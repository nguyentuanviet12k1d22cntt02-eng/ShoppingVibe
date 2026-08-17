import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/addresses?email=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Thiếu tham số email' }, { status: 400 });
    }

    const { data: addresses, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_email', email.trim().toLowerCase())
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, addresses: addresses || [] });
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi tải danh sách địa chỉ' },
      { status: 500 }
    );
  }
}

// POST /api/addresses
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, recipientName, phone, addressLine, label, isDefault } = body;

    if (!userEmail?.trim() || !recipientName?.trim() || !phone?.trim() || !addressLine?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ thông tin địa chỉ.' },
        { status: 400 }
      );
    }

    const cleanEmail = userEmail.trim().toLowerCase();

    // If setting as default, unset other default addresses for this user
    if (isDefault) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_email', cleanEmail);
    }

    const { data: newAddress, error } = await supabase
      .from('user_addresses')
      .insert({
        user_email: cleanEmail,
        recipient_name: recipientName.trim(),
        phone: phone.trim(),
        address_line: addressLine.trim(),
        label: label?.trim() || 'Nhà riêng',
        is_default: Boolean(isDefault),
      })
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, address: newAddress, message: 'Đã thêm địa chỉ mới thành công!' });
  } catch (error: any) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi tạo địa chỉ mới' },
      { status: 500 }
    );
  }
}

// PUT /api/addresses
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userEmail, recipientName, phone, addressLine, label, isDefault } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID địa chỉ' }, { status: 400 });
    }

    if (isDefault && userEmail) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_email', userEmail.trim().toLowerCase());
    }

    const updateFields: any = {};
    if (recipientName !== undefined) updateFields.recipient_name = recipientName.trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (addressLine !== undefined) updateFields.address_line = addressLine.trim();
    if (label !== undefined) updateFields.label = label.trim();
    if (isDefault !== undefined) updateFields.is_default = Boolean(isDefault);

    const { data: updated, error } = await supabase
      .from('user_addresses')
      .update(updateFields)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, address: updated, message: 'Cập nhật địa chỉ thành công!' });
  } catch (error: any) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi cập nhật địa chỉ' },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses?id=...
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID địa chỉ' }, { status: 400 });
    }

    const { error } = await supabase.from('user_addresses').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Đã xóa địa chỉ thành công!' });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xóa địa chỉ' },
      { status: 500 }
    );
  }
}
