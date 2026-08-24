import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendOtpEmail } from '@/utils/mailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unilqwsbbcnpbybizcbz.supabase.co';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_6LZIWOxdtZZLUncEv0cOBw_SQ-wiK_T';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự.' },
        { status: 400 }
      );
    }

    // 1. Check if email is already registered and active in profiles
    try {
      const { data: existingProfiles, error: profileErr } = await supabase
        .from('profiles')
        .select('id, email, status')
        .ilike('email', cleanEmail)
        .eq('status', 'active')
        .limit(1);

      if (!profileErr && existingProfiles && existingProfiles.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.' },
          { status: 400 }
        );
      }
    } catch (checkErr) {
      console.warn('Profile check warning:', checkErr);
    }

    // 2. Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Password hash for temporary storage
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex') + ':' + salt;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 3. Invalidate old unverified OTPs and insert new OTP record
    try {
      await supabase
        .from('otp_verifications')
        .update({ is_verified: true })
        .ilike('email', cleanEmail)
        .eq('is_verified', false);

      const { error: insertErr } = await supabase
        .from('otp_verifications')
        .insert({
          email: cleanEmail,
          otp_code: otpCode,
          user_name: cleanName,
          password_hash: passwordHash,
          purpose: 'signup',
          expires_at: expiresAt,
          is_verified: false,
        });

      if (insertErr) {
        console.warn('Could not insert into otp_verifications table, proceeding with email:', insertErr.message);
      }
    } catch (dbErr) {
      console.warn('OTP table DB error:', dbErr);
    }

    // 4. Send email containing the OTP code
    const mailResult = await sendOtpEmail({
      toEmail: cleanEmail,
      recipientName: cleanName,
      otpCode,
    });

    if (!mailResult.success) {
      console.warn('Email sending notice:', mailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: `Mã xác minh OTP 6 số đã được gửi đến email ${cleanEmail}. Vui lòng mở hộp thư của bạn để lấy mã.`,
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error('Error in register-otp API:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi xử lý đăng ký từ máy chủ.' },
      { status: 500 }
    );
  }
}
