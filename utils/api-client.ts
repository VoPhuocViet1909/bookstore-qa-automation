import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { API_URL } from '../playwright.config';

/** Cấu trúc response chuẩn của backend: { code, message, result } */
export interface ApiBody<T = any> {
  code: number;
  message?: string;
  result?: T;
}

export interface ApiResult<T = any> {
  status: number;
  body: ApiBody<T>;
  raw: APIResponse;
}

/**
 * Wrapper mỏng quanh APIRequestContext của Playwright:
 *  - tự gắn Bearer token
 *  - tự parse JSON (kể cả khi lỗi)
 * Đường dẫn truyền vào KHÔNG có dấu "/" ở đầu, ví dụ: api.get('books').
 */
export class BookstoreApi {
  constructor(private ctx: APIRequestContext, public token?: string) {}

  static async create(token?: string): Promise<BookstoreApi> {
    const ctx = await request.newContext({ baseURL: API_URL + '/' });
    return new BookstoreApi(ctx, token);
  }

  private headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  private async wrap<T>(res: APIResponse): Promise<ApiResult<T>> {
    let body: any = {};
    try { body = await res.json(); } catch { body = { code: -1, message: await res.text() }; }
    return { status: res.status(), body, raw: res };
  }

  async get<T = any>(path: string, params?: Record<string, string | number | boolean>) {
    return this.wrap<T>(await this.ctx.get(path, { headers: this.headers(), params }));
  }
  async post<T = any>(path: string, data?: unknown, params?: Record<string, string | number | boolean>) {
    return this.wrap<T>(await this.ctx.post(path, { headers: this.headers(), data, params }));
  }
  async put<T = any>(path: string, data?: unknown, params?: Record<string, string | number | boolean>) {
    return this.wrap<T>(await this.ctx.put(path, { headers: this.headers(), data, params }));
  }
  async patch<T = any>(path: string, data?: unknown, params?: Record<string, string | number | boolean>) {
    return this.wrap<T>(await this.ctx.patch(path, { headers: this.headers(), data, params }));
  }
  async delete<T = any>(path: string, params?: Record<string, string | number | boolean>) {
    return this.wrap<T>(await this.ctx.delete(path, { headers: this.headers(), params }));
  }

  /** Đăng nhập và trả về client đã gắn token */
  static async login(username: string, password: string): Promise<BookstoreApi> {
    const api = await BookstoreApi.create();
    const res = await api.post<{ token: string }>('auth/login', { username, password });
    if (res.status !== 200 || !res.body.result?.token) {
      throw new Error(`Login thất bại cho ${username}: ${res.status} ${JSON.stringify(res.body)}`);
    }
    api.token = res.body.result.token;
    return api;
  }

  async dispose() { await this.ctx.dispose(); }
}
