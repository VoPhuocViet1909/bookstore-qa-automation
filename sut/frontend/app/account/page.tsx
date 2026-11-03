"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { EmailVerification } from "@/components/auth/email-verification";
import { useAuth, type User } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, ShoppingBag, Heart, Settings, MapPin, Edit, Trash2, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { usersService } from "@/lib/services/users.service";
import { ordersService, OrderResponse } from "@/lib/services/orders.service";
import Image from "next/image";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string | null;
  role: string;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  lastLogin?: string | null;
  membershipTier?: string;
  points?: number;
}
import { WishlistSection } from "@/components/account/wishlist-section";
import { addressService, type Address } from "@/lib/services";
import { AddressSelectModal } from "@/components/products/address-select-modal";

import { ProfileEditDialog } from "@/components/account/profile-edit-dialog";

export default function AccountPage() {
  const { user, logout, isLoading, setUserState } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [localEmailVerified, setLocalEmailVerified] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [timeFilter, setTimeFilter] = useState("ALL")
  // // Fetch user profile from API - fetch khi user có và chưa fetch
  // Fetch user profile from API
  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoadingProfile(true);
      const profile = await usersService.getMyProfile();
      setUserProfile(profile as UserProfile);

      // Update AuthContext with latest user info including avatarUrl
      const updatedUser = {
        ...user,
        avatar: profile.avatar || profile.avatarUrl || user.avatar,
        emailVerified: profile.emailVerified ?? user.isEmailVerified,
        fullName: profile.fullName || user.fullName,
        phone: profile.phoneNumber || user.phone,
        username: profile.username || user.username,
        gender: profile.gender || user.gender,
        dateOfBirth: profile.dateOfBirth || user.dateOfBirth,
        // Preserve other fields
      };

      // Check if critical fields changed before updating context to avoid loops
      if (
        updatedUser.avatar !== user.avatar ||
        updatedUser.fullName !== user.fullName ||
        updatedUser.phone !== user.phone
      ) {
        setUserState(updatedUser);
        // Update localStorage with new info
        localStorage.setItem("user", JSON.stringify(updatedUser)); // Or handle by auth context
      }

      // setLocalEmailVerified(profile.emailVerified || false);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoadingProfile(false);
      setHasFetchedProfile(true);
    }
  };

  useEffect(() => {
    if (user?.id && !hasFetchedProfile) {
      fetchUserProfile();
    }
  }, [user?.id, hasFetchedProfile]);

  // Refresh user from localStorage on mount AND when emailVerified event fires

  useEffect(() => {
    const checkEmailVerified = () => {
      if (user) {
        const storedUser =
          localStorage.getItem("user") || localStorage.getItem("currentUser");
        if (storedUser) {
          try {
            const freshUser = JSON.parse(storedUser);
            const isNowVerified = freshUser.isEmailVerified === true;
            setLocalEmailVerified(isNowVerified);
            if (freshUser.isEmailVerified !== user.isEmailVerified) {
              setUserState(freshUser);
            }
          } catch (err) {
            console.error("Failed to refresh user from localStorage:", err);
          }
        }
      }
    };
    checkEmailVerified();
  }, []);


  useEffect(() => {
    const checkEmailVerified = () => {
      if (user) {
        const storedUser =
          localStorage.getItem("user") || localStorage.getItem("currentUser");
        if (storedUser) {
          try {
            const freshUser = JSON.parse(storedUser);
            const isNowVerified = freshUser.isEmailVerified === true;

            setLocalEmailVerified(isNowVerified);

            // Update context if isEmailVerified changed
            if (freshUser.isEmailVerified !== user.isEmailVerified) {
              setUserState(freshUser);
            }
          } catch (err) {
            console.error("Failed to refresh user from localStorage:", err);
          }
        }
      }
    };

    checkEmailVerified();

    // Listen for custom emailVerified event from success page
    const handleEmailVerified = () => {
      console.log("📧 Email verified event received");
      checkEmailVerified();
    };

    window.addEventListener("emailVerified", handleEmailVerified);

    return () => {
      window.removeEventListener("emailVerified", handleEmailVerified);
    };
  }, [user?.isEmailVerified]);

  // Load addresses when switching to addresses tab
  useEffect(() => {
    if (activeTab === "addresses" && user) {
      loadAddresses();
    }
    if (activeTab === "orders" && user) {
      loadOrders();
    }
  }, [activeTab, user]);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true)
      const data = await ordersService.getMyOrders()
      // Sort by newest first
      const sortedData = data.sort((a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
      setOrders(sortedData)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const getFilteredOrders = () => {
    return orders.filter(order => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && order.status !== statusFilter) {
        return false
      }

      // 2. Time Filter
      if (timeFilter !== "ALL") {
        const orderDate = new Date(order.orderDate)
        const now = new Date()

        if (timeFilter === "30_DAYS") {
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
          if (orderDate < thirtyDaysAgo) return false
        } else if (timeFilter === "6_MONTHS") {
          const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6))
          if (orderDate < sixMonthsAgo) return false
        } else if (timeFilter === "THIS_YEAR") {
          const startOfYear = new Date(new Date().getFullYear(), 0, 1)
          if (orderDate < startOfYear) return false
        }
      }

      return true
    })
  }

  const filteredOrders = getFilteredOrders()

  const filterTabs = [
    { id: "ALL", label: "Tất cả" },
    { id: "PENDING", label: "Chờ xác nhận" },
    { id: "CONFIRMED", label: "Đã xác nhận" },
    { id: "PROCESSING", label: "Đang xử lý" },
    { id: "SHIPPED", label: "Đang giao" },
    { id: "DELIVERED", label: "Đã giao" },
    { id: "COMPLETED", label: "Hoàn thành" },
    { id: "CANCELLED", label: "Đã hủy" },
  ]

  const loadAddresses = async () => {
    try {
      setAddressesLoading(true);
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Error loading addresses:", error);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      return;
    }

    try {
      await addressService.deleteAddress(addressId);
      await loadAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Có lỗi xảy ra khi xóa địa chỉ");
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Bạn chưa đăng nhập</p>
            <Link href="/login">
              <Button>Đăng nhập ngay</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
                {/* User Info */}
                <div className="text-center mb-6">
                  {(userProfile?.avatarUrl || user?.avatar) ? (
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-primary">
                      <Image
                        src={userProfile?.avatarUrl || user?.avatar || ""}
                        alt={userProfile?.fullName || user?.fullName || "Avatar"}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                      {(
                        userProfile?.fullName?.charAt(0) ||
                        user.fullName?.charAt(0) ||
                        userProfile?.email?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "?"
                      ).toUpperCase()}
                    </div>
                  )}
                  <h2 className="font-bold text-foreground">
                    {userProfile?.fullName || user.fullName || "Khách hàng BookSphere"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.email || user.email || "Không có email"}
                  </p>
                  {userProfile?.membershipTier && (
                    <p className="text-xs text-primary mt-1 font-medium">
                      {userProfile.membershipTier}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {(userProfile?.points ?? 0).toLocaleString("vi-VN")} điểm
                  </p>
                </div>

                {/* Menu */}
                <nav className="space-y-2 mb-6">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === "profile"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                      }`}
                  >
                    <UserIcon size={18} />
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === "orders"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                      }`}
                  >
                    <ShoppingBag size={18} />
                    Đơn hàng
                  </button>
                  <button
                    onClick={() => setActiveTab("wishlist")}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === "wishlist"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                      }`}
                  >
                    <Heart size={18} />
                    Danh sách yêu thích
                  </button>
                  <button
                    onClick={() => setActiveTab("addresses")}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === "addresses"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                      }`}
                  >
                    <MapPin size={18} />
                    Địa chỉ của tôi
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition ${activeTab === "settings"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                      }`}
                  >
                    <Settings size={18} />
                    Cài đặt
                  </button>
                </nav>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" />
                  Đăng xuất
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              {activeTab === "profile" && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Thông tin cá nhân
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Tên đăng nhập
                        </label>
                        <p className="text-foreground font-medium">
                          {userProfile?.username || user.username || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Họ và tên
                        </label>
                        <p className="text-foreground font-medium">
                          {userProfile?.fullName || user.fullName || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Email
                        </label>
                        <div className="flex items-center gap-3">
                          <p className="text-foreground font-medium">
                            {userProfile?.email || user.email}
                          </p>
                          {(userProfile?.email || user?.email) && (
                            <EmailVerification
                              email={userProfile?.email || user.email || ""}
                              isVerified={localEmailVerified}
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Số điện thoại
                        </label>
                        <p className="text-foreground font-medium">
                          {userProfile?.phoneNumber || user.phone || "Chưa cập nhật"}
                        </p>
                      </div>
                      {userProfile?.dateOfBirth && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Ngày sinh
                          </label>
                          <p className="text-foreground font-medium">
                            {new Date(userProfile.dateOfBirth).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Giới tính
                        </label>
                        <p className="text-foreground font-medium">
                          {userProfile?.gender
                            ? (userProfile.gender.toUpperCase() === "MALE" ? "Nam" : userProfile.gender.toUpperCase() === "FEMALE" ? "Nữ" : "Khác")
                            : "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Hạng thành viên
                        </label>
                        <p className="text-foreground font-medium">
                          {userProfile?.membershipTier || "Chưa có"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                          Điểm tích lũy
                        </label>
                        <p className="text-foreground font-medium">
                          {(userProfile?.points ?? 0).toLocaleString("vi-VN")} điểm
                        </p>
                      </div>
                      {userProfile?.lastLogin && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Lần đăng nhập cuối
                          </label>
                          <p className="text-foreground font-medium">
                            {new Date(userProfile.lastLogin).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      )}
                      {user?.createdAt && (
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Ngày tạo tài khoản
                          </label>
                          <p className="text-foreground font-medium">
                            {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button className="mt-4" onClick={() => setIsEditingProfile(true)}>Chỉnh sửa thông tin</Button>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Đơn hàng của tôi
                  </h2>

                  {/* Filters Section */}
                  <div className="space-y-4 mb-6">
                    {/* Status Tabs - Scrollable on mobile */}
                    <div className="flex overflow-x-auto pb-2 gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                      {filterTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setStatusFilter(tab.id)}
                          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === tab.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Time Filter & Stats */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Thời gian:</span>
                        <select
                          value={timeFilter}
                          onChange={(e) => setTimeFilter(e.target.value)}
                          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="ALL">Toàn bộ thời gian</option>
                          <option value="30_DAYS">30 ngày gần đây</option>
                          <option value="6_MONTHS">6 tháng gần đây</option>
                          <option value="THIS_YEAR">Năm nay ({new Date().getFullYear()})</option>
                        </select>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Hiển thị {filteredOrders.length} đơn hàng
                      </div>
                    </div>
                  </div>

                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Đang tải đơn hàng...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag
                        size={48}
                        className="mx-auto text-muted-foreground mb-4 opacity-50"
                      />
                      <p className="text-muted-foreground mb-4">
                        Không tìm thấy đơn hàng nào
                      </p>
                      {statusFilter !== "ALL" || timeFilter !== "ALL" ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStatusFilter("ALL")
                            setTimeFilter("ALL")
                          }}
                        >
                          Xóa bộ lọc
                        </Button>
                      ) : (
                        <Link href="/products">
                          <Button>Mua sắm ngay</Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => {
                        const statusConfig: Record<string, { label: string; color: string }> = {
                          PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
                          CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
                          PROCESSING: { label: "Đang chuẩn bị", color: "bg-blue-100 text-blue-700" },
                          SHIPPED: { label: "Đang giao", color: "bg-purple-100 text-purple-700" },
                          DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-700" },
                          CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
                          COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
                        }
                        const config = statusConfig[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" }

                        return (
                          <Link key={order.id} href={`/account/orders/${order.id}`}>
                            <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="font-bold text-lg text-foreground">Đơn hàng #{order.orderCode || order.id.substring(0, 8)}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                                  {config.label}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Số lượng sách</p>
                                  <p className="font-semibold text-foreground">{order.items.length}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Tổng tiền</p>
                                  <p className="font-semibold text-primary text-lg">{order.total.toLocaleString("vi-VN")}₫</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Phương thức thanh toán</p>
                                  <p className="font-semibold text-foreground">
                                    {order.paymentMethod}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary">
                                  <span className="text-sm font-medium">Xem chi tiết</span>
                                  <ChevronRight size={16} />
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "wishlist" && <WishlistSection />}

              {activeTab === "addresses" && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      Địa chỉ của tôi
                    </h2>
                    <Button onClick={handleAddNewAddress}>
                      <MapPin size={18} className="mr-2" />
                      Thêm địa chỉ mới
                    </Button>
                  </div>

                  {addressesLoading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Đang tải...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin
                        size={48}
                        className="mx-auto text-muted-foreground mb-4 opacity-50"
                      />
                      <p className="text-muted-foreground">
                        Chưa có địa chỉ nào
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="border border-border rounded-lg p-4 hover:border-primary transition"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {address.recipientName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {address.phoneNumber}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="text-muted-foreground hover:text-primary transition"
                                onClick={() => handleEditAddress(address)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="text-muted-foreground hover:text-destructive transition"
                                onClick={() => handleDeleteAddress(address.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-foreground">
                            {address.street}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.ward}, {address.district}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.province}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Cài đặt
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">
                          Thông báo email
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Nhận thông báo về đơn hàng và khuyến mãi
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Nhận SMS</p>
                        <p className="text-sm text-muted-foreground">
                          Nhận thông báo qua SMS
                        </p>
                      </div>
                      <input type="checkbox" className="w-5 h-5" />
                    </div>
                    <Button className="mt-4">Lưu thay đổi</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Address Modal */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        addresses={addresses}
        onSelectAddress={() => { }}
        onAddressCreated={() => {
          loadAddresses();
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        editingAddress={editingAddress}
        onAddressUpdated={() => {
          loadAddresses();
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
      />
      <ProfileEditDialog
        user={userProfile && Object.keys(userProfile).length > 0 ? (userProfile as unknown as User) : user}
        open={isEditingProfile}
        onOpenChange={setIsEditingProfile}
        onProfileUpdated={fetchUserProfile}
      />
    </div>
  );
}
