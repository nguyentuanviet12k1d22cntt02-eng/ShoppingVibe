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

async function main() {
  await client.connect();
  console.log('✅ Đã kết nối tới cơ sở dữ liệu PostgreSQL');

  try {
    // Reset sold_count = 0 in products
    const res = await client.query('UPDATE products SET sold_count = 0;');
    console.log(`✅ Đã đặt lại sold_count = 0 cho tất cả ${res.rowCount} sản phẩm trong bảng products.`);
  } catch (err) {
    console.error('❌ Lỗi:', err);
  } finally {
    await client.end();
  }
}

main();
