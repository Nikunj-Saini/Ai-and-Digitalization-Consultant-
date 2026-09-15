import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowRight, Sparkles, AlertTriangle, Wrench, Check, X } from 'lucide-react';

const DEFAULT_CATEGORIES = {
  'Languages & Core Runtimes': ['Python', 'Node.js', 'TypeScript', 'SQL', 'C# / .NET'],
  'Frameworks & Libraries': ['FastAPI', 'Pandas', 'React', 'Next.js', 'LangChain', 'LlamaIndex'],
  'Enterprise APIs & Integrations': ['REST APIs', 'Power Automate', 'Zapier / Make', 'OpenAI API', 'AWS Textract'],
  'Data, DB & Analytics': ['PostgreSQL', 'Snowflake', 'Redis', 'MongoDB', 'Power BI', 'Qdrant']
};

export default function ClarificationChat({
  rawProblem,
  question,
  missingInfo = [],
  roundCount,
  onAnswerSubmit,
  onProceedToSolutions,
  loading,
  isClear,
  history = [],
  suggestedTechStack = [],
  recommendedCategories = {}
}) {
  const [answerText, setAnswerText] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState(() => {
    if (suggestedTechStack && Array.isArray(suggestedTechStack) && suggestedTechStack.length > 0) {
      return suggestedTechStack;
    }
    return ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs'];
  });

  // Sync state if suggestedTechStack updates from API
  React.useEffect(() => {
    if (suggestedTechStack && Array.isArray(suggestedTechStack) && suggestedTechStack.length > 0) {
      setSelectedTechStack(suggestedTechStack);
    }
  }, [suggestedTechStack]);

  const categoriesToDisplay = React.useMemo(() => {
    if (recommendedCategories && Object.keys(recommendedCategories).length > 0) {
      return recommendedCategories;
    }
    return DEFAULT_CATEGORIES;
  }, [recommendedCategories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    onAnswerSubmit(answerText);
    setAnswerText('');
  };

  const toggleTool = (tool) => {
    setSelectedTechStack(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '28px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(73, 220, 177, 0.15)',
            padding: '10px',
            borderRadius: '12px',
            color: '#49dcb1',
            border: '1px solid rgba(73, 220, 177, 0.3)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Conversational AI Clarification</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Interactive Chat Session with AI Consulting Agent
            </p>
          </div>
        </div>

        <span className="badge badge-mint" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
          Round {roundCount} of 2
        </span>
      </div>

      {/* Chat Conversation Thread Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
        
        {/* 1. Initial User Problem Statement Bubble (Right Aligned) */}
        {rawProblem && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1d4d46 0%, #163e38 100%)',
              border: '1px solid rgba(73, 220, 177, 0.35)',
              borderRadius: '20px 20px 4px 20px',
              padding: '14px 20px',
              color: '#ffffff',
              fontSize: '0.94rem',
              lineHeight: 1.5,
              maxWidth: '75%',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
            }}>
              {rawProblem}
            </div>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2dd4bf 0%, #059669 100%)',
              color: '#070b0e',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(73, 220, 177, 0.3)'
            }}>
              K
            </div>
          </div>
        )}

        {/* 2. History of Q&As */}
        {history.map((qa, index) => (
          <React.Fragment key={index}>
            {/* AI Question Bubble */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(73, 220, 177, 0.15)',
                border: '1px solid rgba(73, 220, 177, 0.3)',
                color: '#49dcb1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 0 12px rgba(73, 220, 177, 0.2)'
              }}>
                <Sparkles size={20} />
              </div>
              <div style={{
                background: 'rgba(15, 24, 27, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: '20px 20px 20px 4px',
                padding: '16px 22px',
                color: '#ffffff',
                fontSize: '0.94rem',
                lineHeight: 1.5,
                maxWidth: '80%',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
              }}>
                <span style={{ fontSize: '0.74rem', color: '#49dcb1', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  AI AGENT (ROUND {qa.round})
                </span>
                {qa.question}
              </div>
            </div>

            {/* User Answer Bubble */}
            {qa.answer && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1d4d46 0%, #163e38 100%)',
                  border: '1px solid rgba(73, 220, 177, 0.35)',
                  borderRadius: '20px 20px 4px 20px',
                  padding: '14px 20px',
                  color: '#ffffff',
                  fontSize: '0.94rem',
                  lineHeight: 1.5,
                  maxWidth: '75%',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}>
                  {qa.answer}
                </div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #059669 100%)',
                  color: '#070b0e',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}>
                  K
                </div>
              </div>
            )}
          </React.Fragment>
        ))}

        {/* 3. Current Active Question / Agent Response */}
        {!isClear && question ? (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(73, 220, 177, 0.15)',
              border: '1px solid rgba(73, 220, 177, 0.3)',
              color: '#49dcb1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(73, 220, 177, 0.2)'
            }}>
              <Sparkles size={20} />
            </div>
            <div style={{
              background: 'rgba(15, 24, 27, 0.95)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '20px 20px 20px 4px',
              padding: '18px 22px',
              color: '#ffffff',
              fontSize: '0.96rem',
              lineHeight: 1.5,
              maxWidth: '82%',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)'
            }}>
              <span style={{ fontSize: '0.74rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                AGENT CLARIFICATION NEEDED
              </span>
              <p style={{ marginBottom: '14px', fontWeight: 500, color: '#e2e8f0' }}>
                {question}
              </p>

              {missingInfo.length > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.78rem', color: '#fca5a5', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> Missing context identified:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {missingInfo.map((info, i) => (
                      <span key={i} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        • {info}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ marginTop: '12px' }}>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type your response to the AI Agent..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(7, 11, 14, 0.9)',
                    border: '1px solid rgba(73, 220, 177, 0.3)',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    marginBottom: '8px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#49dcb1' }}>Shift + Enter</kbd> to send • <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }}>Enter</kbd> for next line
                  </span>
                  <div>
                    <button type="submit" className="btn-primary" disabled={loading || !answerText.trim()} style={{ padding: '9px 20px', fontSize: '0.9rem' }}>
                      {loading ? 'Sending...' : <><Send size={15} /> Send Reply</>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Tech Stack Confirmation & AI Agent Verification Bubble when clear */
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(73, 220, 177, 0.15)',
              border: '1px solid rgba(73, 220, 177, 0.3)',
              color: '#49dcb1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(73, 220, 177, 0.2)'
            }}>
              <CheckCircle2 size={22} color="#34d399" />
            </div>
            <div style={{
              background: 'rgba(15, 24, 27, 0.95)',
              border: '1px solid rgba(73, 220, 177, 0.4)',
              borderRadius: '20px 20px 20px 4px',
              padding: '24px 28px',
              color: '#ffffff',
              fontSize: '0.96rem',
              lineHeight: 1.5,
              width: '100%',
              maxWidth: '900px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)'
            }}>
              <span style={{ fontSize: '0.76rem', color: '#49dcb1', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', letterSpacing: '0.04em' }}>
                <Wrench size={15} color="#49dcb1" /> CONFIRM ENTERPRISE TECH STACK & TOOLING PREFERENCE
              </span>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginBottom: '6px' }}>
                Requirement Gathering Complete!
              </p>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '18px', lineHeight: '1.5' }}>
                Before generating solution architectures, please verify or select your organization's preferred software & tools. AI will tailor the solutions ground-up around your stack:
              </p>

              {/* Active Selected Tech Stack Badge Box */}
              <div style={{
                background: 'rgba(7, 12, 15, 0.85)',
                border: '1px solid rgba(73, 220, 177, 0.25)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#49dcb1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ACTIVE SELECTED STACK ({selectedTechStack.length} {selectedTechStack.length === 1 ? 'TOOL' : 'TOOLS'} SELECTED)
                  </span>
                  {selectedTechStack.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTechStack([])}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <X size={12} /> Clear All
                    </button>
                  )}
                </div>

                {selectedTechStack.length === 0 ? (
                  <p style={{ color: '#f87171', fontSize: '0.84rem', fontStyle: 'italic', margin: 0 }}>
                    Please select at least one technology/tool from the Library to generate a solution.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedTechStack.map((tool) => (
                      <span
                        key={tool}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, rgba(73, 220, 177, 0.2) 0%, rgba(5, 150, 105, 0.25) 100%)',
                          border: '1px solid rgba(73, 220, 177, 0.45)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                          fontWeight: 600
                        }}
                      >
                        {tool}
                        <button
                          type="button"
                          onClick={() => toggleTool(tool)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '16px',
                            height: '16px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Categorized Tech Stack Selection Chips */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  RECOMMENDED ENTERPRISE TOOLS (CLICK CHIP TO ADD OR REMOVE):
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {Object.entries(categoriesToDisplay).map(([catName, tools]) => (
                    <div key={catName}>
                      <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        {catName}:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {tools.map((tool) => {
                          const isChecked = selectedTechStack.includes(tool);
                          return (
                            <button
                              key={tool}
                              type="button"
                              onClick={() => toggleTool(tool)}
                              style={{
                                background: isChecked ? 'rgba(73, 220, 177, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                                border: isChecked ? '1.5px solid #49dcb1' : '1px solid rgba(255, 255, 255, 0.12)',
                                color: isChecked ? '#49dcb1' : '#cbd5e1',
                                borderRadius: '8px',
                                padding: '6px 14px',
                                fontSize: '0.82rem',
                                fontWeight: isChecked ? 700 : 500,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {isChecked ? <CheckCircle2 size={14} color="#49dcb1" /> : null}
                              {tool}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation warning banner when 0 tools selected and library tools are required */}
              {selectedTechStack.length === 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.14)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '18px',
                  color: '#fca5a5',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0 }} />
                  <span>Please select at least one technology/tool from the Library to generate a solution.</span>
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                  Confirmed Tech Stack ({selectedTechStack.length} tools): <strong style={{ color: selectedTechStack.length > 0 ? '#49dcb1' : '#f87171' }}>{selectedTechStack.length > 0 ? selectedTechStack.join(', ') : 'None selected'}</strong>
                </span>
                <button
                  onClick={() => {
                    const requiresLibraryTool = (suggestedTechStack && suggestedTechStack.length > 0) ||
                                                 (recommendedCategories && Object.keys(recommendedCategories).length > 0);
                    if (selectedTechStack.length === 0 && requiresLibraryTool) {
                      onProceedToSolutions([]);
                      return;
                    }
                    onProceedToSolutions(selectedTechStack);
                  }}
                  className="btn-primary"
                  disabled={loading}
                  style={{
                    padding: '12px 26px',
                    fontSize: '0.94rem',
                    opacity: loading ? 0.5 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Formulating AI Solutions...' : <><ArrowRight size={18} /> Confirm Tech Stack & Generate Solutions ({selectedTechStack.length} {selectedTechStack.length === 1 ? 'Tool' : 'Tools'})</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
