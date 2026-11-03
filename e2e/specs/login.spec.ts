import { test, expect } from '../fixtures';
import { loadSeed } from '../../utils/seed';

const seed = loadSeed();

test.describe('E2E - Đăng nhập', () => {
  test.beforeEach(async ({ loginPage }) => { await loginPage.open(); });

  test('TC-E2E-LOGIN-01 Khách hàng đăng nhập thành công -> chuyển tới trang tài khoản @smoke', async ({ page, loginPage }) => {
    await loginPage.login(seed.customerA.username, seed.customerA.password);
    await expect(page).toHaveURL(/\/account/);
    expect(await page.evaluate(() => localStorage.getItem('authToken'))).toBeTruthy();
  });

  test('TC-E2E-LOGIN-02 Admin đăng nhập thành công -> chuyển tới trang quản trị @smoke', async ({ page, loginPage }) => {
    await loginPage.login(seed.admin.username, seed.admin.password);
    await expect(page).toHaveURL(/\/admin/);
  });

  test('TC-E2E-LOGIN-03 Bỏ trống thông tin -> hiển thị thông báo yêu cầu nhập', async ({ page, loginPage }) => {
    await loginPage.submit.click();
    await expect(page.getByText('Vui lòng nhập tên đăng nhập và mật khẩu')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-E2E-LOGIN-04 Sai mật khẩu -> hiển thị đúng thông báo "Sai tên đăng nhập hoặc mật khẩu"', async ({ page, loginPage }) => {
    await loginPage.login(seed.customerA.username, 'SaiMatKhau!');
    await expect(page.getByText('Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại.')).toBeVisible();
  });

  test('TC-E2E-LOGIN-05 Không ghi mật khẩu ra console trình duyệt @security', async ({ page, loginPage }) => {
    const logs: string[] = [];
    page.on('console', m => logs.push(m.text()));
    const secret = seed.customerA.password;
    await loginPage.login(seed.customerA.username, secret);
    await expect(page).toHaveURL(/\/account/);
    const leaked = logs.filter(l => l.includes(secret));
    expect(leaked, `Mật khẩu xuất hiện trong console:\n${leaked.join('\n')}`).toHaveLength(0);
  });

  test('TC-E2E-LOGIN-06 Đăng nhập xong quay lại đúng trang được yêu cầu (redirect)', async ({ page, loginPage }) => {
    await loginPage.open('/cart');
    await loginPage.login(seed.customerA.username, seed.customerA.password);
    await expect(page).toHaveURL(/\/cart$/);
  });
});
