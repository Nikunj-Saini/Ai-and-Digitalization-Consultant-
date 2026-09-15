import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer({ compact = false }) {
  return (
    <footer style={{
      marginTop: compact ? '10px' : '40px',
      padding: compact ? '6px 0 10px 0' : '20px 0 28px 0',
      textAlign: 'center',
      borderTop: compact ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px'
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: compact ? '0.8rem' : '0.9rem',
        color: '#94a3b8',
        fontWeight: 400
      }}>
        <span>Developed & Designed with</span>
        <Heart size={14} fill="#ef4444" color="#ef4444" style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))', margin: '0 2px' }} />
        <span>by</span>
        <strong style={{ color: '#ffffff', fontWeight: 700, marginLeft: '2px' }}>Nikunj Saini</strong>
        {compact && <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '6px' }}>• © {new Date().getFullYear()} All Rights Reserved</span>}
      </div>
      {!compact && (
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>
          © {new Date().getFullYear()} Nikunj Saini. All Rights Reserved.
        </div>
      )}
    </footer>
  );
}

