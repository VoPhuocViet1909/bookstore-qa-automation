"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "Nhà Sách Online",
    email: "contact@bookstore.vn",
    phone: "1900-123-456",
    address: "12 Nguyễn Văn Bảo, Hồ Chí Minh",
    shippingFee: "0",
    minOrder: "0",
    freeShippingThreshold: "500000",
  })

  const handleSave = () => {
    console.log("Saving settings:", settings)
    alert("Cài đặt đã được cập nhật")
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-6 px-4 py-6 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>

        <div className="max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          {/* Store Info */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-foreground">Thông tin cửa hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Tên cửa hàng</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Số điện thoại</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Địa chỉ</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Shipping Settings */}
          <div className="border-t border-border pt-6">
            <h2 className="mb-4 text-xl font-bold text-foreground">Cài đặt vận chuyển</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Phí vận chuyển (₫)</label>
                <input
                  type="number"
                  value={settings.shippingFee}
                  onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Đơn hàng tối thiểu (₫)</label>
                <input
                  type="number"
                  value={settings.minOrder}
                  onChange={(e) => setSettings({ ...settings, minOrder: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Miễn phí vận chuyển từ (₫)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
            Lưu cài đặt
          </Button>
        </div>
      </div>
    </div>
  )
}
