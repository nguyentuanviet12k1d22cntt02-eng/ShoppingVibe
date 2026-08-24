'use client';

import React from 'react';

interface ChatFloatingButtonProps {
  onClick: () => void;
}

export default function ChatFloatingButton({ onClick }: ChatFloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#1b4d3e',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 8px 24px rgba(27, 77, 62, 0.4)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        position: 'relative',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      title="Trò chuyện với Trợ lý Mộc Mạc AI"
      aria-label="Mở cửa sổ chat"
    >
      <i className="fa-solid fa-comments"></i>
      <span
        style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '14px',
          height: '14px',
          backgroundColor: '#10b981',
          borderRadius: '50%',
          border: '2px solid #ffffff',
        }}
      />
    </button>
  );
}
