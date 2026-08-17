import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unilqwsbbcnpbybizcbz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Vui lòng nhập mã giảm giá.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Number(subtotal) || 0;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query coupon from database
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (error || !coupon) {
      return NextResponse.json({
        success: false,
        error: `Mã giảm giá "${cleanCode}" không tồn tại hoặc đã hết hiệu lực.`
      }, { status: 404 });
    }

    if (!coupon.is_active) {
      return NextResponse.json({
        success: false,
        error: `Mã giảm giá "${cleanCode}" hiện đang tạm khóa.`
      }, { status: 400 });
    }

    // Check expiration
    if (coupon.end_date && new Date(coupon.end_date) < new Date()) {
      return NextResponse.json({
        success: false,
        error: `Mã giảm giá "${cleanCode}" đã hết hạn sử dụng.`
      }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({
        success: false,
        error: `Mã giảm giá "${cleanCode}" đã đạt giới hạn lượt sử dụng.`
      }, { status: 400 });
    }

    // Check min order amount
    const minAmount = Number(coupon.min_order_amount) || 0;
    if (orderSubtotal < minAmount) {
      return NextResponse.json({
        success: false,
        error: `Mã "${cleanCode}" chỉ áp dụng cho đơn hàng từ ${minAmount.toLocaleString('vi-VN')}đ trở lên.`
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    const discountVal = Number(coupon.discount_value) || 0;
    const maxDiscount = coupon.max_discount_amount ? Number(coupon.max_discount_amount) : Infinity;

    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((orderSubtotal * discountVal) / 100);
      if (discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    } else {
      discountAmount = Math.min(discountVal, orderSubtotal);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: discountVal,
        discountAmount,
        minOrderAmount: minAmount,
      }
    });
  } catch (err: any) {
    console.error('Error validating coupon:', err);
    return NextResponse.json({ success: false, error: 'Lỗi kiểm tra mã giảm giá.' }, { status: 500 });
  }
}
