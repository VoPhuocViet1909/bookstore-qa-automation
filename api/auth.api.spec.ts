import { test, expect } from '@playwright/test';
import { BookstoreApi } from '../utils/api-client';
import { newUser } from '../utils/data-factory';
import { loadSeed } from '../utils/seed';

const seed = loadSeed();
let anon: BookstoreApi;
test.beforeAll(async () => { anon = await BookstoreApi.create(); });
test.afterAll(async () => { await anon.dispose(); });

test.describe('API - Đăng ký tài khoản', () => {
  test('TC-API-AUTH-01 Đăng ký hợp lệ trả về token và role CUSTOMER @smoke', async () => {
    const u = newUser('reg');
    const res = await anon.post('auth/register', u);
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(1000);
    expect(res.body.result.token).toBeTruthy();
    expect(res.body.result.user).toMatchObject({ username: u.username, email: u.email, role: 'CUSTOMER' });
    // Không bao giờ được trả mật khẩu về client
    expect(JSON.stringify(res.body)).not.toContain(u.password);
  });

  test('TC-API-AUTH-02 Đăng ký trùng username bị từ chối (409)', async () => {
    const u = newUser('dup');
    await anon.post('auth/register', u);
    const res = await anon.post('auth/register', { ...u, email: `other_${u.email}` });
    expect(res.status).toBe(409);
  });

  test('TC-API-AUTH-03 Đăng ký trùng email bị từ chối (409)', async () => {
    const u = newUser('dupmail');
    await anon.post('auth/register', u);
    const res = await anon.post('auth/register', { ...u, username: `${u.username}x` });
    expect(res.status).toBe(409);
  });

  // Kiểm thử giá trị biên (BVA): username 3..50 ký tự, password >= 6 ký tự
  const bva = [
    { name: 'username 2 ký tự (dưới biên)', patch: { username: 'ab' }, ok: false },
    { name: 'username 3 ký tự (đúng biên)', patch: { username: 'u' + Date.now().toString(36).slice(-2) }, ok: true },
    { name: 'username 51 ký tự (trên biên)', patch: { username: 'x'.repeat(51) }, ok: false },
    { name: 'password 5 ký tự (dưới biên)', patch: { password: '12345' }, ok: false },
    { name: 'password 6 ký tự (đúng biên)', patch: { password: '123456' }, ok: true },
  ];
  for (const c of bva) {
    test(`TC-API-AUTH-04 BVA: ${c.name}`, async () => {
      const res = await anon.post('auth/register', { ...newUser('bva'), ...c.patch });
      if (c.ok) expect(res.status).toBe(200);
      else expect(res.status).toBe(400);
    });
  }

  // Phân vùng tương đương (EP) cho email và số điện thoại
  const invalid = [
    { name: 'email sai định dạng', patch: { email: 'not-an-email' } },
    { name: 'email rỗng', patch: { email: '' } },
    { name: 'SĐT 9 số', patch: { phoneNumber: '091234567' } },
    { name: 'SĐT chứa chữ', patch: { phoneNumber: '09123abcde' } },
    { name: 'thiếu password', patch: { password: undefined } },
  ];
  for (const c of invalid) {
    test(`TC-API-AUTH-05 EP: ${c.name} -> 400`, async () => {
      const res = await anon.post('auth/register', { ...newUser('ep'), ...c.patch });
      expect(res.status).toBe(400);
    });
  }
});

test.describe('API - Đăng nhập & xác thực', () => {
  test('TC-API-AUTH-06 Đăng nhập bằng username @smoke', async () => {
    const res = await anon.post('auth/login', { username: seed.customerA.username, password: seed.customerA.password });
    expect(res.status).toBe(200);
    expect(res.body.result.token.split('.')).toHaveLength(3); // JWT có 3 phần
  });

  test('TC-API-AUTH-07 Đăng nhập bằng email', async () => {
    const res = await anon.post('auth/login', { username: seed.customerA.email, password: seed.customerA.password });
    expect(res.status).toBe(200);
  });

  test('TC-API-AUTH-08 Sai mật khẩu -> 401', async () => {
    const res = await anon.post('auth/login', { username: seed.customerA.username, password: 'WrongPass!' });
    expect(res.status).toBe(401);
  });

  test('TC-API-AUTH-09 Không lộ thông tin tài khoản tồn tại hay không (user enumeration) @security', async () => {
    // OWASP: sai username và sai password phải trả về CÙNG một phản hồi,
    // nếu không kẻ tấn công dò được username nào đang tồn tại.
    const wrongPass = await anon.post('auth/login', { username: seed.customerA.username, password: 'WrongPass!' });
    const unknownUser = await anon.post('auth/login', { username: `ghost_${Date.now()}`, password: 'WrongPass!' });
    expect(unknownUser.status).toBe(wrongPass.status);
    expect(unknownUser.body.message).toBe(wrongPass.body.message);
  });

  test('TC-API-AUTH-10 Gọi API cần đăng nhập khi không có token -> 401 @security', async () => {
    const res = await anon.get('cart');
    expect(res.status).toBe(401);
  });

  test('TC-API-AUTH-11 Token bị sửa (chữ ký sai) -> 401 @security', async () => {
    const api = await BookstoreApi.login(seed.customerA.username, seed.customerA.password);
    const [h, p, s] = api.token!.split('.');
    api.token = `${h}.${p}.${s.slice(0, -4)}AAAA`;
    const res = await api.get('cart');
    expect(res.status).toBe(401);
    await api.dispose();
  });
});
