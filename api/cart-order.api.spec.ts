import { test, expect } from '@playwright/test';
import { loadSeed } from '../utils/seed';
import { freshCustomer, stockOf } from '../utils/helpers';

const seed = loadSeed();
const SHIPPING_FALLBACK = 30000; // phí ship mặc định khi không gọi được GHN

test.describe('API - Giỏ hàng', () => {
  test('TC-API-CART-01 Thêm sách vào giỏ và xem giỏ hàng @smoke', async () => {
    const { api } = await freshCustomer('cart');
    const add = await api.post('cart/add', { bookId: seed.books.main.id, quantity: 2 });
    expect(add.status).toBe(200);
    expect(add.body.code).toBe(1000);

    const cart = await api.get('cart');
    expect(cart.status).toBe(200);
    const item = cart.body.result.items.find((i: any) => i.bookId === seed.books.main.id);
    expect(item.quantity).toBe(2);
    expect(item.subTotal).toBe(seed.books.main.price * 2);
    await api.dispose();
  });

  test('TC-API-CART-02 Thêm cùng sách 2 lần thì cộng dồn số lượng', async () => {
    const { api } = await freshCustomer('cart');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 3 });
    const cart = await api.get('cart');
    expect(cart.body.result.items).toHaveLength(1);
    expect(cart.body.result.items[0].quantity).toBe(4);
    await api.dispose();
  });

  test('TC-API-CART-03 BVA số lượng: 0 và -1 bị từ chối (400)', async () => {
    const { api } = await freshCustomer('cart');
    expect((await api.post('cart/add', { bookId: seed.books.main.id, quantity: 0 })).status).toBe(400);
    expect((await api.post('cart/add', { bookId: seed.books.main.id, quantity: -1 })).status).toBe(400);
    await api.dispose();
  });

  test('TC-API-CART-04 BVA tồn kho: thêm đúng bằng tồn kho được, vượt tồn kho bị từ chối', async () => {
    const { api } = await freshCustomer('cart');
    const stock = await stockOf(seed.books.lowStock.id);
    const over = await api.post('cart/add', { bookId: seed.books.lowStock.id, quantity: stock + 1 });
    // Lỗi nghiệp vụ phải trả HTTP 4xx để client xử lý đúng, không phải 200 kèm code lỗi
    expect(over.body.code).not.toBe(1000);
    expect(over.status, `HTTP status thực tế: ${over.status}, body: ${JSON.stringify(over.body)}`).toBeGreaterThanOrEqual(400);

    const exact = await api.post('cart/add', { bookId: seed.books.lowStock.id, quantity: stock });
    expect(exact.body.code).toBe(1000);
    await api.dispose();
  });

  test('TC-API-CART-05 Cập nhật số lượng và xóa sản phẩm khỏi giỏ', async () => {
    const { api } = await freshCustomer('cart');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    const upd = await api.put(`cart/update/${seed.books.main.id}`, { quantity: 5 });
    expect(upd.body.code).toBe(1000);
    expect((await api.get('cart')).body.result.items[0].quantity).toBe(5);

    const del = await api.delete(`cart/remove/${seed.books.main.id}`);
    expect(del.body.code).toBe(1000);
    expect((await api.get('cart')).body.result.items).toHaveLength(0);
    await api.dispose();
  });
});

test.describe('API - Đặt hàng (COD)', () => {
  test('TC-API-ORD-01 Đặt hàng COD: tổng tiền = tạm tính + phí ship, tồn kho giảm @smoke', async () => {
    const { api, addressId } = await freshCustomer('ord');
    const before = await stockOf(seed.books.second.id);
    await api.post('cart/add', { bookId: seed.books.second.id, quantity: 2 });

    const res = await api.post('orders/checkout', { addressId, paymentMethod: 'COD' });
    expect(res.body.code, JSON.stringify(res.body)).toBe(1000);
    const order = res.body.result;
    expect(order.status).toBe('PENDING');
    expect(Number(order.subtotal)).toBe(seed.books.second.price * 2);
    expect(Number(order.total)).toBe(Number(order.subtotal) + Number(order.shippingFee) - Number(order.discountAmount ?? 0));
    expect(await stockOf(seed.books.second.id)).toBe(before - 2);

    // Giỏ hàng phải trống sau khi đặt
    expect((await api.get('cart')).body.result.items).toHaveLength(0);
    await api.dispose();
  });

  test('TC-API-ORD-02 Áp mã giảm giá 10% khi đặt hàng', async () => {
    const { api, addressId } = await freshCustomer('ord');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    const res = await api.post('orders/checkout', { addressId, paymentMethod: 'COD', discountCode: seed.promo.code });
    expect(res.body.code, JSON.stringify(res.body)).toBe(1000);
    const o = res.body.result;
    expect(Number(o.discountAmount)).toBe(seed.books.main.price * 0.1);
    expect(Number(o.total)).toBe(seed.books.main.price * 0.9 + Number(o.shippingFee));
    await api.dispose();
  });

  test('TC-API-ORD-03 Đặt hàng khi giỏ trống bị từ chối', async () => {
    const { api, addressId } = await freshCustomer('ord');
    const res = await api.post('orders/checkout', { addressId, paymentMethod: 'COD' });
    expect(res.body.code).not.toBe(1000);
    expect(res.status).toBeGreaterThanOrEqual(400);
    await api.dispose();
  });

  test('TC-API-ORD-04 Hủy đơn PENDING thì hoàn lại tồn kho', async () => {
    const { api, addressId } = await freshCustomer('ord');
    const before = await stockOf(seed.books.main.id);
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 3 });
    const order = (await api.post('orders/checkout', { addressId, paymentMethod: 'COD' })).body.result;
    expect(await stockOf(seed.books.main.id)).toBe(before - 3);

    const cancel = await api.post(`orders/${order.id}/cancel`);
    expect(cancel.body.code, JSON.stringify(cancel.body)).toBe(1000);
    expect(cancel.body.result.status).toBe('CANCELLED');
    expect(await stockOf(seed.books.main.id)).toBe(before);
    await api.dispose();
  });

  test('TC-API-ORD-05 Lịch sử đơn hàng chỉ chứa đơn của chính mình', async () => {
    const { api, addressId } = await freshCustomer('ord');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    const mine = (await api.post('orders/checkout', { addressId, paymentMethod: 'COD' })).body.result;
    const list = await api.get('orders');
    expect(list.status).toBe(200);
    const ids = list.body.result.map((o: any) => o.id);
    expect(ids).toEqual([mine.id]);
    await api.dispose();
  });

  test('TC-API-ORD-06 Phí ship mặc định được áp dụng khi không tính được phí GHN', async () => {
    const { api, addressId } = await freshCustomer('ord');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    const o = (await api.post('orders/checkout', { addressId, paymentMethod: 'COD' })).body.result;
    expect(Number(o.shippingFee)).toBe(SHIPPING_FALLBACK);
    await api.dispose();
  });
});
