import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('❌ Lỗi: Chưa cấu hình biến môi trường DATABASE_URL hoặc POSTGRES_URL.');
  console.error('👉 Vui lòng thiết lập biến môi trường trước khi chạy script: e.g. DATABASE_URL="postgresql://..." node scripts/init_supabase_schema.mjs');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const CATEGORIES = [
  {
    id: 'noi-that',
    name: 'Nội thất gia dụng',
    slug: 'noi-that',
    image: '/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp',
    description: 'Bàn ăn, sofa, kệ gỗ mộc tự nhiên cao cấp phong cách Bắc Âu.',
    status: 'active'
  },
  {
    id: 'den',
    name: 'Đèn & Chiếu sáng',
    slug: 'den',
    image: '/assets/images/products/do-my-nghe/den-tre-thu-cong.webp',
    description: 'Đèn thả trần mây tre đan thủ công mỹ nghệ ấm cúng.',
    status: 'active'
  },
  {
    id: 'trang-tri',
    name: 'Đồ trang trí Decor',
    slug: 'trang-tri',
    image: '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp',
    description: 'Bình gốm Bát Tràng, tranh treo tường macrame nghệ thuật.',
    status: 'active'
  },
  {
    id: 'luu-tru',
    name: 'Giỏ & Kệ lưu trữ',
    slug: 'luu-tru',
    image: '/assets/images/products/do-thu-cong/gio-may-dan.webp',
    description: 'Giỏ mây có nắp, khay gỗ hoa văn và kệ tổ chức không gian.',
    status: 'active'
  },
  {
    id: 'gom-su',
    name: 'Gốm sứ thủ công',
    slug: 'gom-su',
    image: '/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp',
    description: 'Dòng sản phẩm gốm mộc tráng men hỏa biến tinh xảo.',
    status: 'active'
  },
  {
    id: 'nha-bep',
    name: 'Đồ dùng Nhà bếp',
    slug: 'nha-bep',
    image: '/assets/images/products/do-thu-cong/khay-go-hoa-van.webp',
    description: 'Khay gỗ tự nhiên, đồ dùng bàn ăn cao cấp phong cách tối giản.',
    status: 'active'
  }
];

const PRODUCTS = [
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

const ORDERS = [
  {
    id: "MS-1024",
    customerName: "Nguyễn Văn Nam",
    customerPhone: "0901234567",
    customerEmail: "namnv@gmail.com",
    address: "123 Đường Láng, Láng Thượng, Đống Đa, Hà Nội",
    items: [
      { productId: "p1", productName: "Sofa 2 chỗ Nordic", image: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp", price: 2990000, quantity: 1 },
      { productId: "p3", productName: "Đèn thả trần Minimal", image: "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp", price: 599000, quantity: 2 }
    ],
    total: 4188000,
    date: "2026-08-08T14:32:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "processing",
    notes: "Giao hàng giờ hành chính."
  },
  {
    id: "MS-1023",
    customerName: "Trần Thị Lan",
    customerPhone: "0918765432",
    customerEmail: "lantt@yahoo.com",
    address: "456 Điện Biên Phủ, Phường 15, Bình Thạnh, TP. Hồ Chí Minh",
    items: [
      { productId: "p2", productName: "Bàn ăn gỗ Sồi", image: "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp", price: 3490000, quantity: 1 }
    ],
    total: 3490000,
    date: "2026-08-08T10:15:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "pending",
    notes: null
  },
  {
    id: "MS-1022",
    customerName: "Lê Hoàng Long",
    customerPhone: "0982233445",
    customerEmail: "longlh@gmail.com",
    address: "78 Lê Lợi, Thạch Thang, Hải Châu, Đà Nẵng",
    items: [
      { productId: "p6", productName: "Giỏ mây lưu trữ", image: "/assets/images/products/do-thu-cong/gio-may-dan.webp", price: 199000, quantity: 3 }
    ],
    total: 597000,
    date: "2026-08-07T19:40:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "shipping",
    notes: "Gọi điện trước khi giao."
  },
  {
    id: "MS-1021",
    customerName: "Phạm Minh Đức",
    customerPhone: "0934455667",
    customerEmail: "ducpm@gmail.com",
    address: "12 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
    items: [
      { productId: "p4", productName: "Bình gốm Decor", image: "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp", price: 290000, quantity: 1 }
    ],
    total: 290000,
    date: "2026-08-07T15:20:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1020",
    customerName: "Hoàng Ngân Hà",
    customerPhone: "0976677889",
    customerEmail: "hahn@outlook.com",
    address: "321 Cách Mạng Tháng Tám, Quận 10, TP. Hồ Chí Minh",
    items: [
      { productId: "p1", productName: "Sofa 2 chỗ Nordic", image: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp", price: 2990000, quantity: 1 }
    ],
    total: 2990000,
    date: "2026-08-06T09:10:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "cancelled",
    notes: "Khách hủy đơn do trùng lịch đi công tác."
  },
  {
    id: "MS-1019",
    customerName: "Vũ Hoàng Anh",
    customerPhone: "0963344552",
    customerEmail: "anhvh@gmail.com",
    address: "246 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    items: [
      { productId: "p2", productName: "Bàn ăn gỗ Sồi", image: "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp", price: 3490000, quantity: 1 }
    ],
    total: 3490000,
    date: "2026-08-05T16:45:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1018",
    customerName: "Đỗ Thị Minh",
    customerPhone: "0904455663",
    customerEmail: "minhdt@yahoo.com",
    address: "15 Lê Thánh Tôn, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    items: [
      { productId: "p3", productName: "Đèn thả trần Minimal", image: "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp", price: 599000, quantity: 1 }
    ],
    total: 599000,
    date: "2026-08-05T11:20:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "processing",
    notes: null
  },
  {
    id: "MS-1017",
    customerName: "Bùi Anh Tuấn",
    customerPhone: "0981122334",
    customerEmail: "tuanba@gmail.com",
    address: "55 Hùng Vương, Hải Châu, Đà Nẵng",
    items: [
      { productId: "p5", productName: "Kệ gỗ đa năng", image: "/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp", price: 1293000, quantity: 1 }
    ],
    total: 1293000,
    date: "2026-08-04T18:30:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1016",
    customerName: "Dương Quốc Huy",
    customerPhone: "0915566774",
    customerEmail: "huydq@gmail.com",
    address: "88 Trần Phú, Lộc Thọ, Nha Trang",
    items: [
      { productId: "p7", productName: "Đèn lồng tre", image: "/assets/images/products/do-my-nghe/den-long-tre.webp", price: 320000, quantity: 2 },
      { productId: "p6", productName: "Giỏ mây lưu trữ", image: "/assets/images/products/do-thu-cong/gio-may-dan.webp", price: 199000, quantity: 1 }
    ],
    total: 839000,
    date: "2026-08-04T14:15:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "shipping",
    notes: null
  },
  {
    id: "MS-1015",
    customerName: "Trịnh Khánh Linh",
    customerPhone: "0902233446",
    customerEmail: "linhtk@gmail.com",
    address: "99 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    items: [
      { productId: "p4", productName: "Bình gốm Decor", image: "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp", price: 290000, quantity: 1 }
    ],
    total: 290000,
    date: "2026-08-03T21:10:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1014",
    customerName: "Ngô Minh Triết",
    customerPhone: "0938899001",
    customerEmail: "trietnm@outlook.com",
    address: "102 Lê Hồng Phong, Phường 2, Quận 5, TP. Hồ Chí Minh",
    items: [
      { productId: "p1", productName: "Sofa 2 chỗ Nordic", image: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp", price: 2990000, quantity: 1 },
      { productId: "p4", productName: "Bình gốm Decor", image: "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp", price: 290000, quantity: 1 }
    ],
    total: 3280000,
    date: "2026-08-03T15:40:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "pending",
    shippingStatus: "pending",
    notes: null
  },
  {
    id: "MS-1013",
    customerName: "Phan Thanh Thảo",
    customerPhone: "0971122338",
    customerEmail: "thaopt@gmail.com",
    address: "42 Bạch Đằng, Phước Ninh, Hải Châu, Đà Nẵng",
    items: [
      { productId: "p6", productName: "Giỏ mây lưu trữ", image: "/assets/images/products/do-thu-cong/gio-may-dan.webp", price: 199000, quantity: 2 }
    ],
    total: 398000,
    date: "2026-08-03T09:05:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "processing",
    notes: null
  },
  {
    id: "MS-1012",
    customerName: "Đặng Quốc Bảo",
    customerPhone: "0967788992",
    customerEmail: "baodq@gmail.com",
    address: "24 Cát Linh, Quốc Tử Giám, Đống Đa, Hà Nội",
    items: [
      { productId: "p1", productName: "Sofa 2 chỗ Nordic", image: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp", price: 2990000, quantity: 1 }
    ],
    total: 2990000,
    date: "2026-08-02T17:50:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1011",
    customerName: "Lý Hoài Nam",
    customerPhone: "0906677881",
    customerEmail: "namlh@gmail.com",
    address: "156 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, TP. Hồ Chí Minh",
    items: [
      { productId: "p8", productName: "Bộ bình gốm Minimal", image: "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp", price: 450000, quantity: 2 },
      { productId: "p6", productName: "Giỏ mây lưu trữ", image: "/assets/images/products/do-thu-cong/gio-may-dan.webp", price: 199000, quantity: 1 }
    ],
    total: 1099000,
    date: "2026-08-02T11:12:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1010",
    customerName: "Đinh Gia Bảo",
    customerPhone: "0987788554",
    customerEmail: "baodg@gmail.com",
    address: "68 Kim Mã, Ngọc Khánh, Ba Đình, Hà Nội",
    items: [
      { productId: "p10", productName: "Khay gỗ hoa văn", image: "/assets/images/products/do-thu-cong/khay-go-hoa-van.webp", price: 280000, quantity: 1 }
    ],
    total: 280000,
    date: "2026-08-01T22:30:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "pending",
    notes: null
  },
  {
    id: "MS-1009",
    customerName: "Nguyễn Thanh Tùng",
    customerPhone: "0912233448",
    customerEmail: "tungnt@gmail.com",
    address: "220 Xô Viết Nghệ Tĩnh, Phường 21, Bình Thạnh, TP. Hồ Chí Minh",
    items: [
      { productId: "p3", productName: "Đèn thả trần Minimal", image: "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp", price: 599000, quantity: 2 }
    ],
    total: 1198000,
    date: "2026-08-01T16:20:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1008",
    customerName: "Trần Minh Ngọc",
    customerPhone: "0933344557",
    customerEmail: "ngoctm@yahoo.com",
    address: "33 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng",
    items: [
      { productId: "p2", productName: "Bàn ăn gỗ Sồi", image: "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp", price: 3490000, quantity: 1 }
    ],
    total: 3490000,
    date: "2026-08-01T10:45:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "cancelled",
    notes: null
  },
  {
    id: "MS-1007",
    customerName: "Lê Thùy Trang",
    customerPhone: "0965566779",
    customerEmail: "tranglt@gmail.com",
    address: "18 Phố Huế, Hàng Bài, Hoàn Kiếm, Hà Nội",
    items: [
      { productId: "p7", productName: "Đèn lồng tre", image: "/assets/images/products/do-my-nghe/den-long-tre.webp", price: 320000, quantity: 1 }
    ],
    total: 320000,
    date: "2026-07-31T14:15:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1006",
    customerName: "Phạm Tiến Dũng",
    customerPhone: "0984433221",
    customerEmail: "dungpt@gmail.com",
    address: "245 Điện Biên Phủ, Phường 7, Quận 3, TP. Hồ Chí Minh",
    items: [
      { productId: "p8", productName: "Bộ bình gốm Minimal", image: "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp", price: 450000, quantity: 3 }
    ],
    total: 1350000,
    date: "2026-07-31T09:30:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1005",
    customerName: "Vũ Thúy Hạnh",
    customerPhone: "0905544332",
    customerEmail: "hanhvt@outlook.com",
    address: "15 Hàm Nghi, Nguyễn Thái Bình, Quận 1, TP. Hồ Chí Minh",
    items: [
      { productId: "p9", productName: "Tranh treo Macrame", image: "/assets/images/products/do-thu-cong/tranh-treo-macrame.webp", price: 380000, quantity: 1 },
      { productId: "p6", productName: "Giỏ mây lưu trữ", image: "/assets/images/products/do-thu-cong/gio-may-dan.webp", price: 199000, quantity: 1 }
    ],
    total: 579000,
    date: "2026-07-30T20:10:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "shipping",
    notes: null
  },
  {
    id: "MS-1004",
    customerName: "Đỗ Hoàng Giang",
    customerPhone: "0913344558",
    customerEmail: "giangdh@gmail.com",
    address: "72 Giảng Võ, Cát Linh, Đống Đa, Hà Nội",
    items: [
      { productId: "p1", productName: "Sofa 2 chỗ Nordic", image: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp", price: 2990000, quantity: 1 }
    ],
    total: 2990000,
    date: "2026-07-30T15:00:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1003",
    customerName: "Nguyễn Ngọc Anh",
    customerPhone: "0973344550",
    customerEmail: "anhnn@gmail.com",
    address: "19 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    items: [
      { productId: "p9", productName: "Tranh treo Macrame", image: "/assets/images/products/do-thu-cong/tranh-treo-macrame.webp", price: 380000, quantity: 2 }
    ],
    total: 760000,
    date: "2026-07-29T18:35:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1002",
    customerName: "Trần Hoàng Anh",
    customerPhone: "0932233449",
    customerEmail: "anhta@gmail.com",
    address: "56 Hùng Vương, Hải Châu 1, Hải Châu, Đà Nẵng",
    items: [
      { productId: "p9", productName: "Tranh treo Macrame", image: "/assets/images/products/do-thu-cong/tranh-treo-macrame.webp", price: 380000, quantity: 1 }
    ],
    total: 380000,
    date: "2026-07-29T11:22:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "pending",
    notes: null
  },
  {
    id: "MS-1001",
    customerName: "Lê Văn Sỹ",
    customerPhone: "0909988776",
    customerEmail: "sylv@gmail.com",
    address: "789 Lê Văn Sỹ, Phường 14, Quận 3, TP. Hồ Chí Minh",
    items: [
      { productId: "p5", productName: "Kệ gỗ đa năng", image: "/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp", price: 1293000, quantity: 1 },
      { productId: "p6", productName: "Giỏ mây lưu trữ", image: "/assets/images/products/do-thu-cong/gio-may-dan.webp", price: 199000, quantity: 1 }
    ],
    total: 1492000,
    date: "2026-07-28T17:15:00Z",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
    notes: null
  },
  {
    id: "MS-1000",
    customerName: "Phạm Thị Tuyết",
    customerPhone: "0986655443",
    customerEmail: "tuyetpt@gmail.com",
    address: "44 Nguyễn Du, Nguyễn Du, Hai Bà Trưng, Hà Nội",
    items: [
      { productId: "p6", productName: "Giỏ mây lưu trữ", image: "/assets/images/products/do-thu-cong/gio-may-dan.webp", price: 199000, quantity: 1 }
    ],
    total: 199000,
    date: "2026-07-28T13:00:00Z",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "completed",
    notes: null
  }
];

async function main() {
  try {
    console.log('Connecting to PostgreSQL Supabase database...');
    await client.connect();
    console.log('Successfully connected!\n');

    console.log('Creating tables in public schema...');
    
    // 1. Categories Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        image TEXT,
        description TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('-> Table public.categories created.');

    // 2. Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        category TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
        category_name TEXT,
        image TEXT,
        description TEXT,
        featured BOOLEAN DEFAULT false,
        stock_count INTEGER DEFAULT 0,
        in_stock BOOLEAN DEFAULT true,
        sold_count INTEGER DEFAULT 0,
        sku TEXT,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('-> Table public.products created.');

    // 3. Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        address TEXT NOT NULL,
        notes TEXT,
        total_amount NUMERIC NOT NULL,
        shipping_fee NUMERIC DEFAULT 0,
        payment_method TEXT DEFAULT 'cod',
        payment_status TEXT DEFAULT 'pending',
        shipping_status TEXT DEFAULT 'pending',
        order_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('-> Table public.orders created.');

    // 4. Order Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.order_items (
        id BIGSERIAL PRIMARY KEY,
        order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
        product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
        product_name TEXT NOT NULL,
        image TEXT,
        price NUMERIC NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('-> Table public.order_items created.');

    // Disable RLS on all 4 tables as requested
    console.log('\nConfiguring RLS (Disabled as requested)...');
    await client.query(`
      ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
      ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
    `);
    console.log('-> RLS disabled on all tables.');

    // Grant public access for anon and authenticated Supabase roles
    await client.query(`
      GRANT ALL ON public.categories TO anon, authenticated, service_role;
      GRANT ALL ON public.products TO anon, authenticated, service_role;
      GRANT ALL ON public.orders TO anon, authenticated, service_role;
      GRANT ALL ON public.order_items TO anon, authenticated, service_role;
      GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
    `);
    console.log('-> Permissions granted to anon, authenticated, service_role.');

    // Insert / Upsert Categories
    console.log('\nInserting categories...');
    for (const cat of CATEGORIES) {
      await client.query(`
        INSERT INTO public.categories (id, name, slug, image, description, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          image = EXCLUDED.image,
          description = EXCLUDED.description,
          status = EXCLUDED.status;
      `, [cat.id, cat.name, cat.slug, cat.image, cat.description, cat.status]);
    }
    console.log(`-> ${CATEGORIES.length} categories upserted successfully.`);

    // Insert / Upsert Products
    console.log('\nInserting products...');
    for (const prod of PRODUCTS) {
      await client.query(`
        INSERT INTO public.products (id, name, price, category, category_name, image, description, featured, stock_count, in_stock, sold_count, sku)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          category = EXCLUDED.category,
          category_name = EXCLUDED.category_name,
          image = EXCLUDED.image,
          description = EXCLUDED.description,
          featured = EXCLUDED.featured,
          stock_count = EXCLUDED.stock_count,
          in_stock = EXCLUDED.in_stock,
          sold_count = EXCLUDED.sold_count,
          sku = EXCLUDED.sku;
      `, [
        prod.id,
        prod.name,
        prod.price,
        prod.category,
        prod.categoryName,
        prod.image,
        prod.description,
        prod.featured,
        prod.stockCount,
        prod.inStock,
        prod.soldCount,
        prod.sku
      ]);
    }
    console.log(`-> ${PRODUCTS.length} products upserted successfully.`);

    // Insert / Upsert Orders & Order Items
    console.log('\nInserting orders and items...');
    for (const order of ORDERS) {
      await client.query(`
        INSERT INTO public.orders (id, customer_name, customer_phone, customer_email, address, notes, total_amount, shipping_fee, payment_method, payment_status, shipping_status, order_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          customer_phone = EXCLUDED.customer_phone,
          customer_email = EXCLUDED.customer_email,
          address = EXCLUDED.address,
          notes = EXCLUDED.notes,
          total_amount = EXCLUDED.total_amount,
          shipping_fee = EXCLUDED.shipping_fee,
          payment_method = EXCLUDED.payment_method,
          payment_status = EXCLUDED.payment_status,
          shipping_status = EXCLUDED.shipping_status,
          order_date = EXCLUDED.order_date;
      `, [
        order.id,
        order.customerName,
        order.customerPhone,
        order.customerEmail,
        order.address,
        order.notes,
        order.total,
        0,
        order.paymentMethod,
        order.paymentStatus,
        order.shippingStatus,
        order.date
      ]);

      // Clear existing items for this order to re-insert clean items
      await client.query('DELETE FROM public.order_items WHERE order_id = $1', [order.id]);

      for (const item of order.items) {
        await client.query(`
          INSERT INTO public.order_items (order_id, product_id, product_name, image, price, quantity)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          order.id,
          item.productId,
          item.productName,
          item.image,
          item.price,
          item.quantity
        ]);
      }
    }
    console.log(`-> ${ORDERS.length} orders & order items upserted successfully.`);

    // Final verification counts
    console.log('\n================ VERIFICATION ================');
    const countCategories = await client.query('SELECT COUNT(*) FROM public.categories;');
    const countProducts = await client.query('SELECT COUNT(*) FROM public.products;');
    const countOrders = await client.query('SELECT COUNT(*) FROM public.orders;');
    const countItems = await client.query('SELECT COUNT(*) FROM public.order_items;');

    console.log(`Total Categories in DB: ${countCategories.rows[0].count}`);
    console.log(`Total Products in DB:   ${countProducts.rows[0].count}`);
    console.log(`Total Orders in DB:     ${countOrders.rows[0].count}`);
    console.log(`Total Order Items in DB:${countItems.rows[0].count}`);
    console.log('==============================================\n');

  } catch (err) {
    console.error('Error during database initialization:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
