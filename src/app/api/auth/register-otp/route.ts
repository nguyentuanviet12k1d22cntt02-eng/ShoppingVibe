import { NextResponse } from 'next/server';
import pg from 'pg';
import crypto from 'crypto';
import { sendOtpEmail } from '@/utils/mailer';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

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

    const client = await pool.connect();
    try {
      // 1. Check if email is already registered and active
      const existingUser = await client.query(
        'SELECT id, email, status FROM public.profiles WHERE lower(email) = $1',
        [cleanEmail]
      );

      if (existingUser.rows.length > 0 && existingUser.rows[0].status === 'active') {
        return NextResponse.json(
          { success: false, error: 'Email này đã được đăng ký tài khoản trong hệ thống. Vui lòng đăng nhập.' },
          { status: 400 }
        );
      }

      // 2. Generate 6-digit numeric OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Password hash for storage before confirmation
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex') + ':' + salt;

      // Expiration: 10 minutes from now
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Invalidate previous unverified OTPs for this email
      await client.query(
        'UPDATE public.otp_verifications SET is_verified = true WHERE email = $1 AND is_verified = false',
        [cleanEmail]
      );

      // Insert new OTP verification record
      await client.query(
        `INSERT INTO public.otp_verifications (email, otp_code, user_name, password_hash, purpose, expires_at)
         VALUES ($1, $2, $3, $4, 'signup', $5)`,
        [cleanEmail, otpCode, cleanName, passwordHash, expiresAt]
      );

      // 3. Send email to recipient's email address
      await sendOtpEmail({
        toEmail: cleanEmail,
        recipientName: cleanName,
        otpCode,
      });

      return NextResponse.json({
        success: true,
        message: `Mã xác minh OTP 6 số đã được gửi đến email ${cleanEmail}. Vui lòng mở hộp thư của bạn để lấy mã.`,
        email: cleanEmail,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error in register-otp API:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi xử lý đăng ký từ máy chủ.' },
      { status: 500 }
    );
  }
}
