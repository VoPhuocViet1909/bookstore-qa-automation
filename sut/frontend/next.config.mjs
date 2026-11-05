import path from "node:path"
import { fileURLToPath } from "node:url"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Chỉ rõ thư mục gốc là sut/frontend, nếu không Next.js chọn nhầm
  // thư mục cha (có package-lock.json của bộ test Playwright)
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
