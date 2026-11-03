/**
 * Thêm dữ liệu mẫu (danh mục, tác giả, ~20 cuốn sách) để web trông giống thật khi test thủ công.
 * Chạy:  node scripts/seed-sample-data.mjs      (tại thư mục bookstore-qa/tests)
 * Chạy lại nhiều lần không sao: cái gì đã có (trùng tên) sẽ được bỏ qua.
 * Yêu cầu: backend đang chạy ở http://localhost:8080 và có tài khoản admin/admin.
 */
const API = process.env.API_URL ?? 'http://localhost:8080/api';
const ADMIN_USER = process.env.ADMIN_USER ?? 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS ?? 'admin';

let token = '';
async function call(method, path, body) {
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try { json = await res.json(); } catch { /* không phải JSON */ }
  return { status: res.status, body: json };
}
function must(res, what) {
  if (res.status !== 200 || res.body.code !== 1000) {
    throw new Error(`${what} thất bại: HTTP ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.result;
}
const list = r => (Array.isArray(r) ? r : r?.content ?? []);

const CATEGORIES = [
  ['Văn học', 'Tiểu thuyết, truyện ngắn trong và ngoài nước'],
  ['Kinh tế', 'Kinh doanh, tài chính, quản trị'],
  ['Kỹ năng sống', 'Phát triển bản thân'],
  ['Thiếu nhi', 'Sách cho trẻ em'],
  ['Công nghệ', 'Lập trình, kiểm thử phần mềm, CNTT'],
];
const AUTHORS = [
  ['Nguyễn Nhật Ánh', 'Việt Nam'], ['Tô Hoài', 'Việt Nam'], ['Paulo Coelho', 'Brazil'],
  ['Dale Carnegie', 'Mỹ'], ['Robert Kiyosaki', 'Mỹ'], ['Morgan Housel', 'Mỹ'],
  ['Robert C. Martin', 'Mỹ'], ['Glenford Myers', 'Mỹ'], ['Antoine de Saint-Exupéry', 'Pháp'],
  ['James Clear', 'Mỹ'],
];
// [tên sách, tác giả, danh mục, giá, giá khuyến mãi | null, tồn kho, ngày xuất bản]
const BOOKS = [
  ['Mắt Biếc', 'Nguyễn Nhật Ánh', 'Văn học', 110000, 95000, 40, '2019-03-01'],
  ['Cho Tôi Xin Một Vé Đi Tuổi Thơ', 'Nguyễn Nhật Ánh', 'Văn học', 85000, null, 60, '2018-06-15'],
  ['Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 'Nguyễn Nhật Ánh', 'Văn học', 125000, 99000, 35, '2018-01-10'],
  ['Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'Thiếu nhi', 65000, null, 80, '2020-05-20'],
  ['Nhà Giả Kim', 'Paulo Coelho', 'Văn học', 79000, 69000, 100, '2020-09-01'],
  ['Hoàng Tử Bé', 'Antoine de Saint-Exupéry', 'Thiếu nhi', 72000, null, 50, '2019-11-11'],
  ['Đắc Nhân Tâm', 'Dale Carnegie', 'Kỹ năng sống', 86000, 76000, 120, '2021-02-14'],
  ['Quẳng Gánh Lo Đi Và Vui Sống', 'Dale Carnegie', 'Kỹ năng sống', 92000, null, 45, '2020-07-07'],
  ['Thói Quen Nguyên Tử', 'James Clear', 'Kỹ năng sống', 159000, 135000, 70, '2022-04-01'],
  ['Cha Giàu Cha Nghèo', 'Robert Kiyosaki', 'Kinh tế', 115000, 99000, 90, '2021-08-08'],
  ['Tâm Lý Học Về Tiền', 'Morgan Housel', 'Kinh tế', 189000, null, 30, '2022-10-10'],
  ['Clean Code', 'Robert C. Martin', 'Công nghệ', 350000, 315000, 25, '2019-01-01'],
  ['The Clean Coder', 'Robert C. Martin', 'Công nghệ', 290000, null, 15, '2019-06-01'],
  ['Clean Architecture', 'Robert C. Martin', 'Công nghệ', 380000, 340000, 12, '2020-03-03'],
  ['Nghệ Thuật Kiểm Thử Phần Mềm', 'Glenford Myers', 'Công nghệ', 260000, null, 20, '2021-12-01'],
  // Dữ liệu biên để test thủ công
  ['Sách Còn Đúng 1 Cuốn', 'Paulo Coelho', 'Văn học', 50000, null, 1, '2023-01-01'],
  ['Sách Đã Hết Hàng', 'Tô Hoài', 'Thiếu nhi', 45000, null, 0, '2023-01-01'],
  ['Sách Giá Rất Cao Để Test Định Dạng Số', 'Morgan Housel', 'Kinh tế', 9999000, 8999000, 5, '2023-05-05'],
  ['Sách Có Tên Rất Dài Để Kiểm Tra Giao Diện Có Bị Tràn Chữ Hay Vỡ Bố Cục Khi Hiển Thị Trên Thẻ Sản Phẩm Hay Không', 'James Clear', 'Kỹ năng sống', 99000, null, 10, '2023-06-06'],
  ['Sách Tiếng Việt Có Dấu: Ước Mơ Đường Xa', 'Nguyễn Nhật Ánh', 'Văn học', 88000, 80000, 18, '2023-07-07'],
];

async function main() {
  const login = await call('POST', 'auth/login', { username: ADMIN_USER, password: ADMIN_PASS });
  token = must(login, 'Đăng nhập admin').token;
  console.log('✔ Đăng nhập admin');

  const catId = {};
  const existingCats = list(must(await call('GET', 'categories'), 'Lấy danh mục'));
  for (const [name, description] of CATEGORIES) {
    const found = existingCats.find(c => c.name === name);
    catId[name] = found ? found.id : must(await call('POST', 'admin/categories', { name, description }), `Tạo danh mục ${name}`).id;
    console.log(`${found ? '•' : '✔'} Danh mục: ${name}`);
  }

  const authorId = {};
  const existingAuthors = list(must(await call('GET', 'authors?page=0&size=500'), 'Lấy tác giả'));
  for (const [name, nationality] of AUTHORS) {
    const found = existingAuthors.find(a => a.name === name);
    authorId[name] = found ? found.id : must(await call('POST', 'authors', { name, nationality, biography: '' }), `Tạo tác giả ${name}`).id;
    console.log(`${found ? '•' : '✔'} Tác giả: ${name}`);
  }

  const existingTitles = new Set(list(must(await call('GET', 'books?page=0&pageSize=1000'), 'Lấy sách')).map(b => b.title));
  let created = 0, i = 0;
  for (const [title, author, cat, price, discountPrice, stockQuantity, publishDate] of BOOKS) {
    i++;
    if (existingTitles.has(title)) { console.log(`• Đã có: ${title}`); continue; }
    must(await call('POST', 'admin/books', {
      title,
      isbn: `97860400${String(i).padStart(5, '0')}`,
      price, discountPrice, importPrice: Math.round(price * 0.6),
      stockQuantity, publishDate,
      description: `${title} - sách mẫu dùng cho kiểm thử thủ công.`,
      status: 'AVAILABLE',
      authorIds: [authorId[author]],
      categoryIds: [catId[cat]],
    }), `Tạo sách ${title}`);
    created++;
    console.log(`✔ Sách: ${title}`);
  }
  console.log(`\nXong! Đã thêm ${created} sách mới. Mở http://localhost:3000 để xem.`);
}

main().catch(e => { console.error('\n✘ ' + e.message); process.exit(1); });
