import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StageStepper from './components/StageStepper';
import IntakeForm from './components/IntakeForm';
import ClarificationChat from './components/ClarificationChat';
import SolutionDeck from './components/SolutionDeck';
import DeepAnalysisView from './components/DeepAnalysisView';
import DocumentHub from './components/DocumentHub';
import LoadingModal from './components/LoadingModal';
import HistoryDrawer from './components/HistoryDrawer';
import Footer from './components/Footer';
import { ArrowLeft } from 'lucide-react';
import {
  submitProblem,
  submitClarification,
  generateSolutions,
  selectSolution,
  generateDocuments
} from './services/api';

const normalizeStage = (rawStage) => {
  if (!rawStage) return 'INTAKE';
  const s = String(rawStage).toUpperCase();
  if (s === 'INTAKE') return 'INTAKE';
  if (s === 'CLARIFICATION' || s === 'UNDERSTANDING') return 'CLARIFICATION';
  if (s === 'SOLUTIONS_GENERATED' || s === 'SOLUTIONS_READY' || s === 'SOLUTION_CHOICE') return 'SOLUTIONS_GENERATED';
  if (s === 'SOLUTION_SELECTED') return 'SOLUTION_SELECTED';
  if (s === 'DOCUMENTS_GENERATED') return 'DOCUMENTS_GENERATED';
  return 'INTAKE';
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel fade-in" style={{ padding: '40px 24px', maxWidth: '600px', margin: '40px auto', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171', marginBottom: '8px' }}>
            Session Restore Encountered an Issue
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
            {this.state.error?.message || 'Unable to render restored history data.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="btn-primary"
            style={{ padding: '10px 24px', margin: '0 auto' }}
          >
            Start New Session
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [stage, setStage] = useState('INTAKE'); // INTAKE, CLARIFICATION, SOLUTIONS_GENERATED, SOLUTION_SELECTED, DOCUMENTS_GENERATED
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing Solution Architecture with AI Agent...');
  const [error, setError] = useState(null);

  // Intake / Clarification State
  const [rawProblem, setRawProblem] = useState('');
  const [clarificationQuestion, setClarificationQuestion] = useState(null);
  const [missingInfo, setMissingInfo] = useState([]);
  const [roundCount, setRoundCount] = useState(0);
  const [isClear, setIsClear] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);

  // Solutions State
  const [solutions, setSolutions] = useState([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [suggestedTechStack, setSuggestedTechStack] = useState([]);
  const [confirmedTechStack, setConfirmedTechStack] = useState([]);
  const [recommendedCategories, setRecommendedCategories] = useState({});

  // Document State
  const [documents, setDocuments] = useState([]);
  const [successCriteriaBenefits, setSuccessCriteriaBenefits] = useState(null);
  const [maxUnlockedStage, setMaxUnlockedStage] = useState('INTAKE');

  // History Drawer State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  // Auto scroll to top on stage change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage]);

  // Load history count on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('da_question_history');
      if (stored) {
        setHistoryCount(JSON.parse(stored).length);
      }
    } catch (e) {
      console.error("Failed to count history:", e);
    }
  }, [isHistoryOpen]);

  const saveOrUpdateHistory = (problemText, sessId, currentStage, overrideData = {}) => {
    if (!problemText) return;
    try {
      const stored = localStorage.getItem('da_question_history');
      const list = stored ? JSON.parse(stored) : [];
      const targetId = sessId || `hist_${Date.now()}`;
      const existingIndex = list.findIndex(item => item.id === targetId || (item.sessionId && item.sessionId === sessId));

      const normStage = normalizeStage(currentStage);

      const snapshot = {
        sessionId: sessId,
        rawProblem: problemText,
        stage: normStage,
        maxUnlockedStage: normalizeStage(overrideData.maxUnlockedStage || maxUnlockedStage || normStage),
        clarificationQuestion: overrideData.clarificationQuestion !== undefined ? overrideData.clarificationQuestion : clarificationQuestion,
        missingInfo: overrideData.missingInfo || missingInfo,
        roundCount: overrideData.roundCount !== undefined ? overrideData.roundCount : roundCount,
        isClear: overrideData.isClear !== undefined ? overrideData.isClear : isClear,
        qaHistory: overrideData.qaHistory || qaHistory,
        solutions: overrideData.solutions || solutions,
        selectedSolutionId: overrideData.selectedSolutionId !== undefined ? overrideData.selectedSolutionId : selectedSolutionId,
        selectedSolution: overrideData.selectedSolution || selectedSolution,
        analysis: overrideData.analysis || analysis,
        documents: overrideData.documents || documents,
        successCriteriaBenefits: overrideData.successCriteriaBenefits || successCriteriaBenefits
      };

      const newItem = {
        id: targetId,
        sessionId: sessId,
        question: problemText,
        timestamp: Date.now(),
        dateFormatted: new Date().toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        stage: normStage,
        fullState: snapshot
      };

      if (existingIndex >= 0) {
        list[existingIndex] = { ...list[existingIndex], ...newItem };
      } else {
        list.unshift(newItem);
      }

      localStorage.setItem('da_question_history', JSON.stringify(list.slice(0, 50)));
      setHistoryCount(list.length);
    } catch (e) {
      console.error("Error saving history:", e);
    }
  };

  const handleResetSession = () => {
    setSessionId(null);
    setRawProblem('');
    setStage('INTAKE');
    setMaxUnlockedStage('INTAKE');
    setLoading(false);
    setError(null);
    setClarificationQuestion(null);
    setMissingInfo([]);
    setRoundCount(0);
    setIsClear(false);
    setQaHistory([]);
    setSolutions([]);
    setSelectedSolutionId(null);
    setSelectedSolution(null);
    setAnalysis(null);
    setSuggestedTechStack([]);
    setConfirmedTechStack([]);
    setRecommendedCategories({});
    setDocuments([]);
    setSuccessCriteriaBenefits(null);
  };

  // 1. Submit Problem Statement
  const handleSubmitProblem = async (problemText) => {
    setLoadingMessage('Analyzing Problem Statement & Domain Grounding with AI Agent...');
    setLoading(true);
    setError(null);
    setRawProblem(problemText);
    try {
      const res = await submitProblem(problemText);
      setSessionId(res.session_id);
      setIsClear(res.is_clear);
      setRoundCount(res.clarification_round);
      setClarificationQuestion(res.question);
      setMissingInfo(res.missing_info || []);
      if (res.suggested_tech_stack && res.suggested_tech_stack.length > 0) {
        setSuggestedTechStack(res.suggested_tech_stack);
      }
      if (res.recommended_categories) {
        setRecommendedCategories(res.recommended_categories);
      }

      const nextStage = 'CLARIFICATION';
      setStage(nextStage);
      setMaxUnlockedStage(nextStage);

      // Save into Question History
      saveOrUpdateHistory(problemText, res.session_id, nextStage, {
        maxUnlockedStage: nextStage,
        clarificationQuestion: res.question,
        missingInfo: res.missing_info || [],
        roundCount: res.clarification_round,
        isClear: res.is_clear,
        suggestedTechStack: res.suggested_tech_stack || [],
        recommendedCategories: res.recommended_categories || {},
        qaHistory: []
      });
    } catch (err) {
      setError(err.message || 'Error submitting problem statement');
    } finally {
      setLoading(false);
    }
  };

  // 2. Answer Clarification
  const handleAnswerSubmit = async (answerText) => {
    if (!sessionId) return;
    setLoadingMessage('Processing Clarification & Refining Requirement Context with AI Agent...');
    setLoading(true);
    setError(null);
    try {
      const currentQ = clarificationQuestion;
      const currentR = roundCount;
      const res = await submitClarification(sessionId, answerText);
      
      const newQaHistory = [...qaHistory, { round: currentR, question: currentQ, answer: answerText }];
      setQaHistory(newQaHistory);
      setIsClear(res.is_clear);
      setRoundCount(res.clarification_round);
      setClarificationQuestion(res.question);
      setMissingInfo(res.missing_info || []);
      if (res.suggested_tech_stack && res.suggested_tech_stack.length > 0) {
        setSuggestedTechStack(res.suggested_tech_stack);
      }
      if (res.recommended_categories) {
        setRecommendedCategories(res.recommended_categories);
      }
      
      const nextStage = normalizeStage(res.stage);
      setStage(nextStage);
      setMaxUnlockedStage(nextStage);

      saveOrUpdateHistory(rawProblem, sessionId, nextStage, {
        maxUnlockedStage: nextStage,
        clarificationQuestion: res.question,
        missingInfo: res.missing_info || [],
        roundCount: res.clarification_round,
        isClear: res.is_clear,
        suggestedTechStack: res.suggested_tech_stack || suggestedTechStack,
        recommendedCategories: res.recommended_categories || recommendedCategories,
        qaHistory: newQaHistory
      });
    } catch (err) {
      setError(err.message || 'Error submitting clarification');
    } finally {
      setLoading(false);
    }
  };

  // 3. Force Proceed to Solutions with Confirmed Tech Stack
  const handleProceedToSolutions = async (preferredTools = null) => {
    if (!sessionId) return;

    const hasSelectedTools = Array.isArray(preferredTools) && preferredTools.length > 0;

    // Check if the solution genuinely requires a Library technology/tool
    const requiresLibraryTool = (suggestedTechStack && suggestedTechStack.length > 0) ||
                                 (recommendedCategories && Object.keys(recommendedCategories).length > 0);

    if (!hasSelectedTools && requiresLibraryTool) {
      setError('Please select at least one technology/tool from the Library to generate a solution.');
      return;
    }

    const finalTools = hasSelectedTools ? preferredTools : [];

    setConfirmedTechStack(finalTools);
    setLoadingMessage('Formulating Tailored Digital Transformation Solutions with AI Agent...');
    setLoading(true);
    setError(null);
    try {
      const solRes = await generateSolutions(sessionId, preferredTools);
      const finalSolutions = solRes.solutions || [];

      setSolutions(finalSolutions);
      const nextStage = normalizeStage(solRes.stage);
      setStage(nextStage);
      setMaxUnlockedStage(nextStage);

      saveOrUpdateHistory(rawProblem, sessionId, nextStage, {
        maxUnlockedStage: nextStage,
        solutions: finalSolutions
      });
    } catch (err) {
      setError(err.message || 'Error generating solution options');
    } finally {
      setLoading(false);
    }
  };

  // 4. Select Solution Option with Custom Tools
  const handleSelectSolution = async (solId, customTools = null) => {
    if (!sessionId) return;
    setLoadingMessage('Performing Deep Architectural Breakdown & Risk Analysis for Selected Solution...');
    setLoading(true);
    setError(null);
    setSelectedSolutionId(solId);
    
    const updatedSolutions = solutions.map(s => {
      if (s.id === solId || s.id === undefined) {
        return { ...s, is_selected: s.id === solId, tools: customTools !== null ? customTools : s.tools };
      }
      return { ...s, is_selected: false };
    });
    setSolutions(updatedSolutions);

    try {
      const res = await selectSolution(sessionId, solId);
      const selSol = { ...res.selected_solution };
      if (customTools !== null) {
        selSol.tools = customTools;
      }
      setSelectedSolution(selSol);
      setAnalysis(res.analysis);

      if (stage === 'DOCUMENTS_GENERATED') {
        const docRes = await generateDocuments(sessionId);
        setDocuments(docRes.documents);
        setSuccessCriteriaBenefits(docRes.success_criteria_benefits);

        saveOrUpdateHistory(rawProblem, sessionId, 'DOCUMENTS_GENERATED', {
          solutions: updatedSolutions,
          selectedSolutionId: solId,
          selectedSolution: selSol,
          analysis: res.analysis,
          documents: docRes.documents,
          successCriteriaBenefits: docRes.success_criteria_benefits
        });
      } else {
        setDocuments([]);
        setSuccessCriteriaBenefits(null);
        setStage('SOLUTION_SELECTED');
        setMaxUnlockedStage('SOLUTION_SELECTED');

        saveOrUpdateHistory(rawProblem, sessionId, 'SOLUTION_SELECTED', {
          maxUnlockedStage: 'SOLUTION_SELECTED',
          solutions: updatedSolutions,
          selectedSolutionId: solId,
          selectedSolution: selSol,
          analysis: res.analysis
        });
      }
    } catch (err) {
      setError(err.message || 'Error processing selected solution option');
    } finally {
      setLoading(false);
    }
  };

  // 5. Generate Documents
  const handleGenerateDocuments = async () => {
    if (!sessionId) return;
    setLoadingMessage('Synthesizing Executive BRD, PRD & Implementation Plan (.docx) Specs with AI Agent...');
    setLoading(true);
    setError(null);
    try {
      const res = await generateDocuments(sessionId);
      setDocuments(res.documents);
      setSuccessCriteriaBenefits(res.success_criteria_benefits);
      setStage('DOCUMENTS_GENERATED');
      setMaxUnlockedStage('DOCUMENTS_GENERATED');

      saveOrUpdateHistory(rawProblem, sessionId, 'DOCUMENTS_GENERATED', {
        maxUnlockedStage: 'DOCUMENTS_GENERATED',
        documents: res.documents,
        successCriteriaBenefits: res.success_criteria_benefits
      });
    } catch (err) {
      setError(err.message || 'Error generating requirement documents');
    } finally {
      setLoading(false);
    }
  };

  const handleStageSelect = (targetStageKey) => {
    const norm = normalizeStage(targetStageKey);

    if (norm === 'DOCUMENTS_GENERATED') {
      if (documents.length === 0 && sessionId) {
        handleGenerateDocuments();
      } else {
        setStage('DOCUMENTS_GENERATED');
      }
      return;
    }
    
    if (norm === 'SOLUTIONS_GENERATED') {
      if (solutions.length === 0 && sessionId) {
        handleProceedToSolutions();
      } else {
        setStage('SOLUTIONS_GENERATED');
      }
      return;
    }

    setStage(norm);
  };

  // Apply a local state snapshot
  const applyStateSnapshot = (snapshot) => {
    if (!snapshot) return;
    try {
      if (snapshot.sessionId) setSessionId(snapshot.sessionId);
      if (snapshot.rawProblem) setRawProblem(snapshot.rawProblem);
      
      const restoredStage = normalizeStage(snapshot.stage);
      setStage(restoredStage);
      
      const maxStage = normalizeStage(snapshot.maxUnlockedStage || restoredStage);
      setMaxUnlockedStage(maxStage);

      setClarificationQuestion(snapshot.clarificationQuestion || null);
      setMissingInfo(Array.isArray(snapshot.missingInfo) ? snapshot.missingInfo : []);
      setRoundCount(typeof snapshot.roundCount === 'number' ? snapshot.roundCount : 0);
      setIsClear(!!snapshot.isClear);
      setQaHistory(Array.isArray(snapshot.qaHistory) ? snapshot.qaHistory : []);
      setSolutions(Array.isArray(snapshot.solutions) ? snapshot.solutions : []);
      setSelectedSolutionId(snapshot.selectedSolutionId || null);
      setSelectedSolution(snapshot.selectedSolution || null);
      setAnalysis(snapshot.analysis || null);
      setDocuments(Array.isArray(snapshot.documents) ? snapshot.documents : []);
      setSuccessCriteriaBenefits(snapshot.successCriteriaBenefits || null);
    } catch (err) {
      console.error("Error applying state snapshot:", err);
    }
  };

  // Restore session from History Drawer
  const handleRestoreHistoryItem = async (historyItem) => {
    if (!historyItem) return;

    try {
      const snapshot = historyItem.fullState || (historyItem.rawProblem ? historyItem : null);
      const sessId = historyItem.sessionId || snapshot?.sessionId;
      const questionText = historyItem.question || snapshot?.rawProblem;

      // 1. Instantly apply saved local state snapshot for 0-latency UI feedback
      if (snapshot) {
        applyStateSnapshot(snapshot);
      } else if (questionText) {
        handleResetSession();
        setRawProblem(questionText);
      }

      // 2. Fetch authoritative backend session status from MySQL if sessionId exists
      if (sessId) {
        try {
          const res = await fetch(`/api/session/${sessId}/status`);
          if (res.ok) {
            const statusData = await res.json();
            
            const targetStage = normalizeStage(statusData.stage || snapshot?.stage);

            setSessionId(statusData.session_id || sessId);
            if (statusData.raw_problem) setRawProblem(statusData.raw_problem);
            setStage(targetStage);
            setMaxUnlockedStage(targetStage);
            
            if (Array.isArray(statusData.clarifications) && statusData.clarifications.length > 0) {
              setQaHistory(statusData.clarifications);
            }
            if (statusData.clarification_round !== undefined) {
              setRoundCount(statusData.clarification_round);
            }
            if (Array.isArray(statusData.solutions) && statusData.solutions.length > 0) {
              setSolutions(statusData.solutions);
            }
            if (statusData.selected_solution) {
              setSelectedSolution(statusData.selected_solution);
              setSelectedSolutionId(statusData.selected_solution.id);
            }
            if (Array.isArray(statusData.documents) && statusData.documents.length > 0) {
              setDocuments(statusData.documents);
            }
          }
        } catch (err) {
          console.warn("Backend status fetch fallback:", err);
        }
      }
    } catch (err) {
      console.error("Error restoring history item:", err);
    }
  };

  // Reuse question text into IntakeForm
  const handleReuseQuestion = (questionText) => {
    handleResetSession();
    setRawProblem(questionText);
  };

  // Derive stage back navigation configuration
  const getBackConfig = () => {
    if (stage === 'CLARIFICATION') {
      return { onBack: () => setStage('INTAKE'), backLabel: 'Back to 1. Intake' };
    }
    if (stage === 'SOLUTIONS_GENERATED') {
      return { onBack: () => setStage('CLARIFICATION'), backLabel: 'Back to 2. Clarification' };
    }
    if (stage === 'SOLUTION_SELECTED') {
      return { onBack: () => setStage('SOLUTIONS_GENERATED'), backLabel: 'Back to 3. Solutions Deck' };
    }
    if (stage === 'DOCUMENTS_GENERATED') {
      return { onBack: () => setStage('SOLUTION_SELECTED'), backLabel: 'Back to 4. Deep Analysis' };
    }
    return { onBack: null, backLabel: null };
  };

  const { onBack, backLabel } = getBackConfig();

  return (
    <div style={{ padding: '12px 24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      <LoadingModal show={loading} message={loadingMessage} />

      <Header 
        onReset={handleResetSession} 
        stage={stage} 
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyCount}
        onBack={onBack}
        backLabel={backLabel}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistoryItem={handleRestoreHistoryItem}
        onReuseQuestion={handleReuseQuestion}
      />

      <StageStepper 
        currentStage={stage} 
        roundCount={roundCount} 
        onStageSelect={handleStageSelect}
        maxUnlockedStage={maxUnlockedStage}
      />

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#fca5a5',
          padding: '14px 20px',
          borderRadius: '12px',
          marginBottom: '24px',
          maxWidth: '1600px',
          margin: '0 auto 24px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <ErrorBoundary key={stage} onReset={handleResetSession}>
        {/* Stage 1: INTAKE */}
        {stage === 'INTAKE' && (
          <IntakeForm onSubmit={handleSubmitProblem} loading={loading} initialValue={rawProblem} />
        )}

        {/* Stage 2: CLARIFICATION */}
        {stage === 'CLARIFICATION' && (
          <ClarificationChat
            rawProblem={rawProblem}
            question={clarificationQuestion}
            missingInfo={missingInfo}
            roundCount={roundCount}
            onAnswerSubmit={handleAnswerSubmit}
            onProceedToSolutions={handleProceedToSolutions}
            loading={loading}
            isClear={isClear}
            history={qaHistory}
            suggestedTechStack={suggestedTechStack}
            recommendedCategories={recommendedCategories}
          />
        )}

        {/* Stage 3: SOLUTIONS DECK (Select Solution Tab) */}
        {stage === 'SOLUTIONS_GENERATED' && (
          <SolutionDeck
            solutions={solutions}
            selectedSolutionId={selectedSolutionId}
            onSelectSolution={handleSelectSolution}
            loading={loading}
            onGenerateSolutions={handleProceedToSolutions}
            suggestedTechStack={suggestedTechStack}
            confirmedTechStack={confirmedTechStack}
            recommendedCategories={recommendedCategories}
          />
        )}

        {/* Stage 4: DEEP ANALYSIS VIEW (Dedicated Page) */}
        {stage === 'SOLUTION_SELECTED' && (
          <>
            {analysis ? (
              <DeepAnalysisView
                solution={selectedSolution}
                analysis={analysis}
                onGenerateDocuments={handleGenerateDocuments}
                loading={loading}
              />
            ) : (
              <SolutionDeck
                solutions={solutions}
                selectedSolutionId={selectedSolutionId}
                onSelectSolution={handleSelectSolution}
                loading={loading}
                onGenerateSolutions={handleProceedToSolutions}
                suggestedTechStack={suggestedTechStack}
                confirmedTechStack={confirmedTechStack}
                recommendedCategories={recommendedCategories}
              />
            )}
          </>
        )}

        {/* Stage 5: DOCUMENT HUB (Dedicated Page) */}
        {stage === 'DOCUMENTS_GENERATED' && (
          <DocumentHub
            documents={documents}
            successCriteriaBenefits={successCriteriaBenefits}
            onGenerateDocuments={handleGenerateDocuments}
            hasSession={!!sessionId}
          />
        )}

        {/* Catch-all fallback in case of unknown stage string */}
        {!['INTAKE', 'CLARIFICATION', 'SOLUTIONS_GENERATED', 'SOLUTION_SELECTED', 'DOCUMENTS_GENERATED'].includes(stage) && (
          <IntakeForm onSubmit={handleSubmitProblem} loading={loading} initialValue={rawProblem} />
        )}
      </ErrorBoundary>

      <Footer />
    </div>
  );
}
