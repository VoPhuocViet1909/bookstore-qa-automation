import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Trang giỏ hàng: /cart */
export class CartPage extends BasePage {
  readonly heading: Locator;
  readonly checkoutButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Giỏ hàng của bạn' });
    this.checkoutButton = page.getByRole('button', { name: /^Thanh toán \(\d+\)$/ });
    this.emptyState = page.getByRole('button', { name: 'Tiếp tục mua sắm' });
  }

  async open() {
    await this.goto('/cart');
  }

  /** Một dòng sản phẩm trong giỏ, xác định bằng tên sách */
  row(title: string): Locator {
    return this.page.locator('div').filter({ has: this.page.getByRole('link', { name: title }) })
      .filter({ has: this.page.getByRole('button', { name: 'Xóa khỏi giỏ' }) }).last();
  }

  selectItem(title: string) { return this.page.getByRole('checkbox', { name: `Select ${title}` }).click(); }
  increase(title: string) { return this.row(title).getByRole('button', { name: 'Tăng số lượng' }).click(); }
  decrease(title: string) { return this.row(title).getByRole('button', { name: 'Giảm số lượng' }).click(); }
  remove(title: string) { return this.row(title).getByRole('button', { name: 'Xóa khỏi giỏ' }).click(); }
}
