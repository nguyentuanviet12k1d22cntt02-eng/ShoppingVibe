import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID sản phẩm' }, { status: 400 });
    }

    // 1. Fetch main product
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', id.trim())
      .single();

    if (prodErr || !product) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    // 2. Fetch images gallery
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id.trim())
      .order('display_order', { ascending: true });

    // 3. Fetch variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', id.trim())
      .order('price_adjustment', { ascending: true });

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        images: images || [],
        variants: variants || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi tải chi tiết sản phẩm' },
      { status: 500 }
    );
  }
}
