import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import type { Promotion } from "@/lib/services/promotions.service"

interface PromotionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (promotion: Omit<Promotion, "id" | "status" | "usageCount">) => Promise<void>
  onUpdate?: (promotion: Partial<Promotion>) => Promise<void>
  editingPromotion?: Promotion | null
}

export function PromotionFormModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  editingPromotion
}: PromotionFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    discount: 10,
    startDate: "",
    endDate: "",
    usageLimit: 100,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (isOpen) {
      if (editingPromotion) {
        setFormData({
          name: editingPromotion.name,
          code: editingPromotion.code,
          description: editingPromotion.description || "",
          discount: editingPromotion.discount,
          startDate: editingPromotion.startDate || "",
          endDate: editingPromotion.endDate || "",
          usageLimit: editingPromotion.usageLimit || 100,
        })
      } else {
        // Set default end date to 30 days from now
        const defaultEndDate = new Date()
        defaultEndDate.setDate(defaultEndDate.getDate() + 30)

        setFormData({
          name: "",
          code: "",
          description: "",
          discount: 10,
          startDate: new Date().toISOString().split("T")[0],
          endDate: defaultEndDate.toISOString().split("T")[0],
          usageLimit: 100,
        })
      }
      setErrors({})
    }
  }, [isOpen, editingPromotion])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Tên khuyến mãi là bắt buộc"
    }

    if (!formData.code.trim()) {
      newErrors.code = "Mã khuyến mãi là bắt buộc"
    } else if (formData.code.length < 3) {
      newErrors.code = "Mã khuyến mãi phải có ít nhất 3 ký tự"
    } else if (!/^[A-Z0-9]+$/.test(formData.code)) {
      newErrors.code = "Mã khuyến mãi chỉ chứa chữ in hoa và số"
    }

    if (formData.discount < 1 || formData.discount > 100) {
      newErrors.discount = "Giảm giá phải từ 1% đến 100%"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc"
    }

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc"
    } else if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu"
    }

    if (formData.usageLimit < 1) {
      newErrors.usageLimit = "Giới hạn sử dụng phải >= 1"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      console.log("Form validation failed")
      return
    }

    console.log("Submitting form with data:", formData)
    console.log("Form code value:", formData.code)
    console.log("Form code type:", typeof formData.code)
    console.log("Form code length:", formData.code?.length)

    setIsSubmitting(true)
    try {
      if (editingPromotion && onUpdate) {
        await onUpdate(formData)
      } else {
        console.log("Calling onSubmit with:", formData)
        await onSubmit(formData)
      }
      // Only close modal on success
      onClose()
    } catch (error) {
      // Error is already handled in parent component
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingPromotion ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tên khuyến mãi */}
          <div className="space-y-2">
            <Label htmlFor="name">Tên khuyến mãi *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="VD: Giảm 20% cho đơn hàng đầu tiên"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Mã khuyến mãi */}
          <div className="space-y-2">
            <Label htmlFor="code">Mã khuyến mãi *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => {
                // Chỉ cho phép chữ in hoa và số
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                handleInputChange("code", value)
              }}
              placeholder="VD: WELCOME20"
              className={errors.code ? "border-red-500" : ""}
            />
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
            <p className="text-xs text-muted-foreground">Chỉ chứa chữ in hoa và số</p>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả về khuyến mãi..."
              rows={3}
            />
          </div>

          {/* Giảm giá */}
          <div className="space-y-3">
            <Label>Giảm giá: {formData.discount}%</Label>
            <Slider
              value={[formData.discount]}
              onValueChange={(value) => handleInputChange("discount", value[0])}
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
            {errors.discount && (
              <p className="text-sm text-red-500">{errors.discount}</p>
            )}
          </div>

          {/* Giới hạn sử dụng */}
          <div className="space-y-2">
            <Label htmlFor="usageLimit">Giới hạn sử dụng *</Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => handleInputChange("usageLimit", parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">Số lần tối đa có thể sử dụng mã khuyến mãi</p>
          </div>

          {/* Ngày bắt đầu và kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
              />
            </div>
          </div>

          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate}</p>
          )}
          {errors.endDate && (
            <p className="text-sm text-red-500">{errors.endDate}</p>
          )}
          {errors.usageLimit && (
            <p className="text-sm text-red-500">{errors.usageLimit}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? (editingPromotion ? "Đang cập nhật..." : "Đang thêm...")
              : (editingPromotion ? "Cập nhật" : "Thêm mới")
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}