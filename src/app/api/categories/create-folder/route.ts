import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body.slug;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
    }

    const cleanSlug = slug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    const nextPublicDir = path.join(process.cwd(), 'public', 'assets', 'images', 'products', cleanSlug);
    const rootWorkspaceDir = path.join(process.cwd(), '..', 'assets', 'images', 'products', cleanSlug);

    if (!fs.existsSync(nextPublicDir)) {
      fs.mkdirSync(nextPublicDir, { recursive: true });
    }
    if (!fs.existsSync(rootWorkspaceDir)) {
      fs.mkdirSync(rootWorkspaceDir, { recursive: true });
    }

    return NextResponse.json({
      success: true,
      folder: cleanSlug,
      path: `/assets/images/products/${cleanSlug}`,
    });
  } catch (error: any) {
    console.error('Create category folder error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
