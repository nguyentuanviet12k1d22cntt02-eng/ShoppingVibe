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

const sourceBase = path.join(process.cwd(), 'Đồ nội thất');
const targetBase = path.join(process.cwd(), 'public', 'assets', 'images', 'products', 'noi-that');

// Ensure target directories exist
const folders = ['ban', 'ghe', 'giuong', 'rem-cua', 'tu-ke', 'tu-lavabo'];
folders.forEach(f => {
  const dir = path.join(targetBase, f);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('📁 Copying images from "Đồ nội thất" to "public/assets/images/products/noi-that/"...');

// 1. Copy Bàn
const banSource = path.join(sourceBase, 'Bàn');
const banFiles = fs.readdirSync(banSource);
const banImages = [];
banFiles.forEach((file, idx) => {
  const ext = path.extname(file) || '.jpg';
  const targetName = `ban-${idx + 1}${ext}`;
  const targetPath = path.join(targetBase, 'ban', targetName);
  fs.copyFileSync(path.join(banSource, file), targetPath);
  banImages.push(`/assets/images/products/noi-that/ban/${targetName}`);
});

// 2. Copy Ghế
const gheSource = path.join(sourceBase, 'Ghế');
const gheFiles = fs.readdirSync(gheSource);
const gheImages = [];
gheFiles.forEach((file, idx) => {
  const ext = path.extname(file) || '.jpg';
  const targetName = `ghe-${idx + 1}${ext}`;
  const targetPath = path.join(targetBase, 'ghe', targetName);
  fs.copyFileSync(path.join(gheSource, file), targetPath);
  gheImages.push(`/assets/images/products/noi-that/ghe/${targetName}`);
});

// 3. Copy Giường
const giuongSource = path.join(sourceBase, 'Giường');
const giuongFiles = fs.readdirSync(giuongSource);
const giuongImages = [];
giuongFiles.forEach((file, idx) => {
  const ext = path.extname(file) || '.jpg';
  const targetName = `giuong-${idx + 1}${ext}`;
  const targetPath = path.join(targetBase, 'giuong', targetName);
  fs.copyFileSync(path.join(giuongSource, file), targetPath);
  giuongImages.push(`/assets/images/products/noi-that/giuong/${targetName}`);
});

// 4. Copy Rèm cửa
const remSource = path.join(sourceBase, 'Rèm cửa');
const remFiles = fs.readdirSync(remSource);
const remImages = [];
remFiles.forEach((file, idx) => {
  const ext = path.extname(file) || '.jpg';
  const targetName = `rem-${idx + 1}${ext}`;
  const targetPath = path.join(targetBase, 'rem-cua', targetName);
  fs.copyFileSync(path.join(remSource, file), targetPath);
  remImages.push(`/assets/images/products/noi-that/rem-cua/${targetName}`);
});

// 5. Copy Tủ kệ
const tuKeSource = path.join(sourceBase, 'Tủ kệ');
const tuKeFiles = fs.readdirSync(tuKeSource);
const tuKeImages = [];
tuKeFiles.forEach((file, idx) => {
  const ext = path.extname(file) || '.jpg';
  const targetName = `tu-ke-${idx + 1}${ext}`;
  const targetPath = path.join(targetBase, 'tu-ke', targetName);
  fs.copyFileSync(path.join(tuKeSource, file), targetPath);
  tuKeImages.push(`/assets/images/products/noi-that/tu-ke/${targetName}`);
});

// 6. Copy Tủ lavabo
const tuLavaboSource = path.join(sourceBase, 'Tủ lavabo');
const tuLavaboFiles = fs.readdirSync(tuLavaboSource);
const tuLavaboImages = [];
tuLavaboFiles.forEach((file, idx) => {
  const ext = path.extname(file) || '.jpg';
  const targetName = `tu-lavabo-${idx + 1}${ext}`;
  const targetPath = path.join(targetBase, 'tu-lavabo', targetName);
  fs.copyFileSync(path.join(tuLavaboSource, file), targetPath);
  tuLavaboImages.push(`/assets/images/products/noi-that/tu-lavabo/${targetName}`);
});

console.log(`✅ Đã sao chép thành công:
  - Bàn: ${banImages.length} ảnh
  - Ghế: ${gheImages.length} ảnh
  - Giường: ${giuongImages.length} ảnh
  - Rèm cửa: ${remImages.length} ảnh
  - Tủ kệ: ${tuKeImages.length} ảnh
  - Tủ lavabo: ${tuLavaboImages.length} ảnh
`);

// Define rich furniture products list
const FURNITURE_PRODUCTS = [
  // BÀN
  {
    id: 'ban-01',
    name: 'Bàn Trà Sofa Gỗ Sồi Bắc Âu',
    price: 1850000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: banImages[0] || '/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp',
    gallery: banImages,
    description: 'Bàn trà sofa gỗ sồi tự nhiên phong cách Scandinavian tinh tế, mặt bàn láng mịn chống thấm nước, chân bàn vững chắc chịu lực cao.',
    featured: true,
    stockCount: 20,
    inStock: true,
    soldCount: 38,
    sku: 'SKU-BAN-01',
    variants: [
      { name: 'Đường kính 60cm - Gỗ Sồi sáng', priceAdj: 0, stock: 10 },
      { name: 'Đường kính 80cm - Gỗ Sồi sáng', priceAdj: 350000, stock: 10 }
    ]
  },
  {
    id: 'ban-02',
    name: 'Bàn Ăn Gỗ Nguyên Tấm Tự Nhiên',
    price: 4890000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: banImages[1] || banImages[0],
    gallery: banImages,
    description: 'Bộ bàn ăn nguyên tấm vân gỗ tự nhiên sang trọng, xử lý chống mối mọt cong vênh, hoàn hảo cho không gian bếp ấm cúng.',
    featured: true,
    stockCount: 12,
    inStock: true,
    soldCount: 24,
    sku: 'SKU-BAN-02',
    variants: [
      { name: 'Dài 1m4 (4-6 ghế)', priceAdj: 0, stock: 6 },
      { name: 'Dài 1m8 (6-8 ghế)', priceAdj: 1200000, stock: 6 }
    ]
  },
  {
    id: 'ban-03',
    name: 'Bàn Làm Việc Tối Giản Minimalist',
    price: 2450000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: banImages[2] || banImages[0],
    gallery: banImages,
    description: 'Bàn làm việc thông minh kèm hộc tủ để đồ, khung chân thép sơn tĩnh điện cứng cáp kết hợp mặt gỗ công nghiệp cao cấp phủ Melamine.',
    featured: false,
    stockCount: 15,
    inStock: true,
    soldCount: 45,
    sku: 'SKU-BAN-03'
  },

  // GHẾ
  {
    id: 'ghe-01',
    name: 'Ghế Sofa Đơn Thư Giãn Bọc Nỉ Cao Cấp',
    price: 2190000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: gheImages[0] || '/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp',
    gallery: gheImages,
    description: 'Ghế armchair đơn bọc đệm êm ái, thiết kế tựa lưng công thái học ôm sát cơ thể, mang lại cảm giác thư thái tối đa khi đọc sách hoặc nghỉ ngơi.',
    featured: true,
    stockCount: 18,
    inStock: true,
    soldCount: 52,
    sku: 'SKU-GHE-01',
    variants: [
      { name: 'Màu Be Tự Nhiên', priceAdj: 0, stock: 9 },
      { name: 'Màu Xám Ghi Hiện Đại', priceAdj: 0, stock: 9 }
    ]
  },
  {
    id: 'ghe-02',
    name: 'Ghế Ăn Gỗ Uốn Cong Tinh Tế',
    price: 890000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: gheImages[1] || gheImages[0],
    gallery: gheImages,
    description: 'Ghế tựa lưng gỗ uốn cong mềm mại, mặt ngồi đệm bọc da simili chống bám bẩn, dễ dàng lau chùi vệ sinh.',
    featured: false,
    stockCount: 30,
    inStock: true,
    soldCount: 80,
    sku: 'SKU-GHE-02'
  },
  {
    id: 'ghe-03',
    name: 'Ghế Thư Giãn Bập Bênh Phong Cách Bắc Âu',
    price: 2750000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: gheImages[2] || gheImages[0],
    gallery: gheImages,
    description: 'Ghế bập bênh khung gỗ sồi kết hợp đệm bông dày dặn êm ái, lý tưởng cho góc ban công hoặc phòng ngủ thư giãn.',
    featured: true,
    stockCount: 14,
    inStock: true,
    soldCount: 19,
    sku: 'SKU-GHE-03'
  },

  // GIƯỜNG
  {
    id: 'giuong-01',
    name: 'Giường Ngủ Gỗ Sồi Tự Nhiên Scandinavia',
    price: 7890000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: giuongImages[0] || '/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp',
    gallery: giuongImages,
    description: 'Giường ngủ gỗ sồi 100% tự nhiên sấy khô đạt chuẩn, dát phản phẳng mịn màng, đầu giường bo cong tinh tế an toàn cho gia đình.',
    featured: true,
    stockCount: 10,
    inStock: true,
    soldCount: 16,
    sku: 'SKU-GIUONG-01',
    variants: [
      { name: 'Kích thước 1m6 x 2m', priceAdj: 0, stock: 5 },
      { name: 'Kích thước 1m8 x 2m', priceAdj: 900000, stock: 5 }
    ]
  },
  {
    id: 'giuong-02',
    name: 'Giường Hộp Bọc Đệm Đầu Giường Cao Cấp',
    price: 6490000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: giuongImages[1] || giuongImages[0],
    gallery: giuongImages,
    description: 'Thiết kế bọc nệm đầu giường êm ái, chân ẩn tạo hiệu ứng bồng bềnh sang trọng cho phòng ngủ master.',
    featured: true,
    stockCount: 8,
    inStock: true,
    soldCount: 14,
    sku: 'SKU-GIUONG-02'
  },
  {
    id: 'giuong-03',
    name: 'Giường Ngủ Có Ngăn Kéo Lưu Trữ Thông Minh',
    price: 8200000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: giuongImages[2] || giuongImages[0],
    gallery: giuongImages,
    description: 'Tích hợp 4 ngăn kéo để chăn ga gối đệm siêu tiện lợi, tiết kiệm tối đa không gian cho căn hộ hiện đại.',
    featured: false,
    stockCount: 6,
    inStock: true,
    soldCount: 22,
    sku: 'SKU-GIUONG-03'
  },

  // RÈM CỬA
  {
    id: 'rem-01',
    name: 'Rèm Vải 2 Lớp Cản Sáng 100% Khách Sạn 5 Sao',
    price: 1350000,
    category: 'trang-tri',
    categoryName: 'Trang trí',
    image: remImages[0] || '/assets/images/products/do-thu-cong/tranh-treo-macrame.webp',
    gallery: remImages,
    description: 'Bộ rèm vải 2 lớp (1 lớp vải gấm cản sáng nhiệt độ cao + 1 lớp voan thêu mộng mơ), may dập ly sóng tiêu chuẩn cao cấp.',
    featured: true,
    stockCount: 25,
    inStock: true,
    soldCount: 65,
    sku: 'SKU-REM-01',
    variants: [
      { name: 'Kích thước Rộng 2m x Cao 2m7', priceAdj: 0, stock: 12 },
      { name: 'Kích thước Rộng 3m x Cao 2m7', priceAdj: 550000, stock: 13 }
    ]
  },
  {
    id: 'rem-02',
    name: 'Rèm Cầu Vồng Hàn Quốc Cản Sáng Tiện Lợi',
    price: 850000,
    category: 'trang-tri',
    categoryName: 'Trang trí',
    image: remImages[1] || remImages[0],
    gallery: remImages,
    description: 'Rèm cuốn cầu vồng điều chỉnh ánh sáng linh hoạt, chất liệu sợi dệt tổng hợp chống bám bụi và chống tia UV hiệu quả.',
    featured: false,
    stockCount: 30,
    inStock: true,
    soldCount: 48,
    sku: 'SKU-REM-02'
  },

  // TỦ KỆ
  {
    id: 'tu-ke-01',
    name: 'Kệ Tivi Phòng Khách Gỗ Sồi Hiện Đại',
    price: 3850000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: tuKeImages[0] || '/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp',
    gallery: tuKeImages,
    description: 'Kệ tivi thiết kế chân gỗ thon gọn, 3 ngăn kéo mở êm ái cùng khoang hở đặt đầu máy, đầu thu gọn gàng thẩm mỹ.',
    featured: true,
    stockCount: 12,
    inStock: true,
    soldCount: 33,
    sku: 'SKU-TUKE-01',
    variants: [
      { name: 'Dài 1m6 - Màu Gỗ Tự Nhiên', priceAdj: 0, stock: 6 },
      { name: 'Dài 2m0 - Màu Gỗ Tự Nhiên', priceAdj: 700000, stock: 6 }
    ]
  },
  {
    id: 'tu-ke-02',
    name: 'Tủ Quần Áo Cánh Lùa Kèm Kệ Trang Trí',
    price: 6950000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: tuKeImages[1] || tuKeImages[0],
    gallery: tuKeImages,
    description: 'Tủ quần áo 3 cánh lùa ray trượt êm ái, tích hợp kệ góc bo tròn để túi xách mỹ phẩm decor cực xinh.',
    featured: true,
    stockCount: 8,
    inStock: true,
    soldCount: 15,
    sku: 'SKU-TUKE-02'
  },
  {
    id: 'tu-ke-03',
    name: 'Tủ Giày Thông Minh Siêu Mỏng Tiết Kiệm Diện Tích',
    price: 1590000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: tuKeImages[2] || tuKeImages[0],
    gallery: tuKeImages,
    description: 'Tủ giày cánh lật 3 tầng chứa được 25-30 đôi giày dép, bề dày chỉ 24cm giúp hành lang nhà luôn rộng rãi.',
    featured: false,
    stockCount: 22,
    inStock: true,
    soldCount: 74,
    sku: 'SKU-TUKE-03'
  },

  // TỦ LAVABO
  {
    id: 'tu-lavabo-01',
    name: 'Bộ Tủ Chậu Lavabo Phòng Tắm Chống Nước Tuyệt Đối',
    price: 3690000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: tuLavaboImages[0] || '/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp',
    gallery: tuLavaboImages,
    description: 'Chất liệu nhựa PVC đặc cao cấp chịu nước 100%, mặt chậu sứ ceramic phủ men nano tuyết trắng bóng chống ố vàng.',
    featured: true,
    stockCount: 14,
    inStock: true,
    soldCount: 29,
    sku: 'SKU-LAVABO-01',
    variants: [
      { name: 'Kích thước 60cm x 48cm', priceAdj: 0, stock: 7 },
      { name: 'Kích thước 80cm x 48cm', priceAdj: 600000, stock: 7 }
    ]
  },
  {
    id: 'tu-lavabo-02',
    name: 'Bộ Tủ Lavabo Treo Tường Kèm Gương Led Cảm Ứng',
    price: 4500000,
    category: 'noi-that',
    categoryName: 'Nội thất',
    image: tuLavaboImages[1] || tuLavaboImages[0],
    gallery: tuLavaboImages,
    description: 'Gương led thông minh chạm cảm ứng sấy gương chống mờ hơi nước, tủ dưới chia ngăn rộng rãi để dầu gội khăn tắm.',
    featured: true,
    stockCount: 10,
    inStock: true,
    soldCount: 21,
    sku: 'SKU-LAVABO-02'
  }
];

async function seedToSupabase() {
  if (!databaseUrl) {
    console.log('⚠️ DATABASE_URL không tồn tại, bỏ qua bước seed Database.');
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📡 Đang kết nối Postgres Supabase để nạp sản phẩm nội thất mới...');
    await client.connect();

    for (const p of FURNITURE_PRODUCTS) {
      // 1. Insert product
      await client.query(`
        INSERT INTO public.products (id, name, price, category, category_name, description, image, in_stock, stock_count, sold_count, sku, featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          category = EXCLUDED.category,
          category_name = EXCLUDED.category_name,
          description = EXCLUDED.description,
          image = EXCLUDED.image,
          in_stock = EXCLUDED.in_stock,
          stock_count = EXCLUDED.stock_count,
          sold_count = EXCLUDED.sold_count,
          sku = EXCLUDED.sku,
          featured = EXCLUDED.featured;
      `, [p.id, p.name, p.price, p.category, p.categoryName, p.description, p.image, p.inStock, p.stockCount, p.soldCount, p.sku, p.featured]);

      // 2. Insert gallery images
      if (p.gallery && p.gallery.length > 0) {
        await client.query(`DELETE FROM public.product_images WHERE product_id = $1`, [p.id]);
        for (let i = 0; i < p.gallery.length; i++) {
          await client.query(`
            INSERT INTO public.product_images (product_id, image_url, display_order)
            VALUES ($1, $2, $3)
          `, [p.id, p.gallery[i], i + 1]);
        }
      }

      // 3. Insert variants
      if (p.variants && p.variants.length > 0) {
        await client.query(`DELETE FROM public.product_variants WHERE product_id = $1`, [p.id]);
        for (const v of p.variants) {
          await client.query(`
            INSERT INTO public.product_variants (product_id, variant_name, price_adjustment, stock_quantity)
            VALUES ($1, $2, $3, $4)
          `, [p.id, v.name, v.priceAdj, v.stock]);
        }
      }
    }

    await client.end();
    console.log(`🎉 Đã nạp thành công ${FURNITURE_PRODUCTS.length} sản phẩm nội thất mới vào Supabase!`);
  } catch (err) {
    console.error('❌ Lỗi khi seed Supabase:', err.message);
  }
}

seedToSupabase();
