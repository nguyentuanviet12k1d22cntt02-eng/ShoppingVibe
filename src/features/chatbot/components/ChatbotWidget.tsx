'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChatMessage } from '../types/chat.types';
import ChatFloatingButton from './ChatFloatingButton';
import ChatHeader from './ChatHeader';
import ChatMessageItem from './ChatMessageItem';
import ChatQuickPrompts from './ChatQuickPrompts';
import ChatInputBar from './ChatInputBar';

const STORAGE_SESSION_KEY = 'minishop_chat_session_id';

export default function ChatbotWidget() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBotActive, setIsBotActive] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or restore session ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem(STORAGE_SESSION_KEY);
      if (savedId) {
        setSessionId(savedId);
      } else {
        const currentId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem(STORAGE_SESSION_KEY, currentId);
        setSessionId(currentId);
      }
    }
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const prevMessagesCountRef = useRef<number>(0);

  // Fetch message history for this session
  const fetchMessages = async (sid: string, silent = false) => {
    if (!sid) return;
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch(`/api/chat/messages?sessionId=${sid}`);
      const data = await res.json();
      if (data.success) {
        const fetchedMsgs: ChatMessage[] = data.messages || [];
        setMessages(prev => {
          const tempMsgs = prev.filter(m => m.id.startsWith('temp_'));
          const serverContents = new Set(fetchedMsgs.map(m => m.content));
          const stillPending = tempMsgs.filter(t => !serverContents.has(t.content));

          const map = new Map<string, ChatMessage>();
          fetchedMsgs.forEach(m => map.set(m.id, m));
          stillPending.forEach(m => map.set(m.id, m));
          return Array.from(map.values());
        });
        if (data.session) {
          setIsBotActive(data.session.isBotActive);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId);
    }
  }, [sessionId]);

  // Polling for live admin replies when chat window is open (pause while user is sending a message)
  useEffect(() => {
    if (!isOpen || !sessionId || isLoading) return;
    const interval = setInterval(() => {
      fetchMessages(sessionId, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen, sessionId, isLoading]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  // Auto-scroll logic
  useEffect(() => {
    if (!containerRef.current || !isOpen) return;
    const isNewMsg = messages.length > prevMessagesCountRef.current;
    if (isNewMsg && isNearBottomRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, isOpen, isLoading]);

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content || !sessionId || isLoading) return;

    setInputMessage('');

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sessionId,
      sender: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          sender: 'user',
          content,
          customerName: user?.name || 'Khách hàng',
          customerEmail: user?.email || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => {
          const map = new Map<string, ChatMessage>();
          prev.filter(m => m.id !== tempUserMsg.id).forEach(m => map.set(m.id, m));
          if (data.userMessage) map.set(data.userMessage.id, data.userMessage);
          if (data.botMessage) map.set(data.botMessage.id, data.botMessage);
          return Array.from(map.values());
        });
        if (data.isBotActive === false) {
          setIsBotActive(false);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (confirm('Bạn có muốn tạo cuộc trò chuyện mới? Lịch sử cũ sẽ được làm mới.')) {
      const newSid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem(STORAGE_SESSION_KEY, newSid);
      setSessionId(newSid);
      setMessages([]);
      setIsBotActive(true);
    }
  };

  // If user is Admin or currently browsing admin pages, do NOT render the customer chatbot widget
  if (pathname?.startsWith('/admin') || user?.role === 'admin') {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'inherit' }}>
      {/* Floating Action Button */}
      {!isOpen && (
        <ChatFloatingButton onClick={() => setIsOpen(true)} />
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div
          style={{
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 100px)',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            animation: 'slideUpFade 0.25s ease forwards',
          }}
        >
          {/* Header */}
          <ChatHeader
            isBotActive={isBotActive}
            onReset={handleResetChat}
            onClose={() => setIsOpen(false)}
          />

          {/* Messages Body */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: '#f8fafc',
            }}
          >
            {/* Greeting welcome message if empty */}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#e6f4ea',
                    color: '#1b4d3e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    margin: '0 auto 12px auto',
                  }}
                >
                  M
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  Xin chào bạn!
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, maxWidth: '280px', margin: '0 auto 16px auto' }}>
                  Em là <strong>Mộc Mạc AI</strong>, sẵn sàng tư vấn đồ gốm, nội thất, mã giảm giá và tra cứu đơn hàng giúp bạn.
                </p>

                <ChatQuickPrompts onSelectPrompt={handleSendMessage} variant="welcome" />
              </div>
            )}

            {/* Message List */}
            {messages.map((msg, idx) => (
              <ChatMessageItem
                key={`${msg.id}_${idx}`}
                message={msg}
                onProductClick={() => setIsOpen(false)}
              />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.82rem', padding: '6px 0' }}>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Mộc Mạc AI đang tra cứu & soạn câu trả lời...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips bar when conversation has messages */}
          {messages.length > 0 && !isLoading && (
            <ChatQuickPrompts onSelectPrompt={handleSendMessage} variant="bottom_bar" />
          )}

          {/* Input Footer */}
          <ChatInputBar
            inputMessage={inputMessage}
            isBotActive={isBotActive}
            isLoading={isLoading}
            onChangeInput={setInputMessage}
            onSendMessage={() => handleSendMessage()}
            inputRef={inputRef}
          />
        </div>
      )}
    </div>
  );
}
