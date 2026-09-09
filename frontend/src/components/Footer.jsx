import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      marginTop: '60px',
      padding: '28px 0 36px 0',
      textAlign: 'center',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.94rem',
        color: '#94a3b8',
        fontWeight: 400
      }}>
        <span>Developed & Designed with</span>
        <Heart size={16} fill="#ef4444" color="#ef4444" style={{ filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))', margin: '0 2px' }} />
        <span>by</span>
        <strong style={{ color: '#ffffff', fontWeight: 700, marginLeft: '2px' }}>Nikunj Saini</strong>
      </div>

      <div style={{
        fontSize: '0.82rem',
        color: '#64748b',
        fontWeight: 400,
        letterSpacing: '0.01em'
      }}>
        © {new Date().getFullYear()} Nikunj Saini. All Rights Reserved.
      </div>
    </footer>
  );
}
