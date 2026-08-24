'use client';

import React from 'react';
import { ChatMessage } from '../types/chat.types';
import ChatProductCard from './ChatProductCard';

interface ChatMessageItemProps {
  message: ChatMessage;
  onProductClick?: () => void;
}

export default function ChatMessageItem({ message, onProductClick }: ChatMessageItemProps) {
  const isUser = message.sender === 'user';
  const isAdmin = message.sender === 'admin';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '4px',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: isUser ? '#1b4d3e' : isAdmin ? '#0284c7' : '#64748b',
        }}
      >
        <span>{isUser ? 'Bạn' : isAdmin ? 'Admin Hỗ Trợ' : 'Mộc Mạc AI'}</span>
      </div>

      <div
        style={{
          padding: '12px 14px',
          borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
          backgroundColor: isUser ? '#1b4d3e' : isAdmin ? '#e0f2fe' : '#ffffff',
          color: isUser ? '#ffffff' : '#0f172a',
          fontSize: '0.88rem',
          lineHeight: '1.5',
          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
          border: isUser ? 'none' : isAdmin ? '1px solid #bae6fd' : '1px solid #e2e8f0',
          maxWidth: '85%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {message.content}
      </div>

      {/* Recommended Products Cards */}
      {message.recommendedProducts && message.recommendedProducts.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            width: '100%',
            maxWidth: '90%',
          }}
        >
          {message.recommendedProducts.map((prod) => (
            <ChatProductCard
              key={prod.id}
              product={prod}
              onSelect={onProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
