"use client"

import { UserLayout } from "@/components/layout/user-layout"
import { Form, Input, Button, Card, message, Checkbox } from "antd"
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from "@ant-design/icons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { authService } from "@/lib/services"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { setUserState } = useAuth()

  const handleRegister = async (values: any) => {
    // Validate required fields
    if (!values.username || !values.email || !values.password || !values.fullName || !values.phone) {
      message.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    // Đảm bảo username và email là riêng biệt
    if (values.username.trim().toLowerCase() === values.email.trim().toLowerCase()) {
      message.error("Tên đăng nhập không được trùng với email")
      return
    }

    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu không trùng khớp")
      return
    }

    setLoading(true)
    try {
      // Gọi API đăng ký với đầy đủ thông tin - username và email hoàn toàn riêng biệt
      const response = await authService.signup({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        phoneNumber: values.phone.trim(),
      })

      // Chuẩn hóa user giống AuthContext
      const authenticatedUser = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName ?? response.user.username ?? response.user.email.split("@")[0],
        role: response.user.role.toUpperCase(),
        username: response.user.username,
        phone: response.user.phoneNumber,
        avatar: response.user.avatar,
        createdAt: new Date().toISOString(),
      }

      // Lưu token và thông tin user
      localStorage.setItem("authToken", response.token)
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken)
      }
      localStorage.setItem("user", JSON.stringify(authenticatedUser))

      // Cập nhật context để header/account hiển thị ngay
      setUserState(authenticatedUser)

      message.success("Đăng ký thành công")
      router.push("/")
    } catch (error: any) {
      // Xử lý lỗi từ API
      const errorMessage = error?.message || "Đăng ký thất bại. Vui lòng thử lại."
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserLayout>
      <div className="max-w-md mx-auto py-12">
        <Card>
          <h1 className="text-2xl font-bold text-center mb-8">Đăng ký tài khoản</h1>

          <Form onFinish={handleRegister} layout="vertical">
            <Form.Item
              label="Tên đăng nhập"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên đăng nhập" },
                { min: 4, message: "Tên đăng nhập ít nhất 4 ký tự" },
                {
                  validator: (_, value) => {
                    if (!value || value.trim().length === 0) {
                      return Promise.reject(new Error("Tên đăng nhập không được để trống"))
                    }
                    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                      return Promise.reject(new Error("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"))
                    }
                    return Promise.resolve()
                  },
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const email = getFieldValue("email")
                    if (value && email && value.toLowerCase() === email.toLowerCase()) {
                      return Promise.reject(new Error("Tên đăng nhập không được trùng với email"))
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
            </Form.Item>

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên" },
                {
                  validator: (_, value) => {
                    if (!value || value.trim().length === 0) {
                      return Promise.reject(new Error("Họ tên không được để trống"))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên đầy đủ" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
                {
                  validator: (_, value) => {
                    if (!value || value.trim().length === 0) {
                      return Promise.reject(new Error("Email không được để trống"))
                    }
                    return Promise.resolve()
                  },
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const username = getFieldValue("username")
                    if (value && username && value.toLowerCase() === username.toLowerCase()) {
                      return Promise.reject(new Error("Email không được trùng với tên đăng nhập"))
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập địa chỉ email" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  validator: (_, value) => {
                    if (!value || value.trim().length === 0) {
                      return Promise.reject(new Error("Số điện thoại không được để trống"))
                    }
                    if (!/^[0-9]{10,11}$/.test(value)) {
                      return Promise.reject(new Error("Số điện thoại phải có 10-11 chữ số"))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu ít nhất 6 ký tự" },
                {
                  validator: (_, value) => {
                    if (!value || value.length === 0) {
                      return Promise.reject(new Error("Mật khẩu không được để trống"))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.reject(new Error("Vui lòng xác nhận mật khẩu"))
                    }
                    if (value !== getFieldValue("password")) {
                      return Promise.reject(new Error("Mật khẩu không khớp"))
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error("Bạn phải đồng ý với điều khoản")),
                },
              ]}
            >
              <Checkbox>
                Tôi đồng ý với{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Điều khoản dịch vụ
                </a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <p className="text-center text-gray-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Đăng nhập tại đây
            </Link>
          </p>
        </Card>
      </div>
    </UserLayout>
  )
}
