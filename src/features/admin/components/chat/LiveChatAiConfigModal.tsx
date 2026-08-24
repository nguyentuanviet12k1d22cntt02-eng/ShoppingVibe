'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

interface LiveChatAiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export default function LiveChatAiConfigModal({
  isOpen,
  onClose,
  onSaved,
}: LiveChatAiConfigModalProps) {
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch current AI settings
  const fetchAiSettings = async () => {
    setIsLoading(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/chat/settings');
      const data = await res.json();
      if (data.success) {
        setHasKey(data.hasKey);
        setMaskedKey(data.maskedKey || '');
        setApiKey(data.geminiApiKey || '');
      }
    } catch (err) {
      console.error('Error loading AI settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAiSettings();
    }
  }, [isOpen]);

  // Test Gemini API Key
  const handleTestKey = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) {
      showToast('Vui lòng nhập API Key để kiểm tra', 'error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/chat/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiApiKey: keyToTest,
          testOnly: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: 'Khóa API Gemini hợp lệ & đã kết nối thành công!' });
        showToast('Khóa API hợp lệ!', 'success');
      } else {
        setTestResult({ success: false, message: data.error || 'Khóa API không hợp lệ' });
        showToast(data.error || 'Khóa API không hợp lệ', 'error');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: 'Lỗi kết nối tới máy chủ Google AI' });
      showToast('Lỗi kết nối', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  // Save AI Key
  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/chat/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiApiKey: apiKey.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        if (onSaved) onSaved();
        onClose();
      } else {
        showToast(data.error || 'Lỗi khi lưu cấu hình AI', 'error');
      }
    } catch (err) {
      showToast('Lỗi khi lưu cấu hình AI', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove AI Key
  const handleRemoveKey = async () => {
    if (!confirm('Bạn có chắc muốn xóa API Key này?')) return;
    setApiKey('');
    setIsSaving(true);
    try {
      const res = await fetch('/api/chat/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geminiApiKey: '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHasKey(false);
        setMaskedKey('');
        showToast('Đã xóa API Key thành công', 'info');
        if (onSaved) onSaved();
      }
    } catch (err) {
      showToast('Lỗi khi xóa API Key', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Cấu Hình Google Gemini AI
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Dán API Key để kích hoạt mô hình Gemini 2.5 / 2.0 Flash trả lời tự động
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSaveKey} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Đang tải thông tin cấu hình...
            </div>
          ) : (
            <>
              {/* Status Badge */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: hasKey ? '#ecfdf5' : '#fffbeb',
                  border: hasKey ? '1px solid #a7f3d0' : '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: hasKey ? '#065f46' : '#92400e' }}>
                    {hasKey ? 'Đã kích hoạt Google Gemini 2.5 Flash' : 'Chưa cấu hình API Key'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: hasKey ? '#047857' : '#b45309', marginTop: '2px' }}>
                    {hasKey
                      ? `Khóa hiện tại: ${maskedKey || 'Đã lưu trong hệ thống'}`
                      : 'Hệ thống đang chạy chế độ RAG thông minh mặc định'}
                  </div>
                </div>
                {hasKey && (
                  <button
                    type="button"
                    onClick={handleRemoveKey}
                    style={{
                      fontSize: '0.75rem',
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Xóa Key
                  </button>
                )}
              </div>

              {/* API Key Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Gemini API Key:
                </label>
                <input
                  type="password"
                  placeholder="Dán mã API Key dạng AIzaSy..."
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#1b4d3e')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Lấy key miễn phí tại:</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Google AI Studio (aistudio.google.com) ↗
                  </a>
                </div>
              </div>

              {/* Test Result Alert */}
              {testResult && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: testResult.success ? '#ecfdf5' : '#fef2f2',
                    color: testResult.success ? '#065f46' : '#991b1b',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {testResult.message}
                </div>
              )}

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTesting || !apiKey.trim()}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: apiKey.trim() && !isTesting ? 'pointer' : 'not-allowed',
                    opacity: apiKey.trim() && !isTesting ? 1 : 0.6,
                  }}
                >
                  {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra Key'}
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#1b4d3e',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
