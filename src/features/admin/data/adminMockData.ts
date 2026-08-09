import { Customer } from '@/features/customers/types/customers.types';

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  items: OrderItem[];
  total: number;
  date: string;
  paymentMethod: 'cod' | 'bank_transfer';
  paymentStatus: 'paid' | 'pending';
  shippingStatus: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  notes?: string;
}

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "CUST-001", name: "Nguyễn Văn Nam", phone: "0901234567", email: "namnv@gmail.com", level: "platinum", totalSpend: 15420000, ordersCount: 8, joinDate: "2026-01-15", avatarBg: "#4f46e5", status: "active" },
  { id: "CUST-002", name: "Trần Thị Lan", phone: "0918765432", email: "lantt@yahoo.com", level: "gold", totalSpend: 7890000, ordersCount: 4, joinDate: "2026-02-10", avatarBg: "#0ea5e9", status: "active" },
  { id: "CUST-003", name: "Lê Hoàng Long", phone: "0982233445", email: "longlh@gmail.com", level: "silver", totalSpend: 3450000, ordersCount: 2, joinDate: "2026-03-22", avatarBg: "#10b981", status: "active" },
  { id: "CUST-004", name: "Phạm Minh Đức", phone: "0934455667", email: "ducpm@gmail.com", level: "bronze", totalSpend: 1250000, ordersCount: 1, joinDate: "2026-04-05", avatarBg: "#f59e0b", status: "active" },
  { id: "CUST-005", name: "Hoàng Ngân Hà", phone: "0976677889", email: "hahn@outlook.com", level: "gold", totalSpend: 8900000, ordersCount: 5, joinDate: "2026-01-08", avatarBg: "#ec4899", status: "active" },
  { id: "CUST-006", name: "Vũ Hoàng Anh", phone: "0963344552", email: "anhvh@gmail.com", level: "silver", totalSpend: 4890000, ordersCount: 3, joinDate: "2026-05-12", avatarBg: "#8b5cf6", status: "active" },
  { id: "CUST-007", name: "Đỗ Thị Minh", phone: "0904455663", email: "minhdt@yahoo.com", level: "bronze", totalSpend: 599000, ordersCount: 1, joinDate: "2026-06-18", avatarBg: "#ef4444", status: "inactive" },
  { id: "CUST-008", name: "Bùi Anh Tuấn", phone: "0981122334", email: "tuanba@gmail.com", level: "silver", totalSpend: 2580000, ordersCount: 2, joinDate: "2026-03-01", avatarBg: "#06b6d4", status: "active" },
  { id: "CUST-009", name: "Dương Quốc Huy", phone: "0915566774", email: "huydq@gmail.com", level: "platinum", totalSpend: 12350000, ordersCount: 6, joinDate: "2026-02-28", avatarBg: "#f97316", status: "active" },
  { id: "CUST-010", name: "Trịnh Khánh Linh", phone: "0902233446", email: "linhtk@gmail.com", level: "gold", totalSpend: 6780000, ordersCount: 4, joinDate: "2026-04-14", avatarBg: "#14b8a6", status: "active" }
];

export const MOCK_ORDERS: Order[] = [
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
    date: "2026-08-08 14:32",
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
    date: "2026-08-08 10:15",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "pending",
  },
  {
    id: "MS-1022",
    customerName: "Lê Hoàng Long",
    customerPhone: "0982233445",
    customerEmail: "longlh@gmail.com",
    address: "78 Lê Lợi, Thạch Thang, Hải Châu, Đà Nẵng",
    items: [
      { productId: "p4", productName: "Giỏ mây tre đan", image: "/assets/images/products/do-thu-cong/gio-may-dan.webp", price: 250000, quantity: 3 }
    ],
    total: 750000,
    date: "2026-08-07 19:40",
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
      { productId: "p5", productName: "Bình gốm Bát Tràng", image: "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp", price: 450000, quantity: 1 }
    ],
    total: 450000,
    date: "2026-08-07 15:20",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-08-06 09:10",
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
    date: "2026-08-05 16:45",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-08-05 11:20",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "processing",
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
    date: "2026-08-04 18:30",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-08-04 14:15",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "shipping",
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
    date: "2026-08-03 21:10",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-08-03 15:40",
    paymentMethod: "bank_transfer",
    paymentStatus: "pending",
    shippingStatus: "pending",
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
    date: "2026-08-03 09:05",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "processing",
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
    date: "2026-08-02 17:50",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-08-02 11:12",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-08-01 22:30",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "pending",
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
    date: "2026-08-01 16:20",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-08-01 10:45",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "cancelled",
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
    date: "2026-07-31 14:15",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-07-31 09:30",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-07-30 20:10",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "shipping",
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
    date: "2026-07-30 15:00",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-07-29 18:35",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-07-29 11:22",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "pending",
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
    date: "2026-07-28 17:15",
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    shippingStatus: "completed",
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
    date: "2026-07-28 13:00",
    paymentMethod: "cod",
    paymentStatus: "pending",
    shippingStatus: "completed",
  }
];
