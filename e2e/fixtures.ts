import { test as base, Page } from '@playwright/test';
import { BookstoreApi } from '../utils/api-client';
import { LoginPage } from './pages/LoginPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

/**
 * Đăng nhập "tắt" qua API rồi bơm token vào localStorage, giống hệt cách frontend lưu
 * (authToken + user). Nhanh và ổn định hơn nhiều so với điền form đăng nhập ở mọi test.
 * Chỉ các test của chức năng Đăng nhập mới đi qua giao diện form.
 */
export async function loginViaApi(page: Page, username: string, password: string) {
  const anon = await BookstoreApi.create();
  const res = await anon.post('auth/login', { username, password });
  await anon.dispose();
  const { token, refreshToken, user } = res.body.result;
  const stored = {
    id: user.id, email: user.email, fullName: user.fullName ?? user.username,
    role: String(user.role).toUpperCase(), username: user.username,
    isEmailVerified: user.isEmailVerified ?? false, createdAt: new Date().toISOString(),
  };
  await page.addInitScript(([t, r, u]) => {
    localStorage.setItem('authToken', t as string);
    if (r) localStorage.setItem('refreshToken', r as string);
    localStorage.setItem('user', u as string);
  }, [token, refreshToken, JSON.stringify(stored)]);
  return token as string;
}

type Pages = { loginPage: LoginPage; productPage: ProductPage; cartPage: CartPage; checkoutPage: CheckoutPage };

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  productPage: async ({ page }, use) => { await use(new ProductPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
});
export { expect } from '@playwright/test';
