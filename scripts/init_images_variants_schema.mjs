import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Read .env.local manually
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
    console.log('Connected to Supabase PostgreSQL...');

    // 1. Create product_images table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.product_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        display_order INT DEFAULT 0,
        is_thumbnail BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Table public.product_images ready.');

    // 2. Create product_variants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
        variant_name VARCHAR(150) NOT NULL,
        sku VARCHAR(100),
        price_adjustment NUMERIC(15,2) DEFAULT 0,
        stock_quantity INT DEFAULT 50,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Table public.product_variants ready.');

    // 3. Query existing products
    const resProducts = await client.query(`SELECT id, name, price, image FROM public.products ORDER BY id;`);
    console.log(`Found ${resProducts.rows.length} products.`);

    // 4. Seed sample extra images for products if empty
    const imgCountRes = await client.query(`SELECT count(*) FROM public.product_images;`);
    if (parseInt(imgCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding sample product images gallery...');
      for (const prod of resProducts.rows) {
        // Thumbnail
        await client.query(`
          INSERT INTO public.product_images (product_id, image_url, display_order, is_thumbnail)
          VALUES ($1, $2, 0, true);
        `, [prod.id, prod.image]);

        // Extra detail angles from cloud bucket
        const extraImages = [
          'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-my-nghe/binh-gom-trang-tri.webp',
          'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-my-nghe/am-tra-bat-trang.webp',
          'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/may-tre-dan/gio-may-tron.webp',
          'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/may-tre-dan/den-long-tre.webp',
        ];

        const randomImg1 = extraImages[(Math.abs(prod.id.charCodeAt(0)) + 1) % extraImages.length];
        const randomImg2 = extraImages[(Math.abs(prod.id.charCodeAt(prod.id.length - 1)) + 2) % extraImages.length];

        await client.query(`
          INSERT INTO public.product_images (product_id, image_url, display_order, is_thumbnail)
          VALUES ($1, $2, 1, false), ($1, $3, 2, false);
        `, [prod.id, randomImg1, randomImg2]);
      }
      console.log('Product images seeded.');
    }

    // 5. Seed sample variants if empty
    const varCountRes = await client.query(`SELECT count(*) FROM public.product_variants;`);
    if (parseInt(varCountRes.rows[0].count, 10) === 0) {
      console.log('Seeding sample product variants...');
      for (const prod of resProducts.rows) {
        if (prod.name.toLowerCase().includes('bình') || prod.name.toLowerCase().includes('gốm') || prod.name.toLowerCase().includes('lọ')) {
          await client.query(`
            INSERT INTO public.product_variants (product_id, variant_name, sku, price_adjustment, stock_quantity)
            VALUES 
              ($1, 'Size Tiêu Chuẩn (25cm) - Men Hỏa Biến', $2 || '-STD', 0, 30),
              ($1, 'Size Đại (38cm) - Men Hỏa Biến', $2 || '-L', 150000, 20),
              ($1, 'Size VIP (45cm) - Khắc Họa Tiết Vàng', $2 || '-VIP', 350000, 10);
          `, [prod.id, `SKU-${prod.id}`]);
        } else if (prod.name.toLowerCase().includes('giỏ') || prod.name.toLowerCase().includes('mây') || prod.name.toLowerCase().includes('khay')) {
          await client.query(`
            INSERT INTO public.product_variants (product_id, variant_name, sku, price_adjustment, stock_quantity)
            VALUES 
              ($1, 'Kích Thước M (Đường kính 30cm)', $2 || '-M', 0, 40),
              ($1, 'Kích Thước L (Đường kính 40cm)', $2 || '-L', 60000, 25),
              ($1, 'Bộ Combo Set 3 Giỏ Lồng Nhau', $2 || '-SET3', 180000, 15);
          `, [prod.id, `SKU-${prod.id}`]);
        } else if (prod.name.toLowerCase().includes('trà') || prod.name.toLowerCase().includes('tách') || prod.name.toLowerCase().includes('ấm')) {
          await client.query(`
            INSERT INTO public.product_variants (product_id, variant_name, sku, price_adjustment, stock_quantity)
            VALUES 
              ($1, 'Bộ 1 Ấm + 4 Chén (Tiêu chuẩn)', $2 || '-4C', 0, 25),
              ($1, 'Bộ 1 Ấm + 6 Chén + Khay Gỗ Hương', $2 || '-6C-KHAY', 120000, 15);
          `, [prod.id, `SKU-${prod.id}`]);
        } else {
          await client.query(`
            INSERT INTO public.product_variants (product_id, variant_name, sku, price_adjustment, stock_quantity)
            VALUES 
              ($1, 'Bản Mộc Tự Nhiên', $2 || '-NAT', 0, 35),
              ($1, 'Bản Phủ Sơn Bóng Chống Ẩm', $2 || '-COAT', 45000, 25);
          `, [prod.id, `SKU-${prod.id}`]);
        }
      }
      console.log('Product variants seeded.');
    }

    console.log('Step 3 Database setup completed successfully!');
  } catch (err) {
    console.error('Error during DB init:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
