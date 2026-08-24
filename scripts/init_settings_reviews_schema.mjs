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

const INITIAL_REVIEWS = [
  {
    product_id: 'p1',
    user_name: 'Chị Ngọc Thảo',
    user_email: 'ngocthao@gmail.com',
    rating: 5,
    comment: 'Bình gốm mạ men Bát Tràng đặt ở bàn trà phòng khách nhìn rất sang và ấm cúng. Đóng gói chèn xốp và hộp gỗ cẩn thận, mộc mạc đúng tinh thần thủ công!',
    location: 'Hà Nội',
    is_verified_purchase: true
  },
  {
    product_id: 'p3',
    user_name: 'Anh Minh Hoàng',
    user_email: 'minhhoang@gmail.com',
    rating: 5,
    comment: 'Giỏ mây đan rất chắc chắn, nan tre nhẵn bóng và thơm mùi mây tự nhiên. Giao hàng 2h trong nội thành cực kỳ nhanh chóng. Rất hài lòng với dịch vụ.',
    location: 'TP. Hồ Chí Minh',
    is_verified_purchase: true
  },
  {
    product_id: 'p2',
    user_name: 'Chị Thu Trang',
    user_email: 'thutrang@gmail.com',
    rating: 5,
    comment: 'Đèn thả trần tre tỏa ánh sáng vàng ấm dịu rất chill cho bàn ăn gia đình. Bạn bè tới chơi ai cũng tấm tắc khen gu thẩm mỹ mộc mạc của căn nhà.',
    location: 'Đà Nẵng',
    is_verified_purchase: true
  },
  {
    product_id: 'p4',
    user_name: 'Anh Tuấn Kiệt',
    user_email: 'tuankiet@gmail.com',
    rating: 5,
    comment: 'Bộ ấm chén gốm mộc pha trà rất giữ nhiệt và đượm vị. Nước men mịn, hoa văn vẽ tay rất tinh tế.',
    location: 'Hải Phòng',
    is_verified_purchase: true
  }
];

async function main() {
  try {
    console.log('📡 Đang kết nối Postgres Supabase...');
    await client.connect();
    console.log('✅ Đã kết nối thành công!\n');

    // 1. Store Settings Table
    console.log('🛠️ Đang tạo bảng public.store_settings...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.store_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        store_name TEXT NOT NULL DEFAULT 'Mini Shop - Không Gian Sống Mộc Mạc',
        phone TEXT NOT NULL DEFAULT '0912 345 678',
        email TEXT NOT NULL DEFAULT 'contact@minishop.vn',
        address TEXT NOT NULL DEFAULT 'Làng gốm Bát Tràng, Gia Lâm, Hà Nội',
        shipping_fee NUMERIC NOT NULL DEFAULT 30000,
        free_ship_threshold NUMERIC NOT NULL DEFAULT 500000,
        bank_name TEXT NOT NULL DEFAULT 'Vietcombank (VCB)',
        account_number TEXT NOT NULL DEFAULT '1029384756',
        account_name TEXT NOT NULL DEFAULT 'NGUYEN VAN ADMIN',
        cod_enabled BOOLEAN DEFAULT true,
        bank_enabled BOOLEAN DEFAULT true,
        theme_color TEXT DEFAULT '#2e7d32',
        updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      ALTER TABLE public.store_settings DISABLE ROW LEVEL SECURITY;
      GRANT ALL ON public.store_settings TO anon, authenticated, service_role;
    `);

    await client.query(`
      INSERT INTO public.store_settings (id, store_name, phone, email, address, shipping_fee, free_ship_threshold, bank_name, account_number, account_name, cod_enabled, bank_enabled, theme_color)
      VALUES ('default', 'Mini Shop - Không Gian Sống Mộc Mạc', '0912 345 678', 'contact@minishop.vn', 'Làng gốm Bát Tràng, Gia Lâm, Hà Nội', 30000, 500000, 'Vietcombank (VCB)', '1029384756', 'NGUYEN VAN ADMIN', true, true, '#2e7d32')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Bảng public.store_settings đã sẵn sàng.');

    // 2. Product Reviews Table
    console.log('🛠️ Đang tạo bảng public.product_reviews...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.product_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        location TEXT DEFAULT 'Việt Nam',
        is_verified_purchase BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      ALTER TABLE public.product_reviews DISABLE ROW LEVEL SECURITY;
      GRANT ALL ON public.product_reviews TO anon, authenticated, service_role;
    `);

    // Check count and seed initial reviews if empty
    const reviewCount = await client.query(`SELECT count(*) FROM public.product_reviews;`);
    if (parseInt(reviewCount.rows[0].count, 10) === 0) {
      console.log('🌟 Đang chèn đánh giá mẫu ban đầu...');
      for (const rev of INITIAL_REVIEWS) {
        await client.query(`
          INSERT INTO public.product_reviews (product_id, user_name, user_email, rating, comment, location, is_verified_purchase)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [rev.product_id, rev.user_name, rev.user_email, rev.rating, rev.comment, rev.location, rev.is_verified_purchase]);
      }
      console.log(`✅ Đã chèn ${INITIAL_REVIEWS.length} đánh giá vào Database.`);
    }

    // 3. Ensure profiles has status & phone columns
    console.log('🛠️ Kiểm tra cột status & phone trong bảng public.profiles...');
    await client.query(`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      UPDATE public.profiles SET status = 'active' WHERE status IS NULL;
    `);
    console.log('✅ Bảng public.profiles đã cập nhật đầy đủ các cột.');

    await client.end();
    console.log('\n🎉 HOÀN TẤT KHỞI TẠO BẢNG SETTINGS, REVIEWS VÀ CẬP NHẬT PROFILES!');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
}

main();
