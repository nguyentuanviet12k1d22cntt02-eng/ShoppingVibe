export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryName: string;
  image: string;
  description: string;
  featured: boolean;
  stockCount?: number;
  inStock?: boolean;
  soldCount?: number;
  sku?: string;
  gallery?: string[];
}

export const PRODUCTS: Product[] = [
  // --- SẢN PHẨM NỘI THẤT MỚI TẢI LÊN ---
  // 1. BÀN
  {
    id: "ban-01",
    name: "Bàn Trà Sofa Gỗ Sồi Bắc Âu",
    price: 1850000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/ban/ban-1.jpg",
    gallery: [
      "/assets/images/products/noi-that/ban/ban-1.jpg",
      "/assets/images/products/noi-that/ban/ban-2.jpg",
      "/assets/images/products/noi-that/ban/ban-3.jpg",
      "/assets/images/products/noi-that/ban/ban-4.jpg"
    ],
    description: "Bàn trà sofa gỗ sồi tự nhiên phong cách Scandinavian tinh tế, mặt bàn láng mịn chống thấm nước, chân bàn vững chắc chịu lực cao.",
    featured: true,
    stockCount: 20,
    inStock: true,
    soldCount: 38,
    sku: "SKU-BAN-01"
  },
  {
    id: "ban-02",
    name: "Bàn Ăn Gỗ Nguyên Tấm Tự Nhiên",
    price: 4890000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/ban/ban-2.jpg",
    gallery: [
      "/assets/images/products/noi-that/ban/ban-2.jpg",
      "/assets/images/products/noi-that/ban/ban-1.jpg",
      "/assets/images/products/noi-that/ban/ban-3.jpg"
    ],
    description: "Bộ bàn ăn nguyên tấm vân gỗ tự nhiên sang trọng, xử lý chống mối mọt cong vênh, hoàn hảo cho không gian bếp ấm cúng.",
    featured: true,
    stockCount: 12,
    inStock: true,
    soldCount: 24,
    sku: "SKU-BAN-02"
  },
  {
    id: "ban-03",
    name: "Bàn Làm Việc Tối Giản Minimalist",
    price: 2450000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/ban/ban-3.jpg",
    gallery: [
      "/assets/images/products/noi-that/ban/ban-3.jpg",
      "/assets/images/products/noi-that/ban/ban-4.jpg"
    ],
    description: "Bàn làm việc thông minh kèm hộc tủ để đồ, khung chân thép sơn tĩnh điện cứng cáp kết hợp mặt gỗ công nghiệp cao cấp phủ Melamine.",
    featured: false,
    stockCount: 15,
    inStock: true,
    soldCount: 45,
    sku: "SKU-BAN-03"
  },

  // 2. GHẾ
  {
    id: "ghe-01",
    name: "Ghế Sofa Đơn Thư Giãn Bọc Nỉ Cao Cấp",
    price: 2190000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/ghe/ghe-1.jpg",
    gallery: [
      "/assets/images/products/noi-that/ghe/ghe-1.jpg",
      "/assets/images/products/noi-that/ghe/ghe-2.jpg",
      "/assets/images/products/noi-that/ghe/ghe-3.jpg",
      "/assets/images/products/noi-that/ghe/ghe-4.jpg",
      "/assets/images/products/noi-that/ghe/ghe-5.jpg"
    ],
    description: "Ghế armchair đơn bọc đệm êm ái, thiết kế tựa lưng công thái học ôm sát cơ thể, mang lại cảm giác thư thái tối đa khi đọc sách hoặc nghỉ ngơi.",
    featured: true,
    stockCount: 18,
    inStock: true,
    soldCount: 52,
    sku: "SKU-GHE-01"
  },
  {
    id: "ghe-02",
    name: "Ghế Ăn Gỗ Uốn Cong Tinh Tế",
    price: 890000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/ghe/ghe-2.jpg",
    gallery: [
      "/assets/images/products/noi-that/ghe/ghe-2.jpg",
      "/assets/images/products/noi-that/ghe/ghe-1.jpg"
    ],
    description: "Ghế tựa lưng gỗ uốn cong mềm mại, mặt ngồi đệm bọc da simili chống bám bẩn, dễ dàng lau chùi vệ sinh.",
    featured: false,
    stockCount: 30,
    inStock: true,
    soldCount: 80,
    sku: "SKU-GHE-02"
  },
  {
    id: "ghe-03",
    name: "Ghế Thư Giãn Bập Bênh Phong Cách Bắc Âu",
    price: 2750000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/ghe/ghe-3.jpg",
    gallery: [
      "/assets/images/products/noi-that/ghe/ghe-3.jpg",
      "/assets/images/products/noi-that/ghe/ghe-4.jpg"
    ],
    description: "Ghế bập bênh khung gỗ sồi kết hợp đệm bông dày dặn êm ái, lý tưởng cho góc ban công hoặc phòng ngủ thư giãn.",
    featured: true,
    stockCount: 14,
    inStock: true,
    soldCount: 19,
    sku: "SKU-GHE-03"
  },

  // 3. GIƯỜNG
  {
    id: "giuong-01",
    name: "Giường Ngủ Gỗ Sồi Tự Nhiên Scandinavia",
    price: 7890000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/giuong/giuong-1.jpg",
    gallery: [
      "/assets/images/products/noi-that/giuong/giuong-1.jpg",
      "/assets/images/products/noi-that/giuong/giuong-2.jpg",
      "/assets/images/products/noi-that/giuong/giuong-3.jpg",
      "/assets/images/products/noi-that/giuong/giuong-4.jpg",
      "/assets/images/products/noi-that/giuong/giuong-5.jpg"
    ],
    description: "Giường ngủ gỗ sồi 100% tự nhiên sấy khô đạt chuẩn, dát phản phẳng mịn màng, đầu giường bo cong tinh tế an toàn cho gia đình.",
    featured: true,
    stockCount: 10,
    inStock: true,
    soldCount: 16,
    sku: "SKU-GIUONG-01"
  },
  {
    id: "giuong-02",
    name: "Giường Hộp Bọc Đệm Đầu Giường Cao Cấp",
    price: 6490000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/giuong/giuong-2.jpg",
    gallery: [
      "/assets/images/products/noi-that/giuong/giuong-2.jpg",
      "/assets/images/products/noi-that/giuong/giuong-1.jpg"
    ],
    description: "Thiết kế bọc nệm đầu giường êm ái, chân ẩn tạo hiệu ứng bồng bềnh sang trọng cho phòng ngủ master.",
    featured: true,
    stockCount: 8,
    inStock: true,
    soldCount: 14,
    sku: "SKU-GIUONG-02"
  },
  {
    id: "giuong-03",
    name: "Giường Ngủ Có Ngăn Kéo Lưu Trữ Thông Minh",
    price: 8200000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/giuong/giuong-3.jpg",
    gallery: [
      "/assets/images/products/noi-that/giuong/giuong-3.jpg",
      "/assets/images/products/noi-that/giuong/giuong-4.jpg"
    ],
    description: "Tích hợp 4 ngăn kéo để chăn ga gối đệm siêu tiện lợi, tiết kiệm tối đa không gian cho căn hộ hiện đại.",
    featured: false,
    stockCount: 6,
    inStock: true,
    soldCount: 22,
    sku: "SKU-GIUONG-03"
  },

  // 4. RÈM CỬA
  {
    id: "rem-01",
    name: "Rèm Vải 2 Lớp Cản Sáng 100% Khách Sạn 5 Sao",
    price: 1350000,
    category: "trang-tri",
    categoryName: "Trang trí",
    image: "/assets/images/products/noi-that/rem-cua/rem-1.jpg",
    gallery: [
      "/assets/images/products/noi-that/rem-cua/rem-1.jpg",
      "/assets/images/products/noi-that/rem-cua/rem-2.jpg",
      "/assets/images/products/noi-that/rem-cua/rem-3.jpg",
      "/assets/images/products/noi-that/rem-cua/rem-4.jpg",
      "/assets/images/products/noi-that/rem-cua/rem-5.jpg"
    ],
    description: "Bộ rèm vải 2 lớp (1 lớp vải gấm cản sáng nhiệt độ cao + 1 lớp voan thêu mộng mơ), may dập ly sóng tiêu chuẩn cao cấp.",
    featured: true,
    stockCount: 25,
    inStock: true,
    soldCount: 65,
    sku: "SKU-REM-01"
  },
  {
    id: "rem-02",
    name: "Rèm Cầu Vồng Hàn Quốc Cản Sáng Tiện Lợi",
    price: 850000,
    category: "trang-tri",
    categoryName: "Trang trí",
    image: "/assets/images/products/noi-that/rem-cua/rem-2.jpg",
    gallery: [
      "/assets/images/products/noi-that/rem-cua/rem-2.jpg",
      "/assets/images/products/noi-that/rem-cua/rem-3.jpg"
    ],
    description: "Rèm cuốn cầu vồng điều chỉnh ánh sáng linh hoạt, chất liệu sợi dệt tổng hợp chống bám bụi và chống tia UV hiệu quả.",
    featured: false,
    stockCount: 30,
    inStock: true,
    soldCount: 48,
    sku: "SKU-REM-02"
  },

  // 5. TỦ KỆ
  {
    id: "tu-ke-01",
    name: "Kệ Tivi Phòng Khách Gỗ Sồi Hiện Đại",
    price: 3850000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/tu-ke/tu-ke-1.jpg",
    gallery: [
      "/assets/images/products/noi-that/tu-ke/tu-ke-1.jpg",
      "/assets/images/products/noi-that/tu-ke/tu-ke-2.jpg",
      "/assets/images/products/noi-that/tu-ke/tu-ke-3.jpg",
      "/assets/images/products/noi-that/tu-ke/tu-ke-4.jpg",
      "/assets/images/products/noi-that/tu-ke/tu-ke-5.jpg"
    ],
    description: "Kệ tivi thiết kế chân gỗ thon gọn, 3 ngăn kéo mở êm ái cùng khoang hở đặt đầu máy, đầu thu gọn gàng thẩm mỹ.",
    featured: true,
    stockCount: 12,
    inStock: true,
    soldCount: 33,
    sku: "SKU-TUKE-01"
  },
  {
    id: "tu-ke-02",
    name: "Tủ Quần Áo Cánh Lùa Kèm Kệ Trang Trí",
    price: 6950000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/tu-ke/tu-ke-2.jpg",
    gallery: [
      "/assets/images/products/noi-that/tu-ke/tu-ke-2.jpg",
      "/assets/images/products/noi-that/tu-ke/tu-ke-1.jpg"
    ],
    description: "Tủ quần áo 3 cánh lùa ray trượt êm ái, tích hợp kệ góc bo tròn để túi xách mỹ phẩm decor cực xinh.",
    featured: true,
    stockCount: 8,
    inStock: true,
    soldCount: 15,
    sku: "SKU-TUKE-02"
  },
  {
    id: "tu-ke-03",
    name: "Tủ Giày Thông Minh Siêu Mỏng Tiết Kiệm Diện Tích",
    price: 1590000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/tu-ke/tu-ke-3.jpg",
    gallery: [
      "/assets/images/products/noi-that/tu-ke/tu-ke-3.jpg",
      "/assets/images/products/noi-that/tu-ke/tu-ke-4.jpg"
    ],
    description: "Tủ giày cánh lật 3 tầng chứa được 25-30 đôi giày dép, bề dày chỉ 24cm giúp hành lang nhà luôn rộng rãi.",
    featured: false,
    stockCount: 22,
    inStock: true,
    soldCount: 74,
    sku: "SKU-TUKE-03"
  },

  // 6. TỦ LAVABO
  {
    id: "tu-lavabo-01",
    name: "Bộ Tủ Chậu Lavabo Phòng Tắm Chống Nước Tuyệt Đối",
    price: 3690000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/tu-lavabo/tu-lavabo-1.jpg",
    gallery: [
      "/assets/images/products/noi-that/tu-lavabo/tu-lavabo-1.jpg",
      "/assets/images/products/noi-that/tu-lavabo/tu-lavabo-2.jpg",
      "/assets/images/products/noi-that/tu-lavabo/tu-lavabo-3.jpg",
      "/assets/images/products/noi-that/tu-lavabo/tu-lavabo-4.jpg",
      "/assets/images/products/noi-that/tu-lavabo/tu-lavabo-5.jpg"
    ],
    description: "Chất liệu nhựa PVC đặc cao cấp chịu nước 100%, mặt chậu sứ ceramic phủ men nano tuyết trắng bóng chống ố vàng.",
    featured: true,
    stockCount: 14,
    inStock: true,
    soldCount: 29,
    sku: "SKU-LAVABO-01"
  },
  {
    id: "tu-lavabo-02",
    name: "Bộ Tủ Lavabo Treo Tường Kèm Gương Led Cảm Ứng",
    price: 4500000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that/tu-lavabo/tu-lavabo-2.jpg",
    gallery: [
      "/assets/images/products/noi-that/tu-lavabo/tu-lavabo-2.jpg",
      "/assets/images/products/noi-that/tu-lavabo/tu-lavabo-3.jpg"
    ],
    description: "Gương led thông minh chạm cảm ứng sấy gương chống mờ hơi nước, tủ dưới chia ngăn rộng rãi để dầu gội khăn tắm.",
    featured: true,
    stockCount: 10,
    inStock: true,
    soldCount: 21,
    sku: "SKU-LAVABO-02"
  },

  // --- CÁC SẢN PHẨM KHÁC ---
  {
    id: "p1",
    name: "Sofa 2 chỗ Nordic",
    price: 2990000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
    description: "Thiết kế tối giản, êm ái, bọc vải cao cấp",
    featured: true,
    stockCount: 15,
    inStock: true,
    soldCount: 42,
    sku: "SKU-SOFA-01"
  },
  {
    id: "p2",
    name: "Bàn ăn gỗ Sồi",
    price: 3490000,
    category: "noi-that",
    categoryName: "Nội thất",
    image: "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
    description: "Gỗ sồi tự nhiên, bền đẹp, chịu lực tốt",
    featured: true,
    stockCount: 8,
    inStock: true,
    soldCount: 29,
    sku: "SKU-BAN-02"
  },
  {
    id: "p3",
    name: "Đèn thả trần Minimal",
    price: 599000,
    category: "den",
    categoryName: "Đèn",
    image: "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp",
    description: "Ánh sáng dịu nhẹ, tinh tế cho phòng khách",
    featured: true,
    stockCount: 25,
    inStock: true,
    soldCount: 88,
    sku: "SKU-DEN-03"
  },
  {
    id: "p4",
    name: "Bình gốm Decor",
    price: 290000,
    category: "trang-tri",
    categoryName: "Trang trí",
    image: "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
    description: "Gốm sứ cao cấp, mạ men nung thủ công",
    featured: true,
    stockCount: 50,
    inStock: true,
    soldCount: 150,
    sku: "SKU-GOM-04"
  },
  {
    id: "p5",
    name: "Kệ gỗ đa năng",
    price: 1293000,
    category: "luu-tru",
    categoryName: "Lưu trữ",
    image: "/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp",
    description: "Tiết kiệm không gian, nhiều tầng tiện lợi",
    featured: true,
    stockCount: 12,
    inStock: true,
    soldCount: 35,
    sku: "SKU-KE-05"
  },
  {
    id: "p6",
    name: "Giỏ mây lưu trữ",
    price: 199000,
    category: "luu-tru",
    categoryName: "Lưu trữ",
    image: "/assets/images/products/do-thu-cong/gio-may-dan.webp",
    description: "Mây tự nhiên, thân thiện môi trường",
    featured: true,
    stockCount: 40,
    inStock: true,
    soldCount: 95,
    sku: "SKU-GIO-06"
  },
  {
    id: "p7",
    name: "Đèn lồng tre",
    price: 320000,
    category: "den",
    categoryName: "Đèn",
    image: "/assets/images/products/do-my-nghe/den-long-tre.webp",
    description: "Phong cách dân gian hiện đại",
    featured: false,
    stockCount: 18,
    inStock: true,
    soldCount: 44,
    sku: "SKU-DEN-07"
  },
  {
    id: "p8",
    name: "Bộ bình gốm Minimal",
    price: 450000,
    category: "trang-tri",
    categoryName: "Trang trí",
    image: "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp",
    description: "Tông màu nhã nhặn sang trọng",
    featured: false,
    stockCount: 22,
    inStock: true,
    soldCount: 60,
    sku: "SKU-GOM-08"
  },
  {
    id: "p9",
    name: "Tranh treo Macrame",
    price: 380000,
    category: "trang-tri",
    categoryName: "Trang trí",
    image: "/assets/images/products/do-thu-cong/tranh-treo-macrame.webp",
    description: "Đan dây thủ công phong cách Boho",
    featured: false,
    stockCount: 0,
    inStock: false,
    soldCount: 31,
    sku: "SKU-MAC-09"
  },
  {
    id: "p10",
    name: "Khay gỗ hoa văn",
    price: 280000,
    category: "nha-bep",
    categoryName: "Nhà bếp",
    image: "/assets/images/products/do-thu-cong/khay-go-hoa-van.webp",
    description: "Khay phục vụ trà & bánh sang trọng",
    featured: false,
    stockCount: 30,
    inStock: true,
    soldCount: 52,
    sku: "SKU-KHAY-10"
  }
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}
