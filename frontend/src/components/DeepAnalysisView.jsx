import React, { useState } from 'react';
import { Cpu, Layers, FileText, ArrowRight, ShieldCheck, CheckCircle2, Wrench, ShieldAlert, Sparkles, ChevronDown, ChevronUp, Plus, X, RotateCcw, Database, Zap, GitBranch, ArrowDown } from 'lucide-react';
import { isValidToolName, formatToolName } from '../utils/toolValidator';
import { getDynamicImplementationApproach } from '../utils/approachGenerator';

/**
 * Parses raw implementation methodology text into structured step objects
 */
function parseImplementationSteps(rawText) {
  if (!rawText) return [];
  
  const rawParts = rawText.split(/(?=\b\d+\.\s*)/g);
  if (rawParts.length > 1) {
    return rawParts
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => part.replace(/^\d+\.\s*/, ''));
  }

  const lines = rawText.split(/\n+/).map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines.map(l => l.replace(/^\d+\.\s*/, ''));
  }

  const sentences = rawText.split(/\.\s+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length > 1) {
    return sentences.map(s => s.endsWith('.') ? s : `${s}.`);
  }

  return [rawText];
}

/**
 * Connected Visual Flowchart Diagram Component
 */
function VisualFlowchartDiagram({ steps = [], activeTools = [] }) {
  const nodes = steps.map((stepText, idx) => {
    let type = 'INGESTION';
    let title = `Node ${idx + 1}: Data & Operational Intake`;
    let icon = Database;
    let badgeColor = '#38bdf8';
    let bgGradient = 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(14, 165, 233, 0.04) 100%)';
    let borderColor = 'rgba(56, 189, 248, 0.35)';

    if (idx === 1 || stepText.toLowerCase().includes('engine') || stepText.toLowerCase().includes('model') || stepText.toLowerCase().includes('logic') || stepText.toLowerCase().includes('process')) {
      type = 'AI_ENGINE';
      title = `Node ${idx + 1}: AI & Business Processing Engine`;
      icon = Cpu;
      badgeColor = '#49dcb1';
      bgGradient = 'linear-gradient(135deg, rgba(73, 220, 177, 0.14) 0%, rgba(5, 150, 105, 0.05) 100%)';
      borderColor = 'rgba(73, 220, 177, 0.4)';
    } else if (idx >= 2 || stepText.toLowerCase().includes('integration') || stepText.toLowerCase().includes('dashboard') || stepText.toLowerCase().includes('sync')) {
      type = 'OUTPUT_SYNC';
      title = `Node ${idx + 1}: Enterprise Integration & Output Sync`;
      icon = Zap;
      badgeColor = '#34d399';
      bgGradient = 'linear-gradient(135deg, rgba(52, 211, 153, 0.12) 0%, rgba(16, 185, 129, 0.04) 100%)';
      borderColor = 'rgba(52, 211, 153, 0.35)';
    }

    return {
      id: idx + 1,
      type,
      title,
      text: stepText,
      icon,
      badgeColor,
      bgGradient,
      borderColor
    };
  });

  return (
    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '0px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        background: 'rgba(5, 10, 12, 0.8)',
        padding: '10px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(73, 220, 177, 0.2)'
      }}>
        <span style={{ fontSize: '0.78rem', color: '#49dcb1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitBranch size={16} color="#49dcb1" /> TECHNICAL ARCHITECTURE FLOWCHART
        </span>
        <span style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600 }}>
          Connected Node Diagram • {activeTools.length} Active Tools
        </span>
      </div>

      {nodes.map((node, i) => {
        const NodeIcon = node.icon;
        return (
          <React.Fragment key={i}>
            <div style={{
              background: node.bgGradient,
              border: `1px solid ${node.borderColor}`,
              borderRadius: '14px',
              padding: '20px 24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: `1px solid ${node.badgeColor}`,
                    color: node.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <NodeIcon size={20} />
                  </div>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {node.title}
                  </h5>
                </div>

                <span style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: `1px solid ${node.badgeColor}`,
                  color: node.badgeColor,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  FLOW NODE 0{node.id}
                </span>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#e2e8f0', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
                {node.text}
              </p>

              {activeTools.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {activeTools.slice(i * 2, i * 2 + 2).map((t, ti) => (
                    <span key={ti} style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(73, 220, 177, 0.3)',
                      color: '#49dcb1',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      • {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {i < nodes.length - 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
                <div style={{ width: '2px', height: '16px', background: 'linear-gradient(180deg, #49dcb1 0%, rgba(73, 220, 177, 0.3) 100%)' }} />
                
                {i === 0 ? (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid #fbbf24',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    margin: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 0 14px rgba(251, 191, 36, 0.25)'
                  }}>
                    <ShieldCheck size={16} color="#fbbf24" />
                    <span style={{ fontSize: '0.76rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      DECISION GATEWAY: Rule Validation & Confidence Check
                    </span>
                  </div>
                ) : (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'rgba(73, 220, 177, 0.15)',
                    border: '1px solid #49dcb1',
                    color: '#49dcb1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    boxShadow: '0 0 10px rgba(73, 220, 177, 0.3)'
                  }}>
                    <ArrowDown size={14} />
                  </div>
                )}

                <div style={{ width: '2px', height: '16px', background: 'linear-gradient(180deg, rgba(73, 220, 177, 0.3) 0%, #49dcb1 100%)' }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const COMMON_ALTERNATIVES = [
  'UiPath', 'Power Automate', 'Automation Anywhere',
  'AWS Textract', 'Tesseract OCR', 'Google Document AI', 'ABBYY FlexiCapture',
  'Python Scripting', 'FastAPI', 'Node.js / Express', 'REST APIs',
  'SAP GUI Scripting API', 'PostgreSQL', 'Snowflake', 'Power BI', 'Zapier / Make'
];

export default function DeepAnalysisView({ solution, analysis, onGenerateDocuments, loading }) {
  const [isStepsOpen, setIsStepsOpen] = useState(true);
  const [activeTools, setActiveTools] = useState(solution?.tools || []);
  const [removedTools, setRemovedTools] = useState([]);
  const [showAltDrawer, setShowAltDrawer] = useState(false);
  const [customInput, setCustomInput] = useState('');

  React.useEffect(() => {
    if (solution?.tools) {
      setActiveTools(solution.tools);
    }
  }, [solution]);

  const handleRemoveTool = (toolToRemove) => {
    const idx = activeTools.indexOf(toolToRemove);
    const updated = activeTools.filter(t => t !== toolToRemove);
    setActiveTools(updated);
    if (solution) solution.tools = updated;
    setRemovedTools(prev => [...prev, { tool: toolToRemove, index: idx >= 0 ? idx : updated.length }]);
  };

  const handleUndoRemove = () => {
    if (!removedTools || removedTools.length === 0) return;
    const lastRemoved = removedTools[removedTools.length - 1];
    setRemovedTools(prev => prev.slice(0, -1));

    const updated = [...activeTools];
    if (lastRemoved.index !== undefined && lastRemoved.index <= updated.length) {
      updated.splice(lastRemoved.index, 0, lastRemoved.tool);
    } else {
      updated.push(lastRemoved.tool);
    }
    setActiveTools(updated);
    if (solution) solution.tools = updated;
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (['INPUT', 'TEXTAREA'].includes(activeTag)) {
          return;
        }
        if (removedTools.length > 0) {
          e.preventDefault();
          handleUndoRemove();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [removedTools, activeTools]);

  const handleAddTool = (toolToAdd) => {
    if (!toolToAdd || !isValidToolName(toolToAdd)) return;
    const cleanTool = formatToolName(toolToAdd);
    if (activeTools.includes(cleanTool)) return;
    const updated = [...activeTools, cleanTool];
    setActiveTools(updated);
    if (solution) solution.tools = updated;
  };

  if (!analysis) return null;

  const rawApproachText = getDynamicImplementationApproach(analysis, activeTools);
  const implementationSteps = parseImplementationSteps(rawApproachText);

  return (
    <div className="glass-panel fade-in" style={{ padding: '36px', maxWidth: '1440px', width: '100%', margin: '0 auto 36px' }}>
      {/* Stage Header & Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-mint" style={{ fontSize: '0.8rem' }}>
              <Sparkles size={14} /> Stage 4: Solution Analysis Agent
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
            Selected Solution: <strong style={{ color: '#49dcb1', fontWeight: 700 }}>{solution?.title}</strong>
          </p>
        </div>
      </div>

      {/* Confirmed Tech Stack Summary (Read-Only) */}
      <div style={{
        background: 'rgba(9, 18, 20, 0.85)',
        border: '1px solid rgba(73, 220, 177, 0.3)',
        borderRadius: '14px',
        padding: '14px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#49dcb1', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.05em' }}>
            <Wrench size={15} color="#49dcb1" /> Architecture Tech Stack:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {Array.isArray(activeTools) && activeTools.length > 0 ? (
              activeTools.map((t, idx) => (
                <span key={idx} style={{
                  background: 'rgba(73, 220, 177, 0.15)',
                  border: '1px solid rgba(73, 220, 177, 0.35)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: '#34d399',
                  fontWeight: 700
                }}>
                  {t}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Standard Enterprise Stack</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Recommended Implementation Methodology - Numbered Step Cards */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(18, 28, 32, 0.85) 0%, rgba(10, 20, 22, 0.85) 100%)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid rgba(73, 220, 177, 0.25)',
          boxShadow: '0 0 20px rgba(73, 220, 177, 0.1)'
        }}>
          <div 
            onClick={() => setIsStepsOpen(prev => !prev)}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              userSelect: 'none' 
            }}
          >
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#49dcb1', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GitBranch size={22} color="#49dcb1" /> Recommended Technical Implementation Flowchart
            </h4>
            <button
              type="button"
              style={{
                background: 'rgba(73, 220, 177, 0.15)',
                border: '1px solid rgba(73, 220, 177, 0.35)',
                color: '#49dcb1',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              {isStepsOpen ? (
                <><ChevronUp size={16} style={{ marginRight: '6px' }} /> Hide Flowchart ({implementationSteps.length} Nodes)</>
              ) : (
                <><ChevronDown size={16} style={{ marginRight: '6px' }} /> View Flowchart ({implementationSteps.length} Nodes)</>
              )}
            </button>
          </div>

          {isStepsOpen && (
            <VisualFlowchartDiagram steps={implementationSteps} activeTools={activeTools} />
          )}
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
              {Array.isArray(analysis.key_considerations) && analysis.key_considerations.map((item, idx) => (
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
              {Array.isArray(analysis.dependencies) && analysis.dependencies.map((dep, idx) => (
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

        {/* BOTTOM CTA: Proceed to Step 5 Document Export Hub */}
        <div style={{
          marginTop: '16px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={onGenerateDocuments}
            className="btn-primary"
            disabled={loading}
            style={{
              padding: '14px 32px',
              fontSize: '0.96rem',
              fontWeight: 800,
              boxShadow: '0 0 24px rgba(73, 220, 177, 0.4)',
              width: 'auto',
              maxWidth: '100%',
              whiteSpace: 'nowrap',
              justifyContent: 'center'
            }}
          >
            {loading ? (
              'Generating Executive (.docx) Specs...'
            ) : (
              <><FileText size={18} /> Proceed to Step 5: Load Document Export Hub <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
