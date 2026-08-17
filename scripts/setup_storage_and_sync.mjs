import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const { Client } = pg;

// Read .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || 'https://unilqwsbbcnpbybizcbz.supabase.co';
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const databaseUrl = envVars.DATABASE_URL;

const BUCKET_NAME = 'product-images';

async function main() {
  console.log('🚀 Bắt đầu thiết lập quyền Storage và đồng bộ hình ảnh...');

  if (!databaseUrl) {
    console.error('❌ Không tìm thấy DATABASE_URL trong .env.local');
    return;
  }

  // 1. Connect to Postgres to add RLS policies for storage.objects
  const pgClient = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pgClient.connect();
    console.log('📡 Đã kết nối Postgres Database.');

    // Ensure bucket exists and is public
    await pgClient.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('${BUCKET_NAME}', '${BUCKET_NAME}', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);

    // Drop old policies if existing and re-create
    await pgClient.query(`
      DO $$
      BEGIN
        DROP POLICY IF EXISTS "Public Upload Policy" ON storage.objects;
        DROP POLICY IF EXISTS "Public Read Policy" ON storage.objects;
        DROP POLICY IF EXISTS "Public Update Policy" ON storage.objects;
        DROP POLICY IF EXISTS "Public Delete Policy" ON storage.objects;

        CREATE POLICY "Public Upload Policy" ON storage.objects 
          FOR INSERT TO public WITH CHECK (bucket_id = '${BUCKET_NAME}');

        CREATE POLICY "Public Read Policy" ON storage.objects 
          FOR SELECT TO public USING (bucket_id = '${BUCKET_NAME}');

        CREATE POLICY "Public Update Policy" ON storage.objects 
          FOR UPDATE TO public USING (bucket_id = '${BUCKET_NAME}');

        CREATE POLICY "Public Delete Policy" ON storage.objects 
          FOR DELETE TO public USING (bucket_id = '${BUCKET_NAME}');
      END $$;
    `);

    console.log('🛡️ Đã tạo xong Storage Policies cho phép INSERT/SELECT trên bucket product-images.');
  } catch (err) {
    console.warn('⚠️ Cảnh báo cấu hình policy qua Postgres:', err.message);
  }

  // 2. Upload all images using Supabase Storage client
  const supabase = createClient(supabaseUrl, supabaseKey);
  const baseDir = path.join(process.cwd(), 'public', 'assets', 'images');

  function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getFiles(filePath, fileList);
      } else if (/\.(webp|jpg|jpeg|png|svg)$/i.test(file)) {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  const allFiles = getFiles(baseDir);
  console.log(`📦 Bắt đầu tải lên ${allFiles.length} hình ảnh...`);

  const urlMapping = new Map();
  let successCount = 0;
  let errorCount = 0;

  for (const filePath of allFiles) {
    const relativeToPublic = path.relative(path.join(process.cwd(), 'public'), filePath).replace(/\\/g, '/');
    const localWebPath = `/${relativeToPublic}`;

    const relativeToImages = path.relative(baseDir, filePath).replace(/\\/g, '/');
    const cleanStoragePath = relativeToImages
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_\-\.\/]/g, '-');

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'image/webp';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(cleanStoragePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`❌ Lỗi upload ${cleanStoragePath}:`, error.message);
      errorCount++;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(cleanStoragePath);

      const publicUrl = publicUrlData.publicUrl;
      urlMapping.set(localWebPath, publicUrl);
      const filename = path.basename(filePath);
      urlMapping.set(filename, publicUrl);
      console.log(`✅ Upload thành công: ${cleanStoragePath}`);
      successCount++;
    }
  }

  console.log(`\n🎉 Tải lên hoàn tất: ${successCount} file thành công, ${errorCount} thất bại.`);

  // 3. Update Database tables
  if (successCount > 0) {
    console.log('🔄 Đang cập nhật URL Cloud vào Database...');
    try {
      const { rows: prods } = await pgClient.query('SELECT id, image FROM products');
      let prodsUpdated = 0;
      for (const prod of prods) {
        if (!prod.image) continue;
        if (prod.image.startsWith('/assets/')) {
          const newUrl = urlMapping.get(prod.image) || urlMapping.get(path.basename(prod.image));
          if (newUrl) {
            await pgClient.query('UPDATE products SET image = $1 WHERE id = $2', [newUrl, prod.id]);
            prodsUpdated++;
          }
        }
      }
      console.log(`✨ Đã cập nhật ${prodsUpdated} sản phẩm sang URL Cloud.`);

      const { rows: cats } = await pgClient.query('SELECT id, image FROM categories');
      let catsUpdated = 0;
      for (const cat of cats) {
        if (!cat.image) continue;
        if (cat.image.startsWith('/assets/')) {
          const newUrl = urlMapping.get(cat.image) || urlMapping.get(path.basename(cat.image));
          if (newUrl) {
            await pgClient.query('UPDATE categories SET image = $1 WHERE id = $2', [newUrl, cat.id]);
            catsUpdated++;
          }
        }
      }
      console.log(`✨ Đã cập nhật ${catsUpdated} danh mục sang URL Cloud.`);
    } catch (dbErr) {
      console.error('Lỗi cập nhật DB:', dbErr.message);
    }
  }

  await pgClient.end();
  console.log('\n🏁 HOÀN TẤT ĐỒNG BỘ 100% LÊN SUPABASE STORAGE!');
}

main();
