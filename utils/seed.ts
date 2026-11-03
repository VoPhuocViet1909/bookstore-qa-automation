import fs from 'fs';
import path from 'path';

export interface SeedBook { id: string; title: string; price: number; stock: number; }
export interface SeedUser { username: string; email: string; password: string; }
export interface SeedData {
  runId: string;
  admin: SeedUser;
  customerA: SeedUser;
  customerB: SeedUser;
  categoryId: string;
  authorId: string;
  books: { main: SeedBook; second: SeedBook; lowStock: SeedBook };
  promo: { code: string; percent: number };
}

export const SEED_FILE = path.join(__dirname, '..', 'test-data', '.seed.json');

/**
 * Trả về dữ liệu seed theo kiểu "lazy": file chỉ được đọc khi test thực sự dùng tới.
 * (Playwright nạp file test để liệt kê test TRƯỚC khi chạy global-setup.)
 */
export function loadSeed(): SeedData {
  let cache: SeedData | undefined;
  return new Proxy({} as SeedData, {
    get(_t, prop) {
      if (!cache) {
        if (!fs.existsSync(SEED_FILE)) throw new Error('Chưa có test-data/.seed.json - global-setup chưa chạy?');
        cache = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'));
      }
      return (cache as any)[prop];
    },
  });
}
