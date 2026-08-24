import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// GET: Fetch all chat sessions for Admin
export async function GET(req: NextRequest) {
  try {
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mapped = (sessions || []).map((s: any) => ({
      id: s.id,
      customerName: s.customer_name,
      customerEmail: s.customer_email,
      isBotActive: s.is_bot_active,
      lastMessage: s.last_message || '',
      lastMessageAt: s.last_message_at,
      status: s.status || 'active',
      createdAt: s.created_at,
    }));

    return NextResponse.json({ success: true, sessions: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: Update session (e.g. Toggle isBotActive, status)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, isBotActive, status } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Thiếu sessionId' }, { status: 400 });
    }

    const updates: any = {};
    if (typeof isBotActive === 'boolean') updates.is_bot_active = isBotActive;
    if (status) updates.status = status;

    const { data: updatedSession, error } = await supabase
      .from('chat_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        customerName: updatedSession.customer_name,
        customerEmail: updatedSession.customer_email,
        isBotActive: updatedSession.is_bot_active,
        lastMessage: updatedSession.last_message,
        lastMessageAt: updatedSession.last_message_at,
        status: updatedSession.status,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Remove session & messages
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Thiếu sessionId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Đã xóa phiên trò chuyện.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
