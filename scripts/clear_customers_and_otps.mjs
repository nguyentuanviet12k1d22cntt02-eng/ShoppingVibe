import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://postgres.unilqwsbbcnpbybizcbz:Viet.10092004%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('✅ Đã kết nối tới cơ sở dữ liệu Supabase PostgreSQL');

  try {
    // 1. Clear all OTP verification records
    console.log('\n🧹 Đang xóa toàn bộ lịch sử mã OTP trong `public.otp_verifications`...');
    try {
      const delOtp = await client.query('DELETE FROM public.otp_verifications;');
      console.log(`✅ Đã xóa ${delOtp.rowCount} bản ghi mã OTP.`);
    } catch (e) {
      console.warn('⚠️ Lỗi xóa otp_verifications:', e.message);
    }

    // 2. Identify and keep admin accounts
    const adminProfilesRes = await client.query(`
      SELECT id, full_name, email, role FROM public.profiles WHERE role = 'admin' OR email ILIKE '%admin%';
    `);
    console.log('\n👑 Tài khoản Admin được giữ lại:');
    console.table(adminProfilesRes.rows);

    const adminEmails = adminProfilesRes.rows.map(r => (r.email ? r.email.toLowerCase() : ''));

    // 3. Clear non-admin customer profiles
    console.log('\n🧹 Đang xóa danh sách tài khoản khách hàng trong `public.profiles`...');
    let delProfiles;
    if (adminEmails.length > 0) {
      const placeholders = adminEmails.map((_, idx) => `$${idx + 1}`).join(',');
      delProfiles = await client.query(
        `DELETE FROM public.profiles WHERE LOWER(email) NOT IN (${placeholders}) AND role != 'admin';`,
        adminEmails
      );
    } else {
      delProfiles = await client.query("DELETE FROM public.profiles WHERE role != 'admin';");
    }
    console.log(`✅ Đã xóa ${delProfiles.rowCount} tài khoản khách hàng khỏi bảng ` + '`profiles`');

    // 4. Clear auth.users for non-admin accounts
    try {
      console.log('\n🧹 Đang xóa danh sách khách hàng trong `auth.users`...');
      let delAuth;
      if (adminEmails.length > 0) {
        const placeholders = adminEmails.map((_, idx) => `$${idx + 1}`).join(',');
        delAuth = await client.query(
          `DELETE FROM auth.users WHERE LOWER(email) NOT IN (${placeholders}) AND email NOT ILIKE '%admin%';`,
          adminEmails
        );
      } else {
        delAuth = await client.query("DELETE FROM auth.users WHERE email NOT ILIKE '%admin%';");
      }
      console.log(`✅ Đã xóa ${delAuth.rowCount} tài khoản khỏi ` + '`auth.users`');
    } catch (authErr) {
      console.warn('ℹ️ Auth.users cleanup:', authErr.message);
    }

    // 5. Check remaining accounts
    const remaining = await client.query('SELECT id, full_name, email, role, status FROM public.profiles;');
    console.log('\n✨ DANH SÁCH TÀI KHOẢN CÒN LẠI TRÊN SUPABASE:');
    console.table(remaining.rows);
  } catch (err) {
    console.error('❌ Lỗi khi dọn dẹp dữ liệu:', err);
  } finally {
    await client.end();
  }
}

main();
