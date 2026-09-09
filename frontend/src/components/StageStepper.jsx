import React from 'react';
import { CheckCircle2, HelpCircle, Layers, MousePointerClick, FileText, SearchCheck, Cpu } from 'lucide-react';

const STAGES = [
  { key: 'INTAKE', label: '1. Intake', icon: Layers },
  { key: 'UNDERSTANDING', label: '2. Clarity Check', icon: SearchCheck },
  { key: 'CLARIFICATION', label: '3. Clarification', icon: HelpCircle },
  { key: 'SOLUTIONS_GENERATED', label: '4. Solutions Deck', icon: Layers },
  { key: 'SOLUTION_CHOICE', label: '5. Selection', icon: MousePointerClick },
  { key: 'SOLUTION_SELECTED', label: '6. Deep Analysis', icon: Cpu },
  { key: 'DOCUMENTS_GENERATED', label: '7. Document Hub', icon: FileText }
];

export default function StageStepper({ currentStage, roundCount, onStageSelect, maxUnlockedStage }) {
  const getStageIndex = (stageKey) => {
    if (stageKey === 'INTAKE') return 0;
    if (stageKey === 'UNDERSTANDING') return 1;
    if (stageKey === 'CLARIFICATION') return 2;
    if (stageKey === 'SOLUTIONS_READY' || stageKey === 'SOLUTIONS_GENERATED') return 3;
    if (stageKey === 'SOLUTION_CHOICE') return 4;
    if (stageKey === 'SOLUTION_SELECTED') return 5;
    if (stageKey === 'DOCUMENTS_GENERATED') return 6;
    return 0;
  };

  const activeIdx = getStageIndex(currentStage);
  const maxIdx = maxUnlockedStage ? getStageIndex(maxUnlockedStage) : activeIdx;

  return (
    <div className="glass-panel" style={{ padding: '18px 24px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        
        {STAGES.map((stage, idx) => {
          const IconComponent = stage.icon;
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isUnlocked = idx <= Math.max(activeIdx, maxIdx);

          return (
            <div 
              key={stage.key} 
              onClick={() => {
                if (isUnlocked && onStageSelect) {
                  onStageSelect(stage.key);
                }
              }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                flex: 1, 
                position: 'relative', 
                zIndex: 2,
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : 0.45,
                transition: 'opacity 0.2s ease'
              }}
              title={isUnlocked ? `Click to go to ${stage.label}` : 'Stage locked'}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDone 
                  ? 'linear-gradient(135deg, #34d399 0%, #059669 100%)' 
                  : isCurrent 
                    ? 'rgba(73, 220, 177, 0.15)' 
                    : 'rgba(18, 28, 32, 0.8)',
                border: isCurrent ? '2px solid #49dcb1' : isDone ? '1px solid #34d399' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isCurrent ? '#49dcb1' : isDone ? '#070b0e' : '#64748b',
                boxShadow: isCurrent ? '0 0 18px rgba(73, 220, 177, 0.35)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                {isDone ? <CheckCircle2 size={18} color="#070b0e" /> : <IconComponent size={18} />}
              </div>

              <span style={{
                fontSize: '0.78rem',
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? '#49dcb1' : isDone ? '#ffffff' : '#64748b',
                marginTop: '8px',
                textAlign: 'center'
              }}>
                {stage.label}
                {stage.key === 'CLARIFICATION' && (
                  <span style={{ display: 'block', fontSize: '0.68rem', color: '#fbbf24', marginTop: '2px' }}>
                    Round {roundCount}/2
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

