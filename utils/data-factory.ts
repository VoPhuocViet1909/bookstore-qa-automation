/** Sinh dữ liệu test duy nhất cho mỗi lần chạy để test không phụ thuộc lẫn nhau */
export const uid = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export function newUser(prefix = 'qa') {
  const id = uid();
  return {
    username: `${prefix}_${id}`.slice(0, 50),
    email: `${prefix}_${id}@test.local`,
    password: 'Test@123',
    fullName: `QA ${prefix} ${id}`,
    phoneNumber: '0912345678',
  };
}

/** Địa chỉ hợp lệ (mã GHN giả, vì GHN không được kết nối trong môi trường test) */
export function newAddress(recipient = 'QA Tester') {
  return {
    recipientName: recipient,
    phoneNumber: '0912345678',
    street: '12 Nguyễn Văn Bảo',
    ward: 'Phường 4',
    district: 'Gò Vấp',
    province: 'Hồ Chí Minh',
    provinceId: 202,
    districtId: 1461,
    wardCode: '21310',
  };
}

export function newBook(overrides: Partial<Record<string, unknown>> = {}) {
  const id = uid();
  return {
    title: `[QA] Sách kiểm thử ${id}`,
    isbn: `978${Date.now().toString().slice(-10)}`,
    price: 100000,
    importPrice: 60000,
    stockQuantity: 50,
    publishDate: '2024-01-15',
    description: 'Sách tạo tự động bởi bộ test QA',
    status: 'AVAILABLE',
    ...overrides,
  };
}

export const isoDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};
