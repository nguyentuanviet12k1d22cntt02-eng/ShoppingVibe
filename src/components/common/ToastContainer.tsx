'use client';

import React from 'react';
import { useToast, ToastType } from '@/context/ToastContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'error':
        return <i className="fa-solid fa-circle-xmark" style={{ color: '#ef4444', fontSize: '1.2rem' }}></i>;
      case 'warning':
        return <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f59e0b', fontSize: '1.2rem' }}></i>;
      case 'info':
        return <i className="fa-solid fa-circle-info" style={{ color: '#3b82f6', fontSize: '1.2rem' }}></i>;
      case 'success':
      default:
        return <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '1.2rem' }}></i>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#ffffff',
            color: 'var(--text-main)',
            padding: '14px 18px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            borderLeft: t.type === 'error' ? '4px solid #ef4444' : t.type === 'warning' ? '4px solid #f59e0b' : '4px solid #10b981',
            fontSize: '0.92rem',
            fontWeight: 600,
            animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            {getToastIcon(t.type)}
            <span style={{ lineHeight: 1.4 }}>{t.message}</span>
          </div>

          <button
            type="button"
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
            aria-label="Đóng thông báo"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      ))}
    </div>
  );
}
