'use client';

import React from 'react';
import { ChatSession } from '@/features/chatbot/types/chat.types';

interface LiveChatHeaderProps {
  session: ChatSession;
  onToggleBot: (session: ChatSession) => void;
}

export default function LiveChatHeader({ session, onToggleBot }: LiveChatHeaderProps) {
  return (
    <div
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        flexShrink: 0,
      }}
    >
      <div>
        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{session.customerName}</span>
          {session.customerEmail && (
            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b' }}>
              ({session.customerEmail})
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
          Mã phiên: <code>{session.id}</code>
        </div>
      </div>

      {/* Bot AI Toggle Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: session.isBotActive ? '#059669' : '#d97706' }}>
            {session.isBotActive ? 'Bot AI: Đang Bật' : 'Bot AI: Đã Tắt (Admin Quản Lý)'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            {session.isBotActive ? 'Tự động trả lời theo RAG' : 'Admin trả lời trực tiếp'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleBot(session)}
          style={{
            padding: '7px 16px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: session.isBotActive ? '#10b981' : '#f59e0b',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.82rem',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.2s',
          }}
        >
          {session.isBotActive ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
        </button>
      </div>
    </div>
  );
}
