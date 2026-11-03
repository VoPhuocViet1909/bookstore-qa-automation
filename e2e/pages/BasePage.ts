import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  get cartButton(): Locator { return this.page.getByRole('button', { name: 'Mở giỏ hàng' }); }
  get searchButton(): Locator { return this.page.getByRole('button', { name: 'Tìm kiếm' }); }

  /** Toast thông báo (shadcn/sonner) */
  toast(text: string | RegExp): Locator {
    return this.page.locator('[data-sonner-toast], [role="status"], li[role="status"]').filter({ hasText: text }).first();
  }

  async goto(path: string) {
    await this.page.goto(path);
  }

  async expectPath(path: string | RegExp) {
    await expect(this.page).toHaveURL(typeof path === 'string' ? new RegExp(`${path}$`) : path);
  }
}
