import { NextResponse } from 'next/server';
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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp email cần gửi lại mã OTP.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Find latest registration attempt
    const { data: prevRecords } = await supabase
      .from('otp_verifications')
      .select('user_name, password_hash')
      .ilike('email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(1);

    const userName = prevRecords && prevRecords.length > 0 ? prevRecords[0].user_name : 'Khách hàng';
    const passHash = prevRecords && prevRecords.length > 0 ? prevRecords[0].password_hash : null;

    // 2. Invalidate previous OTPs
    await supabase
      .from('otp_verifications')
      .update({ is_verified: true })
      .ilike('email', cleanEmail)
      .eq('is_verified', false);

    // 3. Generate new 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from('otp_verifications').insert({
      email: cleanEmail,
      otp_code: newOtp,
      user_name: userName,
      password_hash: passHash,
      purpose: 'signup',
      expires_at: expiresAt,
      is_verified: false,
    });

    // 4. Send new OTP to recipient email
    const mailResult = await sendOtpEmail({
      toEmail: cleanEmail,
      recipientName: userName,
      otpCode: newOtp,
    });

    if (!mailResult.success) {
      console.warn('Resend email notice:', mailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: `Mã OTP mới đã được gửi tới email ${cleanEmail}.`,
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error('Error in resend-otp API:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi gửi lại mã OTP từ máy chủ.' },
      { status: 500 }
    );
  }
}
