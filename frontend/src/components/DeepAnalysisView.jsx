import React from 'react';
import { Cpu, Layers, FileText, ArrowRight, ShieldCheck, CheckCircle2, Wrench, ShieldAlert, Sparkles } from 'lucide-react';

/**
 * Parses raw implementation methodology text into structured step objects
 * so numbered strings like "1. Step A... 2. Step B..." render as clean visual cards.
 */
function parseImplementationSteps(rawText) {
  if (!rawText) return [];
  
  // Split by numbers like "1. ", "2. ", "Step 1:", etc.
  const rawParts = rawText.split(/(?=\b\d+\.\s*)/g);
  
  if (rawParts.length > 1) {
    return rawParts
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => part.replace(/^\d+\.\s*/, ''));
  }

  // Fallback: split by newlines
  const lines = rawText.split(/\n+/).map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines.map(l => l.replace(/^\d+\.\s*/, ''));
  }

  // Fallback: split by period if single long paragraph
  const sentences = rawText.split(/\.\s+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length > 1) {
    return sentences.map(s => s.endsWith('.') ? s : `${s}.`);
  }

  return [rawText];
}

export default function DeepAnalysisView({ solution, analysis, onGenerateDocuments, loading }) {
  if (!analysis) return null;

  const implementationSteps = parseImplementationSteps(analysis.implementation_approach);

  return (
    <div className="glass-panel fade-in" style={{ padding: '36px', maxWidth: '1000px', margin: '0 auto 36px' }}>
      {/* Stage Header & Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-mint" style={{ fontSize: '0.8rem' }}>
              <Sparkles size={14} /> Stage 6: Solution Analysis Agent
            </span>
            {solution?.effort && (
              <span className="badge badge-emerald" style={{ fontSize: '0.78rem' }}>
                {solution.effort}
              </span>
            )}
            {solution?.cost_tier && (
              <span className="badge badge-cyan" style={{ fontSize: '0.78rem' }}>
                {solution.cost_tier}
              </span>
            )}
          </div>
          
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
            Deep Architectural Breakdown
          </h3>
          <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Selected Option: <strong style={{ color: '#49dcb1', fontWeight: 700 }}>{solution?.title}</strong>
          </p>
        </div>

        <button onClick={onGenerateDocuments} className="btn-primary" disabled={loading} style={{ padding: '14px 28px', fontSize: '0.98rem' }}>
          {loading ? (
            'Generating Step 7 (.docx Specs)...'
          ) : (
            <><FileText size={18} /> Proceed to Step 7: Load Document Export Hub <ArrowRight size={16} /></>
          )}
        </button>
      </div>

      {/* Tech Stack & Recommended Tools Bar */}
      {solution?.tools && solution.tools.length > 0 && (
        <div style={{
          background: 'rgba(9, 18, 20, 0.8)',
          border: '1px solid rgba(73, 220, 177, 0.22)',
          borderRadius: '14px',
          padding: '14px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#49dcb1', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
            <Wrench size={15} color="#49dcb1" /> Architecture Tech Stack:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {solution.tools.map((t, idx) => (
              <span key={idx} style={{
                background: 'rgba(73, 220, 177, 0.12)',
                border: '1px solid rgba(73, 220, 177, 0.35)',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#49dcb1',
                fontWeight: 600
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Recommended Implementation Methodology - Numbered Step Cards */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(18, 28, 32, 0.85) 0%, rgba(10, 20, 22, 0.85) 100%)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(73, 220, 177, 0.25)',
          boxShadow: '0 0 20px rgba(73, 220, 177, 0.1)'
        }}>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#49dcb1', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={22} color="#49dcb1" /> Recommended Technical Implementation Methodology
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {implementationSteps.map((stepText, idx) => (
              <div
                key={idx}
                style={{
                  background: 'linear-gradient(135deg, rgba(73, 220, 177, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)',
                  borderLeft: '4px solid #49dcb1',
                  borderTop: '1px solid rgba(73, 220, 177, 0.2)',
                  borderRight: '1px solid rgba(73, 220, 177, 0.2)',
                  borderBottom: '1px solid rgba(73, 220, 177, 0.2)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #49dcb1 0%, #059669 100%)',
                  color: '#070b0e',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  flexShrink: 0,
                  letterSpacing: '0.04em',
                  marginTop: '2px',
                  boxShadow: '0 0 10px rgba(73, 220, 177, 0.3)'
                }}>
                  STEP 0{idx + 1}
                </div>
                <p style={{ fontSize: '0.94rem', color: '#f1f5f9', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                  {stepText}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Grid: Considerations & Dependencies */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
          {/* Key Considerations Card */}
          <div style={{
            background: 'rgba(18, 28, 32, 0.8)',
            padding: '22px',
            borderRadius: '14px',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            boxShadow: '0 0 14px rgba(251, 191, 36, 0.08)'
          }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#fbbf24" /> Critical Architecture Considerations
            </h4>
            <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              {analysis.key_considerations?.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '10px' }}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Dependencies Card */}
          <div style={{
            background: 'rgba(18, 28, 32, 0.8)',
            padding: '22px',
            borderRadius: '14px',
            border: '1px solid rgba(45, 212, 191, 0.25)',
            boxShadow: '0 0 14px rgba(45, 212, 191, 0.08)'
          }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2dd4bf', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#2dd4bf" /> System & Resource Dependencies
            </h4>
            <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              {analysis.dependencies?.map((dep, idx) => (
                <li key={idx} style={{ marginBottom: '10px' }}>{dep}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk & Mitigation Callout Box if present */}
        {solution?.risk && (
          <div style={{
            background: 'rgba(248, 113, 113, 0.08)',
            padding: '16px 20px',
            borderRadius: '12px',
            borderLeft: '4px solid #f87171',
            borderTop: '1px solid rgba(248, 113, 113, 0.2)',
            borderRight: '1px solid rgba(248, 113, 113, 0.2)',
            borderBottom: '1px solid rgba(248, 113, 113, 0.2)'
          }}>
            <h4 style={{ fontSize: '0.94rem', color: '#f87171', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#f87171" /> Targeted Risk & Mitigation Strategy
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#fca5a5', margin: 0, lineHeight: 1.5 }}>
              {solution.risk}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
