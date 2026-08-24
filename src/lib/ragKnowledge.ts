import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from '@/data/products';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface RagProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
  categoryName: string;
  image: string;
  description: string;
  stockCount: number;
  inStock: boolean;
  featured?: boolean;
}

export interface RagCouponItem {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
}

export interface RagContextResult {
  contextText: string;
  matchedProducts: RagProductItem[];
  orderStatusFound?: string | null;
}

/**
 * Trích xuất toàn bộ dữ liệu CSDL thời gian thực từ Supabase và xây dựng ngữ cảnh RAG
 */
export async function buildRagContext(userQuery: string): Promise<RagContextResult> {
  const queryLower = userQuery.toLowerCase().trim();

  // 1. Fetch real-time products from Supabase (fallback to static data if needed)
  let productsList: RagProductItem[] = [];
  try {
    const { data: dbProds } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (dbProds && dbProds.length > 0) {
      productsList = dbProds.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price || 0),
        category: p.category || 'decor',
        categoryName: p.category_name || 'Đồ thủ công',
        image: p.image || '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp',
        description: p.description || '',
        stockCount: p.stock_count !== null && p.stock_count !== undefined ? Number(p.stock_count) : 10,
        inStock: Boolean(p.in_stock),
        featured: Boolean(p.featured),
      }));
    } else {
      productsList = PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        categoryName: p.categoryName,
        image: p.image,
        description: p.description,
        stockCount: p.stockCount ?? 10,
        inStock: p.inStock !== false,
        featured: p.featured,
      }));
    }
  } catch (err) {
    console.error('Error fetching products for RAG:', err);
  }

  // 2. Fetch active coupons
  let couponsList: RagCouponItem[] = [];
  try {
    const { data: dbCoupons } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true);

    if (dbCoupons) {
      couponsList = dbCoupons.map((c: any) => ({
        code: c.code,
        description: c.description || '',
        discountType: c.discount_type,
        discountValue: Number(c.discount_value || 0),
        minOrderAmount: Number(c.min_order_amount || 0),
        maxDiscountAmount: c.max_discount_amount ? Number(c.max_discount_amount) : undefined,
      }));
    }
  } catch (err) {
    console.error('Error fetching coupons for RAG:', err);
  }

  // 3. Fetch store settings & policies
  let storeInfo = {
    name: 'Mini Shop - Không Gian Sống Mộc Mạc',
    phone: '0912 345 678',
    email: 'contact@minishop.vn',
    address: 'Làng gốm Bát Tràng, Gia Lâm, Hà Nội',
    shippingFee: 30000,
    freeShipThreshold: 500000,
    paymentMethods: 'Thanh toán khi nhận hàng (COD kiểm tra hàng trước khi thanh toán) và Chuyển khoản QR Ngân hàng',
    warranty: 'Bảo hành 12 tháng, 1 đổi 1 trong vòng 30 ngày nếu có lỗi từ xưởng sản xuất',
  };

  try {
    const { data: dbSettings } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (dbSettings) {
      storeInfo = {
        name: dbSettings.store_name || storeInfo.name,
        phone: dbSettings.phone || storeInfo.phone,
        email: dbSettings.email || storeInfo.email,
        address: dbSettings.address || storeInfo.address,
        shippingFee: Number(dbSettings.shipping_fee || 30000),
        freeShipThreshold: Number(dbSettings.free_ship_threshold || 500000),
        paymentMethods: storeInfo.paymentMethods,
        warranty: storeInfo.warranty,
      };
    }
  } catch (err) {
    console.error('Error fetching settings for RAG:', err);
  }

  // 4. Order Tracking Lookup (Detect Order ID pattern like MS-XXXX or order search)
  let orderStatusFound: string | null = null;
  const orderIdMatch = userQuery.match(/MS-[A-Z0-9]+-[A-Z0-9]+/i) || userQuery.match(/MS-[A-Z0-9]+/i);
  if (orderIdMatch) {
    const searchCode = orderIdMatch[0].toUpperCase();
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .ilike('id', `%${searchCode}%`)
        .limit(1)
        .single();

      if (orderData) {
        const payStatus = orderData.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán (COD/Chuyển khoản)';
        const shipStatusMap: Record<string, string> = {
          pending: 'Đang tiếp nhận & Chuẩn bị đơn',
          processing: 'Đang đóng gói tại xưởng',
          shipping: 'Đang vận chuyển giao hàng',
          completed: 'Đã giao hàng thành công',
          cancelled: 'Đã hủy',
        };
        const shipStatus = shipStatusMap[orderData.shipping_status] || orderData.shipping_status;
        const total = Number(orderData.total_amount || 0).toLocaleString('vi-VN');
        const itemsList = (orderData.order_items || []).map((it: any) => `${it.product_name} (x${it.quantity})`).join(', ');

        orderStatusFound = `Đơn hàng ${orderData.id}: Người nhận: ${orderData.customer_name}, SĐT: ${orderData.customer_phone}, Địa chỉ: ${orderData.address}. Tổng tiền: ${total}đ. Trạng thái giao hàng: ${shipStatus}. Trạng thái thanh toán: ${payStatus}. Sản phẩm: [${itemsList}].`;
      }
    } catch (e) {
      console.warn('Order lookup error in RAG:', e);
    }
  }

  // 5. Intelligent Product Ranking & Matching with Stop Words Filtering
  const matchedProducts: RagProductItem[] = [];

  const STOP_WORDS = new Set([
    'shop', 'ơi', 'bên', 'mình', 'có', 'bán', 'không', 'khong', 'k', 'ko', 'ạ',
    'mua', 'tìm', 'cần', 'xem', 'hỏi', 'cho', 'em', 'tôi', 'bạn', 'mấy', 'cái',
    'con', 'chiếc', 'món', 'mẫu', 'nào', 'với', 'và', 'ở', 'đây', 'được', 'thế', 'thì', 'la', 'là'
  ]);

  const rawTokens = queryLower.replace(/[.,?!:;]/g, ' ').split(/\s+/);
  const meaningfulTokens = rawTokens.filter(t => t.length >= 2 && !STOP_WORDS.has(t));

  // Score products based on meaningful keyword matching
  const scoredProducts = productsList.map(p => {
    let score = 0;
    const nameLower = p.name.toLowerCase();
    const catLower = (p.categoryName + ' ' + p.category).toLowerCase();
    const descLower = p.description.toLowerCase();

    // Direct phrase match
    meaningfulTokens.forEach(token => {
      if (nameLower === token) {
        score += 15; // exact keyword match
      } else if (nameLower.includes(token)) {
        score += 8;
      }
      if (catLower.includes(token)) {
        score += 4;
      }
      if (descLower.includes(token)) {
        score += 1;
      }
    });

    return { product: p, score };
  });

  scoredProducts.sort((a, b) => b.score - a.score);

  // Only pick products that have a solid score (>= 8)
  const topMatches = scoredProducts.filter(item => item.score >= 8).slice(0, 3);
  if (topMatches.length > 0) {
    topMatches.forEach(item => matchedProducts.push(item.product));
  } else if (
    meaningfulTokens.length === 0 &&
    (queryLower.includes('bán chạy') || queryLower.includes('gợi ý') || queryLower.includes('tư vấn'))
  ) {
    // Return top 3 featured products only for general browsing questions
    productsList.filter(p => p.inStock).slice(0, 3).forEach(p => matchedProducts.push(p));
  }

  // 6. Build the Context String for LLM
  let contextText = `=== THÔNG TIN CỬA HÀNG & CHÍNH SÁCH MINI SHOP ===
- Tên cửa hàng: ${storeInfo.name}
- Hotline hỗ trợ: ${storeInfo.phone}
- Địa chỉ xưởng: ${storeInfo.address}
- Chính sách giao hàng: Phí vận chuyển toàn quốc là ${storeInfo.shippingFee.toLocaleString('vi-VN')}đ. MIỄN PHÍ VẬN CHUYỂN (Freeship) cho đơn hàng từ ${storeInfo.freeShipThreshold.toLocaleString('vi-VN')}đ trở lên.
- Chính sách bảo hành & đổi trả: ${storeInfo.warranty}.
- Phương thức thanh toán: ${storeInfo.paymentMethods}.

=== DANH SÁCH MÃ GIẢM GIÁ ĐANG ÁP DỤNG (${couponsList.length} mã) ===
${
  couponsList.length > 0
    ? couponsList
        .map(
          c =>
            `- Mã "${c.code}": Giảm ${
              c.discountType === 'percentage' ? `${c.discountValue}%` : `${c.discountValue.toLocaleString('vi-VN')}đ`
            } cho đơn hàng từ ${c.minOrderAmount.toLocaleString('vi-VN')}đ. Mô tả: ${c.description}`
        )
        .join('\n')
    : 'Hiện chưa có mã giảm giá mới.'
}

=== DANH MỤC SẢN PHẨM HIỆN CÓ TRONG CSDL (${productsList.length} sản phẩm) ===
${productsList
  .slice(0, 100)
  .map(
    p =>
      `- [${p.id}] ${p.name} | Danh mục: ${p.categoryName} | Giá bán: ${p.price.toLocaleString(
        'vi-VN'
      )}đ | Tồn kho: ${p.inStock ? `${p.stockCount} món (Còn hàng)` : '0 món (Hết hàng)'} | Link: /products/${p.id}`
  )
  .join('\n')}
`;

  if (orderStatusFound) {
    contextText += `\n=== KẾT QUẢ TRA CỨU ĐƠN HÀNG THỰC TẾ ===\n${orderStatusFound}\n`;
  }

  return {
    contextText,
    matchedProducts,
    orderStatusFound,
  };
}

/**
 * Fallback AI / Smart Rule Synthesis khi chưa cấu hình Gemini API Key
 */
export function generateSmartRagResponse(userQuery: string, ragData: RagContextResult): string {
  const q = userQuery.toLowerCase();

  // 1. Order status query
  if (ragData.orderStatusFound) {
    return `**Kết quả tra cứu:** ${ragData.orderStatusFound}`;
  }

  // 2. Coupon query
  if (q.includes('mã giảm') || q.includes('voucher') || q.includes('khuyến mãi') || q.includes('coupon') || q.includes('giảm giá')) {
    return `Mini Shop có các mã: **MINI10** (giảm 10% đơn từ 300k), **FREESHIP** (miễn phí ship đơn từ 500k), **WELCOME50** (giảm 50k cho khách mới). Bạn nhập mã tại trang thanh toán nhé.`;
  }

  // 3. Shipping / Policy query
  if (q.includes('ship') || q.includes('vận chuyển') || q.includes('giao hàng') || q.includes('phí giao') || q.includes('freeship')) {
    return `Phí giao hàng toàn quốc là **30.000đ**, **miễn phí vận chuyển** cho đơn từ **500.000đ**. Thời gian giao hàng từ 1 - 3 ngày.`;
  }

  // 4. Warranty & Return query
  if (q.includes('bảo hành') || q.includes('đổi trả') || q.includes('lỗi')) {
    return `Chính sách của shop: **Đổi trả 1-1 trong 30 ngày** nếu có lỗi sản xuất/vận chuyển và **bảo hành chính hãng 12 tháng**.`;
  }

  // 5. Product recommendations
  if (ragData.matchedProducts.length > 0) {
    return `Dạ, shop có các sản phẩm phù hợp với nhu cầu của bạn bên dưới. Bạn nhấn vào thẻ để xem chi tiết nhé.`;
  }

  // 6. If asking for unavailable categories (computer, phone, clothes, etc.)
  if (
    q.includes('máy tính') ||
    q.includes('laptop') ||
    q.includes('điện thoại') ||
    q.includes('quần áo') ||
    q.includes('xe') ||
    q.includes('giày')
  ) {
    return `Dạ hiện tại Mini Shop không kinh doanh mặt hàng này ạ. Shop chỉ chuyên về nội thất và đồ thủ công mỹ nghệ.`;
  }

  // 7. Default greeting
  return `Dạ chào bạn! Mini Shop chuyên về nội thất và đồ thủ công mỹ nghệ. Bạn cần tìm sản phẩm hoặc hỗ trợ thông tin gì ạ?`;
}
