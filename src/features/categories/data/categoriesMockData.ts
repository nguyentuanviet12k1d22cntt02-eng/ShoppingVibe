import { CategoryItem } from '../types/categories.types';

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-noi-that',
    name: 'Nội thất gia dụng',
    slug: 'noi-that',
    image: '/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp',
    description: 'Bàn ăn, sofa, kệ gỗ mộc tự nhiên cao cấp phong cách Bắc Âu.',
    status: 'active',
  },
  {
    id: 'cat-den',
    name: 'Đèn & Chiếu sáng',
    slug: 'den',
    image: '/assets/images/products/do-my-nghe/den-tre-thu-cong.webp',
    description: 'Đèn thả trần mây tre đan thủ công mỹ nghệ ấm cúng.',
    status: 'active',
  },
  {
    id: 'cat-decor',
    name: 'Đồ trang trí Decor',
    slug: 'decor',
    image: '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp',
    description: 'Bình gốm Bát Tràng, tranh treo tường macrame nghệ thuật.',
    status: 'active',
  },
  {
    id: 'cat-luu-tru',
    name: 'Giỏ & Kệ lưu trữ',
    slug: 'luu-tru',
    image: '/assets/images/products/do-thu-cong/gio-may-dan.webp',
    description: 'Giỏ mây có nắp, khay gỗ hoa văn và kệ tổ chức không gian.',
    status: 'active',
  },
  {
    id: 'cat-gom-su',
    name: 'Gốm sứ thủ công',
    slug: 'gom-su',
    image: '/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp',
    description: 'Dòng sản phẩm gốm mộc tráng men hỏa biến tinh xảo.',
    status: 'active',
  },
];
