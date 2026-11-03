"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Address } from "@/lib/services/address.service"
import { shipmentService, addressService } from "@/lib/services"
import type { Province, District, Ward } from "@/lib/services/shipment.service"

interface AddressSelectModalProps {
  isOpen: boolean
  onClose: () => void
  addresses: Address[]
  selectedAddressId?: string
  onSelectAddress: (address: Address) => void
  onAddressCreated?: () => void
  editingAddress?: Address | null
  onAddressUpdated?: () => void
}

export function AddressSelectModal({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressCreated,
  editingAddress,
  onAddressUpdated,
}: AddressSelectModalProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedAddressId)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Form states
  const [recipientName, setRecipientName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [street, setStreet] = useState("")
  
  // Location states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSelectedId(selectedAddressId)
  }, [selectedAddressId])

  // Load provinces when add form is shown
  useEffect(() => {
    if (showAddForm && provinces.length === 0) {
      loadProvinces()
    }
  }, [showAddForm])

  // Load editing address data
  useEffect(() => {
    if (editingAddress && isOpen) {
      setShowAddForm(true)
      setRecipientName(editingAddress.recipientName)
      setPhoneNumber(editingAddress.phoneNumber)
      setStreet(editingAddress.street)
      
      // Load provinces first
      loadProvinces().then(() => {
        // Find and set province
        const province = provinces.find(p => p.provinceId === editingAddress.provinceId)
        if (province) {
          setSelectedProvince(province)
          
          // Load districts for this province
          loadDistricts(province.provinceId).then(() => {
            const district = districts.find(d => d.districtId === editingAddress.districtId)
            if (district) {
              setSelectedDistrict(district)
              
              // Load wards for this district
              loadWards(district.districtId).then(() => {
                const ward = wards.find(w => w.wardCode === editingAddress.wardCode)
                if (ward) {
                  setSelectedWard(ward)
                }
              })
            }
          })
        }
      })
    }
  }, [editingAddress, isOpen])

  const loadProvinces = async () => {
    try {
      setLoading(true)
      const data = await shipmentService.getProvinces()
      setProvinces(data)
    } catch (error) {
      console.error("Error loading provinces:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDistricts = async (provinceId: number) => {
    try {
      setLoading(true)
      const data = await shipmentService.getDistricts(provinceId)
      setDistricts(data)
      setWards([])
      setSelectedDistrict(null)
      setSelectedWard(null)
    } catch (error) {
      console.error("Error loading districts:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadWards = async (districtId: number) => {
    try {
      setLoading(true)
      const data = await shipmentService.getWards(districtId)
      setWards(data)
      setSelectedWard(null)
    } catch (error) {
      console.error("Error loading wards:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProvinceChange = (provinceId: string) => {
    const province = provinces.find(p => p.provinceId.toString() === provinceId)
    if (province) {
      setSelectedProvince(province)
      loadDistricts(province.provinceId)
    }
  }

  const handleDistrictChange = (districtId: string) => {
    const district = districts.find(d => d.districtId.toString() === districtId)
    if (district) {
      setSelectedDistrict(district)
      loadWards(district.districtId)
    }
  }

  const handleWardChange = (wardCode: string) => {
    const ward = wards.find(w => w.wardCode === wardCode)
    if (ward) {
      setSelectedWard(ward)
    }
  }

  const handleSaveAddress = async () => {
    if (!recipientName || !phoneNumber || !street || !selectedProvince || !selectedDistrict || !selectedWard) {
      alert("Vui lòng điền đầy đủ thông tin")
      return
    }

    try {
      setSaving(true)
      
      const addressData = {
        recipientName,
        phoneNumber,
        street,
        ward: selectedWard.wardName,
        district: selectedDistrict.districtName,
        province: selectedProvince.provinceName,
        latitude: "0",
        longitude: "0",
        provinceId: selectedProvince.provinceId,
        districtId: selectedDistrict.districtId,
        wardCode: selectedWard.wardCode,
      }

      if (editingAddress) {
        // Update existing address
        await addressService.updateAddress(editingAddress.id, addressData)
        onAddressUpdated?.()
      } else {
        // Create new address
        const newAddress = await addressService.createAddress(addressData)
        onSelectAddress(newAddress)
        onAddressCreated?.()
      }

      // Reset form
      setRecipientName("")
      setPhoneNumber("")
      setStreet("")
      setSelectedProvince(null)
      setSelectedDistrict(null)
      setSelectedWard(null)
      setDistricts([])
      setWards([])
      setShowAddForm(false)

      onClose()
    } catch (error) {
      console.error("Error saving address:", error)
      alert("Có lỗi xảy ra khi lưu địa chỉ")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const handleSelect = (address: Address) => {
    setSelectedId(address.id)
  }

  const handleConfirm = () => {
    const selected = addresses.find(addr => addr.id === selectedId)
    if (selected) {
      onSelectAddress(selected)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {showAddForm ? (editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới") : "Chọn địa chỉ giao hàng"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showAddForm ? (
            /* Add Address Form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tên người nhận <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nhập tên người nhận"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Số điện thoại <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tỉnh/Thành phố <span className="text-destructive">*</span>
                </label>
                <select
                  value={selectedProvince?.provinceId || ""}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map((province) => (
                    <option key={province.provinceId} value={province.provinceId}>
                      {province.provinceName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Quận/Huyện <span className="text-destructive">*</span>
                </label>
                <select
                  value={selectedDistrict?.districtId || ""}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!selectedProvince || loading}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground disabled:opacity-50"
                >
                  <option value="">-- Chọn Quận/Huyện --</option>
                  {districts.map((district) => (
                    <option key={district.districtId} value={district.districtId}>
                      {district.districtName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phường/Xã <span className="text-destructive">*</span>
                </label>
                <select
                  value={selectedWard?.wardCode || ""}
                  onChange={(e) => handleWardChange(e.target.value)}
                  disabled={!selectedDistrict || loading}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground disabled:opacity-50"
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map((ward) => (
                    <option key={ward.wardCode} value={ward.wardCode}>
                      {ward.wardName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Số nhà, tên đường <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ví dụ: 123 Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>

              {selectedProvince && selectedDistrict && selectedWard && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Địa chỉ đầy đủ:</p>
                  <p className="text-sm text-muted-foreground">
                    {street && `${street}, `}
                    {selectedWard.wardName}, {selectedDistrict.districtName}, {selectedProvince.provinceName}
                  </p>
                </div>
              )}
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">Chưa có địa chỉ nào</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus size={16} className="mr-2" />
                Thêm địa chỉ mới
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => handleSelect(address)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    selectedId === address.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-foreground">
                          {address.recipientName}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {address.phoneNumber}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.street}, {address.ward}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.district}, {address.province}
                      </p>
                    </div>
                    {selectedId === address.id && (
                      <div className="shrink-0">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check size={16} className="text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-border">
          {showAddForm ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setRecipientName("")
                  setPhoneNumber("")
                  setStreet("")
                  setSelectedProvince(null)
                  setSelectedDistrict(null)
                  setSelectedWard(null)
                }}
              >
                Quay lại
              </Button>
              <Button
                onClick={handleSaveAddress}
                disabled={saving || !recipientName || !phoneNumber || !street || !selectedProvince || !selectedDistrict || !selectedWard}
              >
                {saving ? "Đang lưu..." : "Lưu địa chỉ"}
              </Button>
            </>
          ) : addresses.length > 0 ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={16} className="mr-2" />
                Thêm mới
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedId}
                >
                  Xác nhận
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
