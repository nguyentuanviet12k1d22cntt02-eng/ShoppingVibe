# LỘ TRÌNH NÂNG CẤP DỰ ÁN MINI SHOP (ĐÃ ĐIỀU CHỈNH)

> **Dự án:** Mini Shop - Artisan & Eco-Living Decor  
> **Quy trình thực hiện:** Triển khai từng bước một (Step-by-Step). Xong bước nào sẽ dừng lại báo cáo và nghiệm thu trước khi chuyển bước tiếp theo.

---

## 📋 DANH SÁCH CÁC BƯỚC THỰC HIỆN

### ✅ BƯỚC 1: HỆ THỐNG MÃ GIẢM GIÁ ĐỘNG (`coupons`) & QUẢN LÝ VOUCHER (Đang thực hiện)
1. Tạo bảng `coupons` trong Database Supabase.
2. Viết API kiểm tra mã voucher theo thời hạn, số lượng sử dụng và giá trị đơn hàng tối thiểu.
3. Tích hợp áp dụng Voucher động vào Giỏ hàng (`CartPage`) và Đặt hàng (`CheckoutPage` & `/api/checkout`).
4. Thêm giao diện quản lý Mã giảm giá (Tạo mới, sửa, bật/tắt mã) trong trang Quản trị Admin.

---

### ⏳ BƯỚC 2: THANH TOÁN VIETQR ĐỘNG (DYNAMIC VIETQR AUTO-PAYMENT)
1. Tự động sinh mã VietQR chuẩn NAPAS chứa chính xác số tiền và cú pháp `MS-<Mã đơn>`.
2. Hiển thị mã QR động tại trang Checkout và trang Chi tiết đơn hàng (`OrderTrackingPage`).
3. Khách chỉ cần mở App ngân hàng quét là điền sẵn mọi thông tin chính xác 100%.

---

### ⏳ BƯỚC 3: BỘ SƯU TẬP ĐA ẢNH (`product_images`) & BIẾN THỂ SẢN PHẨM (`product_variants`)
1. Tạo bảng `product_images` và `product_variants` trong Supabase.
2. Cập nhật trang Chi tiết sản phẩm (`ProductDetail`) cho phép chọn xem nhiều góc ảnh và chọn phân loại (Size S/M/L, Màu men gốm).
3. Hỗ trợ thêm/sửa gallery ảnh và biến thể trong Admin.

---

### ⏳ BƯỚC 4: SỔ ĐỊA CHỈ GIAO HÀNG (`user_addresses`)
1. Tạo bảng `user_addresses` liên kết với tài khoản người dùng Supabase Auth.
2. Khách hàng đăng nhập có thể lưu sẵn địa chỉ Nhà riêng / Cơ quan.
3. Chọn nhanh địa chỉ với 1 click khi Checkout mà không cần nhập lại từ đầu.

---

### ⏳ BƯỚC 5: BỘ LỌC ĐA TIÊU CHÍ (SPACES & MATERIALS FILTER) & MIX & MATCH COMBO
1. Bộ lọc sản phẩm theo Không gian (Phòng khách, Bàn ăn, Phòng ngủ, Ban công), Chất liệu và Thanh trượt giá (Price Slider).
2. Tính năng "Tự phối không gian Decor" (Mix & Match) cho phép chọn thử combo sản phẩm ăn nhập màu sắc.

---

### ⏳ BƯỚC 6: HÀNH TRÌNH LÀNG NGHỀ (ARTISAN HERITAGE) & HỒ SƠ NGHỆ NHÂN
1. Trang "Hành trình làng nghề Việt": Làng gốm Bát Tràng, Làng mây tre Phú Vinh, Làng sơn mài Hạ Thái.
2. Thẻ chứng nhận nghệ nhân và quy trình chế tác thủ công 7 bước.

---

### ⏳ BƯỚC 7: TÍNH NĂNG ADMIN PRO & TỰ ĐỘNG HÓA
1. Bắn thông báo đơn hàng mới tức thì qua Telegram Bot về điện thoại cho Admin.
2. Nút bấm in Hóa đơn / Phiếu vận đơn A5/A6 có mã vạch dán kiện hàng.
3. Xuất báo cáo doanh thu ra file Excel (.xlsx).
4. Tự động trừ tồn kho khi đơn hàng hoàn tất.
