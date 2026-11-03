"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Result, Button, Spin } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }

    // Update user in localStorage
    const storedUser =
      localStorage.getItem("user") || localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        user.emailVerified = true;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent("emailVerified"));

        console.log("✅ Email verified successfully:", email);
      } catch (err) {
        console.error("Failed to update user in localStorage:", err);
      }
    }
  }, [searchParams, email]);

  const handleGoToAccount = () => {
    window.location.href = "/account";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Result
        icon={<CheckCircleOutlined className="text-green-500" />}
        status="success"
        title="Xác thực email thành công!"
        subTitle={
          <div className="space-y-2">
            <p className="text-lg">
              Email <strong>{email}</strong> đã được xác thực thành công!
            </p>
            <p className="text-sm text-gray-600">
              Tài khoản của bạn đã được kích hoạt. Bạn có thể sử dụng đầy đủ các
              tính năng.
            </p>
          </div>
        }
        extra={[
          <Button type="primary" key="account" onClick={handleGoToAccount}>
            Đến trang cá nhân
          </Button>,
        ]}
      />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
