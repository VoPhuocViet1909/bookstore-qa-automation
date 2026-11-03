/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from "../api-client";

export interface LoginRequest {
  identifier: string; // email or username
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    phoneNumber?: string;
    role: string;
    avatar?: string;
    avatarUrl?: string; // Google avatar URL
    isEmailVerified?: boolean;
  };
}

export interface GoogleAuthRequest {
  credential: string;
}

export const authService = {
  /**
   * Login with email/username and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const requestBody = {
      username: data.identifier,
      password: data.password,
    };
    // apiClient đã tự unwrap { code, message, result } thành result
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      requestBody
    );
    return response;
  },

  /**
   * Register a new user account
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response;
  },

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(data: GoogleAuthRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/google", data);
    return response;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    return apiClient.post<void>("/auth/logout");
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse["user"]> {
    return apiClient.get<AuthResponse["user"]>("/auth/me");
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    return apiClient.post<{ token: string }>("/auth/refresh");
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/forgot-password", {
      email,
    });
  },

  /**
   * Send OTP to email for password reset
   */
  async sendOtp(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/send-otp", {
      email,
    });
  },

  /**
   * Verify OTP and reset password
   */
  async verifyOtp(
    email: string,
    otp: string,
    passwordNew: string,
    confirmPassword: string
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/verify-otp", {
      email,
      otp,
      passwordNew,
      confirmPassword,
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
    });
  },

  /**
   * Send email verification
   */
  async verifyEmail(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/verify-email", { email });
  },

  /**
   * Confirm email with token (not used directly, backend redirects)
   */
  async confirmEmail(token: string): Promise<{ message: string }> {
    return apiClient.get<{ message: string }>(
      `/auth/confirm-email?token=${token}`
    );
  },
};
