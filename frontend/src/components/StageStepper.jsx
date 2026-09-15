import React from 'react';
import { CheckCircle2, HelpCircle, Layers, FileText, Cpu } from 'lucide-react';

const STAGES = [
  { key: 'INTAKE', label: '1. Intake', icon: Layers },
  { key: 'CLARIFICATION', label: '2. Clarification', icon: HelpCircle },
  { key: 'SOLUTIONS_GENERATED', label: '3. Solutions Deck', icon: Layers },
  { key: 'SOLUTION_SELECTED', label: '4. Deep Analysis', icon: Cpu },
  { key: 'DOCUMENTS_GENERATED', label: '5. Document Hub', icon: FileText }
];

export default function StageStepper({ currentStage, roundCount, onStageSelect, maxUnlockedStage }) {
  const getStageIndex = (stageKey) => {
    if (stageKey === 'INTAKE') return 0;
    if (stageKey === 'CLARIFICATION' || stageKey === 'UNDERSTANDING') return 1;
    if (stageKey === 'SOLUTIONS_READY' || stageKey === 'SOLUTIONS_GENERATED' || stageKey === 'SOLUTION_CHOICE') return 2;
    if (stageKey === 'SOLUTION_SELECTED') return 3;
    if (stageKey === 'DOCUMENTS_GENERATED') return 4;
    return 0;
  };

  const activeIdx = getStageIndex(currentStage);
  const maxIdx = maxUnlockedStage ? getStageIndex(maxUnlockedStage) : activeIdx;

  return (
    <div 
      className="glass-panel" 
      style={{ 
        position: 'sticky',
        top: '6px',
        zIndex: 100,
        padding: '10px 20px', 
        marginBottom: '14px',
        background: 'rgba(9, 15, 17, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(73, 220, 177, 0.35)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
        borderRadius: '14px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', overflowX: 'auto', padding: '2px 0' }}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isUnlocked = idx <= Math.max(activeIdx, maxIdx);

          return (
            <React.Fragment key={stage.key}>
              <div 
                onClick={() => {
                  if (isUnlocked && onStageSelect) {
                    onStageSelect(stage.key);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: isCurrent 
                    ? 'rgba(73, 220, 177, 0.12)' 
                    : isDone 
                      ? 'rgba(73, 220, 177, 0.05)' 
                      : 'transparent',
                  border: isCurrent 
                    ? '1px solid #49dcb1' 
                    : isDone 
                      ? '1px solid rgba(52, 211, 153, 0.3)' 
                      : '1px solid transparent',
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.45,
                  transition: 'all 0.25s ease',
                  flexShrink: 0
                }}
                title={isUnlocked ? `Click to view ${stage.label}` : 'Stage locked'}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isCurrent 
                    ? '#49dcb1' 
                    : isDone 
                      ? 'rgba(52, 211, 153, 0.2)' 
                      : 'rgba(255, 255, 255, 0.06)',
                  border: isCurrent ? 'none' : isDone ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.15)',
                  color: isCurrent ? '#070b0e' : isDone ? '#34d399' : '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  transition: 'all 0.25s ease'
                }}>
                  {isDone ? <CheckCircle2 size={14} color="#34d399" /> : (idx + 1)}
                </div>

                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? 800 : isDone ? 700 : 500,
                  color: isCurrent ? '#49dcb1' : isDone ? '#e2e8f0' : '#64748b',
                  whiteSpace: 'nowrap'
                }}>
                  {stage.label}
                  {stage.key === 'CLARIFICATION' && (
                    <span style={{ fontSize: '0.68rem', color: '#fbbf24', marginLeft: '4px', fontWeight: 700 }}>
                      ({roundCount}/2)
                    </span>
                  )}
                </span>
              </div>

              {/* Connecting Horizontal Line Segment */}
              {idx < STAGES.length - 1 && (
                <div style={{
                  flex: 1,
                  minWidth: '20px',
                  height: '2px',
                  background: idx < activeIdx ? 'linear-gradient(90deg, #34d399 0%, #49dcb1 100%)' : 'rgba(255, 255, 255, 0.12)',
                  transition: 'all 0.3s ease',
                  flexShrink: 1
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
