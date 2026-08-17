import pg from 'pg';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.replace('DATABASE_URL=', '').trim().replace(/^['"]|['"]$/g, '');
    break;
  }
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connecting to Supabase PostgreSQL...');

    // 1. Create user_addresses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255) NOT NULL,
        recipient_name VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address_line TEXT NOT NULL,
        label VARCHAR(50) DEFAULT 'Nhà riêng',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Table public.user_addresses ready.');

    // 2. Seed initial addresses for testing (e.g. admin & demo users)
    const countRes = await client.query(`SELECT count(*) FROM public.user_addresses;`);
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial addresses...');
      await client.query(`
        INSERT INTO public.user_addresses (user_email, recipient_name, phone, address_line, label, is_default)
        VALUES 
          ('nguyentuanviet12k3@gmail.com', 'Việt Nguyễn Tuấn', '0868274624', 'Số 18 Phố Hàng Trống, Quận Hoàn Kiếm, Hà Nội', 'Nhà riêng', true),
          ('nguyentuanviet12k3@gmail.com', 'Việt Nguyễn (Văn Phòng)', '0868274624', 'Tòa nhà Landmark 72, Đường Phạm Hùng, Quận Nam Từ Liêm, Hà Nội', 'Văn phòng', false),
          ('admin@gmail.com', 'Admin Master', '0901234567', 'Tầng 12 Tòa nhà Artisan Tower, 123 Phố Huế, Hai Bà Trưng, Hà Nội', 'Công ty', true);
      `);
      console.log('Initial addresses seeded successfully.');
    }

    console.log('Step 4 Database setup completed!');
  } finally {
    client.release();
    await pool.end();
  }
}

main();
