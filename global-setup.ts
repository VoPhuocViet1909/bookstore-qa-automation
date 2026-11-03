/**
 * Global setup: chạy 1 lần trước toàn bộ test.
 *  1. Chờ backend sẵn sàng
 *  2. Đăng nhập admin, tạo dữ liệu test (danh mục, sách, mã khuyến mãi) qua API
 *  3. Đăng ký 2 khách hàng (A, B) để test phân quyền
 *  4. Ghi lại vào test-data/.seed.json cho các test dùng
 * Cách làm này giúp test không phụ thuộc vào dữ liệu có sẵn trong DB.
 */
import fs from 'fs';
import { BookstoreApi } from './utils/api-client';
import { newBook, newUser, uid, isoDate } from './utils/data-factory';
import { SEED_FILE, SeedData, SeedBook } from './utils/seed';
import { API_URL } from './playwright.config';

const ADMIN = {
  username: process.env.ADMIN_USER ?? 'admin',
  email: 'admin@gmail.com',
  password: process.env.ADMIN_PASS ?? 'admin',
};

async function waitForBackend(timeoutMs = 120_000) {
  const start = Date.now();
  const api = await BookstoreApi.create();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await api.get('books', { page: 0, pageSize: 1 });
      if (res.status === 200) { await api.dispose(); return; }
    } catch { /* backend chưa lên */ }
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error(`Backend không phản hồi tại ${API_URL} sau ${timeoutMs / 1000}s. Đã chạy "docker compose up -d" chưa?`);
}

function must<T>(res: { status: number; body: any }, what: string): T {
  if (res.status !== 200 || res.body.code !== 1000) {
    throw new Error(`[seed] ${what} thất bại: HTTP ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.result as T;
}

export default async function globalSetup() {
  await waitForBackend();
  const runId = uid();
  const admin = await BookstoreApi.login(ADMIN.username, ADMIN.password);

  const category = must<{ id: string }>(
    await admin.post('admin/categories', { name: `QA Category ${runId}`, description: 'Tạo bởi bộ test' }),
    'Tạo danh mục');

  // Backend bản mới bắt buộc sách phải có ít nhất 1 tác giả
  const author = must<{ id: string }>(
    await admin.post('authors', { name: `QA Author ${runId}`, biography: 'Tạo bởi bộ test', nationality: 'Việt Nam' }),
    'Tạo tác giả');

  const createBook = async (overrides: Record<string, unknown>): Promise<SeedBook> => {
    const payload = newBook({ categoryIds: [category.id], authorIds: [author.id], ...overrides });
    const b = must<{ id: string; title: string; price: number; stockQuantity: number }>(
      await admin.post('admin/books', payload), `Tạo sách ${payload.title}`);
    return { id: b.id, title: b.title, price: b.price, stock: b.stockQuantity };
  };

  const books = {
    main: await createBook({ title: `[QA] Lập trình kiểm thử ${runId}`, price: 120000, stockQuantity: 100 }),
    second: await createBook({ title: `[QA] Nhập môn Playwright ${runId}`, price: 85000, stockQuantity: 100 }),
    lowStock: await createBook({ title: `[QA] Sách sắp hết ${runId}`, price: 50000, stockQuantity: 2 }),
  };

  const promoCode = `QA${runId.toUpperCase().replace(/[^A-Z0-9]/g, '')}`.slice(0, 20);
  must(await admin.post('promotions', {
    name: `QA giảm 10% ${runId}`,
    code: promoCode,
    discountPercent: 10,
    startDate: isoDate(-1),
    endDate: isoDate(30),
    usageLimit: 1000,
    description: 'Mã giảm giá cho test',
  }), 'Tạo mã khuyến mãi');

  const registerCustomer = async (prefix: string) => {
    const u = newUser(prefix);
    const anon = await BookstoreApi.create();
    must(await anon.post('auth/register', u), `Đăng ký ${u.username}`);
    await anon.dispose();
    return { username: u.username, email: u.email, password: u.password };
  };

  const seed: SeedData = {
    runId,
    admin: ADMIN,
    customerA: await registerCustomer('qa_a'),
    customerB: await registerCustomer('qa_b'),
    categoryId: category.id,
    authorId: author.id,
    books,
    promo: { code: promoCode, percent: 10 },
  };

  fs.mkdirSync(require('path').dirname(SEED_FILE), { recursive: true });
  fs.writeFileSync(SEED_FILE, JSON.stringify(seed, null, 2));
  await admin.dispose();
  console.log(`\n[seed] runId=${runId} | sách: ${Object.values(books).map(b => b.title).join(', ')} | mã KM: ${promoCode}\n`);
}
