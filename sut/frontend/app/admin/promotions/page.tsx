"use client"

import { useState } from "react"
import { usePromotionFilters } from "@/hooks/use-promotion-filters"
import {
  PromotionsPageHeader,
  PromotionsStats,
  PromotionsFilterSection,
  PromotionsTable,
  PromotionFormModal
} from "@/components/admin"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { Promotion } from "@/lib/services/promotions.service"

export default function PromotionsPage() {
  const {
    filteredPromotions,
    allFilteredPromotions,
    filterState,
    sortState,
    paginationState,
    statusOptions,
    stats,
    isLoading,
    error,
    filterActions,
    sortActions,
    paginationActions,
    promotionActions,
    refreshPromotions
  } = usePromotionFilters()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  // Handler functions
  const handleAddPromotion = () => {
    setEditingPromotion(null)
    setIsModalOpen(true)
  }

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setIsModalOpen(true)
  }

  const handleDeletePromotion = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      await promotionActions.deletePromotion(id)
    }
  }

  const handleTogglePromotion = async (id: string, currentStatus: "ACTIVE" | "INACTIVE" | "EXPIRED", isUpcoming?: boolean) => {
    await promotionActions.togglePromotion(id, currentStatus, isUpcoming)
  }

  const handleSubmitForm = async (promotionData: any) => {
    try {
      // Transform form data to match API format
      const promotionPayload: any = {
        code: promotionData.code, // QUAN TRỌNG: Luôn thêm code khi tạo mới
        name: promotionData.name,
        description: promotionData.description || "",
        discount: promotionData.discount,
        startDate: promotionData.startDate,
        endDate: promotionData.endDate,
        usageLimit: promotionData.usageLimit,
        applicableBookIds: promotionData.applicableBookIds || [],
      }

      if (editingPromotion) {
        await promotionActions.updatePromotion(editingPromotion.id, promotionPayload)
        // Toast đã được hiện trong hook, chỉ cần đóng modal sau một chút để user thấy toast
        setTimeout(() => {
          setIsModalOpen(false)
          setEditingPromotion(null)
        }, 100)
      } else {
        await promotionActions.addPromotion(promotionPayload)
        // Toast đã được hiện trong hook, chỉ cần đóng modal sau một chút để user thấy toast
        setTimeout(() => {
          setIsModalOpen(false)
          setEditingPromotion(null)
        }, 100)
      }
    } catch (error) {
      // Error đã được handle trong hook, không đóng modal nếu có lỗi
      console.error("Error submitting promotion:", error)
    }
  }

  const handleExportData = () => {
    toast.info("Chức năng xuất dữ liệu đang phát triển")
  }

  const handleAdvancedFilter = () => {
    toast.info("Chức năng lọc nâng cao đang phát triển")
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={refreshPromotions}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="px-4 py-4 sm:p-6 lg:p-8">
          <PromotionsPageHeader
            onAddPromotion={handleAddPromotion}
            onExportData={handleExportData}
          />
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 px-4 py-6 sm:p-6 lg:p-8">
        <PromotionsStats stats={stats} />

        <PromotionsFilterSection
          filterState={filterState}
          actions={filterActions}
          statusOptions={statusOptions}
          filteredCount={allFilteredPromotions.length}
          totalCount={stats.total}
          onAdvancedFilter={handleAdvancedFilter}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <>
            <PromotionsTable
              promotions={filteredPromotions}
              onEdit={handleEditPromotion}
              onDelete={handleDeletePromotion}
              onToggle={handleTogglePromotion}
              sortState={sortState}
              onSort={sortActions.handleSort}
            />

            {/* Pagination */}
            {paginationState.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {paginationState.currentPage * paginationState.itemsPerPage + 1} - {Math.min((paginationState.currentPage + 1) * paginationState.itemsPerPage, paginationState.totalItems)} trên tổng {paginationState.totalItems} khuyến mãi
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={paginationActions.prevPage}
                    disabled={paginationState.currentPage === 0}
                  >
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, paginationState.totalPages) }, (_, i) => {
                      let pageNum
                      if (paginationState.totalPages <= 5) {
                        pageNum = i
                      } else if (paginationState.currentPage < 3) {
                        pageNum = i
                      } else if (paginationState.currentPage > paginationState.totalPages - 4) {
                        pageNum = paginationState.totalPages - 5 + i
                      } else {
                        pageNum = paginationState.currentPage - 2 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={paginationState.currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => paginationActions.goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum + 1}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={paginationActions.nextPage}
                    disabled={paginationState.currentPage >= paginationState.totalPages - 1}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <PromotionFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPromotion(null)
          }}
          onSubmit={handleSubmitForm}
          onUpdate={handleSubmitForm}
          editingPromotion={editingPromotion}
        />

      </div>
    </div>
  )
}
