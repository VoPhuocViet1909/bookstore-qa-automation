"use client"

import { UserLayout } from "@/components/layout/user-layout"
import { Tabs, Form, Input, Button, Table, Card, Empty, message, Spin } from "antd"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const mockOrders = [
  {
    id: "ĐH001",
    date: "2024-01-10",
    total: 138000,
    status: "Đã giao",
    items: 2,
  },
  {
    id: "ĐH002",
    date: "2024-01-05",
    total: 79000,
    status: "Đang xử lý",
    items: 1,
  },
]

const mockWishlist = [
  { id: 3, title: "Kinh tế vi mô cơ bản", price: 99000 },
  { id: 5, title: "Lịch sử Việt Nam thời kỳ cổ đại", price: 120000 },
]

function ProfilePageContent() {
  const [form] = Form.useForm()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams?.get("tab") || "info")

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/login")
      return
    }
    const userData = JSON.parse(currentUser)
    setUser(userData)
    form.setFieldsValue({
      fullName: userData.fullName,
      email: userData.email,
    })
  }, [form, router])

  const handleUpdateProfile = async (values: any) => {
    setLoading(true)
    try {
      setTimeout(() => {
        const updatedUser = { ...user, ...values }
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
        setUser(updatedUser)
        message.success("Cập nhật thành công")
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <Spin />

  return (
    <UserLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold sm:mb-8">Tài khoản cá nhân</h1>

        <div className="rounded-lg border border-border bg-card/40 p-2 sm:p-4">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabBarGutter={16}
            items={[
            {
              key: "info",
              label: "Thông tin cá nhân",
              children: (
                <Card className="shadow-sm">
                  <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{ required: true }, { type: "email" }]}>
                      <Input disabled />
                    </Form.Item>

                    <Form.Item name="phone" label="Số điện thoại">
                      <Input />
                    </Form.Item>

                    <Form.Item name="address" label="Địa chỉ">
                      <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading} className="w-full sm:w-auto">
                        Cập nhật
                      </Button>
                    </Form.Item>
                  </Form>

                  <div className="mt-8 border-t pt-8">
                    <h3 className="mb-4 font-bold">Đổi mật khẩu</h3>
                    <Form layout="vertical">
                      <Form.Item name="oldPassword" label="Mật khẩu cũ" rules={[{ required: true }]}>
                        <Input.Password />
                      </Form.Item>

                      <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, min: 6 }]}>
                        <Input.Password />
                      </Form.Item>

                      <Form.Item name="confirmPassword" label="Xác nhận mật khẩu" rules={[{ required: true }]}>
                        <Input.Password />
                      </Form.Item>

                      <Button className="w-full sm:w-auto">Đổi mật khẩu</Button>
                    </Form>
                  </div>
                </Card>
              ),
            },
            {
              key: "orders",
              label: "Lịch sử đơn hàng",
              children: (
                <Card className="shadow-sm">
                  <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <Table
                      dataSource={mockOrders}
                      pagination={false}
                      scroll={{ x: 640 }}
                      columns={[
                        {
                          title: "Mã đơn hàng",
                          dataIndex: "id",
                        },
                        {
                          title: "Ngày đặt",
                          dataIndex: "date",
                        },
                        {
                          title: "Số lượng",
                          dataIndex: "items",
                        },
                        {
                          title: "Tổng tiền",
                          dataIndex: "total",
                          render: (total) => `${total.toLocaleString()} đ`,
                        },
                        {
                          title: "Trạng thái",
                          dataIndex: "status",
                          render: (status) => (
                            <span className={status === "Đã giao" ? "text-green-600" : "text-blue-600"}>{status}</span>
                          ),
                        },
                      ]}
                    />
                  </div>
                </Card>
              ),
            },
            {
              key: "wishlist",
              label: "Danh sách yêu thích",
              children: (
                <Card className="shadow-sm">
                  {mockWishlist.length === 0 ? (
                    <Empty description="Danh sách trống" />
                  ) : (
                    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                      <Table
                        dataSource={mockWishlist}
                        pagination={false}
                        scroll={{ x: 520 }}
                        columns={[
                          {
                            title: "Tên sách",
                            dataIndex: "title",
                          },
                          {
                            title: "Giá",
                            dataIndex: "price",
                            render: (price) => `${price.toLocaleString()} đ`,
                          },
                          {
                            title: "Hành động",
                            render: () => (
                              <Button type="primary" size="small">
                                Thêm vào giỏ hàng
                              </Button>
                            ),
                          },
                        ]}
                      />
                    </div>
                  )}
                </Card>
              ),
            },
          ]}
          />
        </div>
      </div>
    </UserLayout>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <UserLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </UserLayout>
    }>
      <ProfilePageContent />
    </Suspense>
  )
}
