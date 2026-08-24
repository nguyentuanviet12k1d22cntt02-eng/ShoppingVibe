import { NextResponse } from 'next/server';
import pg from 'pg';
import { sendOtpEmail } from '@/utils/mailer';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

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
    const client = await pool.connect();

    try {
      // Find latest registration attempt
      const prevRecord = await client.query(
        `SELECT user_name, password_hash FROM public.otp_verifications
         WHERE lower(email) = $1 ORDER BY created_at DESC LIMIT 1`,
        [cleanEmail]
      );

      const userName = prevRecord.rows.length > 0 ? prevRecord.rows[0].user_name : 'Khách hàng';
      const passHash = prevRecord.rows.length > 0 ? prevRecord.rows[0].password_hash : null;

      // Invalidate previous OTPs
      await client.query(
        'UPDATE public.otp_verifications SET is_verified = true WHERE email = $1 AND is_verified = false',
        [cleanEmail]
      );

      // Generate new 6-digit OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await client.query(
        `INSERT INTO public.otp_verifications (email, otp_code, user_name, password_hash, purpose, expires_at)
         VALUES ($1, $2, $3, $4, 'signup', $5)`,
        [cleanEmail, newOtp, userName, passHash, expiresAt]
      );

      // Send new OTP to recipient email
      await sendOtpEmail({
        toEmail: cleanEmail,
        recipientName: userName,
        otpCode: newOtp,
      });

      return NextResponse.json({
        success: true,
        message: `Mã OTP mới đã được gửi tới email ${cleanEmail}.`,
        email: cleanEmail,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error in resend-otp API:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi gửi lại mã OTP từ máy chủ.' },
      { status: 500 }
    );
  }
}
