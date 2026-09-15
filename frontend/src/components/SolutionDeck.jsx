import React, { useState } from 'react';
import { Sparkles, CheckCircle, ThumbsUp, Wrench, TrendingUp, Cpu, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { getDynamicFlowchartSteps } from '../utils/approachGenerator';

export default function SolutionDeck({
  solutions = [],
  selectedSolutionId,
  onSelectSolution,
  loading,
  suggestedTechStack = [],
  confirmedTechStack = []
}) {
  const [showBenefits, setShowBenefits] = useState({});

  const activeTechStack = React.useMemo(() => {
    if (confirmedTechStack && Array.isArray(confirmedTechStack) && confirmedTechStack.length > 0) {
      return confirmedTechStack;
    }
    if (suggestedTechStack && Array.isArray(suggestedTechStack) && suggestedTechStack.length > 0) {
      return suggestedTechStack;
    }
    return ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs'];
  }, [confirmedTechStack, suggestedTechStack]);

  const toggleBenefits = (solId) => {
    setShowBenefits(prev => ({ ...prev, [solId]: !prev[solId] }));
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1440px', margin: '0 auto', paddingBottom: '32px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
          <Sparkles size={16} /> Stage 3: AI Solution Deck
        </div>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
          Recommended Digital Transformation Solutions
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select your preferred solution option to generate BRD, PRD, and Implementation Plan documents.
        </p>
      </div>

      {/* Confirmed Tech Stack Read-only Header Toolbar */}
      <div style={{
        background: 'rgba(13, 23, 27, 0.85)',
        border: '1px solid rgba(73, 220, 177, 0.3)',
        borderRadius: '14px',
        padding: '14px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#49dcb1', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wrench size={15} /> Confirmed Enterprise Tech Stack ({activeTechStack.length} tools):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {activeTechStack.map(t => (
              <span key={t} style={{
                background: 'rgba(73, 220, 177, 0.15)',
                border: '1px solid rgba(73, 220, 177, 0.35)',
                color: '#34d399',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {solutions.map((sol, index) => {
          const isSelected = selectedSolutionId === sol.id || sol.is_selected;
          const solTools = Array.isArray(sol.tools) && sol.tools.length > 0 ? sol.tools : activeTechStack;
          const flowchart = getDynamicFlowchartSteps(sol, solTools, index);
          const isBenefitsOpen = !!showBenefits[sol.id];

          return (
            <div
              key={sol.id || index}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                border: isSelected ? '2px solid #49dcb1' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isSelected 
                  ? 'linear-gradient(135deg, rgba(17, 36, 34, 0.95) 0%, rgba(9, 20, 22, 0.95) 100%)' 
                  : 'rgba(8, 14, 16, 0.85)',
                boxShadow: isSelected ? '0 0 28px rgba(73, 220, 177, 0.35)' : 'none',
                opacity: isSelected ? 1 : 0.82,
                position: 'relative',
                overflow: 'hidden',
                padding: '24px',
                transition: 'all 0.3s ease'
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

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* TOP CENTERED SOLUTION BADGE */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', marginTop: isSelected ? '12px' : '4px' }}>
                  <span style={{
                    padding: '6px 18px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: '#ffffff',
                    color: '#070b0e',
                    border: '1.5px solid #ffffff',
                    boxShadow: '0 0 14px rgba(255, 255, 255, 0.4)'
                  }}>
                    SOLUTION {index + 1}
                  </span>
                </div>

                {/* SOLUTION TITLE & HIGHLIGHT BADGES */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px', lineHeight: '1.3' }}>
                  {sol.title}
                </h3>
                
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
                  {sol.summary || sol.description}
                </p>

                {/* VISUAL FLOWCHART WORKFLOW CARD PIPELINE */}
                <div style={{
                  background: 'rgba(5, 11, 13, 0.75)',
                  border: '1px solid rgba(73, 220, 177, 0.2)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '18px'
                }}>
                  <p style={{
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    color: '#49dcb1',
                    fontWeight: 800,
                    marginBottom: '10px',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Zap size={14} color="#49dcb1" /> DYNAMIC WORKFLOW PIPELINE:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {flowchart.map((fc, fci) => {
                      const IconComp = fc.icon || Cpu;
                      const toolPills = fc.badge ? fc.badge.split(/\s*[\+\,&]\s*/).filter(Boolean) : [];
                      return (
                        <div key={fci} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'rgba(73, 220, 177, 0.06)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(73, 220, 177, 0.2)'
                          }}>
                            <span style={{
                              background: '#49dcb1',
                              color: '#070b0e',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              borderRadius: '4px',
                              padding: '2px 6px',
                              flexShrink: 0
                            }}>
                              STEP {fc.step}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <IconComp size={13} color="#49dcb1" /> {fc.title}
                                {toolPills.map((pill, pi) => (
                                  <span key={pi} style={{
                                    fontSize: '0.66rem',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    color: '#cbd5e1',
                                    border: '1px solid rgba(255, 255, 255, 0.16)',
                                    borderRadius: '4px',
                                    padding: '1px 6px',
                                    fontWeight: 600
                                  }}>
                                    {pill}
                                  </span>
                                ))}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                                {fc.desc}
                              </div>
                            </div>
                          </div>
                          {fci < flowchart.length - 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
                              <div style={{ width: '2px', height: '12px', background: 'linear-gradient(180deg, #49dcb1 0%, rgba(73, 220, 177, 0.15) 100%)' }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BENEFITS & ADVANTAGES TABULAR DROPDOWN */}
                <div style={{ marginBottom: '18px' }}>
                  <button
                    type="button"
                    onClick={() => toggleBenefits(sol.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: isBenefitsOpen ? 'rgba(73, 220, 177, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      border: isBenefitsOpen ? '1px solid #49dcb1' : '1px solid rgba(255, 255, 255, 0.12)',
                      color: isBenefitsOpen ? '#49dcb1' : '#e2e8f0',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isBenefitsOpen ? '0 0 14px rgba(73, 220, 177, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={15} color="#49dcb1" />
                      <span style={{ marginRight: '8px' }}>{isBenefitsOpen ? 'Hide Benefits & Business Advantages' : 'View Benefits & Business Advantages'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
                      {isBenefitsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* TABULAR FORM INSIDE DROPDOWN */}
                  {isBenefitsOpen && (
                    <div className="fade-in" style={{
                      marginTop: '8px',
                      background: 'rgba(7, 12, 16, 0.95)',
                      borderRadius: '10px',
                      border: '1px solid rgba(73, 220, 177, 0.35)',
                      overflow: 'hidden'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'rgba(73, 220, 177, 0.15)', borderBottom: '1px solid rgba(73, 220, 177, 0.3)' }}>
                            <th style={{ padding: '8px 12px', color: '#49dcb1', fontWeight: 800, width: '35%' }}>Category</th>
                            <th style={{ padding: '8px 12px', color: '#49dcb1', fontWeight: 800 }}>Benefit & Advantage Specification</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#ffffff', background: 'rgba(255, 255, 255, 0.02)' }}>Key Advantages</td>
                            <td style={{ padding: '8px 12px', color: '#cbd5e1' }}>
                              <ul style={{ margin: 0, paddingLeft: '14px', lineHeight: '1.4' }}>
                                {Array.isArray(sol.pros) && sol.pros.length > 0 ? (
                                  sol.pros.map((p, pi) => <li key={pi}>{p}</li>)
                                ) : typeof sol.pros === 'string' ? (
                                  <li>{sol.pros}</li>
                                ) : (
                                  <li>High operational efficiency & rapid sign-off</li>
                                )}
                              </ul>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#ffffff', background: 'rgba(255, 255, 255, 0.02)' }}>Target Timeline & Effort</td>
                            <td style={{ padding: '8px 12px', color: '#38bdf8', fontWeight: 700 }}>{sol.effort || 'Low (1-2 weeks)'} Delivery Timeline</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: '#ffffff', background: 'rgba(255, 255, 255, 0.02)' }}>Investment Tier</td>
                            <td style={{ padding: '8px 12px', color: '#34d399', fontWeight: 700 }}>{sol.cost_tier || 'Low Cost / High ROI'}</td>
                          </tr>
                          {sol.risk && (
                            <tr>
                              <td style={{ padding: '8px 12px', fontWeight: 700, color: '#ffffff', background: 'rgba(255, 255, 255, 0.02)' }}>Risk Controls</td>
                              <td style={{ padding: '8px 12px', color: '#fca5a5' }}>{sol.risk}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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
