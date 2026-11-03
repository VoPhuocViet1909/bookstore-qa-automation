import { useMemo, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  joinDate: string;
  status?: "active" | "inactive" | "banned";
  avatar?: string;
  emailVerified?: boolean;
}

export interface UserFilterState {
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface UserFilterActions {
  setSearchTerm: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setSortBy: (value: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  resetFilters: () => void;
}

export interface UserActions {
  deleteUser: (id: string) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  banUser: (id: string) => void;
  unbanUser: (id: string) => void;
}

export function useUserFilters(initialUsers: User[]) {
  // Users state
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("joinDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Status options
  const statusOptions = useMemo(
    () => ["Tất cả", "Hoạt động", "Không hoạt động", "Bị cấm"],
    []
  );

  // Sort options
  const sortOptions = useMemo(
    () => [
      { value: "name", label: "Tên" },
      { value: "joinDate", label: "Ngày tham gia" },
      { value: "totalSpent", label: "Tổng chi tiêu" },
      { value: "orders", label: "Số đơn hàng" },
    ],
    []
  );

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    if (!users || users.length === 0) {
      return [];
    }

    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm);

      const matchesStatus =
        statusFilter === "Tất cả" ||
        (statusFilter === "Hoạt động" &&
          (user.status === "active" || !user.status)) ||
        (statusFilter === "Không hoạt động" && user.status === "inactive") ||
        (statusFilter === "Bị cấm" && user.status === "banned");

      return matchesSearch && matchesStatus;
    });

    // Sort filtered results
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];

      if (sortBy === "joinDate") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, sortBy, sortOrder, users]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("Tất cả");
    setSortBy("joinDate");
    setSortOrder("desc");
  };

  // User actions
  const deleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const updateUser = (id: string, updatedUser: Partial<User>) => {
    setUsers(
      users.map((user) => (user.id === id ? { ...user, ...updatedUser } : user))
    );
  };

  const banUser = (id: string) => {
    updateUser(id, { status: "banned" });
  };

  const unbanUser = (id: string) => {
    updateUser(id, { status: "active" });
  };

  // Statistics
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        bannedUsers: 0,
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        avgRevenuePerUser: 0,
      };
    }

    const totalRevenue = users.reduce((sum, user) => sum + user.totalSpent, 0);
    const totalOrders = users.reduce((sum, user) => sum + user.orders, 0);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === "active" || !u.status)
        .length,
      inactiveUsers: users.filter((u) => u.status === "inactive").length,
      bannedUsers: users.filter((u) => u.status === "banned").length,
      totalRevenue,
      totalOrders,
      avgOrderValue:
        totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      avgRevenuePerUser:
        users.length > 0 ? Math.round(totalRevenue / users.length) : 0,
    };
  }, [users]);

  return {
    users,
    filterState: {
      searchTerm,
      statusFilter,
      sortBy,
      sortOrder,
    },
    filteredUsers,
    statusOptions,
    sortOptions,
    stats,
    filterActions: {
      setSearchTerm,
      setStatusFilter,
      setSortBy,
      setSortOrder,
      resetFilters,
    },
    userActions: {
      deleteUser,
      updateUser,
      banUser,
      unbanUser,
    },
  };
}
