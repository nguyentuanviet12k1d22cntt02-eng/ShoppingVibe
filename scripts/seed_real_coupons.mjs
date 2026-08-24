import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const client = new Client({
  connectionString: envVars.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const INITIAL_COUPONS = [
  {
    code: 'WELCOME10',
    description: 'Giảm 10% cho khách hàng mới (Tối đa 150.000đ)',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 300000,
    max_discount_amount: 150000,
    usage_limit: 200,
    used_count: 34,
    is_active: true
  },
  {
    code: 'NOITHAT500',
    description: 'Giảm 500.000đ cho đơn hàng nội thất từ 3.500.000đ',
    discount_type: 'fixed_amount',
    discount_value: 500000,
    min_order_amount: 3500000,
    max_discount_amount: null,
    usage_limit: 100,
    used_count: 42,
    is_active: true
  },
  {
    code: 'FREESHIP50',
    description: 'Miễn phí vận chuyển 50.000đ cho đơn từ 500.000đ',
    discount_type: 'fixed_amount',
    discount_value: 50000,
    min_order_amount: 500000,
    max_discount_amount: null,
    usage_limit: 500,
    used_count: 128,
    is_active: true
  },
  {
    code: 'FLASH20',
    description: 'Giảm 20% cho nhóm sản phẩm khuyến mãi chớp nhoáng (Tối đa 300.000đ)',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 1000000,
    max_discount_amount: 300000,
    usage_limit: 150,
    used_count: 67,
    is_active: true
  }
];

async function seedRealCoupons() {
  try {
    await client.connect();
    console.log('Connected to Supabase. Seeding real coupons...');

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
          used_count = EXCLUDED.used_count,
          is_active = EXCLUDED.is_active;
      `, [c.code, c.description, c.discount_type, c.discount_value, c.min_order_amount, c.max_discount_amount, c.usage_limit, c.used_count, c.is_active]);
    }

    const { rows } = await client.query('SELECT code, description, discount_value, discount_type, used_count, usage_limit FROM public.coupons ORDER BY created_at DESC');
    console.log('✅ Real Coupons in database:', rows);
    await client.end();
  } catch (err) {
    console.error('Error seeding coupons:', err.message);
  }
}

seedRealCoupons();
