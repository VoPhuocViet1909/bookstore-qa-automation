"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Result, Button, Spin } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const messageParam = searchParams?.get("message");
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam));
    } else {
      setMessage("Đã có lỗi xảy ra");
    }
  }, [searchParams]);

  const handleGoToAccount = () => {
    router.push("/account");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Result
        icon={<CloseCircleOutlined className="text-red-500" />}
        status="error"
        title="Xác thực email thất bại"
        subTitle={
          <div className="space-y-2">
            <p className="text-lg">{message}</p>
            <p className="text-sm text-gray-600">
              Vui lòng thử lại hoặc liên hệ với chúng tôi nếu vấn đề vẫn tiếp
              diễn.
            </p>
          </div>
        }
        extra={[
          <Button type="primary" key="account" onClick={handleGoToAccount}>
            Đến trang cá nhân
          </Button>,
          <Button key="home" onClick={handleGoHome}>
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
