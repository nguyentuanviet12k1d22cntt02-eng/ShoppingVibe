import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'product-images';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'noi-that';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy file tải lên.' }, { status: 400 });
    }

    // Map category slug to folder prefix
    let folderName = category;
    if (category === 'noi-that') folderName = 'noi-that-gia-dung';
    else if (category === 'den' || category === 'decor' || category === 'trang-tri' || category === 'gom-su') folderName = 'do-my-nghe';
    else if (category === 'luu-tru') folderName = 'do-thu-cong';

    // Sanitize file name
    const originalName = file.name;
    const ext = path.extname(originalName) || '.webp';
    const baseName = path.basename(originalName, ext)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    const timestamp = Date.now();
    const finalFileName = `${timestamp}-${baseName}${ext}`;
    const storagePath = `${folderName}/${finalFileName}`;

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage Bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: `Lỗi tải ảnh lên Supabase Storage: ${uploadError.message}. Vui lòng kiểm tra quyền (Policy) của bucket '${BUCKET_NAME}'.`,
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: finalFileName,
      folder: folderName,
      storagePath,
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Lỗi tải ảnh.' }, { status: 500 });
  }
}
