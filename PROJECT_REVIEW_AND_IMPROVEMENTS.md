# BÁO CÁO ĐÁNH GIÁ TOÀN DIỆN DỰ ÁN MINI SHOP (NEXT.JS APP ROUTER)

> **Dự án:** Mini Shop (mini-shop-next)  
> **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, Supabase (Auth, Postgres, SSR), Three.js, Chart.js, GSAP.  
> **Ngày đánh giá:** 17/08/2026  
> **Người thực hiện:** Antigravity AI Code Reviewer  

---

## 1. TỔNG QUAN CẤU TRÚC VÀ TÍNH NĂNG DỰ ÁN

### 1.1. Cấu trúc thư mục (`src/`)
```text
mini-shop-next/
├── scripts/
│   └── init_supabase_schema.mjs         # Script khởi tạo DB Postgres / Supabase
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── admin/page.tsx               # Bảng quản trị người bán (Dashboard, SP, Đơn, Khách)
│   │   ├── api/
│   │   │   ├── categories/create-folder # API tạo thư mục danh mục (Local FS)
│   │   │   └── upload/route.ts          # API upload ảnh (Local FS)
│   │   ├── auth/page.tsx                # Trang đăng nhập / đăng ký Supabase
│   │   ├── cart/page.tsx                # Giỏ hàng
│   │   ├── checkout/page.tsx            # Trang thanh toán & tạo đơn
│   │   ├── order-tracking/page.tsx      # Tra cứu đơn hàng & mô hình 3D kiện hàng
│   │   ├── product-detail/page.tsx      # Chi tiết sản phẩm (Query param ?id=...)
│   │   ├── product-list/page.tsx        # Danh sách sản phẩm, lọc, tìm kiếm
│   │   ├── wishlist/page.tsx            # Danh sách sản phẩm yêu thích
│   │   ├── globals.css                  # CSS toàn cục (>2.600 dòng)
│   │   ├── layout.tsx                   # Root layout, Header/Footer, Providers
│   │   └── page.tsx                     # Trang chủ (Hero, Danh mục, SP nổi bật, Story)
│   ├── components/                      # UI Components tái sử dụng
│   │   ├── common/                      # Header, Footer, Breadcrumb
│   │   ├── layout/                      # AdminSidebar
│   │   └── Providers.tsx                # Bọc các Context Providers
│   ├── context/                         # React Contexts
│   │   ├── AuthContext.tsx              # Quản lý phiên đăng nhập & phân quyền
│   │   ├── CartContext.tsx              # Quản lý giỏ hàng (LocalStorage)
│   │   ├── ProductContext.tsx           # Quản lý sản phẩm, danh mục (Supabase + Cache)
│   │   └── WishlistContext.tsx          # Quản lý yêu thích (LocalStorage)
│   ├── data/
│   │   └── products.ts                  # Mock data dự phòng & types
│   ├── features/                        # Module hóa theo chức năng nghiệp vụ
│   │   ├── admin/                       # Dashboard Overview, System Settings, mock data
│   │   ├── auth/                        # Auth container & forms
│   │   ├── cart/                        # Cart page & Wishlist page components
│   │   ├── categories/                  # Quản lý danh mục & modal thêm/sửa
│   │   ├── customers/                   # Quản lý khách hàng
│   │   ├── dashboard/                   # Thống kê, biểu đồ Chart.js
│   │   ├── orders/                      # Quản lý đơn hàng, chi tiết đơn, Parcel 3D (Three.js)
│   │   └── products/                    # ProductCard, ProductDetail, ProductList, Modals
│   ├── hooks/
│   │   └── useCountUp.ts                # Hook hiệu ứng số đếm (Admin stat cards)
│   └── utils/
│       └── supabase/                    # Cấu hình Supabase client/server/middleware
```

### 1.2. Điểm mạnh của dự án
1. **Giao diện hiện đại & chỉn chu**: Phối màu thủ công mộc mạc (Artisan / Sage Green / Terracotta), typography sắc nét, hiệu ứng tương tác phong phú.
2. **Tính năng hoàn thiện theo luồng E-Commerce**: Đầy đủ luồng Mua sắm (Xem -> Lọc/Tìm kiếm -> Yêu thích -> Giỏ hàng -> Checkout -> Tra cứu đơn) và Admin (CRUD Sản phẩm, Danh mục, Đơn hàng, Khách hàng, Thống kê doanh thu).
3. **Ứng dụng công nghệ đồ họa ấn tượng**: Có module 3D tương tác với `Three.js` (kiện hàng mở nắp, hiệu ứng particle, chuyển động theo trạng thái đơn), biểu đồ `Chart.js`, hoạt ảnh `GSAP`.
4. **TypeScript bao phủ tốt**: Hầu hết các component và context đều có định nghĩa kiểu rõ ràng (`Product`, `CategoryItem`, `Order`, `Customer`, `UserSession`), kiểm tra `tsc --noEmit` không có lỗi cú pháp.

---

## 2. ĐÁNH GIÁ NHỮNG CHỖ CHƯA TỐT & LỖI TIỀM ẨN

### 🔴 MỨC ĐỘ 1: LỖI BẢO MẬT & RỦI RO DỮ LIỆU NGHIÊM TRỌNG

#### 1. Lộ thông tin nhạy cảm (Database Password) trong mã nguồn
- **Vị trí:** `scripts/init_supabase_schema.mjs` (Dòng 4)
- **Hiện trạng:** Chuỗi kết nối Postgres chứa mật khẩu database được viết trực tiếp trong code:  
  `postgresql://postgres:Viet.10092004%40@db.unilqwsbbcnpbybizcbz.supabase.co:5432/postgres`
- **Nguy cơ:** Khi push code lên GitHub/GitLab hoặc chia sẻ repo, hacker có thể chiếm toàn quyền kiểm soát Database.
- **Khắc phục:** Đưa vào biến môi trường `DATABASE_URL` hoặc `.env.local` và thêm vào `.gitignore`.

#### 2. Rò rỉ toàn bộ thông tin đơn hàng của tất cả khách hàng (Data Leak)
- **Vị trí:** `src/features/orders/components/OrderTrackingPage.tsx` (Dòng 61-64)
- **Hiện trạng:** Client-side gọi trực tiếp:
  ```typescript
  const { data: dbOrders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('order_date', { ascending: false });
  ```
- **Nguy cơ:** Bất kỳ ai vào trang `order-tracking` đều tải về danh sách toàn bộ khách hàng, số điện thoại, địa chỉ nhà, lịch sử mua sắm của tất cả đơn hàng trong shop qua tab Network.
- **Khắc phục:** 
  - Áp dụng Row-Level Security (RLS) trên Supabase.
  - Khách chỉ được query đơn hàng của chính mình (theo `user_id` hoặc tra cứu bảo mật theo cặp `id` + `phone`).

#### 3. Hardcode Email Admin trong mã nguồn Client
- **Vị trí:** `src/context/AuthContext.tsx` (Dòng 48, 118, 212) và `AuthContainer.tsx` (Dòng 54)
- **Hiện trạng:** Gán quyền Admin cứng dựa trên chuỗi `'nguyentuanviet12k1@gmail.com'`.
- **Nguy cơ:** Khó mở rộng, không an toàn nếu chuyển giao quyền quản trị hoặc tạo thêm nhân viên.
- **Khắc phục:** Phân quyền quản trị viên thông qua trường `role` trong bảng `profiles` hoặc custom claims / app_metadata của Supabase Auth.

#### 4. Tin cậy dữ liệu giá tiền gửi từ Client khi Checkout
- **Vị trí:** `src/features/checkout/components/CheckoutPage.tsx`
- **Hiện trạng:** Tổng tiền `total_amount` và đơn giá `price` của từng item được lấy trực tiếp từ state giỏ hàng của trình duyệt để `insert` vào database.
- **Nguy cơ:** Người dùng có thể sửa đổi JavaScript / LocalStorage để mua hàng với giá 0đ hoặc 1.000đ.
- **Khắc phục:** Tạo đơn hàng qua Next.js Server Action hoặc API Route, server sẽ truy vấn bảng `products` để tính lại tổng tiền chính xác trước khi lưu vào `orders`.

---

### 🟡 MỨC ĐỘ 2: LỖI KIẾN TRÚC NEXT.JS & TRIỂN KHAI (VERCEL/SERVERLESS)

#### 5. Lưu trữ ảnh trực tiếp vào ổ đĩa cục bộ (`fs.writeFileSync`)
- **Vị trí:** `src/app/api/upload/route.ts` và `src/app/api/categories/create-folder/route.ts`
- **Hiện trạng:** Sử dụng Node.js `fs` ghi file vào thư mục `public/assets/images/...` và `../assets/...`.
- **Hệ quả khi Deploy:** Trên môi trường Serverless như Vercel/Netlify, hệ thống file là **Read-Only / Ephemeral**. Khi deploy lên production, tính năng upload ảnh sẽ **bị lỗi 500 ngay lập tức** hoặc ảnh bị mất sau vài phút.
- **Khắc phục:** Tích hợp **Supabase Storage Bucket** (ví dụ bucket `product-images`), upload trực tiếp lên cloud storage và lưu URL công khai vào database.

#### 6. Cấu trúc Routing chưa tận dụng chuẩn Next.js App Router
- **Hiện trạng:** Chi tiết sản phẩm đang dùng Flat route + Query Param: `/product-detail?id=p4`.
- **Nhược điểm:** Kém thân thiện SEO, không tận dụng được Dynamic Route Segment (`generateMetadata`, `generateStaticParams`), URL không đẹp (`/products/sofa-nordic-p1` thay vì `/product-detail?id=p1`).
- **Khắc phục:** Chuyển sang cấu trúc chuẩn: `/products/[id]` hoặc `/products/[slug]`.

#### 7. Thiếu cấu hình Middleware xác thực Next.js
- **Hiện trạng:** Đã có file helper `src/utils/supabase/middleware.ts` nhưng **chưa có file `src/middleware.ts`** ở thư mục gốc để kích hoạt.
- **Hệ quả:** Phiên đăng nhập (Session token) không được tự động làm mới (refresh) trên server, bảo vệ route admin đang hoàn toàn phụ thuộc vào kiểm tra client-side (gây chớp màn hình trước khi redirect).

#### 8. Thiếu cấu hình `images.remotePatterns` trong `next.config.ts`
- **Vị trí:** `next.config.ts`
- **Hệ quả:** Khi tải ảnh sản phẩm từ Supabase Storage, CDN bên ngoài hoặc URL online, component `next/image` sẽ ném lỗi crash giao diện do domain chưa được khai báo.

---

### 🟠 MỨC ĐỘ 3: CODE QUALITY, STATE & TRẢI NGHIỆM NGƯỜI DÙNG (UX)

#### 9. Can thiệp DOM trực tiếp trong React (`showToastNotification`)
- **Vị trí:** `src/context/CartContext.tsx`
- **Hiện trạng:** Dùng `document.createElement`, `document.getElementById('toast-container')`, `document.body.appendChild`.
- **Nhược điểm:** Phá vỡ nguyên lý Declarative của React, dễ gây memory leak nếu component unmount trong lúc setTimeout chạy.
- **Khắc phục:** Sử dụng React State quản lý Toast Component hoặc tích hợp thư viện nhẹ như `sonner` / React Context.

#### 10. Fallback dữ liệu sai bản chất ở Chi tiết sản phẩm
- **Vị trí:** `src/features/products/components/ProductDetail.tsx` (Dòng 19)
- **Hiện trạng:** `return products.find(p => p.id === id) || products[0] || PRODUCTS[0];`
- **Hệ quả:** Khi người dùng nhập sai ID sản phẩm hoặc sản phẩm đã bị xóa, trang vẫn hiển thị sản phẩm đầu tiên thay vì hiển thị thông báo "Không tìm thấy sản phẩm" (404 Not Found).

#### 11. Dùng ảnh sản phẩm khác để làm Thumbnail giả lập
- **Vị trí:** `src/features/products/components/ProductDetail.tsx` (Dòng 30-36)
- **Hiện trạng:** Lấy ảnh của sản phẩm khác trong danh sách để làm danh sách ảnh thumbnail thu nhỏ của sản phẩm hiện tại.
- **Khắc phục:** Nâng cấp cấu trúc dữ liệu sản phẩm trong DB để hỗ trợ mảng `images: text[]`.

#### 12. Sai lệch Slug danh mục ở Header
- **Vị trí:** `src/components/common/Header.tsx` (Dòng 56, 57)
- **Hiện trạng:** Link danh mục trên Header đang để `?category=goc-goc` và `?category=may-tre`, trong khi slug chuẩn trong Database là `gom-su` và `luu-tru` / `den`. Người dùng click vào sẽ ra danh sách trống.

#### 13. File CSS toàn cục quá lớn (`globals.css` > 2.600 dòng)
- **Vị trí:** `src/app/globals.css` (54 KB)
- **Hiện trạng:** Chứa toàn bộ CSS của mọi trang, admin, animation, dashboard trong 1 file duy nhất. Ngoài ra dùng `@import url(...)` cho Font & FontAwesome.
- **Khắc phục:** 
  - Dùng `next/font/google` để tối ưu tải font, tránh giật layout (CLS).
  - Tách CSS theo CSS Modules (`Admin.module.css`, `Product.module.css`, ...) hoặc tận dụng các utility classes của TailwindCSS.

#### 14. Nguy cơ trùng lặp mã đơn hàng (Order ID Collision)
- **Vị trí:** `src/features/checkout/components/CheckoutPage.tsx`
- **Hiện trạng:** Tạo mã đơn bằng `MS-${Math.floor(1000 + Math.random() * 9000)}` (chỉ có 9.000 mã khả dụng).
- **Khắc phục:** Dùng UUID hoặc sinh mã theo thời gian kết hợp chuỗi ngẫu nhiên (ví dụ: `MS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`).

---

## 3. BẢNG TỔNG HỢP & LỘ TRÌNH CẢI THIỆN ĐỀ XUẤT

| STT | Vấn đề | Phân loại | Mức độ ưu tiên | Giải pháp khuyến nghị |
|:---:|:---|:---:|:---:|:---|
| 1 | Lộ kết nối Postgres DB trong script | Bảo mật | 🔴 Khẩn cấp | Chuyển sang `.env.local`, cập nhật `.gitignore` |
| 2 | Rò rỉ thông tin khách hàng ở Order Tracking | Bảo mật | 🔴 Khẩn cấp | Áp dụng RLS Supabase & lọc đơn hàng theo user |
| 3 | Upload file dùng `fs` cục bộ gây lỗi trên Vercel | Vận hành / Cloud | 🔴 Khẩn cấp | Chuyển sang Supabase Storage Bucket |
| 4 | Giá tiền và đơn hàng tính toán ở Client | Nghiệp vụ | 🟡 Cao | Tạo Server Action / API route xác thực giá phía server |
| 5 | Hardcode Email Admin trong Auth | Kiến trúc | 🟡 Cao | Phân quyền qua role trong DB Profiles |
| 6 | URL chi tiết sản phẩm dùng Query Param | SEO / Routing | 🟡 Cao | Đổi sang Route `/products/[id]` hoặc `[slug]` |
| 7 | Thiếu `middleware.ts` gốc cho Next.js | Kiến trúc | 🟡 Cao | Kích hoạt Middleware Supabase SSR tại root |
| 8 | Thiếu `remotePatterns` trong `next.config.ts` | Ổn định UI | 🟡 Cao | Cấu hình domain ảnh Supabase/Unsplash trong config |
| 9 | Direct DOM manipulation khi bắn Toast | Clean Code | 🟢 Trung bình | Thay bằng React State / Custom Toast hook |
| 10 | Fallback sai khi tìm sản phẩm | UX | 🟢 Trung bình | Hiển thị màn hình 404 / Sản phẩm không tồn tại |
| 11 | Sai slug danh mục trên thanh Header | Bug logic | 🟢 Trung bình | Đồng bộ lại slug `gom-su` và `luu-tru` |
| 12 | CSS nguyên khối > 2.600 dòng, `@import` font | Performance | 🟢 Trung bình | Tối ưu với `next/font` và tách CSS Modules |
| 13 | Thuật toán sinh mã đơn hàng dễ trùng | Nghiệp vụ | 🟢 Thấp | Sinh mã bằng timestamp + hash ngẫu nhiên |

---

## 4. KẾT LUẬN
Dự án **Mini Shop** được xây dựng với giao diện bắt mắt, tính năng phong phú, UI/UX hiện đại và tích hợp nhiều công nghệ tiên tiến (Three.js 3D, Supabase, Chart.js). Tuy nhiên, để đưa dự án lên môi trường Production (như Vercel) một cách an toàn, bảo mật và ổn định, việc khắc phục các lỗ hổng bảo mật (lộ DB string, rò rỉ đơn hàng), chuyển đổi cơ chế lưu trữ ảnh sang Supabase Storage và chuẩn hóa kiến trúc Next.js App Router là những bước đi mang tính bắt buộc và cần được ưu tiên hàng đầu.
