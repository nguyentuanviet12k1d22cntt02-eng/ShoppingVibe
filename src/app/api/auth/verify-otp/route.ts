import { NextResponse } from 'next/server';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unilqwsbbcnpbybizcbz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, password } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp email và mã xác minh OTP 6 số.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const client = await pool.connect();
    try {
      // 1. Find valid matching OTP
      const otpRecord = await client.query(
        `SELECT * FROM public.otp_verifications
         WHERE lower(email) = $1 AND otp_code = $2 AND is_verified = false AND expires_at > now()
         ORDER BY created_at DESC LIMIT 1`,
        [cleanEmail, cleanOtp]
      );

      if (otpRecord.rows.length === 0) {
        // Check if OTP was wrong or expired
        const expiredCheck = await client.query(
          `SELECT * FROM public.otp_verifications
           WHERE lower(email) = $1 AND otp_code = $2
           ORDER BY created_at DESC LIMIT 1`,
          [cleanEmail, cleanOtp]
        );

        if (expiredCheck.rows.length > 0 && expiredCheck.rows[0].expires_at <= new Date()) {
          return NextResponse.json(
            { success: false, error: 'Mã OTP đã hết hiệu lực. Vui lòng bấm "Gửi lại mã mới".' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { success: false, error: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.' },
          { status: 400 }
        );
      }

      const validEntry = otpRecord.rows[0];
      const userName = validEntry.user_name || 'Khách hàng';

      // 2. Mark OTP as verified
      await client.query(
        'UPDATE public.otp_verifications SET is_verified = true WHERE id = $1',
        [validEntry.id]
      );

      // 3. Register user via Supabase Auth if password provided
      let supabaseUserId = null;
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        if (password) {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: {
                full_name: userName,
                name: userName,
                role: 'customer',
              },
            },
          });
          if (!authError && authData?.user) {
            supabaseUserId = authData.user.id;
          }
        }
      } catch (authErr) {
        console.warn('Supabase auth signup notice:', authErr);
      }

      // 4. Ensure profile exists and is active in public.profiles table
      const userId = supabaseUserId || crypto.randomUUID();
      await client.query(
        `INSERT INTO public.profiles (id, email, full_name, role, status, updated_at)
         VALUES ($1, $2, $3, 'customer', 'active', now())
         ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           status = 'active',
           updated_at = now()`,
        [userId, cleanEmail, userName]
      );

      console.log(`✅ [AUTH VERIFIED] Tài khoản ${cleanEmail} đã xác minh OTP thành công và kích hoạt.`);

      return NextResponse.json({
        success: true,
        message: 'Xác minh tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.',
        user: {
          id: userId,
          name: userName,
          email: cleanEmail,
          role: 'customer',
        },
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error in verify-otp API:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi xác minh mã OTP từ máy chủ.' },
      { status: 500 }
    );
  }
}
