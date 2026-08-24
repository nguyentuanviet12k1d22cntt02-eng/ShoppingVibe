'use client';

import React from 'react';

export const DEFAULT_PROMPTS = [
  'Hiện có mã giảm giá nào không?',
  'Tư vấn bàn ghế phòng khách',
  'Phí vận chuyển và chính sách Freeship?',
  'Giới thiệu các mẫu bình gốm Bát Tràng',
];

interface ChatQuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  variant?: 'welcome' | 'bottom_bar';
}

export default function ChatQuickPrompts({ onSelectPrompt, variant = 'welcome' }: ChatQuickPromptsProps) {
  if (variant === 'bottom_bar') {
    return (
      <div
        style={{
          padding: '6px 12px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          type="button"
          onClick={() => onSelectPrompt('Mã giảm giá mới nhất?')}
          style={{
            padding: '4px 10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '0.74rem',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          Mã giảm giá
        </button>
        <button
          type="button"
          onClick={() => onSelectPrompt('Phí vận chuyển và chính sách freeship?')}
          style={{
            padding: '4px 10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '0.74rem',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          Phí giao hàng
        </button>
        <button
          type="button"
          onClick={() => onSelectPrompt('Chính sách đổi trả 30 ngày?')}
          style={{
            padding: '4px 10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '0.74rem',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          Bảo hành & Đổi trả
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>Gợi ý câu hỏi nhanh:</span>
      {DEFAULT_PROMPTS.map((prompt, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectPrompt(prompt)}
          style={{
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            fontSize: '0.82rem',
            color: '#1e293b',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#1b4d3e';
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
