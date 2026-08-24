import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const defaultSettings = {
      storeName: 'Mini Shop - Không Gian Sống Mộc Mạc',
      phone: '0912 345 678',
      email: 'contact@minishop.vn',
      address: 'Làng gốm Bát Tràng, Gia Lâm, Hà Nội',
      shippingFee: 30000,
      freeShipThreshold: 500000,
      bankName: 'Vietcombank (VCB)',
      accountNumber: '1029384756',
      accountName: 'NGUYEN VAN ADMIN',
      codEnabled: true,
      bankEnabled: true,
      themeColor: '#2e7d32'
    };

    if (!data) {
      return NextResponse.json({ success: true, settings: defaultSettings });
    }

    return NextResponse.json({
      success: true,
      settings: {
        storeName: data.store_name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        shippingFee: Number(data.shipping_fee),
        freeShipThreshold: Number(data.free_ship_threshold),
        bankName: data.bank_name,
        accountNumber: data.account_number,
        accountName: data.account_name,
        codEnabled: data.cod_enabled,
        bankEnabled: data.bank_enabled,
        themeColor: data.theme_color,
      }
    });
  } catch (err: any) {
    console.error('Error fetching store settings:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      storeName,
      phone,
      email,
      address,
      shippingFee,
      freeShipThreshold,
      bankName,
      accountNumber,
      accountName,
      codEnabled,
      bankEnabled,
      themeColor
    } = body;

    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        id: 'default',
        store_name: storeName,
        phone,
        email,
        address,
        shipping_fee: Number(shippingFee) || 0,
        free_ship_threshold: Number(freeShipThreshold) || 0,
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        cod_enabled: Boolean(codEnabled),
        bank_enabled: Boolean(bankEnabled),
        theme_color: themeColor || '#2e7d32',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình hệ thống thành công!',
      settings: data
    });
  } catch (err: any) {
    console.error('Error saving store settings:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
