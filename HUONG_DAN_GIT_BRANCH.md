# HƯỚNG DẪN QUY TRÌNH GIT BRANCHING AN TOÀN

Tài liệu này hướng dẫn cách lưu trữ mốc mã nguồn an toàn (`master`), tạo nhánh thử nghiệm tính năng mới (`feature/order-tracking-3d`), và cách quay lại nhánh cũ nguyên vẹn nếu không ưng ý.

---

## 📌 Sơ đồ quy trình (Workflow)

```mermaid
gitGraph
   commit id: "1. Mốc hoàn thiện hiện tại"
   branch feature/order-tracking-3d
   checkout feature/order-tracking-3d
   commit id: "2. Thử nghiệm Three.js & GSAP"
   checkout master
   merge feature/order-tracking-3d id: "3A. Ưng ý -> Gộp vào master"
```

---

## GIAI ĐOẠN 1: Lưu mốc an toàn và Đẩy lên nhánh chính (`master`)

Chạy các lệnh sau trong Terminal (`mini-shop-next`):

```bash
# 1. Thêm toàn bộ các thay đổi và file mới vào Git
git add .

# 2. Tạo commit lưu mốc an toàn
git commit -m "feat: hoàn tất hệ thống auth supabase, rbac và admin kết nối database"

# 3. Đẩy lên kho lưu trữ từ xa (GitHub/GitLab)
git push origin master
```

---

## GIAI ĐOẠN 2: Tạo và Chuyển sang Nhánh Mới để thử nghiệm

```bash
# Tạo nhánh mới tên là 'feature/order-tracking-3d' và chuyển sang nhánh đó
git checkout -b feature/order-tracking-3d
```

> **Lưu ý:** Sau khi chạy lệnh này, mọi code mới được viết, mọi thư viện mới được cài đặt sẽ chỉ nằm trên nhánh `feature/order-tracking-3d`. Nhánh `master` của bạn hoàn toàn được bảo toàn nguyên vẹn.

---

## GIAI ĐOẠN 3: Phát triển tính năng mới
Thực hiện cài đặt thư viện Three.js, GSAP và code trang theo dõi đơn hàng trên nhánh `feature/order-tracking-3d`.

---

## GIAI ĐOẠN 4: Nghiệm thu & Xử lý kết quả

### 🟢 Lựa chọn A: Bạn ƯNG Ý và muốn giữ lại tính năng này
Gộp code từ nhánh thử nghiệm vào nhánh chính `master`:

```bash
# 1. Chuyển về nhánh chính
git checkout master

# 2. Gộp nhánh tính năng vào master
git merge feature/order-tracking-3d

# 3. Đẩy code chính thức lên Git
git push origin master

# 4. (Tùy chọn) Xóa nhánh thử nghiệm sau khi đã gộp xong
git branch -d feature/order-tracking-3d
```

---

### 🔴 Lựa chọn B: Bạn KHÔNG ƯNG và muốn xóa sạch quay về như cũ
Xóa bỏ toàn bộ nhánh thử nghiệm và khôi phục mã nguồn chính xác như ban đầu:

```bash
# 1. Chuyển về lại nhánh chính an toàn
git checkout master

# 2. Xóa triệt để nhánh thử nghiệm (dùng cờ -D để buộc xóa)
git branch -D feature/order-tracking-3d
```

👉 **Kết quả:** Toàn bộ mã nguồn dự án của bạn sẽ quay lại mốc hoàn hảo tại Bước 1, không sót lại bất kỳ file rác nào.
