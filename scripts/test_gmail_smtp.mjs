import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const user = envVars.SMTP_USER || envVars.GMAIL_USER;
const pass = (envVars.SMTP_PASS || envVars.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

console.log('Testing Gmail SMTP with user:', user);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: user,
    pass: pass,
  },
});

async function testMail() {
  try {
    const info = await transporter.sendMail({
      from: `"Mini Shop Artisan" <${user}>`,
      to: user,
      subject: `[Mini Shop] Thử nghiệm gửi mã OTP thành công!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2e7d32;">Chúc mừng bạn!</h2>
          <p>Hệ thống gửi email tự động của <strong>Mini Shop</strong> đã được kích hoạt thành công qua Gmail.</p>
          <p>Từ bây giờ, tất cả mã OTP xác minh khi đăng ký tài khoản sẽ được gửi tự động và trực tiếp đến hộp thư người dùng.</p>
        </div>
      `,
    });
    console.log('✅ Gửi email thành công 100%!');
    console.log('Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Lỗi khi gửi email:', err);
  }
}

testMail();
