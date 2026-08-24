'use client';

import React from 'react';

interface LiveChatInputProps {
  adminInput: string;
  isBotActive: boolean;
  isSending: boolean;
  onInputChange: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
}

export default function LiveChatInput({
  adminInput,
  isBotActive,
  isSending,
  onInputChange,
  onSend,
}: LiveChatInputProps) {
  return (
    <form
      onSubmit={onSend}
      style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexShrink: 0,
      }}
    >
      <input
        type="text"
        placeholder={
          isBotActive
            ? 'Nhập tin nhắn (Lưu ý: Bot AI vẫn đang BẬT song song)...'
            : 'Nhập tin nhắn trả lời khách hàng trực tiếp...'
        }
        value={adminInput}
        onChange={(e) => onInputChange(e.target.value)}
        disabled={isSending}
        style={{
          flex: 1,
          padding: '10px 16px',
          borderRadius: '24px',
          border: '1px solid #cbd5e1',
          fontSize: '0.9rem',
          outline: 'none',
          backgroundColor: '#f8fafc',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
        onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
      />

      <button
        type="submit"
        disabled={!adminInput.trim() || isSending}
        style={{
          padding: '10px 22px',
          borderRadius: '24px',
          backgroundColor: adminInput.trim() && !isSending ? '#0284c7' : '#cbd5e1',
          color: '#ffffff',
          border: 'none',
          fontWeight: 700,
          fontSize: '0.88rem',
          cursor: adminInput.trim() && !isSending ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        Gửi
      </button>
    </form>
  );
}
