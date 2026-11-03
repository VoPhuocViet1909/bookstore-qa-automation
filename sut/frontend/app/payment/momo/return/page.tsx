"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ordersService, MoMoCallbackRequest } from "@/lib/services/orders.service"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "sonner"

function MoMoReturnContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
    const [message, setMessage] = useState("Đang xử lý thanh toán...")
    const [orderId, setOrderId] = useState<string | null>(null)

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const params = Object.fromEntries(searchParams.entries())

                // Check if required params exist
                if (!params.partnerCode || !params.orderId) {
                    setStatus("error")
                    setMessage("Thông tin thanh toán không hợp lệ")
                    return
                }

                const request: MoMoCallbackRequest = {
                    partnerCode: params.partnerCode,
                    orderId: params.orderId,
                    requestId: params.requestId,
                    amount: Number(params.amount),
                    orderInfo: params.orderInfo,
                    orderType: params.orderType,
                    transId: params.transId,
                    resultCode: Number(params.resultCode),
                    message: params.message,
                    payType: params.payType,
                    responseTime: Number(params.responseTime),
                    extraData: params.extraData || "",
                    signature: params.signature
                }

                // Check resultCode from MoMo first
                if (request.resultCode !== 0) {
                    setStatus("error")
                    setMessage(`Thanh toán thất bại: ${request.message}`)
                    return
                }

                // Verify with backend
                const response = await ordersService.verifyMoMoPayment(request)

                if (response.status === "PAID" || response.status === "COMPLETED" as any) {
                    setStatus("success")
                    setMessage("Thanh toán thành công!")
                    // Extract actual order ID from transaction ID if needed, or use the one returned
                    // The orderId in MoMo params might be transaction ID "PAY_..."
                    // The response.orderId should be the actual order ID
                    setOrderId(response.orderId)
                    toast.success("Thanh toán thành công")

                    // Redirect after 3 seconds
                    setTimeout(() => {
                        router.push(`/account/orders/${response.orderId}`)
                    }, 3000)
                } else {
                    setStatus("error")
                    setMessage("Thanh toán chưa hoàn tất hoặc thất bại")
                }

            } catch (error: any) {
                console.error("Payment verification error:", error)
                setStatus("error")
                setMessage(error.message || "Có lỗi xảy ra khi xác thực thanh toán")
            }
        }

        verifyPayment()
    }, [searchParams, router])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center p-4">
            {status === "processing" && (
                <>
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <h1 className="text-2xl font-bold">Đang xử lý thanh toán...</h1>
                    <p className="text-muted-foreground">Vui lòng không tắt trình duyệt</p>
                </>
            )}

            {status === "success" && (
                <>
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <h1 className="text-2xl font-bold text-green-600">Thanh toán thành công!</h1>
                    <p className="text-muted-foreground">{message}</p>
                    <p className="text-sm text-muted-foreground">Đang chuyển hướng đến chi tiết đơn hàng...</p>
                    <Link href={`/account/orders/${orderId}`}>
                        <Button>Xem đơn hàng ngay</Button>
                    </Link>
                </>
            )}

            {status === "error" && (
                <>
                    <XCircle className="h-16 w-16 text-red-500" />
                    <h1 className="text-2xl font-bold text-red-600">Thanh toán thất bại</h1>
                    <p className="text-muted-foreground">{message}</p>
                    <div className="flex gap-4">
                        <Link href="/checkout">
                            <Button variant="outline">Thử lại</Button>
                        </Link>
                        <Link href="/">
                            <Button>Về trang chủ</Button>
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}

export default function MoMoReturnPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
            <MoMoReturnContent />
        </Suspense>
    )
}
