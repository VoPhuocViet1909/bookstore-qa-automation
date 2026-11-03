import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** Trang thanh toán: /checkout */
export class CheckoutPage extends BasePage {
  readonly codOption: Locator;
  readonly payButton: Locator;
  readonly discountInput: Locator;
  readonly applyDiscount: Locator;
  readonly shippingValue: Locator;

  constructor(page: Page) {
    super(page);
    this.codOption = page.getByText('Thanh toán khi nhận hàng (COD)');
    this.payButton = page.getByRole('button', { name: /^Thanh toán \(.+₫\)$/ });
    this.discountInput = page.getByPlaceholder('Mã giảm giá');
    this.applyDiscount = page.getByRole('button', { name: 'Áp dụng' });
    this.shippingValue = page.getByText('Vận chuyển:').locator('xpath=following-sibling::span[1]');
  }

  /** Đọc số tiền trên nút "Thanh toán (xxx₫)" */
  async displayedTotal(): Promise<number> {
    const text = (await this.payButton.textContent()) ?? '';
    return Number(text.replace(/[^\d]/g, ''));
  }
}
