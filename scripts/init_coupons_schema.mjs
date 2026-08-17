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

// Convert direct pooler host if needed or use connection string
let connectionString = databaseUrl;
// If using IPv4 / direct host, replace if necessary or use standard pg connection
const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const INITIAL_COUPONS = [
  {
    code: 'MINI10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: 500000,
    usage_limit: 500,
    used_count: 14,
    is_active: true,
    description: 'Giảm 10% cho mọi đơn hàng (tối đa 500k)'
  },
  {
    code: 'ARTISAN50',
    discount_type: 'fixed_amount',
    discount_value: 50000,
    min_order_amount: 500000,
    max_discount_amount: 50000,
    usage_limit: 100,
    used_count: 5,
    is_active: true,
    description: 'Giảm 50.000đ cho đơn hàng từ 500.000đ'
  },
  {
    code: 'FREESHIP',
    discount_type: 'fixed_amount',
    discount_value: 30000,
    min_order_amount: 300000,
    max_discount_amount: 30000,
    usage_limit: 200,
    used_count: 28,
    is_active: true,
    description: 'Miễn phí vận chuyển (giảm 30.000đ) cho đơn từ 300.000đ'
  },
  {
    code: 'VIPWELCOME',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_amount: 1000000,
    max_discount_amount: 1000000,
    usage_limit: 50,
    used_count: 2,
    is_active: true,
    description: 'Ưu đãi thành viên VIP giảm 15% cho đơn từ 1 triệu'
  }
];

async function main() {
  try {
    console.log('📡 Đang kết nối Postgres Supabase để khởi tạo bảng coupons...');
    await client.connect();
    console.log('✅ Đã kết nối thành công!\n');

    // 1. Create table coupons
    console.log('🛠️ Đang tạo bảng public.coupons...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.coupons (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
        discount_value NUMERIC NOT NULL,
        min_order_amount NUMERIC DEFAULT 0,
        max_discount_amount NUMERIC,
        usage_limit INTEGER DEFAULT 100,
        used_count INTEGER DEFAULT 0,
        start_date TIMESTAMPTZ DEFAULT now(),
        end_date TIMESTAMPTZ DEFAULT (now() + INTERVAL '1 year'),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
      GRANT ALL ON public.coupons TO anon, authenticated, service_role;
    `);
    console.log('✅ Bảng public.coupons đã sẵn sàng.');

    // 2. Insert initial sample coupons
    console.log('🎟️ Đang chèn các mã voucher mẫu...');
    for (const c of INITIAL_COUPONS) {
      await client.query(`
        INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (code) DO UPDATE SET
          description = EXCLUDED.description,
          discount_type = EXCLUDED.discount_type,
          discount_value = EXCLUDED.discount_value,
          min_order_amount = EXCLUDED.min_order_amount,
          max_discount_amount = EXCLUDED.max_discount_amount,
          usage_limit = EXCLUDED.usage_limit,
          is_active = EXCLUDED.is_active;
      `, [c.code, c.description, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount_amount, c.usage_limit, c.used_count, c.is_active]);
    }
    console.log(`✅ Đã thêm/cập nhật ${INITIAL_COUPONS.length} mã voucher vào Database.`);

    await client.end();
    console.log('\n🎉 HOÀN TẤT KHỞI TẠO BẢNG COUPONS!');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

main();
