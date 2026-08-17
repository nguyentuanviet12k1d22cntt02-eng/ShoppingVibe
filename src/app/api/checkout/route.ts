import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from '@/data/products';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface CheckoutItemPayload {
  productId: string;
  quantity: number;
}

interface CheckoutPayload {
  fullname: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'qr';
  items: CheckoutItemPayload[];
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutPayload = await req.json();
    const { fullname, phone, email, address, note, paymentMethod, items } = body;

    // 1. Validation
    if (!fullname?.trim() || !phone?.trim() || !address?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Giỏ hàng của bạn đang trống.' },
        { status: 400 }
      );
    }

    // 2. Fetch official product details from Supabase DB to verify real prices
    const productIds = items.map(it => it.productId.toString());
    const { data: dbProducts, error: prodFetchError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (prodFetchError) {
      console.warn('Could not fetch products from DB, checking static products data:', prodFetchError);
    }

    // Create a lookup map for price & metadata verification
    const productLookup = new Map<string, { name: string; price: number; image: string }>();

    // Seed with static products first
    PRODUCTS.forEach(p => {
      productLookup.set(p.id.toString(), {
        name: p.name,
        price: Number(p.price),
        image: p.image,
      });
    });

    // Override with fresh database products
    if (dbProducts) {
      dbProducts.forEach((p: any) => {
        productLookup.set(p.id.toString(), {
          name: p.name,
          price: Number(p.price),
          image: p.image || '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp',
        });
      });
    }

    // 3. Calculate verified subtotal on the server
    let calculatedSubtotal = 0;
    const verifiedOrderItems: Array<{
      product_id: string;
      product_name: string;
      image: string;
      price: number;
      quantity: number;
    }> = [];

    for (const item of items) {
      const prodInfo = productLookup.get(item.productId.toString());
      if (!prodInfo) {
        return NextResponse.json(
          { success: false, error: `Sản phẩm với mã ID ${item.productId} không tồn tại hoặc đã ngừng kinh doanh.` },
          { status: 400 }
        );
      }

      const validQuantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const itemTotal = prodInfo.price * validQuantity;
      calculatedSubtotal += itemTotal;

      verifiedOrderItems.push({
        product_id: item.productId.toString(),
        product_name: prodInfo.name,
        image: prodInfo.image,
        price: prodInfo.price,
        quantity: validQuantity,
      });
    }

    // 4. Calculate shipping fee and final total
    const calculatedShippingFee = calculatedSubtotal >= 500000 || calculatedSubtotal === 0 ? 0 : 30000;
    const calculatedTotal = calculatedSubtotal + calculatedShippingFee;

    // 5. Generate secure unique order ID (Timestamp in hex + random string)
    const timestampHex = Date.now().toString(36).toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedOrderId = `MS-${timestampHex}-${randomHex}`;

    // 6. Insert order record
    const { error: orderError } = await supabase.from('orders').insert({
      id: generatedOrderId,
      customer_name: fullname.trim(),
      customer_phone: phone.trim(),
      customer_email: email?.trim() || null,
      address: address.trim(),
      notes: note?.trim() || null,
      total_amount: calculatedTotal,
      shipping_fee: calculatedShippingFee,
      payment_method: paymentMethod === 'qr' || paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cod',
      payment_status: 'pending',
      shipping_status: 'pending',
      order_date: new Date().toISOString(),
    });

    if (orderError) {
      console.error('Failed to insert order in Supabase:', orderError);
      return NextResponse.json(
        { success: false, error: 'Không thể tạo đơn hàng trên hệ thống. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }

    // 7. Insert order items
    const itemsToInsert = verifiedOrderItems.map(it => ({
      order_id: generatedOrderId,
      ...it,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

    if (itemsError) {
      console.error('Failed to insert order items in Supabase:', itemsError);
      // Attempt rollback order if items insertion failed
      await supabase.from('orders').delete().eq('id', generatedOrderId);
      return NextResponse.json(
        { success: false, error: 'Lỗi khi lưu danh sách chi tiết đơn hàng.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: generatedOrderId,
      subtotal: calculatedSubtotal,
      shippingFee: calculatedShippingFee,
      totalAmount: calculatedTotal,
    });
  } catch (error: any) {
    console.error('Server Checkout Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý thanh toán máy chủ.' },
      { status: 500 }
    );
  }
}
