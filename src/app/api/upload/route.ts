import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'noi-that';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Map category slug to folder name representation
    let folderName = category;
    if (category === 'noi-that') folderName = 'noi-that-gia-dung';
    else if (category === 'den' || category === 'decor' || category === 'trang-tri' || category === 'gom-su') folderName = 'do-my-nghe';
    else if (category === 'luu-tru') folderName = 'do-thu-cong';

    // Target directories
    // 1. Inside Next.js public directory
    const nextPublicDir = path.join(process.cwd(), 'public', 'assets', 'images', 'products', folderName);
    // 2. In root workspace assets directory
    const rootWorkspaceDir = path.join(process.cwd(), '..', 'assets', 'images', 'products', folderName);

    // Create directories if they do not exist
    if (!fs.existsSync(nextPublicDir)) {
      fs.mkdirSync(nextPublicDir, { recursive: true });
    }
    if (!fs.existsSync(rootWorkspaceDir)) {
      fs.mkdirSync(rootWorkspaceDir, { recursive: true });
    }

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

    const finalFileName = `${baseName}${ext}`;

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write to both locations
    const nextPublicFilePath = path.join(nextPublicDir, finalFileName);
    const rootWorkspaceFilePath = path.join(rootWorkspaceDir, finalFileName);

    fs.writeFileSync(nextPublicFilePath, buffer);
    fs.writeFileSync(rootWorkspaceFilePath, buffer);

    const publicUrl = `/assets/images/products/${folderName}/${finalFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: finalFileName,
      folder: folderName,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
