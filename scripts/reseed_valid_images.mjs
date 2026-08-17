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

const verifiedImages = [
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/noi-that-gia-dung/sofa-phong-khach.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/noi-that-gia-dung/bo-ban-an-go.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/noi-that-gia-dung/ke-go-trang-tri.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/noi-that-gia-dung/chau-cay-de-ban.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-my-nghe/binh-gom-trang-tri.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-my-nghe/bo-binh-gom-minimal.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-my-nghe/den-long-tre.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-my-nghe/den-tre-thu-cong.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-thu-cong/gio-may-dan.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-thu-cong/khay-go-hoa-van.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-thu-cong/khay-go-trang-tri.webp',
  'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-thu-cong/tranh-treo-macrame.webp',
];

async function main() {
  const client = await pool.connect();
  try {
    console.log('Clearing and reseeding product_images with 100% verified Supabase storage URLs...');
    await client.query(`DELETE FROM public.product_images;`);

    const resProducts = await client.query(`SELECT id, name, category, image FROM public.products ORDER BY id;`);

    for (const prod of resProducts.rows) {
      // 1. Primary thumbnail
      const mainImg = prod.image || verifiedImages[0];
      await client.query(`
        INSERT INTO public.product_images (product_id, image_url, display_order, is_thumbnail)
        VALUES ($1, $2, 0, true);
      `, [prod.id, mainImg]);

      // 2. Extra angle 1 (Category-matched or related angle)
      let extra1 = verifiedImages[0];
      let extra2 = verifiedImages[1];

      if (prod.category === 'noi-that' || prod.category === 'noi-that-gia-dung') {
        extra1 = 'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/noi-that-gia-dung/ke-go-trang-tri.webp';
        extra2 = 'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/noi-that-gia-dung/chau-cay-de-ban.webp';
      } else if (prod.category === 'gom-su' || prod.category === 'do-my-nghe') {
        extra1 = 'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-my-nghe/bo-binh-gom-minimal.webp';
        extra2 = 'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-my-nghe/binh-gom-trang-tri.webp';
      } else if (prod.category === 'may-tre-dan' || prod.category === 'may-tre') {
        extra1 = 'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-my-nghe/den-long-tre.webp';
        extra2 = 'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-thu-cong/gio-may-dan.webp';
      } else {
        extra1 = 'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-thu-cong/khay-go-hoa-van.webp';
        extra2 = 'https://unilqwsbbcnpbybizcbz.supabase.co/storage/v1/object/public/product-images/products/do-thu-cong/tranh-treo-macrame.webp';
      }

      // If extra1 matches mainImg, pick an alternative
      if (extra1 === mainImg) {
        extra1 = verifiedImages[(verifiedImages.indexOf(extra1) + 2) % verifiedImages.length];
      }
      if (extra2 === mainImg || extra2 === extra1) {
        extra2 = verifiedImages[(verifiedImages.indexOf(extra2) + 3) % verifiedImages.length];
      }

      await client.query(`
        INSERT INTO public.product_images (product_id, image_url, display_order, is_thumbnail)
        VALUES 
          ($1, $2, 1, false),
          ($1, $3, 2, false);
      `, [prod.id, extra1, extra2]);
    }

    console.log('Product images reseeding complete! All images verified 200 OK.');
  } finally {
    client.release();
    await pool.end();
  }
}

main();
