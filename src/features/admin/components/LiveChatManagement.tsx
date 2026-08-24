'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';
import { ChatMessage, ChatSession } from '@/features/chatbot/types/chat.types';
import LiveChatSessionList from './chat/LiveChatSessionList';
import LiveChatHeader from './chat/LiveChatHeader';
import LiveChatMessageList from './chat/LiveChatMessageList';
import LiveChatInput from './chat/LiveChatInput';
import LiveChatAiConfigModal from './chat/LiveChatAiConfigModal';

export default function LiveChatManagement() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [adminInput, setAdminInput] = useState('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'bot_on' | 'bot_off'>('all');
  const [isAiConfigOpen, setIsAiConfigOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all sessions
  const fetchSessions = async (silent = false) => {
    try {
      if (!silent) setIsLoadingSessions(true);
      const res = await fetch('/api/chat/sessions');
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
        // Auto select first session if none selected
        if (!selectedSessionId && data.sessions && data.sessions.length > 0) {
          setSelectedSessionId(data.sessions[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      if (!silent) setIsLoadingSessions(false);
    }
  };

  // Fetch messages for selected session
  const fetchSessionMessages = async (sessionId: string, silent = false) => {
    try {
      if (!silent) setIsLoadingMessages(true);
      const res = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.success) {
        const fetchedMsgs: ChatMessage[] = data.messages || [];
        setMessages(prev => {
          if (
            prev.length === fetchedMsgs.length &&
            prev[prev.length - 1]?.id === fetchedMsgs[fetchedMsgs.length - 1]?.id
          ) {
            return prev; // keep same reference to prevent re-renders
          }
          return fetchedMsgs;
        });
      }
    } catch (err) {
      console.error('Error fetching session messages:', err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  };

  // Initial load & periodic polling for realtime updates
  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionMessages(selectedSessionId);
      const interval = setInterval(() => {
        fetchSessionMessages(selectedSessionId, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedSessionId]);

  // Toggle Bot AI state for selected session
  const handleToggleBot = async (session: ChatSession) => {
    const nextState = !session.isBotActive;
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          isBotActive: nextState,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSessions(prev =>
          prev.map(s => (s.id === session.id ? { ...s, isBotActive: nextState } : s))
        );
        showToast(
          nextState
            ? 'Đã BẬT Bot AI tự động trả lời cho phiên này!'
            : 'Đã TẮT Bot AI! Giờ bạn có thể trả lời trực tiếp cho khách hàng.',
          nextState ? 'info' : 'warning'
        );
      }
    } catch (err) {
      showToast('Lỗi cập nhật trạng thái Bot AI', 'error');
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử phiên trò chuyện này?')) return;

    try {
      const res = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (selectedSessionId === sessionId) {
          const remaining = sessions.filter(s => s.id !== sessionId);
          setSelectedSessionId(remaining.length > 0 ? remaining[0].id : null);
          setMessages([]);
        }
        showToast('Đã xóa phiên trò chuyện thành công.', 'success');
      }
    } catch (err) {
      showToast('Lỗi khi xóa phiên chat.', 'error');
    }
  };

  // Send Admin message
  const handleAdminSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInput.trim() || !selectedSessionId || isSending) return;

    const contentToSend = adminInput.trim();
    setAdminInput('');
    setIsSending(true);

    const tempAdminMsg: ChatMessage = {
      id: `admin_${Date.now()}`,
      sessionId: selectedSessionId,
      sender: 'admin',
      content: contentToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempAdminMsg]);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          sender: 'admin',
          content: contentToSend,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev.filter(m => m.id !== tempAdminMsg.id), data.userMessage]);
        // Update session last message
        setSessions(prev =>
          prev.map(s =>
            s.id === selectedSessionId
              ? { ...s, lastMessage: contentToSend, lastMessageAt: new Date().toISOString() }
              : s
          )
        );
      }
    } catch (err) {
      showToast('Lỗi khi gửi tin nhắn phản hồi.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Active session details
  const activeSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Quản Lý Live Chat & Trợ Lý AI
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Giám sát các phiên trò chuyện của khách hàng, bật/tắt Bot AI tự động hoặc trả lời trực tiếp.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAiConfigOpen(true)}
            style={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              fontWeight: 700,
            }}
          >
            Cấu hình AI Key
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              fetchSessions();
              if (selectedSessionId) fetchSessionMessages(selectedSessionId);
              showToast('Đã làm mới dữ liệu hộp thư.', 'info');
            }}
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Main 2-Column Chat Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          height: 'calc(100vh - 180px)',
          minHeight: '620px',
          maxHeight: '750px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}
      >
        {/* Left Column: Session List */}
        <LiveChatSessionList
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          searchTerm={searchTerm}
          filterTab={filterTab}
          isLoading={isLoadingSessions}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterTab}
          onSelectSession={setSelectedSessionId}
          onDeleteSession={handleDeleteSession}
        />

        {/* Right Column: Active Conversation Feed & Admin Input */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden', backgroundColor: '#ffffff' }}>
          {activeSession ? (
            <>
              {/* Active Session Header & Bot AI Toggle Switch */}
              <LiveChatHeader
                session={activeSession}
                onToggleBot={handleToggleBot}
              />

              {/* Message Feed Area */}
              <LiveChatMessageList
                messages={messages}
                customerName={activeSession.customerName}
                isLoading={isLoadingMessages}
                selectedSessionId={selectedSessionId}
              />

              {/* Admin Input Bar */}
              <LiveChatInput
                adminInput={adminInput}
                isBotActive={activeSession.isBotActive}
                isSending={isSending}
                onInputChange={setAdminInput}
                onSend={handleAdminSend}
              />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Chọn một phiên trò chuyện ở cột bên trái để bắt đầu</h3>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Key Configuration Modal */}
      <LiveChatAiConfigModal
        isOpen={isAiConfigOpen}
        onClose={() => setIsAiConfigOpen(false)}
      />
    </div>
  );
}
