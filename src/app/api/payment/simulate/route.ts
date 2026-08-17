import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Thiếu mã đơn hàng (orderId).' },
        { status: 400 }
      );
    }

    // Fetch the order
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId.trim())
      .single();

    if (fetchErr || !order) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy đơn hàng #${orderId}` },
        { status: 404 }
      );
    }

    // Update payment status to paid & shipping status to processing if it was pending
    const newShippingStatus = order.shipping_status === 'pending' ? 'processing' : order.shipping_status;
    const paymentNote = order.notes
      ? `${order.notes} | [VietQR Demo] Đã xác nhận chuyển khoản thành công lúc ${new Date().toLocaleTimeString('vi-VN')}`
      : `[VietQR Demo] Đã xác nhận chuyển khoản thành công lúc ${new Date().toLocaleTimeString('vi-VN')}`;

    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        shipping_status: newShippingStatus,
        notes: paymentNote,
      })
      .eq('id', order.id)
      .select('*, order_items(*)')
      .single();

    if (updateErr) {
      throw updateErr;
    }

    return NextResponse.json({
      success: true,
      message: `Xác nhận thanh toán VietQR thành công cho đơn #${orderId}!`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error simulating payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý thanh toán.' },
      { status: 500 }
    );
  }
}
