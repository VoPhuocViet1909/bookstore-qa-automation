import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly errorBox: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByPlaceholder('admin');
    this.password = page.getByPlaceholder('••••••••');
    this.submit = page.locator('form').getByRole('button', { name: 'Đăng nhập', exact: true });
    this.errorBox = page.locator('form .text-destructive').first();
  }

  async open(redirect?: string) {
    await this.goto(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}
