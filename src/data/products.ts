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
}

export const PRODUCTS: Product[] = [
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
