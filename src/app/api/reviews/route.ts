import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : null;

    let query = supabase
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, reviews: data || [] });
  } catch (err: any) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userName, userEmail, rating, comment, location } = body;

    if (!productId || !userName || !comment || !rating) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ tên, số sao đánh giá và nội dung nhận xét.' },
        { status: 400 }
      );
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Đánh giá phải từ 1 đến 5 sao.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_name: userName.trim(),
        user_email: userEmail ? userEmail.trim() : null,
        rating: numRating,
        comment: comment.trim(),
        location: location ? location.trim() : 'Việt Nam',
        is_verified_purchase: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Cảm ơn bạn đã gửi đánh giá sản phẩm!',
      review: data,
    });
  } catch (err: any) {
    console.error('Error creating review:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
