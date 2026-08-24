import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const databaseUrl = envVars.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Không tìm thấy DATABASE_URL trong .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('✅ Đã kết nối tới cơ sở dữ liệu PostgreSQL');

  try {
    // 1. Check current admin profiles
    const adminProfilesRes = await client.query(`
      SELECT id, full_name, email, role FROM profiles WHERE role = 'admin' OR email ILIKE '%admin%';
    `);
    console.log('👑 Các tài khoản Admin được giữ lại:');
    console.table(adminProfilesRes.rows);

    const adminIds = adminProfilesRes.rows.map(r => r.id);
    const adminEmails = adminProfilesRes.rows.map(r => r.email ? r.email.toLowerCase() : '');

    // 2. Delete order_items & orders
    console.log('\n🗑️ Đang xóa toàn bộ đơn hàng...');
    await client.query('DELETE FROM order_items;');
    await client.query('DELETE FROM orders;');
    console.log('✅ Đã xóa toàn bộ dữ liệu trong bảng `order_items` và `orders`');

    // 3. Delete customer addresses for non-admins
    try {
      if (adminEmails.length > 0) {
        const placeholders = adminEmails.map((_, idx) => `$${idx + 1}`).join(',');
        await client.query(`
          DELETE FROM public.user_addresses WHERE LOWER(user_email) NOT IN (${placeholders});
        `, adminEmails);
      } else {
        await client.query('DELETE FROM public.user_addresses;');
      }
      console.log('✅ Đã dọn dẹp bảng `user_addresses` (chỉ giữ lại địa chỉ của tài khoản admin)');
    } catch (e) {
      console.log('ℹ️ Bảng user_addresses:', e.message);
    }

    // 4. Delete customer profiles (keep admins)
    console.log('\n🗑️ Đang xóa các tài khoản khách hàng (giữ lại tài khoản Admin)...');
    let delProfilesRes;
    if (adminIds.length > 0) {
      const placeholders = adminIds.map((_, idx) => `$${idx + 1}`).join(',');
      delProfilesRes = await client.query(`
        DELETE FROM profiles WHERE id NOT IN (${placeholders}) AND role != 'admin';
      `, adminIds);
    } else {
      delProfilesRes = await client.query("DELETE FROM profiles WHERE role != 'admin';");
    }
    console.log(`✅ Đã xóa ${delProfilesRes.rowCount} tài khoản khách hàng khỏi bảng profiles`);

    // 5. Delete auth.users for non-admins if accessible
    try {
      let delAuthRes;
      if (adminEmails.length > 0) {
        const placeholders = adminEmails.map((_, idx) => `$${idx + 1}`).join(',');
        delAuthRes = await client.query(`
          DELETE FROM auth.users WHERE LOWER(email) NOT IN (${placeholders});
        `, adminEmails);
      } else {
        delAuthRes = await client.query("DELETE FROM auth.users WHERE email NOT ILIKE '%admin%';");
      }
      console.log(`✅ Đã xóa ${delAuthRes.rowCount} tài khoản khách hàng khỏi bảng auth.users`);
    } catch (e) {
      console.log('ℹ️ Auth.users cleanup:', e.message);
    }

    // 6. Verify remaining data
    const remainingOrders = await client.query('SELECT COUNT(*) FROM orders;');
    const remainingProfiles = await client.query('SELECT id, full_name, email, role FROM profiles;');
    console.log('\n✨ KẾT QUẢ SAU KHI DỌN DẸP:');
    console.log(`- Số đơn hàng còn lại: ${remainingOrders.rows[0].count}`);
    console.log(`- Danh sách tài khoản còn lại trong hệ thống:`);
    console.table(remainingProfiles.rows);

  } catch (err) {
    console.error('❌ Lỗi khi thực hiện dọn dẹp:', err);
  } finally {
    await client.end();
  }
}

main();
