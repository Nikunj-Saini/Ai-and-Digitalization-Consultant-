import React from 'react';
import { Cpu, RefreshCw, Sparkles, History } from 'lucide-react';

export default function Header({ onReset, stage, onOpenHistory, historyCount = 0 }) {
  return (
    <header className="glass-panel" style={{ padding: '16px 28px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #49dcb1 0%, #059669 100%)', 
          width: '42px', 
          height: '42px', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(73, 220, 177, 0.4)'
        }}>
          <Cpu size={24} color="#070b0e" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Digitalization Advisor
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Enterprise AI Agent Engine</span>
            <span style={{ color: '#25353c' }}>•</span>
            <span style={{ color: '#49dcb1', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <Sparkles size={12} /> Advisory AI Agent
            </span>
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {stage && stage !== 'INTAKE' && (
          <span className="badge badge-mint" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
            Stage: {stage.replace('_', ' ')}
          </span>
        )}

        <button onClick={onOpenHistory} className="btn-secondary" style={{ fontSize: '0.85rem', position: 'relative' }}>
          <History size={15} color="#49dcb1" />
          <span>History</span>
          {historyCount > 0 && (
            <span style={{
              background: '#49dcb1',
              color: '#070b0e',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px',
              marginLeft: '2px'
            }}>
              {historyCount}
            </span>
          )}
        </button>

        <button onClick={onReset} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={15} /> Reset Session
        </button>
      </div>
    </header>
  );
}
