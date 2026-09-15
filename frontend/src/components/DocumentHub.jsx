import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Sparkles, TrendingUp, ShieldCheck, Award, Eye, ChevronDown, ChevronUp, FileCode, Layers, ArrowRight, Cpu, Globe, Lock, Clock, Workflow } from 'lucide-react';

export default function DocumentHub({ documents = [], successCriteriaBenefits, onGenerateDocuments, hasSession }) {
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);

  // Helper to clean up titles and text from repetitive parentheticals
  const cleanString = (str) => {
    if (!str) return '';
    return str.replace(/\s*\([^)]*\)/g, '').replace(/\s*-\s*Smart Gmail Filters.*$/i, '').trim();
  };

  const getDocMeta = (docType, docTitle) => {
    switch (docType?.toLowerCase()) {
      case 'brd':
        return {
          cleanTitle: 'Business Requirement Document (BRD)',
          badge: 'EXECUTIVE STRATEGY',
          tagline: 'Executive strategic rationale, operational scope boundaries, and governance.',
          type: 'brd'
        };
      case 'prd':
        return {
          cleanTitle: 'Product Requirement Document (PRD)',
          badge: 'TECHNICAL ARCHITECTURE',
          tagline: 'Technical product specification, microservices data flow, and SLA requirements.',
          type: 'prd'
        };
      case 'plan':
        return {
          cleanTitle: 'Implementation & Delivery Plan',
          badge: 'TACTICAL ROADMAP',
          tagline: 'Phased execution timeline, team RACI matrix, and risk management protocol.',
          type: 'plan'
        };
      default:
        return {
          cleanTitle: cleanString(docTitle) || 'Specification Document',
          badge: 'SPECIFICATION',
          tagline: 'Structured formal advisory specification ready for stakeholder sign-off.',
          type: docType
        };
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', paddingBottom: '50px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 18px',
          borderRadius: '20px',
          background: 'rgba(73, 220, 177, 0.14)',
          color: '#49dcb1',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '12px',
          border: '1px solid rgba(73, 220, 177, 0.35)',
          boxShadow: '0 0 16px rgba(73, 220, 177, 0.2)'
        }}>
          <Sparkles size={16} /> Stage 5: Formatted Document Hub
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
          Executive Specification & Roadmap Hub
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '600px', margin: '0 auto' }}>
          Select and download production-ready Word (.docx) specifications built with visual architecture and execution workflows.
        </p>
      </div>

      {/* Document Cards Grid or Empty State */}
      {documents.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '600px', margin: '0 auto 40px', border: '1px solid rgba(73, 220, 177, 0.35)', borderRadius: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(73, 220, 177, 0.15)',
            border: '1px solid rgba(73, 220, 177, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#49dcb1'
          }}>
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            No Specifications Synthesized Yet
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
            Select a solution in Stage 3 or 4 to synthesize Executive BRD, PRD & Implementation Plan Word (.docx) specifications.
          </p>
          {onGenerateDocuments && (
            <button onClick={onGenerateDocuments} className="btn-primary" style={{ padding: '12px 24px', margin: '0 auto' }}>
              Synthesize Executive Specs Now
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
        {documents.map((doc) => {
          const isPreviewing = activePreviewDoc === doc.doc_id;
          const meta = getDocMeta(doc.type, doc.title);
          
          const highlights = doc.key_highlights && doc.key_highlights.length > 0
            ? doc.key_highlights.map(cleanString)
            : ["Executive Rationale", "Workflow Capabilities", "Operational State", "Governance & Risk"];

          return (
            <div
              key={doc.doc_id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                padding: '24px',
                border: isPreviewing ? '1px solid #49dcb1' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isPreviewing ? '0 0 24px rgba(73, 220, 177, 0.25)' : 'none',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(180deg, rgba(17, 24, 30, 0.85) 0%, rgba(10, 15, 20, 0.95) 100%)'
              }}
            >
              <div>
                {/* Header Badge & Title */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #49dcb1 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(73, 220, 177, 0.35)'
                  }}>
                    <FileText size={22} color="#070b0e" />
                  </div>
                  <span className="badge badge-mint" style={{ fontSize: '0.72rem', padding: '4px 10px', fontWeight: 800, letterSpacing: '0.5px' }}>
                    {meta.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 8px', color: '#ffffff' }}>
                  {meta.cleanTitle}
                </h3>
                
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: '1.4', marginBottom: '18px' }}>
                  {meta.tagline}
                </p>

                {/* VISUAL DIAGRAM SECTION IN PLACE OF TEXT */}
                <div style={{
                  background: 'rgba(7, 11, 15, 0.75)',
                  padding: '16px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(73, 220, 177, 0.2)',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#49dcb1', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Workflow size={14} /> Visual Structure Diagram
                  </div>

                  {/* BRD VISUALIZATION */}
                  {meta.type === 'brd' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.04)', padding: '10px 6px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <TrendingUp size={16} color="#49dcb1" style={{ margin: '0 auto 4px' }} />
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>01 Rationale</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Strategic ROI</div>
                      </div>
                      <ArrowRight size={14} color="#49dcb1" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.04)', padding: '10px 6px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Layers size={16} color="#49dcb1" style={{ margin: '0 auto 4px' }} />
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>02 Scope</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>In/Out Limits</div>
                      </div>
                      <ArrowRight size={14} color="#49dcb1" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.04)', padding: '10px 6px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Award size={16} color="#49dcb1" style={{ margin: '0 auto 4px' }} />
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>03 Governance</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Sign-off Matrix</div>
                      </div>
                    </div>
                  )}

                  {/* PRD VISUALIZATION */}
                  {meta.type === 'prd' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.04)', padding: '10px 6px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Globe size={16} color="#38bdf8" style={{ margin: '0 auto 4px' }} />
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>API Gateway</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Client Interface</div>
                      </div>
                      <ArrowRight size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.04)', padding: '10px 6px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(73, 220, 177, 0.3)' }}>
                        <Cpu size={16} color="#49dcb1" style={{ margin: '0 auto 4px' }} />
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>AI Core</div>
                        <div style={{ fontSize: '0.65rem', color: '#49dcb1' }}>Microservices</div>
                      </div>
                      <ArrowRight size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.04)', padding: '10px 6px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <Lock size={16} color="#38bdf8" style={{ margin: '0 auto 4px' }} />
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ffffff' }}>Security SLA</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>99.9% Uptime</div>
                      </div>
                    </div>
                  )}

                  {/* PLAN VISUALIZATION */}
                  {meta.type === 'plan' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      <div style={{ background: 'rgba(73, 220, 177, 0.1)', padding: '8px 4px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(73, 220, 177, 0.3)' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#49dcb1' }}>Wk 1-2</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>Discovery</div>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 4px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#38bdf8' }}>Wk 3-6</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>Build</div>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 4px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#fbbf24' }}>Wk 7-8</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>UAT</div>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '8px 4px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399' }}>Wk 9-10</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff' }}>Launch</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* COMPACT SECTION HIGHLIGHT TAGS */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Document Sections Included:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {highlights.map((hl, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.76rem',
                        color: '#e2e8f0',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <CheckCircle2 size={13} color="#49dcb1" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Preview Drawer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActivePreviewDoc(isPreviewing ? null : doc.doc_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: isPreviewing ? 'rgba(73, 220, 177, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    border: isPreviewing ? '1px solid #49dcb1' : '1px solid rgba(255, 255, 255, 0.12)',
                    color: isPreviewing ? '#49dcb1' : '#e2e8f0',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Eye size={14} color="#49dcb1" />
                  <span style={{ marginRight: '6px' }}>{isPreviewing ? 'Hide Outline Preview' : 'Quick Outline Preview'}</span>
                  {isPreviewing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Inline Section Preview Drawer BELOW Toggle Button */}
                {isPreviewing && doc.sections && doc.sections.length > 0 && (
                  <div className="fade-in" style={{
                    background: 'rgba(7, 11, 14, 0.95)',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(73, 220, 177, 0.35)',
                    margin: '4px 0 6px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#49dcb1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileCode size={14} /> Full Document Content Outline:
                    </div>
                    {doc.sections.map((sec, sIdx) => (
                      <div key={sIdx} style={{ marginBottom: '8px', borderBottom: sIdx < doc.sections.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none', paddingBottom: '6px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff' }}>{cleanString(sec.name)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', lineHeight: '1.3' }}>{sec.content}</div>
                      </div>
                    ))}
                  </div>
                )}

                <a
                  href={doc.download_url}
                  download
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    padding: '11px 16px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    boxShadow: '0 4px 14px rgba(73, 220, 177, 0.25)'
                  }}
                >
                  <Download size={16} /> Download {meta.badge.split(' ')[0]} Spec (.docx)
                </a>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

