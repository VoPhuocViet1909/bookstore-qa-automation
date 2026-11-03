import { test, expect } from '@playwright/test';
import { BookstoreApi } from '../utils/api-client';
import { loadSeed } from '../utils/seed';
import { isoDate, uid } from '../utils/data-factory';

const seed = loadSeed();
let admin: BookstoreApi;
let anon: BookstoreApi;
test.beforeAll(async () => {
  admin = await BookstoreApi.login(seed.admin.username, seed.admin.password);
  anon = await BookstoreApi.create();
});
test.afterAll(async () => { await admin.dispose(); await anon.dispose(); });

const promo = (o: Record<string, unknown> = {}) => ({
  name: 'QA promo', code: `QA${uid().toUpperCase()}`, discountPercent: 15,
  startDate: isoDate(0), endDate: isoDate(10), usageLimit: 5, ...o,
});

test.describe('API - Mã khuyến mãi', () => {
  test('TC-API-PRM-01 Kiểm tra mã hợp lệ @smoke', async () => {
    const res = await anon.post('promotions/validate', { code: seed.promo.code, bookIds: [seed.books.main.id] });
    expect(res.status).toBe(200);
    expect(res.body.result.isValid).toBe(true);
    expect(res.body.result.discountPercent).toBe(seed.promo.percent);
  });

  test('TC-API-PRM-02 Mã không tồn tại thì không hợp lệ', async () => {
    const res = await anon.post('promotions/validate', { code: 'KHONGTONTAI999' });
    expect(res.body.result?.isValid ?? false).toBe(false);
  });

  test('TC-API-PRM-03 Mã nhập chữ thường vẫn được nhận diện (không phân biệt hoa thường)', async () => {
    const res = await anon.post('promotions/validate', { code: seed.promo.code.toLowerCase() });
    expect(res.body.result?.isValid).toBe(true);
  });

  // BVA cho phần trăm giảm giá: [0, 100]
  for (const [pct, ok] of [[-0.1, false], [0, true], [100, true], [100.1, false]] as const) {
    test(`TC-API-PRM-04 BVA discountPercent=${pct} -> ${ok ? 'hợp lệ' : '400'}`, async () => {
      const res = await admin.post('promotions', promo({ discountPercent: pct }));
      expect(res.status).toBe(ok ? 200 : 400);
    });
  }

  test('TC-API-PRM-05 Ngày kết thúc trước ngày bắt đầu -> 400', async () => {
    const res = await admin.post('promotions', promo({ startDate: isoDate(5), endDate: isoDate(1) }));
    expect(res.status).toBe(400);
  });

  test('TC-API-PRM-06 Mã chứa ký tự đặc biệt/chữ thường -> 400', async () => {
    expect((await admin.post('promotions', promo({ code: 'qa-sale' }))).status).toBe(400);
  });

  test('TC-API-PRM-07 Trùng mã -> 409', async () => {
    const res = await admin.post('promotions', promo({ code: seed.promo.code }));
    expect(res.status).toBe(409);
  });

  test('TC-API-PRM-08 Mã hết lượt sử dụng không còn hợp lệ', async () => {
    const p = promo({ usageLimit: 1 });
    expect((await admin.post('promotions', p)).status).toBe(200);
    // Dùng hết 1 lượt bằng một đơn hàng
    const { freshCustomer } = await import('../utils/helpers');
    const { api, addressId } = await freshCustomer('prm');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    const order = await api.post('orders/checkout', { addressId, paymentMethod: 'COD', discountCode: p.code });
    expect(order.body.code, JSON.stringify(order.body)).toBe(1000);
    const res = await anon.post('promotions/validate', { code: p.code });
    expect(res.body.result?.isValid ?? false).toBe(false);
    await api.dispose();
  });
});
