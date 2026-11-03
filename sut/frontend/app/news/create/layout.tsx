import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Soạn thảo tin tức - Nhà Sách Online",
  description: "Tạo và chỉnh sửa tin tức",
}

export default function CreateNewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
