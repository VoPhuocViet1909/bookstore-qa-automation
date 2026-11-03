import { BookstoreApi } from './api-client';
import { newAddress, newUser } from './data-factory';

/** Tạo một khách hàng mới tinh (giỏ hàng trống) + 1 địa chỉ, trả về client đã đăng nhập */
export async function freshCustomer(prefix = 'cus') {
  const u = newUser(prefix);
  const anon = await BookstoreApi.create();
  const reg = await anon.post('auth/register', u);
  if (reg.status !== 200) throw new Error(`Không đăng ký được ${u.username}: ${JSON.stringify(reg.body)}`);
  await anon.dispose();
  const api = await BookstoreApi.login(u.username, u.password);
  const addr = await api.post('addresses', newAddress(u.fullName));
  if (addr.status !== 200) throw new Error(`Không tạo được địa chỉ: ${addr.status} ${JSON.stringify(addr.body)}`);
  return { api, user: u, addressId: addr.body.result.id as string };
}

export async function stockOf(bookId: string): Promise<number> {
  const anon = await BookstoreApi.create();
  const res = await anon.get(`books/${bookId}`);
  await anon.dispose();
  return res.body.result.stockQuantity;
}
