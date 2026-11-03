"use client";

import { useAuth } from "@/lib/auth-context";
import { ordersService, OrderResponse } from "@/lib/services/orders.service";
import { reviewsService } from "@/lib/services/reviews.service";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Printer, Download, Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { toast } from "sonner";

const statusSteps = [
  {
    key: "PENDING",
    label: "Chờ xác nhận",
  },
  {
    key: "CONFIRMED",
    label: "Đã xác nhận",
  },
  {
    key: "PROCESSING",
    label: "Đang chuẩn bị",
  },
  {
    key: "SHIPPED",
    label: "Đang giao",
  },
  {
    key: "COMPLETED",
    label: "Hoàn thành",
  },
];

// Helper function to get status colors
const getStatusColors = (stepKey: string) => {
  switch (stepKey) {
    case "PENDING":
      return {
        bg: "bg-yellow-100",
        ring: "ring-yellow-300/50",
        text: "text-yellow-700",
      };
    case "CONFIRMED":
    case "PROCESSING":
      return {
        bg: "bg-blue-100",
        ring: "ring-blue-300/50",
        text: "text-blue-700",
      };
    case "SHIPPED":
      return {
        bg: "bg-purple-100",
        ring: "ring-purple-300/50",
        text: "text-purple-700",
      };
    case "COMPLETED":
      return {
        bg: "bg-green-100",
        ring: "ring-green-300/50",
        text: "text-green-700",
      };
    case "CANCELLED":
      return {
        bg: "bg-red-100",
        ring: "ring-red-300/50",
        text: "text-red-700",
      };
    default:
      return {
        bg: "bg-gray-100",
        ring: "ring-gray-300/50",
        text: "text-gray-700",
      };
  }
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [reviews, setReviews] = useState<{ [key: number]: string }>({});
  const [submitting, setSubmitting] = useState<{ [key: number]: boolean }>({});
  const [reviewedItems, setReviewedItems] = useState<Set<number>>(new Set());

  // Unwrap params Promise
  const { id } = use(params);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchOrder();
    }
  }, [user, authLoading, router, id]);


  console.log("---------------------------", order)

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Không thể tải thông tin đơn hàng");
      router.push("/account/orders");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default
      const { jsPDF } = await import("jspdf")

      // Create an iframe to isolate the print content from Tailwind's global styles
      const iframe = document.createElement("iframe")
      iframe.style.position = "fixed"
      iframe.style.left = "-10000px"
      iframe.style.top = "0"
      iframe.style.width = "210mm" // A4 width
      iframe.style.minHeight = "297mm" // A4 height
      iframe.style.border = "none"
      document.body.appendChild(iframe)

      const doc = iframe.contentWindow?.document
      if (!doc) {
        document.body.removeChild(iframe)
        return
      }

      // Write pure HTML/CSS content into the iframe
      // No external stylesheets are included, so no Tailwind interference
      doc.open()
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: #ffffff; 
              color: #000000; 
              margin: 20px;
              padding: 20px;
            }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 15px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; }
            th { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; background-color: #f5f5f5; font-weight: bold; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .text-right { text-align: right; }
            .total-row { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 16px; display: flex; justify-content: space-between; }
            .summary { float: right; width: 300px; }
            .clear { clear: both; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Đơn hàng #${order?.orderCode || order?.id}</h1>
            <p style="margin: 5px 0 0 0; color: #666;">Ngày đặt: ${new Date(order?.orderDate || "").toLocaleDateString("vi-VN")}</p>
          </div>

          <div class="section">
            <div class="section-title">Địa chỉ giao hàng</div>
            <p style="margin: 5px 0;"><strong>${order?.recipientName}</strong></p>
            <p style="margin: 5px 0;">${order?.shippingAddress}</p>
            <p style="margin: 5px 0;">SĐT: ${order?.recipientPhone}</p>
          </div>

          <div class="section">
            <div class="section-title">Chi tiết đơn hàng</div>
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th class="text-right">Số lượng</th>
                  <th class="text-right">Đơn giá</th>
                </tr>
              </thead>
              <tbody>
                ${order?.items.map(item => `
                  <tr>
                    <td>
                      <div style="font-weight: bold;">${item.bookTitle}</div>
                      <div style="font-size: 12px; color: #666;">ISBN: ${item.bookIsbn}</div>
                    </td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${item.unitPrice.toLocaleString("vi-VN")}₫</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div>
            <div class="summary">
               <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Tạm tính:</span>
                <span style="font-weight: bold;">${order?.subtotal.toLocaleString("vi-VN")}₫</span>
              </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                 <span>Vận chuyển:</span>
                 <span>${order?.shippingFee === 0 ? "Miễn phí" : `${order?.shippingFee.toLocaleString("vi-VN")}₫`}</span>
               </div>
              <div class="total-row">
                <span>Tổng cộng:</span>
                <span style="color: #d00;">${order?.total.toLocaleString("vi-VN")}₫</span>
              </div>
               <div style="margin-top: 20px; text-align: right; font-size: 12px; color: #666;">
                PTTT: ${order?.paymentMethod}
              </div>
            </div>
            <div class="clear"></div>
          </div>
        </body>
        </html>
      `)
      doc.close()

      // Give the iframe a moment to render content/fonts
      await new Promise(resolve => setTimeout(resolve, 500))

      const canvas = await html2canvas(doc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      document.body.removeChild(iframe)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`Order-${order?.orderCode}.pdf`)

      toast.success("Đã tải xuống đơn hàng")
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Không thể tải xuống đơn hàng")
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !order) return null;

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Link href="/account/orders" className="no-print">
                <button className="p-2 hover:bg-muted rounded-lg transition">
                  <ChevronLeft size={20} />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Đơn hàng #{order.orderCode || order.id.substring(0, 8)}
                </h1>
                <p className="text-muted-foreground">
                  {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="font-bold text-foreground mb-6">
              Trạng thái đơn hàng
            </h2>
            <div className="flex justify-between gap-4 pb-2">
              {statusSteps.map((step, index) => {
                const isCurrent = index === currentStepIndex;
                const isPassed = index < currentStepIndex;
                const isActive = index <= currentStepIndex;

                const stepColors = getStatusColors(step.key);

                const currentOrderColors = getStatusColors(order.status);

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center flex-1 min-w-[100px] relative"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 ${isCurrent
                          ? `${stepColors.bg} ${stepColors.text} ring-4 ${stepColors.ring} scale-110 shadow-lg`
                          : isPassed
                            ? `${stepColors.bg} ${stepColors.text}`
                            : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {index + 1}
                    </div>
                    <p
                      className={`text-xs text-center font-medium transition-all duration-300 ${isCurrent
                          ? `${stepColors.text} font-bold scale-105`
                          : isActive
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                        <div
                          className={`w-2 h-2 ${stepColors.bg} rounded-full animate-pulse`}
                        ></div>
                      </div>
                    )}
                    {index < statusSteps.length - 1 && (
                      <div className="absolute top-6 left-[60%] w-full h-0.5 -z-10">
                        <div
                          className={`h-full transition-all duration-500 ${isPassed ? stepColors.bg : "bg-muted"
                            }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              {/* Shipping Address */}
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <h2 className="font-bold text-foreground mb-4">
                  Địa chỉ giao hàng
                </h2>
                {order.shippingAddress ? (
                  <div className="space-y-2 text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      {order.recipientName}
                    </p>
                    <p>{order.shippingAddress}</p>
                    <p>
                      {order.shippingWard},{" "}
                      {order.shippingDistrict},{" "}
                      {order.shippingProvince}
                    </p>
                    <p>Điện thoại: {order.recipientPhone}</p>
                    {order.note && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm font-medium text-foreground">
                          Ghi chú:
                        </p>
                        <p className="text-sm italic">{order.note}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Chưa có thông tin địa chỉ giao hàng
                  </p>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-card border border-border rounded-lg p-6 mb-8">
                <h2 className="font-bold text-foreground mb-4">
                  Chi tiết đơn hàng ({order.items.length} sản phẩm)
                </h2>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 py-3 border-b border-border last:border-0"
                    >
                      {/* Book Image */}
                      {item.bookImageUrl && (
                        <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                          <img
                            src={item.bookImageUrl}
                            alt={item.bookTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 flex justify-between">
                        <div>
                          <p className="font-medium text-foreground">
                            {item.bookTitle}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ISBN: {item.bookIsbn}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-semibold">
                            {item.unitPrice.toLocaleString("vi-VN")}₫
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tổng: {item.subtotal.toLocaleString("vi-VN")}₫
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-bold text-foreground mb-4">
                  Thông tin khách hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Họ tên</p>
                    <p className="font-medium text-foreground">
                      {order.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">
                      {order.customerEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Số điện thoại
                    </p>
                    <p className="font-medium text-foreground">
                      {order.customerPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Hạng thành viên
                    </p>
                    <p className="font-medium text-foreground uppercase">
                      {order.customerMembershipTier}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Section - Only show for COMPLETED orders */}
              {order.status === "COMPLETED" && (
                <div className="bg-card border border-border rounded-lg p-6 mt-8">
                  <h2 className="font-bold text-foreground mb-4">
                    Đánh giá đơn hàng
                  </h2>
                  <div className="space-y-4">
                    {order.items.map((item, index) => {
                      // Skip if already reviewed
                      if (reviewedItems.has(index)) {
                        return null;
                      }
                      
                      return (
                      <div
                        key={index}
                        className="flex gap-4 py-4 border-b border-border last:border-0"
                      >
                        {/* Book Image */}
                        {item.bookImageUrl && (
                          <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                            <img
                              src={item.bookImageUrl}
                              alt={item.bookTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="font-medium text-foreground mb-2">
                            {item.bookTitle}
                          </p>

                          {/* Star Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setRatings((prev) => ({
                                      ...prev,
                                      [index]: star,
                                    }));
                                  }}
                                  className="hover:scale-110 transition-transform focus:outline-none"
                                >
                                  <Star
                                    className={`w-6 h-6 ${star <= (ratings[index] || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                      }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {ratings[index]
                                ? `${ratings[index]} sao`
                                : "Chọn số sao"}
                            </span>
                          </div>

                          {/* Review Text */}
                          <textarea
                            value={reviews[index] || ""}
                            onChange={(e) => {
                              setReviews((prev) => ({
                                ...prev,
                                [index]: e.target.value,
                              }));
                            }}
                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                            className="w-full min-h-[100px] p-3 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />

                          <div className="flex justify-end mt-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={submitting[index]}
                              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                if (!ratings[index]) {
                                  toast.error("Vui lòng chọn số sao đánh giá");
                                  return;
                                }
                                if (
                                  !reviews[index] ||
                                  reviews[index].trim() === ""
                                ) {
                                  toast.error(
                                    "Vui lòng nhập nội dung đánh giá"
                                  );
                                  return;
                                }

                                try {
                                  setSubmitting((prev) => ({
                                    ...prev,
                                    [index]: true,
                                  }));

                                  await reviewsService.createReview({
                                    bookId: item.bookId,
                                    rating: ratings[index],
                                    comment: reviews[index],
                                  });

                                  toast.success(
                                    "Đánh giá của bạn đã được gửi!"
                                  );

                                  // Hide the reviewed item
                                  setReviewedItems((prev) => new Set(prev).add(index));

                                  // Clear form after successful submission
                                  setRatings((prev) => {
                                    const newRatings = { ...prev };
                                    delete newRatings[index];
                                    return newRatings;
                                  });
                                  setReviews((prev) => {
                                    const newReviews = { ...prev };
                                    delete newReviews[index];
                                    return newReviews;
                                  });
                                } catch (error: any) {
                                  console.error(
                                    "Failed to submit review:",
                                    error
                                  );
                                  toast.error(
                                    error.message ||
                                    "Không thể gửi đánh giá. Vui lòng thử lại."
                                  );
                                } finally {
                                  setSubmitting((prev) => ({
                                    ...prev,
                                    [index]: false,
                                  }));
                                }
                              }}
                            >
                              {submitting[index]
                                ? "Đang gửi..."
                                : "Gửi đánh giá"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              )}

              {/* Tracking */}
              {/* Tracking number is not in OrderResponse yet, skipping */}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-muted/50 border border-border rounded-lg p-6 sticky top-20">
                <h2 className="font-bold text-foreground mb-4">
                  Tóm tắt thanh toán
                </h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span className="font-medium">
                      {order.subtotal.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vận chuyển:</span>
                    <span className="font-medium">
                      {order.shippingFee > 0 ? (
                        `${order.shippingFee.toLocaleString("vi-VN")}₫`
                      ) : (
                        <span className="text-accent">Miễn phí</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thuế:</span>
                    <span className="font-medium">
                      {order.taxAmount > 0
                        ? `${order.taxAmount.toLocaleString("vi-VN")}₫`
                        : "0₫"}
                    </span>
                  </div>
                  {order.discountAmount && order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Giảm giá{" "}
                        {order.promotionName && `(${order.promotionName})`}
                        {order.discountPercent && ` ${order.discountPercent}%`}:
                      </span>
                      <span className="font-medium">
                        -{order.discountAmount.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-4 flex justify-between mb-6">
                  <span className="font-bold">Tổng cộng:</span>
                  <span className="font-bold text-lg text-primary">
                    {order.total.toLocaleString("vi-VN")}₫
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Phương thức thanh toán
                    </p>
                    <p className="font-semibold text-foreground">
                      {order.paymentMethod}
                    </p>
                  </div>
                  {order.promotionCode && (
                    <div className="p-3 bg-background rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        Mã khuyến mãi
                      </p>
                      <p className="font-semibold text-green-600 uppercase">
                        {order.promotionCode}
                      </p>
                    </div>
                  )}
                  {order.status === "DELIVERED" && (
                    <Link href="/products" className="block">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        Tìm sách khác
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
