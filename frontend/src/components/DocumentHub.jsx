import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Sparkles, TrendingUp, ShieldCheck, Award, Eye, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

export default function DocumentHub({ documents = [], successCriteriaBenefits }) {
  const [activePreviewDoc, setActivePreviewDoc] = useState(null);

  const defaultHighlights = {
    brd: [
      "Executive Summary & Strategic Rationale",
      "Current vs. Target Operational State Matrix",
      "In-Scope / Out-of-Scope Capabilities",
      "Stakeholder Governance & Sign-off Table"
    ],
    prd: [
      "Product Vision & System Architecture",
      "Detailed Functional Requirements Table (P0/P1)",
      "Non-Functional SLA, Security & Latency Specs",
      "Success Criteria & Business ROI Metrics"
    ],
    plan: [
      "4-Phase Structured Development Roadmap",
      "Milestones, Timelines & Deliverables Table",
      "Team Resource Allocation & RACI Structure",
      "Emergency Risk Mitigation Protocol"
    ]
  };

  const defaultDescriptions = {
    brd: "Executive-level strategic document defining business objectives, operational workflows, scope boundaries, and stakeholder approval governance.",
    prd: "Technical product specification mapping system architecture, microservices data flow, functional requirement tables, and enterprise security SLAs.",
    plan: "Tactical execution roadmap outlining 4 phased delivery milestones, team RACI matrix, risk management protocols, and UAT sign-off criteria."
  };

  return (
    <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '50px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
          marginBottom: '14px',
          border: '1px solid rgba(73, 220, 177, 0.35)',
          boxShadow: '0 0 16px rgba(73, 220, 177, 0.2)'
        }}>
          <Sparkles size={16} /> Stage 7: Executive Advisory Documents Ready
        </div>
        <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '10px', color: '#ffffff' }}>
          Download Your Formatted Specifications
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '650px', margin: '0 auto' }}>
          Fully structured, professional Word (.docx) specifications generated via python-docx, ready for executive distribution and engineering sign-off.
        </p>
      </div>

      {/* Document Download Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {documents.map((doc) => {
          const isPreviewing = activePreviewDoc === doc.doc_id;
          const highlights = doc.key_highlights && doc.key_highlights.length > 0
            ? doc.key_highlights
            : ["Solution Executive Rationale", "Workflow Steps & Capabilities", "Target Operational State", "Governance & Risk Controls"];
          const description = doc.description || `Technical specification generated for ${doc.title}`;

          return (
            <div
              key={doc.doc_id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                padding: '26px',
                border: isPreviewing ? '1px solid #49dcb1' : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isPreviewing ? '0 0 20px rgba(73, 220, 177, 0.25)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              <div>
                {/* Header Icon & Type Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #49dcb1 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(73, 220, 177, 0.35)'
                  }}>
                    <FileText size={24} color="#070b0e" />
                  </div>
                  <span className="badge badge-mint" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    {doc.type.toUpperCase()} SPECIFICATION
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '6px 0 10px', color: '#ffffff' }}>
                  {doc.title}
                </h3>
                
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '16px' }}>
                  {description}
                </p>

                {/* Section Highlights List */}
                <div style={{
                  background: 'rgba(18, 28, 32, 0.65)',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  marginBottom: '18px'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#49dcb1', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCode size={14} /> Document Sections Included:
                  </div>
                  <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0 }}>
                    {highlights.map((hl, idx) => (
                      <li key={idx} style={{ fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '5px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <CheckCircle2 size={14} color="#49dcb1" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Inline Section Preview Drawer */}
                {isPreviewing && doc.sections && doc.sections.length > 0 && (
                  <div className="fade-in" style={{
                    background: 'rgba(7, 11, 14, 0.9)',
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(73, 220, 177, 0.3)',
                    marginBottom: '18px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#49dcb1', marginBottom: '8px' }}>
                      📋 Document Content Structure:
                    </div>
                    {doc.sections.map((sec, sIdx) => (
                      <div key={sIdx} style={{ marginBottom: '8px', borderBottom: sIdx < doc.sections.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none', paddingBottom: '6px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>{sec.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>{sec.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActivePreviewDoc(isPreviewing ? null : doc.doc_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Eye size={14} color="#49dcb1" />
                  {isPreviewing ? 'Hide Structure Preview' : '👁 Quick Structure Preview'}
                  {isPreviewing ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <a
                  href={doc.download_url}
                  download
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justify: 'center',
                    textDecoration: 'none',
                    padding: '11px 16px',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    borderRadius: '8px'
                  }}
                >
                  <Download size={16} /> Download {doc.type.toUpperCase()} (.docx)
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
