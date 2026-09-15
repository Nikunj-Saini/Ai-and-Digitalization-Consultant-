import React from 'react';
import { Cpu, RefreshCw, Sparkles, History, ArrowLeft } from 'lucide-react';

export default function Header({ onReset, stage, onOpenHistory, historyCount = 0, onBack, backLabel }) {
  return (
    <header className="glass-panel" style={{ padding: '10px 20px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {onBack && backLabel && (
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              background: '#ffffff',
              color: '#070b0e',
              border: '1.5px solid #ffffff',
              borderRadius: '8px',
              boxShadow: '0 0 12px rgba(255, 255, 255, 0.35)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginRight: '4px'
            }}
          >
            <ArrowLeft size={14} color="#070b0e" /> {backLabel}
          </button>
        )}

        <div style={{ 
          background: 'linear-gradient(135deg, #49dcb1 0%, #059669 100%)', 
          width: '38px', 
          height: '38px', 
          borderRadius: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(73, 220, 177, 0.4)',
          flexShrink: 0
        }}>
          <Cpu size={22} color="#070b0e" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Transformation Advisor
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>AI-Powered Advisory Engine</span>
            <span style={{ color: '#25353c' }}>•</span>
            <span style={{ color: '#49dcb1', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <Sparkles size={12} /> Advisory AI Agent
            </span>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {stage && stage !== 'INTAKE' && (
          <span className="badge badge-mint" style={{ fontSize: '0.75rem', padding: '5px 10px' }}>
            Stage: {stage.replace('_', ' ')}
          </span>
        )}

        <button onClick={onOpenHistory} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 12px', position: 'relative' }}>
          <History size={14} color="#49dcb1" />
          <span>History</span>
          {historyCount > 0 && (
            <span style={{
              background: '#49dcb1',
              color: '#070b0e',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px',
              marginLeft: '2px'
            }}>
              {historyCount}
            </span>
          )}
        </button>

        <button onClick={onReset} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
          <RefreshCw size={14} /> Reset Session
        </button>
      </div>
    </header>
  );
}

