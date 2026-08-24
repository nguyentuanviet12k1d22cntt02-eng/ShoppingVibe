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

async function createOtpTable() {
  try {
    await client.connect();
    console.log('Connected to Supabase Postgres. Creating otp_verifications table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.otp_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        user_name TEXT,
        password_hash TEXT,
        purpose TEXT DEFAULT 'signup',
        expires_at TIMESTAMPTZ NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_otp_email ON public.otp_verifications(email);
      CREATE INDEX IF NOT EXISTS idx_otp_code ON public.otp_verifications(otp_code);

      ALTER TABLE public.otp_verifications DISABLE ROW LEVEL SECURITY;
      GRANT ALL ON public.otp_verifications TO anon, authenticated, service_role;
    `);

    console.log('✅ Table public.otp_verifications created successfully.');
    await client.end();
  } catch (err) {
    console.error('Error creating otp table:', err.message);
  }
}

createOtpTable();
