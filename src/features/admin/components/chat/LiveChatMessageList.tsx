'use client';

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/features/chatbot/types/chat.types';
import LiveChatMessageItem from './LiveChatMessageItem';

interface LiveChatMessageListProps {
  messages: ChatMessage[];
  customerName: string;
  isLoading: boolean;
  selectedSessionId: string | null;
}

export default function LiveChatMessageList({
  messages,
  customerName,
  isLoading,
  selectedSessionId,
}: LiveChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const prevSessionIdRef = useRef<string | null>(null);
  const prevMessagesCountRef = useRef<number>(0);

  // Monitor user scroll position: if within 120px from bottom, consider as near bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    isNearBottomRef.current = distanceToBottom < 120;
  };

  // Smart auto-scroll logic
  useEffect(() => {
    if (!containerRef.current) return;

    const isSessionSwitched = selectedSessionId !== prevSessionIdRef.current;
    const isNewMessageAdded = messages.length > prevMessagesCountRef.current;
    const lastMsg = messages[messages.length - 1];
    const isAdminJustSent = lastMsg?.sender === 'admin';

    if (isSessionSwitched) {
      // Always scroll to bottom on session switch
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      isNearBottomRef.current = true;
      prevSessionIdRef.current = selectedSessionId;
    } else if (isNewMessageAdded && (isNearBottomRef.current || isAdminJustSent)) {
      // Only scroll to bottom if user was already at the bottom or admin just typed
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      isNearBottomRef.current = true;
    }

    prevMessagesCountRef.current = messages.length;
  }, [messages, selectedSessionId]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f8fafc',
      }}
    >
      {isLoading && messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          Đang tải hội thoại...
        </div>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          Chưa có tin nhắn nào trong phiên này
        </div>
      ) : (
        messages.map((msg, idx) => (
          <LiveChatMessageItem
            key={`${msg.id}_${idx}`}
            message={msg}
            customerName={customerName}
          />
        ))
      )}
    </div>
  );
}
