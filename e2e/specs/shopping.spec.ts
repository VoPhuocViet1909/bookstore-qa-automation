import { test, expect, loginViaApi } from '../fixtures';
import { loadSeed } from '../../utils/seed';
import { freshCustomer } from '../../utils/helpers';
import { BookstoreApi } from '../../utils/api-client';

const seed = loadSeed();
const vnd = (n: number) => n.toLocaleString('vi-VN');

test.describe('E2E - Xem sách & giỏ hàng', () => {
  test('TC-E2E-SHOP-01 Trang chi tiết hiển thị đúng tên và giá sách @smoke', async ({ page, productPage }) => {
    await productPage.open(seed.books.main.id);
    await expect(page.getByRole('heading', { name: seed.books.main.title })).toBeVisible();
    await expect(page.getByText(`${vnd(seed.books.main.price)}`, { exact: false }).first()).toBeVisible();
  });

  test('TC-E2E-SHOP-02 Khách chưa đăng nhập bấm "Thêm vào giỏ" -> chuyển tới trang đăng nhập', async ({ page, productPage }) => {
    await productPage.open(seed.books.main.id);
    await productPage.addToCart.click();
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });

  test('TC-E2E-SHOP-03 Thêm sách vào giỏ và thấy trong trang giỏ hàng @smoke', async ({ page, productPage, cartPage }) => {
    const { user } = await freshCustomer('e2e');
    await loginViaApi(page, user.username, user.password);
    await productPage.open(seed.books.second.id);
    await productPage.addToCart.click();
    await expect(productPage.cartButton).toContainText('1');

    await cartPage.open();
    await expect(cartPage.heading).toBeVisible();
    await expect(page.getByRole('link', { name: seed.books.second.title })).toBeVisible();
  });

  test('TC-E2E-SHOP-04 Tăng/giảm số lượng trong giỏ cập nhật thành tiền', async ({ page, cartPage }) => {
    const { api, user } = await freshCustomer('e2e');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    await loginViaApi(page, user.username, user.password);
    await cartPage.open();
    const title = seed.books.main.title;
    await cartPage.increase(title);
    await expect(cartPage.row(title)).toContainText(`${vnd(seed.books.main.price)}₫ x 2`);
    await cartPage.decrease(title);
    await expect(cartPage.row(title)).toContainText(`${vnd(seed.books.main.price)}₫ x 1`);
    await api.dispose();
  });

  test('TC-E2E-SHOP-05 Không thể tăng số lượng vượt tồn kho', async ({ page, cartPage }) => {
    const { api, user } = await freshCustomer('e2e');
    await api.post('cart/add', { bookId: seed.books.lowStock.id, quantity: seed.books.lowStock.stock });
    await loginViaApi(page, user.username, user.password);
    await cartPage.open();
    await cartPage.increase(seed.books.lowStock.title);
    await page.waitForTimeout(1500);
    const cart = (await api.get('cart')).body.result;
    expect(cart.items[0].quantity).toBe(seed.books.lowStock.stock);
    await api.dispose();
  });

  test('TC-E2E-SHOP-06 Xóa sản phẩm khỏi giỏ', async ({ page, cartPage }) => {
    const { api, user } = await freshCustomer('e2e');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    await loginViaApi(page, user.username, user.password);
    await cartPage.open();
    await cartPage.remove(seed.books.main.title);
    await expect(page.getByRole('link', { name: seed.books.main.title })).toHaveCount(0);
    await api.dispose();
  });
});

test.describe('E2E - Thanh toán', () => {
  test('TC-E2E-CHK-01 Đặt hàng COD thành công từ giỏ hàng @smoke', async ({ page, cartPage, checkoutPage }) => {
    const { api, user } = await freshCustomer('e2e');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    await loginViaApi(page, user.username, user.password);

    await cartPage.open();
    await cartPage.selectItem(seed.books.main.title);
    await cartPage.checkoutButton.click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(checkoutPage.codOption).toBeVisible();
    await checkoutPage.payButton.click();

    await expect(page).toHaveURL(/\/account\/orders\/[0-9a-f-]{36}/, { timeout: 15_000 });
    const orders = (await api.get('orders')).body.result;
    expect(orders).toHaveLength(1);
    expect(orders[0].status).toBe('PENDING');
    await api.dispose();
  });

  test('TC-E2E-CHK-02 Số tiền hiển thị khi thanh toán phải bằng số tiền thực tế của đơn hàng', async ({ page, cartPage, checkoutPage }) => {
    const { api, user } = await freshCustomer('e2e');
    await api.post('cart/add', { bookId: seed.books.second.id, quantity: 1 });
    await loginViaApi(page, user.username, user.password);

    await cartPage.open();
    await cartPage.selectItem(seed.books.second.title);
    await cartPage.checkoutButton.click();
    await expect(checkoutPage.payButton).toBeEnabled();
    await page.waitForTimeout(1500); // chờ tính phí vận chuyển xong
    const shown = await checkoutPage.displayedTotal();
    const shippingText = (await checkoutPage.shippingValue.textContent())?.trim();
    await checkoutPage.payButton.click();
    await expect(page).toHaveURL(/\/account\/orders\//, { timeout: 15_000 });

    const order = (await api.get('orders')).body.result[0];
    expect(Number(order.total),
      `Màn hình hiển thị ${vnd(shown)}₫ (vận chuyển: "${shippingText}") nhưng đơn hàng ghi ${vnd(Number(order.total))}₫ (ship ${vnd(Number(order.shippingFee))}₫)`)
      .toBe(shown);
    await api.dispose();
  });

  test('TC-E2E-CHK-03 Áp mã giảm giá trên trang thanh toán', async ({ page, cartPage, checkoutPage }) => {
    const { api, user } = await freshCustomer('e2e');
    await api.post('cart/add', { bookId: seed.books.main.id, quantity: 1 });
    await loginViaApi(page, user.username, user.password);
    await cartPage.open();
    await cartPage.selectItem(seed.books.main.title);
    await cartPage.checkoutButton.click();
    await expect(checkoutPage.payButton).toBeEnabled();
    const before = await checkoutPage.displayedTotal();

    await checkoutPage.discountInput.fill(seed.promo.code);
    await checkoutPage.applyDiscount.click();
    await expect(page.getByText(`Giảm giá (${seed.promo.code})`)).toBeVisible();
    expect(await checkoutPage.displayedTotal()).toBe(before - seed.books.main.price * 0.1);
    await api.dispose();
  });
});

test.describe('E2E - Phân quyền giao diện @security', () => {
  test('TC-E2E-SEC-01 Khách hàng mở /admin không thấy trang quản trị', async ({ page }) => {
    await loginViaApi(page, seed.customerA.username, seed.customerA.password);
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/\/admin$/);
  });

  test('TC-E2E-ADM-01 Admin thấy sách vừa tạo trong trang quản lý sách', async ({ page }) => {
    await loginViaApi(page, seed.admin.username, seed.admin.password);
    await page.goto('/admin/books');
    await expect(page.getByRole('columnheader', { name: 'Sách' })).toBeVisible();
    // Sách mới nhất có thể nằm ở trang khác -> tìm theo tên nếu có ô tìm kiếm
    const search = page.getByPlaceholder(/Tìm/).first();
    if (await search.isVisible().catch(() => false)) await search.fill(seed.books.main.title);
    await expect(page.getByText(seed.books.main.title).first()).toBeVisible();
  });
});
