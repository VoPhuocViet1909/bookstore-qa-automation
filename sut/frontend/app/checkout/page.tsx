"use client"

import type React from "react"

import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, CreditCard, Loader2, Plus, Edit2, Trash2, CheckCircle2, Ticket } from "lucide-react"
import { addressService, AddressResponse } from "@/lib/services/address.service"
import { ordersService, CheckoutRequest } from "@/lib/services/orders.service"
import { shipmentService, CalculateShippingResponse } from "@/lib/services/shipment.service"
import { promotionsService } from "@/lib/services/promotions.service"
import { toast } from "sonner"
import { AddressSelectModal } from "@/components/products/address-select-modal"

export default function CheckoutPage() {
  const { cart, clearCart, loading, selectedItems } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  // Address State
  const [addresses, setAddresses] = useState<AddressResponse[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)

  // Shipping State
  const [shippingFee, setShippingFee] = useState(0)
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false)
  const [shippingInfo, setShippingInfo] = useState<CalculateShippingResponse | null>(null)

  // Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null)

  // Payment State
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Promotion State
  const [discountCode, setDiscountCode] = useState("")
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)

  // Items to checkout (filtered by selection)
  const items = cart?.items?.filter(item => selectedItems.includes(item.bookId)) || []
  const subtotal = items.reduce((sum, item) => sum + ((item.bookDiscountPrice ?? item.bookPrice) * item.quantity), 0)
  const total = Math.max(0, subtotal + shippingFee - discountAmount)

  // Fetch addresses on mount
  useEffect(() => {
    if (user) {
      fetchAddresses()
    }
  }, [user])

  // Calculate shipping when address changes
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const selectedAddress = addresses.find(addr => addr.id === selectedAddressId)
      if (selectedAddress) {
        calculateShipping(selectedAddress)
      }
    } else {
      setShippingFee(0)
      setShippingInfo(null)
    }
  }, [selectedAddressId, addresses])

  // Redirect if cart/selection IS EMPTY
  useEffect(() => {
    if (!loading && items.length === 0) {
      // redirect handled in render
    }
  }, [items, loading])

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true)
      const data = await addressService.getUserAddresses()
      setAddresses(data)
      // Select the first address by default if none selected
      if (data.length > 0 && !selectedAddressId) {
        setSelectedAddressId(data[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error)
      toast.error("Không thể tải danh sách địa chỉ")
    } finally {
      setIsLoadingAddresses(false)
    }
  }

  const calculateShipping = async (address: AddressResponse) => {
    try {
      setIsCalculatingShipping(true)
      // Call shipment service
      const response = await shipmentService.calculateShippingFee(
        address.districtId,
        address.wardCode,
        {
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: items.reduce((sum, item) => sum + ((item.bookDiscountPrice ?? item.bookPrice) * item.quantity), 0)
        }
      )
      setShippingInfo(response)
      setShippingFee(response.totalFee)
    } catch (error) {
      console.error("Failed to calculate shipping:", error)
      // Don't show toast as this might happen frequently, just log it
      setShippingFee(0)
      setShippingInfo(null)
    } finally {
      setIsCalculatingShipping(false)
    }
  }

  const handleAddNewAddress = () => {
    setEditingAddress(null)
    setIsAddressModalOpen(true)
  }

  const handleEditAddress = (address: AddressResponse) => {
    setEditingAddress(address)
    setIsAddressModalOpen(true)
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return

    try {
      await addressService.deleteAddress(id)
      toast.success("Đã xóa địa chỉ")
      await fetchAddresses() // Await here to ensure list is updated
      if (selectedAddressId === id) {
        setSelectedAddressId(null)
      }
    } catch (error) {
      console.error("Failed to delete address:", error)
      toast.error("Không thể xóa địa chỉ")
    }
  }

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return

    setIsValidatingDiscount(true)
    try {
      const result = await promotionsService.validatePromotion(
        discountCode,
        subtotal,
        items.map(i => i.bookId)
      )

      if (result.valid) {
        setDiscountAmount(result.discount)
        setAppliedCode(discountCode)
        toast.success("Áp dụng mã giảm giá thành công")
      } else {
        setDiscountAmount(0)
        setAppliedCode(null)
        toast.error(result.message || "Mã giảm giá không hợp lệ")
      }
    } catch (error) {
      console.error("Discount validation error:", error)
      toast.error("Có lỗi xảy ra khi kiểm tra mã giảm giá")
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  const handleRemoveDiscount = () => {
    setDiscountCode("")
    setAppliedCode(null)
    setDiscountAmount(0)
    setDiscountCode("")
  }

  // Helper to clear discount state properly, used below renamed to simply verify logic
  const handleClearDiscount = () => {
    setDiscountCode("")
    setAppliedCode(null)
    setDiscountAmount(0)
  }

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thanh toán")
      router.push("/login?redirect=/checkout")
      return
    }

    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng")
      return
    }

    setIsSubmitting(true)

    try {
      const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "http://localhost:3000"

      const checkoutRequest: CheckoutRequest = {
        addressId: selectedAddressId,
        paymentMethod: paymentMethod,
        note: "",
        bookIds: items.map(item => item.bookId),
        redirectUrl: `${origin}/payment/momo/return`,
        discountCode: appliedCode || undefined
      }

      console.log("Checkout Request Data:", checkoutRequest)

      if (paymentMethod === "COD") {
        const order = await ordersService.checkout(checkoutRequest)
        toast.success("Đặt hàng thành công!")
        await clearCart()
        router.push(`/account/orders/${order.id}`)
      } else if (paymentMethod === "VNPay") {
        const response = await ordersService.checkoutVNPay(checkoutRequest)
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl
        } else {
          toast.error("Không thể tạo link thanh toán VNPay")
        }
      } else if (paymentMethod === "ZaloPay") {
        const response = await ordersService.checkoutZaloPay(checkoutRequest)
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl
        } else {
          toast.error("Không thể tạo link thanh toán ZaloPay")
        }
      } else if (paymentMethod === "MoMo") {
        const response = await ordersService.checkoutMoMo(checkoutRequest)
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl
        } else {
          toast.error("Không thể tạo link thanh toán MoMo")
        }
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      toast.error(error.message || "Có lỗi xảy ra khi thanh toán")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Giỏ hàng trống. Quay lại để thêm sách.</p>
            <Link href="/products">
              <Button>Quay lại cửa hàng</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <h1 className="mb-8 text-3xl font-bold text-foreground">Thanh toán</h1>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Address & Payment */}
            <div className="lg:col-span-2 space-y-8">

              {/* Address Section */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <MapPin size={20} />
                    Thông tin giao hàng
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddNewAddress}
                  >
                    <Plus size={16} className="mr-2" />
                    Thêm địa chỉ mới
                  </Button>
                </div>

                {/* Address List */}
                <div className="space-y-4">
                  {isLoadingAddresses ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`relative rounded-lg border p-4 cursor-pointer transition-all ${selectedAddressId === addr.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                            }`}
                          onClick={() => setSelectedAddressId(addr.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center ${selectedAddressId === addr.id ? "border-primary" : "border-muted-foreground"
                                }`}>
                                {selectedAddressId === addr.id && (
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{addr.recipientName} <span className="font-normal text-muted-foreground">| {addr.phoneNumber}</span></p>
                                <p className="text-sm text-muted-foreground mt-1">{addr.street}</p>
                                <p className="text-sm text-muted-foreground">{addr.ward}, {addr.district}, {addr.province}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditAddress(addr)
                                }}
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-full transition"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteAddress(addr.id)
                                }}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-full transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                  <CreditCard size={20} />
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-foreground">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt khi nhận đơn hàng</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                    <input
                      type="radio"
                      name="payment"
                      value="VNPay"
                      checked={paymentMethod === "VNPay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-foreground">VNPay</p>
                      <p className="text-sm text-muted-foreground">Thanh toán qua ví VNPay</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                    <input
                      type="radio"
                      name="payment"
                      value="ZaloPay"
                      checked={paymentMethod === "ZaloPay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-foreground">ZaloPay</p>
                      <p className="text-sm text-muted-foreground">Thanh toán qua ví ZaloPay</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                    <input
                      type="radio"
                      name="payment"
                      value="MoMo"
                      checked={paymentMethod === "MoMo"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-foreground">MoMo</p>
                      <p className="text-sm text-muted-foreground">Thanh toán qua ví MoMo</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/cart" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Quay lại giỏ hàng
                  </Button>
                </Link>
                <Button
                  onClick={handleCheckout}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting || !selectedAddressId}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : `Thanh toán (${total.toLocaleString("vi-VN")}₫)`}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border border-border bg-muted/50 p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">Đơn hàng của bạn</h2>

                <div className="mb-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.bookId} className="flex items-start justify-between gap-4 text-sm">
                      <span className="flex-1 text-muted-foreground">
                        {item.bookTitle} x {item.quantity}
                      </span>
                      <span className="whitespace-nowrap font-medium">
                        {((item.bookDiscountPrice ?? item.bookPrice) * item.quantity).toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  ))}
                </div>


                {/* Discount Code Section */}
                <div className="mb-4 space-y-3 border-t border-border pt-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Mã giảm giá"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        disabled={!!appliedCode}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    {appliedCode ? (
                      <Button variant="outline" onClick={handleClearDiscount} type="button">
                        Xóa
                      </Button>
                    ) : (
                      <Button
                        onClick={handleApplyDiscount}
                        disabled={isValidatingDiscount || !discountCode.trim()}
                        type="button"
                      >
                        {isValidatingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : "Áp dụng"}
                      </Button>
                    )}
                  </div>
                  {appliedCode && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 size={14} />
                      <span>Đã áp dụng mã: <b>{appliedCode}</b></span>
                    </div>
                  )}
                </div>

                <div className="mb-4 space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium">{subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span className="flex items-center gap-1"><Ticket size={14} /> Giảm giá ({appliedCode}):</span>
                      <span className="font-medium">-{discountAmount.toLocaleString("vi-VN")}₫</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vận chuyển:</span>
                    {isCalculatingShipping ? (
                      <span className="text-sm text-muted-foreground">Đang tính...</span>
                    ) : shippingFee > 0 ? (
                      <span className="font-medium">{shippingFee.toLocaleString("vi-VN")}₫</span>
                    ) : (
                      <span className="font-medium text-accent">Miễn phí</span>
                    )}

                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="font-bold">Tổng cộng:</span>
                  <span className="font-bold text-lg text-primary">{total.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main >

      <Footer />

      {/* Address Modal */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false)
          setEditingAddress(null)
        }}
        addresses={addresses}
        onSelectAddress={(address) => setSelectedAddressId(address.id)}
        onAddressCreated={() => {
          fetchAddresses()
          setIsAddressModalOpen(false)
          setEditingAddress(null)
        }}
        editingAddress={editingAddress}
        onAddressUpdated={() => {
          fetchAddresses()
          setIsAddressModalOpen(false)
          setEditingAddress(null)
        }}
        selectedAddressId={selectedAddressId || undefined}
      />
    </div >
  )
}
