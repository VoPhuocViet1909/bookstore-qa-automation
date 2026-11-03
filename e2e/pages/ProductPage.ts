import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Trang chi tiết sách: /products/{id} */
export class ProductPage extends BasePage {
  readonly title: Locator;
  readonly addToCart: Locator;
  readonly qtyValue: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('h1').first();
    this.addToCart = page.getByRole('button', { name: /Thêm vào giỏ|Hết hàng/ });
    // Ô hiển thị số lượng nằm giữa 2 nút - / +
    this.qtyValue = this.addToCart.locator('xpath=preceding::span[1]');
  }

  async open(bookId: string) {
    await this.goto(`/products/${bookId}`);
    await this.title.waitFor();
  }
}
