import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, Layers, ShieldCheck, Loader2, CheckCircle2, Clock, Lightbulb } from 'lucide-react';

const ROTATING_MESSAGES = [
  "Understanding your challenge and matching it to your domain…",
  "Designing your solution & tailoring implementation steps…",
  "Finalizing architecture, security, and document exports…"
];

const FLAVOR_TIPS = [
  "Did you know? Our AI engine validates every solution against enterprise governance guidelines.",
  "Pro-tip: Downloadable BRD, PRD, and Implementation Plans include visual flowcharts and architecture maps.",
  "Analyzing architectural trade-offs to minimize technical debt and execution risk..."
];

export default function LoadingModal({ show, message }) {
  const [activeStep, setActiveStep] = useState(1);
  const [progressPercent, setProgressPercent] = useState(18);
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (!show) {
      setActiveStep(1);
      setProgressPercent(18);
      setMessageIndex(0);
      setTipIndex(0);
      return;
    }

    // Step 1 -> 2 -> 3 Progress animation timer
    const step1Timer = setTimeout(() => {
      setActiveStep(2);
      setProgressPercent(58);
      setMessageIndex(1);
    }, 3200);

    const step2Timer = setTimeout(() => {
      setActiveStep(3);
      setProgressPercent(90);
      setMessageIndex(2);
    }, 7000);

    // Tip rotation timer
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % FLAVOR_TIPS.length);
    }, 4500);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearInterval(tipInterval);
    };
  }, [show]);

  if (!show) return null;

  const currentMessage = message || ROTATING_MESSAGES[messageIndex];

  const steps = [
    {
      id: 1,
      label: "Mapping out implementation approach & tech stack…",
      icon: Sparkles,
      color: "#49dcb1"
    },
    {
      id: 2,
      label: "Designing system architecture & integration points…",
      icon: Layers,
      color: "#38bdf8"
    },
    {
      id: 3,
      label: "Assessing risks & governance requirements…",
      icon: ShieldCheck,
      color: "#fbbf24"
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(7, 11, 14, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel fade-in" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '38px 32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(18, 28, 32, 0.96) 0%, rgba(7, 24, 22, 0.96) 100%)',
        border: '1.5px solid #49dcb1',
        borderRadius: '24px',
        boxShadow: '0 0 45px rgba(73, 220, 177, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Progress Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #49dcb1 0%, #38bdf8 100%)',
            transition: 'width 0.8s ease-in-out',
            boxShadow: '0 0 12px #49dcb1'
          }} />
        </div>

        {/* Step Counter Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 14px',
          borderRadius: '16px',
          background: 'rgba(73, 220, 177, 0.12)',
          border: '1px solid rgba(73, 220, 177, 0.25)',
          color: '#49dcb1',
          fontSize: '0.78rem',
          fontWeight: 700,
          marginBottom: '18px'
        }}>
          <Sparkles size={13} /> Step {Math.min(activeStep, 3)} of 3
        </div>

        {/* Glowing Animated AI Core */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(73, 220, 177, 0.22) 0%, rgba(5, 150, 105, 0.18) 100%)',
          border: '1.5px solid #49dcb1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 30px rgba(73, 220, 177, 0.45)',
          position: 'relative'
        }}>
          <Cpu size={40} color="#49dcb1" style={{ animation: 'pulse 1.8s infinite ease-in-out' }} />
          <Loader2 size={78} color="#49dcb1" style={{
            position: 'absolute',
            animation: 'spin 2s linear infinite',
            opacity: 0.6
          }} />
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px', letterSpacing: '-0.01em' }}>
          Architecting Your Solution
        </h3>

        <p style={{ fontSize: '0.94rem', color: '#49dcb1', fontWeight: 600, marginBottom: '22px', lineHeight: 1.4, minHeight: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentMessage}
        </p>

        {/* Live Progress Milestones Checklist Container */}
        <div style={{
          background: 'rgba(7, 11, 14, 0.75)',
          borderRadius: '16px',
          padding: '18px 20px',
          border: '1px solid rgba(73, 220, 177, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left',
          marginBottom: '20px'
        }}>
          {steps.map((step) => {
            const IconComponent = step.icon;
            const isDone = activeStep > step.id;
            const isActive = activeStep === step.id;

            return (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.86rem',
                  color: isDone ? '#49dcb1' : isActive ? '#ffffff' : '#64748b',
                  fontWeight: isActive ? 700 : isDone ? 600 : 400,
                  transition: 'all 0.3s ease',
                  opacity: isActive || isDone ? 1 : 0.65
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={18} color="#49dcb1" style={{ flexShrink: 0 }} />
                ) : isActive ? (
                  <Loader2 size={18} color={step.color} style={{ flexShrink: 0, animation: 'spin 1.5s linear infinite' }} />
                ) : (
                  <IconComponent size={18} color="#64748b" style={{ flexShrink: 0 }} />
                )}
                <span>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Time Expectation Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: '#94a3b8',
          fontSize: '0.8rem',
          marginBottom: '16px'
        }}>
          <Clock size={14} color="#38bdf8" />
          <span>This usually takes ~10–15 seconds</span>
        </div>

        {/* Rotating Flavor Text / Pro Tips */}
        <div style={{
          background: 'rgba(73, 220, 177, 0.06)',
          border: '1px solid rgba(73, 220, 177, 0.15)',
          borderRadius: '12px',
          padding: '10px 14px',
          fontSize: '0.78rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'left'
        }}>
          <Lightbulb size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
          <span style={{ transition: 'all 0.4s ease' }}>
            {FLAVOR_TIPS[tipIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}
