# Bookstore QA Automation (API + E2E)

![QA Tests](https://github.com/VoPhuocViet1909/bookstore-qa-automation/actions/workflows/tests.yml/badge.svg)

Bộ kiểm thử tự động cho **NotFound Bookstore**, website bán sách (Spring Boot + Next.js), viết bằng **Playwright + TypeScript**.

> Hệ thống được test trong thư mục `sut/` (backend Spring Boot + frontend Next.js) là **dự án nhóm**, được đưa vào để dựng môi trường test. **Phần kiểm thử do mình tự xây dựng**: thiết kế test case, framework, test script, môi trường Docker, CI và bug report.

## Tổng quan

| Hạng mục | Nội dung |
|---|---|
| Số test | **79 test** (API + E2E) |
| API testing | Auth, Books, Cart, Order, Promotion, Security |
| E2E testing | Login, Product, Cart, Checkout, Admin |
| Kỹ thuật thiết kế | Boundary Value Analysis (BVA), Equivalence Partitioning (EP) |
| Security testing | Phân quyền (401/403), JWT bị sửa, user enumeration, IDOR |
| Framework | Page Object Model, fixtures, API client, data factory, seed dữ liệu tự động |
| CI | GitHub Actions: mỗi lần push tự dựng backend (Docker Compose) + frontend, chạy toàn bộ test và lưu HTML report |
| Báo cáo | Playwright HTML Report (kèm trace, screenshot, video khi fail) |
| Bug tìm được | **11 bug**, xem [docs/bugs](docs/bugs) |

## Cấu trúc thư mục

```
├── api/                  # Test API (*.api.spec.ts)
├── e2e/
│   ├── pages/            # Page Object Model
│   ├── specs/            # Test E2E
│   └── fixtures.ts
├── utils/                # API client, data factory, helpers
├── global-setup.ts       # Seed dữ liệu test qua API trước khi chạy
├── sut/                  # Hệ thống được test (dự án nhóm): backend + frontend
├── env/                  # docker-compose dựng môi trường test (MySQL, Redis, Mailpit, Backend)
├── .github/workflows/    # CI GitHub Actions
├── docs/bugs/            # Bug report
└── playwright.config.ts  # 2 project: api, e2e
```

## Cách tiếp cận

- **Test độc lập với dữ liệu có sẵn:** `global-setup.ts` gọi API admin để tạo danh mục, sách, mã khuyến mãi và 2 tài khoản khách (A, B) với id riêng cho mỗi lần chạy.
- **Test phân quyền bằng 2 tài khoản:** khách B không được xem hay huỷ đơn của khách A (IDOR).
- **Tag** `@smoke` và `@security` để chạy nhanh từng nhóm.
- Mã test case dạng `TC-API-AUTH-01`, `TC-E2E-CHK-01`... để truy vết.

## Cách chạy (local)

Yêu cầu: Node.js 20+, Docker Desktop.

```bash
# 1. Dựng backend + DB
cd env
docker compose up -d --build

# 2. Chạy frontend (PowerShell)
./env/start-frontend.ps1

# 3. Cài và chạy test
npm install
npx playwright install chromium
npm test              # toàn bộ
npm run test:api      # chỉ API
npm run test:e2e      # chỉ E2E
npm run test:smoke    # smoke
npm run report        # mở HTML report
```

## Kết quả

<!-- Chạy toàn bộ test, chụp màn hình HTML report rồi lưu vào docs/images/report.png -->
![Playwright report](docs/images/report.png)

## Bug tìm được

| ID | Mô tả | Mức độ |
|---|---|---|
| [BUG-001](docs/bugs/BUG-001.md) | Xem sách không tồn tại trả về 500 thay vì 404 | Medium |
| [BUG-002](docs/bugs/BUG-002.md) | ID sách sai định dạng trả về 500 thay vì 400 | Medium |
| [BUG-003](docs/bugs/BUG-003.md) | Lọc theo khoảng giá trả về sách nằm ngoài khoảng | Medium |
| [BUG-004](docs/bugs/BUG-004.md) | `sortType` không hợp lệ không bị từ chối (200) | Low |
| [BUG-005](docs/bugs/BUG-005.md) | Tìm kiếm trả về 500 khi dịch vụ AI không khả dụng | High |
| [BUG-006](docs/bugs/BUG-006.md) | Trang chủ bị sập khi sách không có giá khuyến mãi (`discountPrice = null`) | High |
| [BUG-007](docs/bugs/BUG-007.md) | Đặt hàng COD luôn thất bại: lỗi tạo vận đơn GHN làm rollback cả đơn | Critical |
| [BUG-008](docs/bugs/BUG-008.md) | Frontend báo "Đặt hàng thành công" và xoá giỏ dù backend trả lỗi | High |
| [BUG-009](docs/bugs/BUG-009.md) | Mật khẩu bị ghi ra console trình duyệt khi đăng nhập | High |
| [BUG-010](docs/bugs/BUG-010.md) | Sai mật khẩu hiện "Đăng nhập thất bại" thay vì "Sai tên đăng nhập hoặc mật khẩu" | Medium |
| [BUG-011](docs/bugs/BUG-011.md) | Áp mã giảm giá báo thành công nhưng tổng tiền không giảm | High |
