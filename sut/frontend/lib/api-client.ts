/**
 * API Client Configuration
 * Base configuration for making HTTP requests to the backend
 */

// Get API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Log API URL in development to help debug
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("API Base URL:", API_BASE_URL)
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get token from localStorage if exists
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle HTTP errors
      if (!response.ok) {
        let errorData: any = {}
        try {
          const text = await response.text()
          if (text) {
            errorData = JSON.parse(text)
          }
        } catch (e) {
          errorData = { message: response.statusText || "Unknown error" }
        }
        // Backend returns { code, message, result } format
        const errorMessage = errorData.message || errorData.error || `HTTP Error: ${response.status}`
        throw new Error(errorMessage)
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();

      // Unwrap Spring Boot response: {code, message, result}
      if (data && typeof data === "object" && "result" in data) {
        return data.result as T;
      }

      return data;
    } catch (error) {
      // Improved error handling for "Failed to fetch"
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.error("API Request Failed:", {
          url,
          baseURL: this.baseURL,
          endpoint,
          error: "Cannot connect to backend server",
          checks: [
            `1. Is backend server running at ${this.baseURL.replace('/api', '')}?`,
            "2. Check CORS configuration in backend",
            "3. Check network connectivity",
            "4. If using Railway, check if NEXT_PUBLIC_API_URL is set correctly in .env.local",
          ],
        })
        throw new Error(
          `Không thể kết nối đến server. Vui lòng kiểm tra:\n` +
          `- Backend có đang chạy tại ${this.baseURL.replace('/api', '')} không?\n` +
          `- Kiểm tra CORS configuration\n` +
          `- Kiểm tra file .env.local có NEXT_PUBLIC_API_URL đúng không\n` +
          `- Kiểm tra kết nối mạng`
        )
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network request failed");
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Filter out undefined, null, and empty string values
    const cleanParams = params
      ? Object.fromEntries(
        Object.entries(params).filter(
          ([_, value]) => value !== undefined && value !== null && value !== "" && String(value) !== "undefined"
        )
      )
      : undefined

    const queryString = cleanParams && Object.keys(cleanParams).length > 0
      ? "?" + new URLSearchParams(
        Object.entries(cleanParams).map(([key, value]) => [key, String(value)])
      ).toString()
      : ""
    return this.request<T>(`${endpoint}${queryString}`, {
      method: "GET",
    });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    if (body) {
      console.log("POST request body (raw):", body)
      console.log("POST request body (stringified):", JSON.stringify(body, null, 2))
    }
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Upload failed");
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
