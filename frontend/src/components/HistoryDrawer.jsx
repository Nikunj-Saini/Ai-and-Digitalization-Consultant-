import React, { useState, useEffect } from 'react';
import { History, Search, Trash2, X, RotateCcw, ArrowRight, Sparkles, MessageSquare, Clock, FileText, CheckCircle2 } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, onSelectHistoryItem, onReuseQuestion }) {
  const [historyList, setHistoryList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('da_question_history');
      if (stored) {
        setHistoryList(JSON.parse(stored));
      } else {
        setHistoryList([]);
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
      setHistoryList([]);
    }
  };

  const handleDeleteItem = (e, id) => {
    e.stopPropagation();
    try {
      const updated = historyList.filter(item => item.id !== id);
      setHistoryList(updated);
      localStorage.setItem('da_question_history', JSON.stringify(updated));
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const handleClearAll = () => {
    try {
      localStorage.removeItem('da_question_history');
      setHistoryList([]);
      setShowClearConfirm(false);
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  if (!isOpen) return null;

  const filteredItems = historyList.filter(item => 
    item.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.stage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'DOCUMENTS_GENERATED':
        return <span className="badge badge-emerald"><CheckCircle2 size={12} /> BRD & PRD Exported</span>;
      case 'SOLUTION_SELECTED':
      case 'SOLUTIONS_GENERATED':
        return <span className="badge badge-cyan"><Sparkles size={12} /> Solutions Ready</span>;
      case 'CLARIFICATION':
      case 'SOLUTIONS_READY':
        return <span className="badge badge-amber"><MessageSquare size={12} /> Clarification</span>;
      default:
        return <span className="badge badge-mint"><Clock size={12} /> Problem Intake</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 9, 12, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'flex-end',
      animation: 'fadeIn 0.25s ease'
    }} onClick={onClose}>
      <div 
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          background: 'rgba(12, 19, 23, 0.98)',
          borderLeft: '1px solid rgba(73, 220, 177, 0.25)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 24px',
          overflowY: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(73, 220, 177, 0.14)',
              border: '1px solid rgba(73, 220, 177, 0.3)',
              padding: '10px',
              borderRadius: '12px',
              color: '#49dcb1'
            }}>
              <History size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Question History</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {historyList.length} previous enquiry session{historyList.length === 1 ? '' : 's'} recorded
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-muted)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.target.style.color = '#ffffff'; e.target.style.background = 'rgba(255, 255, 255, 0.15)'; }}
            onMouseLeave={(e) => { e.target.style.color = 'var(--text-muted)'; e.target.style.background = 'rgba(255, 255, 255, 0.06)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search previous questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: '12px',
                background: 'rgba(7, 11, 14, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {historyList.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '9px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {/* Clear confirmation alert */}
        {showClearConfirm && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>Are you sure you want to clear all history?</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleClearAll} style={{ background: '#f87171', color: '#ffffff', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>Yes, Clear</button>
              <button onClick={() => setShowClearConfirm(false)} style={{ background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* History List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <History size={48} style={{ opacity: 0.25, marginBottom: '14px' }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>
                {searchQuery ? 'No matching questions found' : 'No History Recorded Yet'}
              </p>
              <p style={{ fontSize: '0.84rem' }}>
                {searchQuery ? 'Try searching for a different keyword.' : 'Any digital or process problem statements you submit will automatically appear here.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(18, 27, 32, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '16px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(73, 220, 177, 0.35)';
                  e.currentTarget.style.background = 'rgba(22, 34, 38, 0.9)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = 'rgba(18, 27, 32, 0.75)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => {
                  if (item.fullState) {
                    onSelectHistoryItem(item.fullState);
                    onClose();
                  } else {
                    onReuseQuestion(item.question);
                    onClose();
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  {getStageBadge(item.stage)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.dateFormatted || new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <p style={{
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  marginBottom: '12px',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  "{item.question}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {item.fullState ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHistoryItem(item.fullState);
                          onClose();
                        }}
                        style={{
                          background: 'rgba(73, 220, 177, 0.12)',
                          border: '1px solid rgba(73, 220, 177, 0.3)',
                          color: '#49dcb1',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RotateCcw size={12} /> Restore Session
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReuseQuestion(item.question);
                        onClose();
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#cbd5e1',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ArrowRight size={12} /> Copy Question
                    </button>
                  </div>

                  <button
                    type="button"
                    title="Delete entry"
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
