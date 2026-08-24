'use client';

import React from 'react';

interface ChatInputBarProps {
  inputMessage: string;
  isBotActive: boolean;
  isLoading: boolean;
  onChangeInput: (val: string) => void;
  onSendMessage: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function ChatInputBar({
  inputMessage,
  isBotActive,
  isLoading,
  onChangeInput,
  onSendMessage,
  inputRef,
}: ChatInputBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '12px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={isBotActive ? 'Hỏi Mộc Mạc AI bất cứ điều gì...' : 'Nhắn tin cho Admin...'}
        value={inputMessage}
        onChange={(e) => onChangeInput(e.target.value)}
        disabled={isLoading}
        style={{
          flex: 1,
          padding: '10px 14px',
          borderRadius: '24px',
          border: '1px solid #cbd5e1',
          fontSize: '0.88rem',
          outline: 'none',
          backgroundColor: '#f8fafc',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#1b4d3e')}
        onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
      />
      <button
        type="submit"
        disabled={!inputMessage.trim() || isLoading}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: inputMessage.trim() && !isLoading ? '#1b4d3e' : '#cbd5e1',
          color: '#ffffff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
        title="Gửi tin nhắn"
      >
        <i className="fa-solid fa-paper-plane" style={{ fontSize: '0.9rem' }}></i>
      </button>
    </form>
  );
}
