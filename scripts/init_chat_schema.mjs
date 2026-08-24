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
    // 1. Create chat_sessions table
    console.log('🔨 Đang tạo bảng chat_sessions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.chat_sessions (
        id VARCHAR(100) PRIMARY KEY,
        customer_name VARCHAR(150) NOT NULL DEFAULT 'Khách hàng',
        customer_email VARCHAR(255),
        is_bot_active BOOLEAN NOT NULL DEFAULT true,
        last_message TEXT DEFAULT '',
        last_message_at TIMESTAMPTZ DEFAULT NOW(),
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Bảng public.chat_sessions đã sẵn sàng.');

    // 2. Create chat_messages table
    console.log('🔨 Đang tạo bảng chat_messages...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(100) NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'bot', 'admin')),
        content TEXT NOT NULL,
        recommended_products JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Bảng public.chat_messages đã sẵn sàng.');

    // 3. Create indexes for high performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message_at ON public.chat_sessions(last_message_at DESC);
    `);
    console.log('✅ Đã tạo Index tối ưu hóa truy vấn chat.');

    console.log('\n✨ KHỞI TẠO CƠ SỞ DỮ LIỆU LIVE CHAT & RAG HOÀN TẤT THÀNH CÔNG!');
  } catch (err) {
    console.error('❌ Lỗi khởi tạo bảng chat:', err);
  } finally {
    await client.end();
  }
}

main();
