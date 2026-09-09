import React from 'react';
import { Sparkles, CheckCircle, ThumbsUp, Wrench, ShieldAlert, TrendingUp } from 'lucide-react';

export default function SolutionDeck({ solutions = [], selectedSolutionId, onSelectSolution, loading }) {
  return (
    <div className="fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(73, 220, 177, 0.14)',
          color: '#49dcb1',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '12px',
          border: '1px solid rgba(73, 220, 177, 0.3)',
          boxShadow: '0 0 16px rgba(73, 220, 177, 0.2)'
        }}>
          <Sparkles size={16} /> Stage 4 & 5: AI Solution Deck
        </div>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
          Recommended Digital Transformation Options
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select your preferred solution option to generate architecture specs & Word documents.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {solutions.map((sol, index) => {
          const isSelected = selectedSolutionId === sol.id || sol.is_selected;

          return (
            <div
              key={sol.id || index}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isSelected ? '2px solid #49dcb1' : '1px solid rgba(73, 220, 177, 0.25)',
                background: isSelected ? 'rgba(73, 220, 177, 0.09)' : 'rgba(18, 28, 32, 0.75)',
                boxShadow: isSelected ? '0 0 24px rgba(73, 220, 177, 0.3)' : '0 0 16px rgba(73, 220, 177, 0.12)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'linear-gradient(135deg, #49dcb1 0%, #059669 100%)',
                  color: '#070b0e',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '4px 14px',
                  borderBottomLeftRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 0 12px rgba(73, 220, 177, 0.4)'
                }}>
                  <CheckCircle size={12} /> SELECTED CHOICE
                </div>
              )}

              <div>
                {/* TOP CENTER BADGES with light greenish glow */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', marginTop: '4px' }}>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: 'rgba(73, 220, 177, 0.16)',
                    color: '#49dcb1',
                    border: '1.5px solid #49dcb1',
                    boxShadow: '0 0 14px rgba(73, 220, 177, 0.35)'
                  }}>
                    OPTION {index + 1}
                  </span>
                  <span style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'rgba(73, 220, 177, 0.12)',
                    color: '#49dcb1',
                    border: '1px solid rgba(73, 220, 177, 0.3)'
                  }}>
                    {sol.effort}
                  </span>
                  <span style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'rgba(73, 220, 177, 0.12)',
                    color: '#49dcb1',
                    border: '1px solid rgba(73, 220, 177, 0.3)'
                  }}>
                    {sol.cost_tier}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '12px', color: '#ffffff', textAlign: 'center' }}>
                  {sol.title}
                </h3>

                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '18px', minHeight: '60px', textAlign: 'center' }}>
                  {sol.approach}
                </p>

                {/* Recommended Tools (Strictly Green Theme) */}
                {sol.tools && sol.tools.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#49dcb1', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', letterSpacing: '0.04em' }}>
                      <Wrench size={13} color="#49dcb1" /> TECH STACK & TOOLS:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {sol.tools.map((t, ti) => (
                        <span key={ti} style={{ background: 'rgba(73, 220, 177, 0.12)', border: '1px solid rgba(73, 220, 177, 0.3)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.76rem', color: '#49dcb1', fontWeight: 600 }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Advantages (Mint-Greenish Box with Border Left Accent) */}
                {sol.pros && sol.pros.length > 0 && (
                  <div style={{
                    marginBottom: '18px',
                    background: 'linear-gradient(135deg, rgba(73, 220, 177, 0.09) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    borderLeft: '4px solid #49dcb1',
                    borderTop: '1px solid rgba(73, 220, 177, 0.25)',
                    borderRight: '1px solid rgba(73, 220, 177, 0.25)',
                    borderBottom: '1px solid rgba(73, 220, 177, 0.25)',
                    boxShadow: '0 0 16px rgba(73, 220, 177, 0.12)'
                  }}>
                    <p style={{
                      fontSize: '0.78rem',
                      textTransform: 'uppercase',
                      color: '#49dcb1',
                      fontWeight: 800,
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      letterSpacing: '0.05em'
                    }}>
                      <TrendingUp size={15} color="#49dcb1" /> KEY ADVANTAGES:
                    </p>
                    <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.86rem', color: '#f1f5f9', lineHeight: '1.5' }}>
                      {sol.pros.map((p, pi) => (
                        <li key={pi} style={{ marginBottom: pi < sol.pros.length - 1 ? '6px' : '0' }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk & Mitigation Box (EXCEPT THE RED HERE as explicitly specified by user) */}
                {sol.risk && (
                  <div style={{ marginBottom: '18px', background: 'rgba(248, 113, 113, 0.08)', padding: '10px 14px', borderRadius: '10px', borderLeft: '3px solid #f87171', borderTop: '1px solid rgba(248, 113, 113, 0.15)', borderRight: '1px solid rgba(248, 113, 113, 0.15)', borderBottom: '1px solid rgba(248, 113, 113, 0.15)' }}>
                    <p style={{ fontSize: '0.78rem', color: '#fca5a5', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.4 }}>
                      <ShieldAlert size={15} color="#f87171" style={{ flexShrink: 0 }} /> 
                      <span><strong>Risk & Mitigation:</strong> {sol.risk}</span>
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  onClick={() => onSelectSolution(sol.id)}
                  disabled={loading}
                  className={isSelected ? 'btn-secondary' : 'btn-primary'}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: isSelected ? 'rgba(73, 220, 177, 0.15)' : undefined,
                    borderColor: isSelected ? '#49dcb1' : undefined,
                    color: isSelected ? '#49dcb1' : '#070b0e',
                    boxShadow: isSelected ? '0 0 14px rgba(73, 220, 177, 0.25)' : undefined
                  }}
                >
                  {isSelected ? (
                    <><CheckCircle size={18} /> Selected Solution</>
                  ) : (
                    <><ThumbsUp size={18} /> Select This Solution</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
