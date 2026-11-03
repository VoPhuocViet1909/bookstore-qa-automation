import { defineConfig, devices } from '@playwright/test';

export const API_URL = process.env.API_URL ?? 'http://localhost:8080/api';
export const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: false,
  workers: 1,                       // dữ liệu dùng chung (giỏ hàng, tồn kho) -> chạy tuần tự cho ổn định
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './api',
      use: { baseURL: API_URL + '/' },
    },
    {
      name: 'e2e',
      testDir: './e2e/specs',
      use: { ...devices['Desktop Chrome'], baseURL: WEB_URL, locale: 'vi-VN' },
    },
  ],
});
