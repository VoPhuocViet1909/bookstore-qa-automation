import { test, expect } from '@playwright/test';
import { BookstoreApi } from '../utils/api-client';
import { loadSeed } from '../utils/seed';

const seed = loadSeed();
let anon: BookstoreApi;
test.beforeAll(async () => { anon = await BookstoreApi.create(); });
test.afterAll(async () => { await anon.dispose(); });

test.describe('API - Danh mục sách (public)', () => {
  test('TC-API-BOOK-01 Lấy danh sách sách có phân trang đúng cấu trúc @smoke', async () => {
    const res = await anon.get('books', { page: 0, pageSize: 5 });
    expect(res.status).toBe(200);
    const page = res.body.result;
    expect(Array.isArray(page.content)).toBeTruthy();
    expect(page.content.length).toBeLessThanOrEqual(5);
    expect(page).toHaveProperty('totalElements');
    expect(page).toHaveProperty('totalPages');
  });

  test('TC-API-BOOK-02 Xem chi tiết sách theo ID @smoke', async () => {
    const res = await anon.get(`books/${seed.books.main.id}`);
    expect(res.status).toBe(200);
    expect(res.body.result).toMatchObject({ id: seed.books.main.id, title: seed.books.main.title, price: seed.books.main.price });
  });

  test('TC-API-BOOK-03 Sách không tồn tại -> 404 (không phải 500)', async () => {
    const res = await anon.get('books/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });

  test('TC-API-BOOK-04 ID sai định dạng -> 400 (không phải 500)', async () => {
    const res = await anon.get('books/not-a-uuid');
    expect(res.status).toBe(400);
  });

  test('TC-API-BOOK-05 Lọc theo khoảng giá chỉ trả về sách trong khoảng', async () => {
    const res = await anon.get('books/filter', { minPrice: 80000, maxPrice: 130000, size: 100 });
    expect(res.status).toBe(200);
    const items: any[] = res.body.result.content;
    for (const b of items) {
      const p = b.discountPrice ?? b.price;
      expect(p, `${b.title} có giá ${p}`).toBeGreaterThanOrEqual(80000);
      expect(p, `${b.title} có giá ${p}`).toBeLessThanOrEqual(130000);
    }
    expect(items.map(b => b.id)).toContain(seed.books.main.id);
  });

  test('TC-API-BOOK-06 Lọc với minPrice > maxPrice -> 400', async () => {
    const res = await anon.get('books/filter', { minPrice: 200000, maxPrice: 100000 });
    expect(res.status).toBe(400);
  });

  test('TC-API-BOOK-07 BVA: size=0 và size=101 bị từ chối, size=100 hợp lệ', async () => {
    expect((await anon.get('books/filter', { size: 0 })).status).toBe(400);
    expect((await anon.get('books/filter', { size: 101 })).status).toBe(400);
    expect((await anon.get('books/filter', { size: 100 })).status).toBe(200);
  });

  test('TC-API-BOOK-08 Sắp xếp giá tăng dần trả về đúng thứ tự', async () => {
    const res = await anon.get('books/sorted', { sortType: 'price_asc', size: 50 });
    expect(res.status).toBe(200);
    const prices: number[] = res.body.result.content.map((b: any) => b.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('TC-API-BOOK-09 sortType không hợp lệ -> 400', async () => {
    const res = await anon.get('books/sorted', { sortType: 'hack_desc' });
    expect(res.status).toBe(400);
  });

  test('TC-API-BOOK-10 Tìm kiếm theo từ khóa vẫn hoạt động khi dịch vụ AI không khả dụng', async () => {
    // Môi trường test không có Gemini/Qdrant thật. Hệ thống cần fallback về tìm kiếm DB
    // thay vì trả lỗi 500 cho người dùng (graceful degradation).
    const res = await anon.get('books/search', { keyword: 'Playwright' });
    expect(res.status).toBe(200);
    expect(res.body.result.content.map((b: any) => b.id)).toContain(seed.books.second.id);
  });

  test('TC-API-BOOK-11 Sách bán chạy và gợi ý trả về danh sách', async () => {
    for (const path of ['books/best-selling', 'books/suggested']) {
      const res = await anon.get(path, { limit: 4 });
      expect(res.status, path).toBe(200);
      expect(Array.isArray(res.body.result), path).toBeTruthy();
    }
  });
});

test.describe('API - Quản trị sách (admin)', () => {
  test('TC-API-BOOK-12 Admin tạo sách: thiếu tiêu đề -> 400', async () => {
    const admin = await BookstoreApi.login(seed.admin.username, seed.admin.password);
    const res = await admin.post('admin/books', { isbn: '9781234567897', price: 1000, stockQuantity: 1, publishDate: '2024-01-01' });
    expect(res.status).toBe(400);
    await admin.dispose();
  });

  test('TC-API-BOOK-13 BVA giá: price=0 bị từ chối, tồn kho âm bị từ chối', async () => {
    const admin = await BookstoreApi.login(seed.admin.username, seed.admin.password);
    // Các trường khác đều hợp lệ -> nếu bị 400 thì chắc chắn là do giá/tồn kho
    const base = { title: '[QA] BVA', isbn: `978${Date.now().toString().slice(-10)}`, publishDate: '2024-01-01',
      status: 'AVAILABLE', categoryIds: [seed.categoryId], authorIds: [seed.authorId] };
    expect((await admin.post('admin/books', { ...base, price: 0, stockQuantity: 1 })).status).toBe(400);
    expect((await admin.post('admin/books', { ...base, price: 1000, stockQuantity: -1 })).status).toBe(400);
    await admin.dispose();
  });

  test('TC-API-BOOK-14 Khách hàng không được tạo sách (403) @security', async () => {
    const customer = await BookstoreApi.login(seed.customerA.username, seed.customerA.password);
    const res = await customer.post('admin/books', { title: 'hack', isbn: '9780000000001', price: 1, stockQuantity: 1, publishDate: '2024-01-01' });
    expect(res.status).toBe(403);
    await customer.dispose();
  });
});
