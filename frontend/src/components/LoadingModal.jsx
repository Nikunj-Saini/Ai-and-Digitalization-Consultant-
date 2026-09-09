import React from 'react';
import { Cpu, Sparkles, Layers, ShieldCheck, Loader2 } from 'lucide-react';

export default function LoadingModal({ show, message = "Analyzing Solution Architecture with Agent..." }) {
  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(7, 11, 14, 0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel fade-in" style={{
        maxWidth: '540px',
        width: '100%',
        padding: '38px 32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(18, 28, 32, 0.96) 0%, rgba(7, 24, 22, 0.96) 100%)',
        border: '1.5px solid #49dcb1',
        borderRadius: '24px',
        boxShadow: '0 0 45px rgba(73, 220, 177, 0.35)'
      }}>
        {/* Glowing Animated AI Core */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(73, 220, 177, 0.22) 0%, rgba(5, 150, 105, 0.18) 100%)',
          border: '1.5px solid #49dcb1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 30px rgba(73, 220, 177, 0.45)',
          position: 'relative'
        }}>
          <Cpu size={40} color="#49dcb1" style={{ animation: 'pulse 1.8s infinite ease-in-out' }} />
          <Loader2 size={78} color="#49dcb1" style={{
            position: 'absolute',
            animation: 'spin 2s linear infinite',
            opacity: 0.6
          }} />
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px', letterSpacing: '-0.01em' }}>
          Agent Solution Architecture Engine
        </h3>

        <p style={{ fontSize: '0.96rem', color: '#49dcb1', fontWeight: 700, marginBottom: '24px', lineHeight: 1.4 }}>
          {message}
        </p>

        {/* Live Progress Milestones Container */}
        <div style={{
          background: 'rgba(7, 11, 14, 0.75)',
          borderRadius: '16px',
          padding: '18px 20px',
          border: '1px solid rgba(73, 220, 177, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.86rem', color: '#f1f5f9', fontWeight: 500 }}>
            <Sparkles size={18} color="#49dcb1" style={{ flexShrink: 0 }} />
            <span>Generating deep implementation methodology & tech stack...</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.86rem', color: '#f1f5f9', fontWeight: 500 }}>
            <Layers size={18} color="#34d399" style={{ flexShrink: 0 }} />
            <span>Mapping system architecture & enterprise dependencies...</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.86rem', color: '#f1f5f9', fontWeight: 500 }}>
            <ShieldCheck size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
            <span>Evaluating risk mitigations & governance controls...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
