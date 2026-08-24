import pg from 'pg';

const { Client } = pg;
const databaseUrl = 'postgresql://postgres.unilqwsbbcnpbybizcbz:Viet.10092004%40@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('✅ Đã kết nối Supabase PostgreSQL');

  try {
    // 1. Create product-images bucket in storage.buckets
    await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
      ON CONFLICT (id) DO UPDATE SET
        public = true,
        file_size_limit = 10485760,
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    `);
    console.log('✅ Đã tạo Bucket public `product-images` trên Supabase Storage');

    // 2. Set storage policies so anyone can read and upload
    await client.query(`
      DO $$
      BEGIN
        -- Public read policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for Product Images'
        ) THEN
          CREATE POLICY "Public Access for Product Images"
          ON storage.objects FOR SELECT
          USING (bucket_id = 'product-images');
        END IF;

        -- Public insert/upload policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Upload for Product Images'
        ) THEN
          CREATE POLICY "Public Upload for Product Images"
          ON storage.objects FOR INSERT
          WITH CHECK (bucket_id = 'product-images');
        END IF;

        -- Public update policy
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Update for Product Images'
        ) THEN
          CREATE POLICY "Public Update for Product Images"
          ON storage.objects FOR UPDATE
          USING (bucket_id = 'product-images');
        END IF;
      END $$;
    `);
    console.log('✅ Đã cấp quyền (Policies) công khai cho Bucket `product-images`');

    // 3. Convert any existing broken blob: images in products table to high quality placeholder or real URL
    const updateRes = await client.query(`
      UPDATE public.products
      SET image = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
      WHERE image LIKE 'blob:%' AND name ILIKE '%máy tính%';
    `);
    console.log(`✅ Đã sửa đường dẫn ảnh máy tính bị hỏng blob: thành công (${updateRes.rowCount} bản ghi)`);

  } catch (err) {
    console.error('❌ Lỗi:', err);
  } finally {
    await client.end();
  }
}

main();
