"use client"

import { useState } from "react"
import {
  PageHeader,
  FilterSection,
  ContentLayout,
  BooksTable,
  StatisticsSidebar
} from "@/components/admin"
import { useAdminBooks } from "@/hooks/use-admin-books"
import { AdminBookDetail } from "@/lib/services/admin-books.service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export default function AdminBooksPage() {
  const {
    books,
    loading,
    pageData,
    fetchBooks,
    deleteBook
  } = useAdminBooks()

  const router = useRouter()

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<string | null>(null)

  // -- Handlers --

  const handleAddNewBook = () => {
    router.push("/admin/books/new")
  }

  const handleEditBook = (book: AdminBookDetail) => {
    router.push(`/admin/books/${book.id}/edit`)
  }

  const handleDeleteBook = (id: string) => {
    setBookToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (bookToDelete) {
      await deleteBook(bookToDelete)
      setDeleteConfirmOpen(false)
      setBookToDelete(null)
    }
  }



  return (
    <div className="min-h-screen bg-muted/40">
      <div className="space-y-4 px-2 py-4 sm:px-4 md:px-6 lg:px-8 w-full mx-auto">

        <PageHeader
          title="Quản lý sách"
          description="Quản lý tồn kho, cập nhật thông tin sách và theo dõi hiệu suất bán hàng."
          onAddNew={handleAddNewBook}
        // Remove onSaveFilters if not used or implement specific logic
        />

        {/* 
            TODO: Update FilterSection to support server-side filtering 
            or keep client-side for now with current page's data. 
            For now, I'll comment out specific filter actions or leave them as placeholder 
            until server-side filtering is implemented in service. 
        */}
        {/* <FilterSection 
           ...
        /> */}

        <ContentLayout
          sidebar={<StatisticsSidebar books={books as any[]} />} // Adapt stats to use real data
          sidebarSize="md"
          gap="md"
        >
          {loading ? (
            <div className="flex justify-center p-8">Loading...</div> // Or use a Spinner component
          ) : (
            <BooksTable
              books={books}
              onEdit={handleEditBook}
              onDelete={handleDeleteBook}
            />
          )}

          {/* Simple Pagination Controls (Demo) */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Trang {pageData.currentPage + 1} / {pageData.totalPages}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => fetchBooks(pageData.currentPage - 1)}
                disabled={pageData.currentPage === 0}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => fetchBooks(pageData.currentPage + 1)}
                disabled={pageData.currentPage >= pageData.totalPages - 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </ContentLayout>



        {/* Delete Confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này không thể hoàn tác. Sách sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  )
}
