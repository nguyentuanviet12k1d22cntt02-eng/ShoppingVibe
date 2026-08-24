'use client';

import React from 'react';

interface ChatHeaderProps {
  isBotActive: boolean;
  onReset: () => void;
  onClose: () => void;
}

export default function ChatHeader({ isBotActive, onReset, onClose }: ChatHeaderProps) {
  return (
    <div
      style={{
        backgroundColor: '#1b4d3e',
        color: '#ffffff',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            color: '#1b4d3e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            fontWeight: 800,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          M
          <span
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '9px',
              height: '9px',
              backgroundColor: isBotActive ? '#10b981' : '#f59e0b',
              borderRadius: '50%',
              border: '2px solid #ffffff',
            }}
          />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Trợ Lý Mộc Mạc</span>
            <span
              style={{
                fontSize: '0.68rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 6px',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              AI RAG
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
            <span>{isBotActive ? 'Tự động trực tuyến 24/7' : 'Admin đang hỗ trợ trực tiếp'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            opacity: 0.8,
            cursor: 'pointer',
            fontSize: '0.95rem',
            padding: '6px',
          }}
          title="Làm mới cuộc trò chuyện"
        >
          <i className="fa-solid fa-arrows-rotate"></i>
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff',
            opacity: 0.8,
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '6px',
          }}
          title="Đóng"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
}
