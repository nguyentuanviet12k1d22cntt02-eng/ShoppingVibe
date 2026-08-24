'use client';

import React from 'react';
import { ChatSession } from '@/features/chatbot/types/chat.types';
import LiveChatSessionItem from './LiveChatSessionItem';

interface LiveChatSessionListProps {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  searchTerm: string;
  filterTab: 'all' | 'bot_on' | 'bot_off';
  isLoading: boolean;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: 'all' | 'bot_on' | 'bot_off') => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

export default function LiveChatSessionList({
  sessions,
  selectedSessionId,
  searchTerm,
  filterTab,
  isLoading,
  onSearchChange,
  onFilterChange,
  onSelectSession,
  onDeleteSession,
}: LiveChatSessionListProps) {
  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customerEmail && s.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTab === 'bot_on') return s.isBotActive;
    if (filterTab === 'bot_off') return !s.isBotActive;
    return true;
  });

  return (
    <div
      style={{
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Search & Filter Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}
          ></i>
          <input
            type="text"
            placeholder="Tìm khách hàng / email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: filterTab === 'all' ? '#1b4d3e' : '#e2e8f0',
              color: filterTab === 'all' ? '#ffffff' : '#475569',
              transition: 'all 0.2s',
            }}
          >
            Tất cả ({sessions.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('bot_on')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: filterTab === 'bot_on' ? '#1b4d3e' : '#e2e8f0',
              color: filterTab === 'bot_on' ? '#ffffff' : '#475569',
              transition: 'all 0.2s',
            }}
          >
            Bot Bật ({sessions.filter(s => s.isBotActive).length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('bot_off')}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: filterTab === 'bot_off' ? '#d97706' : '#e2e8f0',
              color: filterTab === 'bot_off' ? '#ffffff' : '#475569',
              transition: 'all 0.2s',
            }}
          >
            Admin ({sessions.filter(s => !s.isBotActive).length})
          </button>
        </div>
      </div>

      {/* Session Cards Scroll Area */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px' }}>
        {isLoading && sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.85rem' }}>
            Đang tải danh sách...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '0.85rem' }}>
            Không tìm thấy phiên chat nào
          </div>
        ) : (
          filteredSessions.map(session => (
            <LiveChatSessionItem
              key={session.id}
              session={session}
              isSelected={session.id === selectedSessionId}
              onSelect={() => onSelectSession(session.id)}
              onDelete={(e) => onDeleteSession(session.id, e)}
            />
          ))
        )}
      </div>
    </div>
  );
}
