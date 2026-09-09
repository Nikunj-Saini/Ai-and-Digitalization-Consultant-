import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowRight, Sparkles, AlertTriangle, User } from 'lucide-react';

export default function ClarificationChat({
  rawProblem,
  question,
  missingInfo = [],
  roundCount,
  onAnswerSubmit,
  onProceedToSolutions,
  loading,
  isClear,
  history = []
}) {
  const [answerText, setAnswerText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    onAnswerSubmit(answerText);
    setAnswerText('');
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '28px', maxWidth: '900px', margin: '0 auto' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#49dcb1' }}>Shift + Enter</kbd> to send • <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }}>Enter</kbd> for next line
                  </span>
                  <button type="submit" className="btn-primary" disabled={loading || !answerText.trim()} style={{ padding: '9px 20px', fontSize: '0.9rem' }}>
                    {loading ? 'Sending...' : <><Send size={15} /> Send Reply</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Confirmation AI Agent Bubble when clear */
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
              border: '1px solid rgba(73, 220, 177, 0.3)',
              borderRadius: '20px 20px 20px 4px',
              padding: '20px 24px',
              color: '#ffffff',
              fontSize: '0.96rem',
              lineHeight: 1.5,
              maxWidth: '82%',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5)'
            }}>
              <span style={{ fontSize: '0.76rem', color: '#49dcb1', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                AGENT VERIFICATION
              </span>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
                Requirement Gathering Complete!
              </p>
              <p style={{ fontSize: '0.92rem', color: '#cbd5e1', marginBottom: '18px' }}>
                I have sufficient context regarding your operational challenge. Ready to generate 3 tailored digital transformation options for you.
              </p>
              <button onClick={onProceedToSolutions} className="btn-primary" disabled={loading} style={{ padding: '12px 24px' }}>
                {loading ? 'Formulating AI Solutions...' : <><ArrowRight size={18} /> Generate Solution Options</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
