'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatMessage, ChatProductSummary } from '@/features/chatbot/types/chat.types';

interface LiveChatMessageItemProps {
  message: ChatMessage;
  customerName: string;
}

export default function LiveChatMessageItem({ message, customerName }: LiveChatMessageItemProps) {
  const isUser = message.sender === 'user';
  const isAdmin = message.sender === 'admin';
  const isBot = message.sender === 'bot';

  const timeStr = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isAdmin ? 'flex-end' : 'flex-start',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: isAdmin ? '#0284c7' : isBot ? '#059669' : '#475569',
        }}
      >
        <span>{isAdmin ? 'Admin (Bạn)' : isBot ? 'Mộc Mạc AI' : customerName}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#94a3b8', marginLeft: '4px' }}>{timeStr}</span>
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderRadius: isAdmin ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
          backgroundColor: isAdmin ? '#0284c7' : isBot ? '#ecfdf5' : '#ffffff',
          color: isAdmin ? '#ffffff' : '#0f172a',
          border: isAdmin ? 'none' : isBot ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          maxWidth: '75%',
          fontSize: '0.9rem',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {message.content}
      </div>

      {/* If Bot recommended products */}
      {message.recommendedProducts && message.recommendedProducts.length > 0 && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '75%' }}>
          {message.recommendedProducts.map((prod: ChatProductSummary) => (
            <div
              key={prod.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#ffffff',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ position: 'relative', width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                <Image src={prod.image} alt={prod.name} fill sizes="38px" style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {prod.name}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1b4d3e' }}>
                  {formatVND(prod.price)}
                </div>
              </div>
              <Link
                href={`/products/${prod.id}`}
                target="_blank"
                style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}
              >
                Mở link
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
