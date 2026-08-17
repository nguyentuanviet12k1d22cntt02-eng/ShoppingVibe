import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

console.log('🚀 Bắt đầu quá trình đồng bộ hình ảnh lên Supabase Storage...');
console.log(`📡 Supabase URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'product-images';

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

async function run() {
  const baseDir = path.join(process.cwd(), 'public', 'assets', 'images');
  if (!fs.existsSync(baseDir)) {
    console.error('❌ Không tìm thấy thư mục public/assets/images');
    return;
  }

  const allFiles = getFiles(baseDir);
  console.log(`📦 Tìm thấy ${allFiles.length} hình ảnh cục bộ cần đồng bộ.`);

  const urlMapping = new Map(); // relative local path -> supabase public url

  let successCount = 0;
  let errorCount = 0;

  for (const filePath of allFiles) {
    const relativeToPublic = path.relative(path.join(process.cwd(), 'public'), filePath).replace(/\\/g, '/');
    const localWebPath = `/${relativeToPublic}`;
    
    // Create clean storage path inside bucket: e.g. products/noi-that-gia-dung/bo-ban-an-go.webp
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
      console.warn(`⚠️ Lỗi khi upload ${cleanStoragePath}:`, error.message);
      errorCount++;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(cleanStoragePath);

      const publicUrl = publicUrlData.publicUrl;
      urlMapping.set(localWebPath, publicUrl);
      const baseFilename = path.basename(filePath);
      urlMapping.set(baseFilename, publicUrl);
      console.log(`✅ Đã upload: ${cleanStoragePath}`);
      successCount++;
    }
  }

  console.log(`\n🎉 Upload hoàn tất: ${successCount} thành công, ${errorCount} thất bại.`);

  // Update Database URLs using Supabase Client
  if (urlMapping.size > 0) {
    console.log('\n🔄 Đang cập nhật URL hình ảnh mới vào Database Supabase...');

    try {
      // 1. Update products table
      const { data: prods, error: prodErr } = await supabase.from('products').select('id, image');
      if (prodErr) {
        console.warn('Lỗi lấy danh sách products:', prodErr.message);
      } else if (prods) {
        let prodsUpdated = 0;
        for (const prod of prods) {
          if (!prod.image) continue;
          if (prod.image.startsWith('/assets/')) {
            const newUrl = urlMapping.get(prod.image);
            if (newUrl) {
              const { error: updateErr } = await supabase
                .from('products')
                .update({ image: newUrl })
                .eq('id', prod.id);

              if (!updateErr) prodsUpdated++;
            }
          }
        }
        console.log(`✨ Đã cập nhật URL cho ${prodsUpdated} sản phẩm trong bảng 'products'.`);
      }

      // 2. Update categories table
      const { data: cats, error: catErr } = await supabase.from('categories').select('id, image');
      if (catErr) {
        console.warn('Lỗi lấy danh sách categories:', catErr.message);
      } else if (cats) {
        let catsUpdated = 0;
        for (const cat of cats) {
          if (!cat.image) continue;
          if (cat.image.startsWith('/assets/')) {
            const newUrl = urlMapping.get(cat.image);
            if (newUrl) {
              const { error: updateErr } = await supabase
                .from('categories')
                .update({ image: newUrl })
                .eq('id', cat.id);

              if (!updateErr) catsUpdated++;
            }
          }
        }
        console.log(`✨ Đã cập nhật URL cho ${catsUpdated} danh mục trong bảng 'categories'.`);
      }
    } catch (dbErr) {
      console.error('❌ Lỗi khi cập nhật Database:', dbErr.message);
    }
  }

  console.log('\n🏁 HOÀN TẤT TOÀN BỘ QUÁ TRÌNH ĐỒNG BỘ!');
}

run();
