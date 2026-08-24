import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 1. Fetch profiles
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileErr) throw profileErr;

    // 2. Fetch orders
    const { data: orders, error: orderErr } = await supabase
      .from('orders')
      .select('customer_email, customer_phone, total_amount, order_date, payment_status, shipping_status');

    if (orderErr) throw orderErr;

    const avatarBgs = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

    const customers = (profiles || []).map((p, idx) => {
      const userOrders = (orders || []).filter(o => o.customer_email && o.customer_email.toLowerCase() === (p.email || '').toLowerCase());
      const paidOrders = userOrders.filter(o => o.payment_status === 'paid' || o.payment_status === 'completed' || o.shipping_status === 'completed');
      const totalSpend = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
      const ordersCount = userOrders.length;

      let level = 'bronze';
      if (totalSpend >= 10000000) level = 'platinum';
      else if (totalSpend >= 5000000) level = 'gold';
      else if (totalSpend >= 2000000) level = 'silver';

      return {
        id: p.id || `CUST-${String(idx + 1).padStart(3, '0')}`,
        name: p.full_name || 'Khách hàng',
        email: p.email || '',
        phone: p.phone || userOrders[0]?.customer_phone || 'Chưa cập nhật',
        role: p.role || 'customer',
        level,
        totalSpend,
        ordersCount,
        joinDate: p.created_at ? p.created_at.split('T')[0] : '2026-08-01',
        avatarBg: avatarBgs[idx % avatarBgs.length],
        status: p.status || 'active',
      };
    });

    return NextResponse.json({ success: true, customers });
  } catch (err: any) {
    console.error('Error fetching customers:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, fullName, phone } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID khách hàng' }, { status: 400 });
    }

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (fullName !== undefined) updates.full_name = fullName;
    if (phone !== undefined) updates.phone = phone;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Cập nhật trạng thái khách hàng thành công!',
      customer: data,
    });
  } catch (err: any) {
    console.error('Error updating customer:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
