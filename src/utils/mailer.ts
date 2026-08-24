import nodemailer from 'nodemailer';

interface SendOtpEmailParams {
  toEmail: string;
  recipientName: string;
  otpCode: string;
}

export async function sendOtpEmail({
  toEmail,
  recipientName,
  otpCode,
}: SendOtpEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'nguyentuanviet12k1@gmail.com';
    const smtpPass = (
      process.env.SMTP_PASS ||
      process.env.GMAIL_APP_PASSWORD ||
      'fnkeehthdrgifwmv'
    ).replace(/\s+/g, '');

    let transporter: nodemailer.Transporter;

    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="background-color: #2e7d32; padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Mini Shop Artisan</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Xác minh địa chỉ email đăng ký tài khoản</p>
        </div>
        
        <div style="padding: 32px 24px;">
          <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-top: 0;">
            Xin chào <strong>${recipientName || 'Quý khách'}</strong>,
          </p>
          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
            Cảm ơn bạn đã đăng ký tài khoản tại <strong>Mini Shop Artisan</strong>. Để hoàn tất kích hoạt tài khoản, vui lòng sử dụng mã xác thực (OTP) dưới đây:
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; padding: 14px 28px; background-color: #f1f8f3; border: 2px dashed #2e7d32; border-radius: 12px;">
              <span style="font-family: monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #2e7d32;">${otpCode}</span>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Mã này có hiệu lực trong vòng <strong>10 phút</strong>.</p>
          </div>
          
          <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tuyệt đối không chia sẻ mã OTP với bất kỳ ai để bảo vệ an toàn cho tài khoản.
          </p>
          
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
            © ${new Date().getFullYear()} Mini Shop Artisan. Đón bình yên vào nếp nhà Việt.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Mini Shop Artisan" <${smtpUser}>`,
      to: toEmail,
      subject: `[Mini Shop] ${otpCode} là mã xác minh đăng ký tài khoản của bạn`,
      text: `Xin chào ${recipientName}, mã xác thực OTP của bạn là: ${otpCode}. Mã có hiệu lực trong 10 phút.`,
      html: htmlContent,
    });

    console.log(`📨 [MAILER] Đã gửi OTP đến: ${toEmail} (ID: ${info.messageId})`);
    return { success: true };
  } catch (err: any) {
    console.error('❌ Lỗi khi gửi email OTP:', err);
    return { success: false, error: err.message || 'Lỗi gửi email' };
  }
}
