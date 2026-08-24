'use client';

import React from 'react';
import { ChatSession } from '@/features/chatbot/types/chat.types';

interface LiveChatSessionItemProps {
  session: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function LiveChatSessionItem({
  session,
  isSelected,
  onSelect,
  onDelete,
}: LiveChatSessionItemProps) {
  const timeString = session.lastMessageAt
    ? new Date(session.lastMessageAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '12px',
        borderRadius: '12px',
        marginBottom: '6px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#ffffff' : 'transparent',
        border: isSelected ? '1px solid #1b4d3e' : '1px solid transparent',
        boxShadow: isSelected ? '0 2px 8px rgba(27, 77, 62, 0.1)' : 'none',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: session.isBotActive ? '#ecfdf5' : '#fef3c7',
              color: session.isBotActive ? '#065f46' : '#92400e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {session.customerName.substring(0, 1).toUpperCase() || 'K'}
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.customerName}
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{timeString}</span>
      </div>

      <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '8px' }}>
        {session.lastMessage || 'Chưa có tin nhắn'}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            backgroundColor: session.isBotActive ? '#d1fae5' : '#fed7aa',
            color: session.isBotActive ? '#065f46' : '#c2410c',
            display: 'inline-block',
          }}
        >
          {session.isBotActive ? 'Bot tự động' : 'Admin tiếp nhận'}
        </span>

        <button
          type="button"
          onClick={onDelete}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '0.8rem',
          }}
          title="Xóa phiên chat"
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  );
}
