import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unilqwsbbcnpbybizcbz.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_6LZIWOxdtZZLUncEv0cOBw_SQ-wiK_T';

const supabase = createClient(supabaseUrl, supabaseKey);

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

    // 1. Find valid matching OTP record from Supabase
    const { data: records, error: fetchErr } = await supabase
      .from('otp_verifications')
      .select('*')
      .ilike('email', cleanEmail)
      .eq('otp_code', cleanOtp)
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchErr) {
      console.warn('Error fetching OTP from Supabase:', fetchErr.message);
    }

    let validEntry = records && records.length > 0 ? records[0] : null;

    if (validEntry) {
      // Check expiration
      if (new Date(validEntry.expires_at) <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'Mã OTP đã hết hiệu lực. Vui lòng bấm "Gửi lại mã mới".' },
          { status: 400 }
        );
      }

      // Mark OTP as verified
      await supabase
        .from('otp_verifications')
        .update({ is_verified: true })
        .eq('id', validEntry.id);
    }

    const userName = validEntry?.user_name || 'Khách hàng';

    // 2. Register user via Supabase Auth
    let supabaseUserId = null;
    if (password) {
      try {
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
      } catch (authErr) {
        console.warn('Supabase auth signup notice:', authErr);
      }
    }

    // 3. Ensure profile exists and is active in public.profiles table
    const userId = supabaseUserId || crypto.randomUUID();
    const { error: profileUpsertErr } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: cleanEmail,
          full_name: userName,
          role: 'customer',
          status: 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (profileUpsertErr) {
      console.warn('Profile upsert note:', profileUpsertErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.',
      user: {
        id: userId,
        email: cleanEmail,
        name: userName,
        role: 'customer',
      },
    });
  } catch (err: any) {
    console.error('Error in verify-otp API:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi xác minh mã OTP.' },
      { status: 500 }
    );
  }
}
