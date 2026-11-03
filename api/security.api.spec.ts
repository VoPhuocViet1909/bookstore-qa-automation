/**
 * Kiểm thử phân quyền (OWASP Top 10 - A01 Broken Access Control).
 * Mỗi test đăng nhập bằng tài khoản KHÁCH HÀNG và thử gọi chức năng chỉ dành cho ADMIN
 * hoặc truy cập dữ liệu của khách hàng khác. Kết quả đúng phải là 403 (hoặc 404).
 */
import { test, expect } from '@playwright/test';
import { BookstoreApi } from '../utils/api-client';
import { loadSeed } from '../utils/seed';
import { freshCustomer } from '../utils/helpers';
import { isoDate, uid } from '../utils/data-factory';

const seed = loadSeed();
const denied = (status: number) => [401, 403, 404].includes(status);

test.describe('API - Phân quyền @security', () => {
  test('TC-API-SEC-01 Khách hàng KHÔNG được xem trang quản trị sách (/api/admin/**)', async () => {
    const c = await BookstoreApi.login(seed.customerA.username, seed.customerA.password);
    expect((await c.get('admin/books')).status).toBe(403);
    await c.dispose();
  });

  test('TC-API-SEC-02 Khách hàng KHÔNG được tạo mã khuyến mãi', async () => {
    const c = await BookstoreApi.login(seed.customerA.username, seed.customerA.password);
    const code = `HACK${uid().toUpperCase()}`;
    const res = await c.post('promotions', {
      name: 'Tự tạo mã 100%', code, discountPercent: 100,
      startDate: isoDate(0), endDate: isoDate(30), usageLimit: 999,
    });
    expect(res.status, `Khách hàng tạo được mã ${code}: ${JSON.stringify(res.body)}`).toBe(403);
    await c.dispose();
  });

  test('TC-API-SEC-03 Khách hàng KHÔNG được xem danh sách đơn hàng của toàn hệ thống', async () => {
    const c = await BookstoreApi.login(seed.customerA.username, seed.customerA.password);
    const res = await c.get('orders/admin/all');
    expect(denied(res.status), `HTTP ${res.status}, trả về ${res.body.result?.content?.length ?? 0} đơn`).toBeTruthy();
    await c.dispose();
  });

  test('TC-API-SEC-04 Khách hàng KHÔNG được đổi trạng thái đơn hàng', async () => {
    const victim = await freshCustomer('victim');
    await victim.api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    const order = (await victim.api.post('orders/checkout', { addressId: victim.addressId, paymentMethod: 'COD' })).body.result;

    const attacker = await BookstoreApi.login(seed.customerB.username, seed.customerB.password);
    const res = await attacker.put(`orders/admin/${order.id}/status`, undefined, { status: 'DELIVERED' });
    const after = (await victim.api.get(`orders/${order.id}`)).body.result;
    expect(after.status, `Đơn bị đổi thành ${after.status} bởi khách hàng khác`).toBe('PENDING');
    expect(denied(res.status)).toBeTruthy();
    await victim.api.dispose(); await attacker.dispose();
  });

  test('TC-API-SEC-05 Khách hàng B KHÔNG xem được đơn hàng của khách hàng A (IDOR)', async () => {
    const victim = await freshCustomer('victim');
    await victim.api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    const order = (await victim.api.post('orders/checkout', { addressId: victim.addressId, paymentMethod: 'COD' })).body.result;

    const attacker = await BookstoreApi.login(seed.customerB.username, seed.customerB.password);
    const res = await attacker.get(`orders/${order.id}`);
    // Nếu lỗi: B đọc được tên, SĐT, địa chỉ của A
    expect(res.body.result?.customerPhone, 'Lộ SĐT khách hàng khác').toBeUndefined();
    expect(denied(res.status)).toBeTruthy();
    await victim.api.dispose(); await attacker.dispose();
  });

  test('TC-API-SEC-06 Khách hàng B KHÔNG hủy được đơn của khách hàng A', async () => {
    const victim = await freshCustomer('victim');
    await victim.api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    const order = (await victim.api.post('orders/checkout', { addressId: victim.addressId, paymentMethod: 'COD' })).body.result;

    const attacker = await BookstoreApi.login(seed.customerB.username, seed.customerB.password);
    const res = await attacker.post(`orders/${order.id}/cancel`);
    expect(res.body.code).not.toBe(1000);
    const after = (await victim.api.get(`orders/${order.id}`)).body.result;
    expect(after.status).toBe('PENDING');
    await victim.api.dispose(); await attacker.dispose();
  });

  test('TC-API-SEC-07 Khách hàng KHÔNG được xem doanh thu', async () => {
    const c = await BookstoreApi.login(seed.customerA.username, seed.customerA.password);
    const res = await c.get('orders/admin/revenue');
    expect(denied(res.status), `HTTP ${res.status}, doanh thu=${res.body.result}`).toBeTruthy();
    await c.dispose();
  });
});
