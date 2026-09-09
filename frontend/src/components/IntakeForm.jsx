import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Lightbulb, AlertCircle } from 'lucide-react';

const SAMPLE_PROBLEMS = [
  "Revamp Project Status Decks",
  "Automate Invoice-to-GL Posting",
  "Triage Support Email Backlog",
  "Automate Lead Qualification & CRM Sync"
];

export default function IntakeForm({ onSubmit, loading, initialValue = '' }) {
  const [problemText, setProblemText] = useState(initialValue);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialValue) {
      setProblemText(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!problemText.trim() || problemText.trim().length < 5) {
      setError('Please provide a detailed problem statement.');
      return;
    }
    setError('');
    onSubmit(problemText);
  };

  const handleChipClick = (sample) => {
    if (sample === "Revamp Project Status Decks") {
      setProblemText("Efforts wasted in managing PowerPoint slide decks across 50 project managers every week.");
    } else if (sample === "Automate Invoice-to-GL Posting") {
      setProblemText("Manual invoice data extraction causing 3-day payment processing delays.");
    } else if (sample === "Triage Support Email Backlog") {
      setProblemText("Customer support team struggling with high triage backlog across email and chat channels.");
    } else if (sample === "Automate Lead Qualification & CRM Sync") {
      setProblemText("Sales reps spending 20 hours a week manually qualifying leads and updating CRM data.");
    } else {
      setProblemText(sample);
    }
    setError('');
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '36px', maxWidth: '880px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'rgba(73, 220, 177, 0.12)',
          color: '#49dcb1',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '14px',
          border: '1px solid rgba(73, 220, 177, 0.25)'
        }}>
          <Sparkles size={16} /> What's slowing you down? Tell us what to fix
        </div>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '10px', color: '#ffffff' }}>
          What operational challenge should we tackle first?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
          Share your pain points — inefficiencies, wasted hours, or outdated tools.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '22px' }}>
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Describe the challenge in your own words"
            rows={5}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: '14px',
              background: 'rgba(12, 19, 22, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '0.98rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#49dcb1';
              e.target.style.boxShadow = '0 0 16px rgba(73, 220, 177, 0.18)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#49dcb1' }}>Shift + Enter</kbd> to send • <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }}>Enter</kbd> for next line
            </span>
          </div>
          {error && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} /> {error}
            </p>
          )}
        </div>

        {/* Quick Starts Container Box matching user's exact reference style */}
        <div style={{
          background: 'rgba(9, 18, 20, 0.75)',
          border: '1px solid rgba(73, 220, 177, 0.22)',
          borderRadius: '16px',
          padding: '18px 22px',
          marginBottom: '28px'
        }}>
          <p style={{
            fontSize: '0.76rem',
            color: '#49dcb1',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 800,
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={14} /> TRY AN EXAMPLE
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {SAMPLE_PROBLEMS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(sample)}
                style={{
                  background: 'rgba(15, 24, 27, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '10px 18px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(73, 220, 177, 0.12)';
                  e.target.style.borderColor = '#49dcb1';
                  e.target.style.boxShadow = '0 0 12px rgba(73, 220, 177, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(15, 24, 27, 0.95)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '14px 28px', fontSize: '1rem' }}>
            {loading ? (
              <>
                Analyzing Challenge with Agent...
              </>
            ) : (
              <>
                <Send size={18} /> Start My Advisory Session
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
