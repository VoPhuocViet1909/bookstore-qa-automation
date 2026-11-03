"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { authService } from "@/lib/services";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "CUSTOMER" | string;
  username?: string;
  phone?: string;
  avatar?: string; // Can be avatarUrl from Google or custom avatar
  isEmailVerified?: boolean;
  createdAt: string;
  gender?: string | null;
  dateOfBirth?: string | null;
}

function decodeGoogleCredential(credential: string) {
  const parts = credential.split(".");
  if (parts.length < 2) {
    throw new Error("GOOGLE_SIGNIN_INVALID_TOKEN");
  }

  const base64 = parts[1];
  const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = atob(padded);

  try {
    return JSON.parse(decoded);
  } catch {
    throw new Error("GOOGLE_SIGNIN_INVALID_TOKEN");
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  signup: (email: string, password: string, fullName: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  setUserState: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (stored && token) {
      try {
        const parsedUser = JSON.parse(stored) as Partial<User>;
        if (parsedUser && typeof parsedUser === "object" && parsedUser.id) {
          setUser({
            id: parsedUser.id ?? "",
            email: parsedUser.email ?? "",
            fullName: parsedUser.fullName ?? "",
            role: parsedUser.role ?? "CUSTOMER",
            username: parsedUser.username,
            phone: parsedUser.phone,
            avatar: parsedUser.avatar,
            isEmailVerified: parsedUser.isEmailVerified ?? false,
            createdAt: parsedUser.createdAt ?? new Date().toISOString(),
          });
        }
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ identifier, password });

      const authenticatedUser: User = {
        id: response.user.id,
        email: response.user.email,
        fullName:
          response.user.fullName ??
          response.user.username ??
          response.user.email.split("@")[0],
        role: response.user.role.toUpperCase(),
        username: response.user.username,
        avatar: response.user.avatarUrl || response.user.avatar,
        isEmailVerified: response.user.isEmailVerified ?? false,
        createdAt: new Date().toISOString(),
      };

      // Store token and user
      localStorage.setItem("authToken", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return authenticatedUser;
    } catch (error) {
      if (error instanceof Error) {
        // Map API errors to existing error codes
        if (
          error.message.includes("401") ||
          error.message.includes("credentials")
        ) {
          throw new Error("INVALID_CREDENTIALS");
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_SIGNIN_UNCONFIGURED");
    }

    if (!credential) {
      throw new Error("GOOGLE_SIGNIN_CREDENTIAL_MISSING");
    }

    setIsLoading(true);
    try {
      // Validate credential format before sending to API
      const payload = decodeGoogleCredential(credential);
      const email = typeof payload?.email === "string" ? payload.email : "";
      const emailVerified =
        typeof payload?.email_verified === "boolean"
          ? payload.email_verified
          : true;

      if (!email) {
        throw new Error("GOOGLE_SIGNIN_EMAIL_REQUIRED");
      }

      if (!emailVerified) {
        throw new Error("GOOGLE_SIGNIN_EMAIL_NOT_VERIFIED");
      }

      // Call API service
      const response = await authService.loginWithGoogle({ credential });

      const authenticatedUser: User = {
        id: response.user.id,
        email: response.user.email,
        fullName:
          response.user.fullName ??
          response.user.username ??
          response.user.email.split("@")[0],
        role: response.user.role.toUpperCase(),
        username: response.user.username,
        avatar: response.user.avatarUrl || response.user.avatar,
        isEmailVerified: response.user.isEmailVerified ?? true,
        createdAt: new Date().toISOString(),
      };

      // Store token and user
      localStorage.setItem("authToken", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return authenticatedUser;
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw validation errors as-is
        if (error.message.startsWith("GOOGLE_SIGNIN_")) {
          throw error;
        }
        // Map API errors
        if (
          error.message.includes("401") ||
          error.message.includes("credentials")
        ) {
          throw new Error("GOOGLE_SIGNIN_INVALID_TOKEN");
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({
        email,
        password,
        fullName,
        username: email.split("@")[0],
        phoneNumber: "",
      });

      const authenticatedUser: User = {
        id: response.user.id,
        email: response.user.email,
        fullName:
          response.user.fullName ??
          response.user.username ??
          response.user.email.split("@")[0],
        role: response.user.role.toUpperCase(),
        username: response.user.username,
        avatar: response.user.avatar,
        isEmailVerified: response.user.isEmailVerified ?? false,
        createdAt: new Date().toISOString(),
      };

      // Store token and user
      localStorage.setItem("authToken", response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);

      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        setUserState: setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
