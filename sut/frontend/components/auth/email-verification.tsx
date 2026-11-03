"use client";

import { useState } from "react";
import { Button, message } from "antd";
import { MailOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { authService } from "@/lib/services";

interface EmailVerificationProps {
  email: string;
  isVerified?: boolean;
  onVerificationSent?: () => void;
  className?: string;
}

/**
 * Email Verification Component
 * Reusable component for sending email verification
 * Can be used in profile page, account page, or anywhere email verification is needed
 * Enforces one-time verification - only shows button if email is not verified
 */
export function EmailVerification({
  email,
  isVerified = false,
  onVerificationSent,
  className = "",
}: EmailVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendVerification = async () => {
    // CRITICAL: Check if already verified FIRST
    if (isVerified) {
      message.warning("Email của bạn đã được xác thực rồi!");
      return;
    }

    if (!email) {
      message.error("Email không hợp lệ");
      return;
    }

    // Double check from localStorage
    const storedUser =
      localStorage.getItem("user") || localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.emailVerified === true) {
          message.warning("Email của bạn đã được xác thực rồi!");
          // Force page reload to update UI
          window.location.reload();
          return;
        }
      } catch (err) {
        console.error("Failed to check user from localStorage:", err);
      }
    }

    setLoading(true);
    try {
      const response = await authService.verifyEmail(email);
      message.success({
        content: (
          <div>
            <div className="font-semibold">Đã gửi email xác thực!</div>
            <div className="text-sm mt-1">
              Vui lòng kiểm tra hộp thư <strong>{email}</strong> và click vào
              link xác thực.
            </div>
            <div className="text-xs mt-1 text-gray-500">
              Link có hiệu lực trong 24 giờ
            </div>
          </div>
        ),
        duration: 8,
      });
      setSent(true);

      // Start countdown timer (60 seconds)
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      onVerificationSent?.();
    } catch (error: any) {
      console.error("Email verification error:", error);

      // Check if error is because email already verified
      if (
        error.message?.includes("đã được xác thực") ||
        error.message?.includes("already verified")
      ) {
        message.warning("Email của bạn đã được xác thực rồi!");
      } else {
        message.error(
          error.message || "Không thể gửi email xác thực. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // If already verified, show verified badge instead of button
  if (isVerified) {
    return (
      <span className="text-green-600 text-sm font-medium flex items-center gap-1">
        <CheckCircleOutlined />
        Đã xác thực
      </span>
    );
  }

  // Show verification button when not verified
  return (
    <Button
      type="primary"
      danger
      icon={<MailOutlined />}
      onClick={handleSendVerification}
      loading={loading}
      disabled={sent && countdown > 0}
      className={className}
    >
      {sent && countdown > 0 ? `Gửi lại (${countdown}s)` : "Xác thực email"}
    </Button>
  );
}
