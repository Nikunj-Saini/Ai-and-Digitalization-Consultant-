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
import {
  submitProblem,
  submitClarification,
  generateSolutions,
  selectSolution,
  generateDocuments
} from './services/api';

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [stage, setStage] = useState('INTAKE'); // INTAKE, CLARIFICATION, SOLUTIONS_READY, SOLUTIONS_GENERATED, SOLUTION_SELECTED, DOCUMENTS_GENERATED
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

  // Document State
  const [documents, setDocuments] = useState([]);
  const [successCriteriaBenefits, setSuccessCriteriaBenefits] = useState(null);
  const [maxUnlockedStage, setMaxUnlockedStage] = useState('INTAKE');

  // History Drawer State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

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

      const snapshot = {
        sessionId: sessId,
        rawProblem: problemText,
        stage: currentStage,
        maxUnlockedStage: overrideData.maxUnlockedStage || maxUnlockedStage || currentStage,
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
        stage: currentStage || 'INTAKE',
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

      const nextStage = res.is_clear ? 'SOLUTIONS_READY' : 'CLARIFICATION';
      setStage(nextStage);
      setMaxUnlockedStage(nextStage);

      // Save into Question History
      saveOrUpdateHistory(problemText, res.session_id, nextStage, {
        maxUnlockedStage: nextStage,
        clarificationQuestion: res.question,
        missingInfo: res.missing_info || [],
        roundCount: res.clarification_round,
        isClear: res.is_clear,
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
      setStage(res.stage);
      setMaxUnlockedStage(res.stage);

      saveOrUpdateHistory(rawProblem, sessionId, res.stage, {
        maxUnlockedStage: res.stage,
        clarificationQuestion: res.question,
        missingInfo: res.missing_info || [],
        roundCount: res.clarification_round,
        isClear: res.is_clear,
        qaHistory: newQaHistory
      });
    } catch (err) {
      setError(err.message || 'Error submitting clarification');
    } finally {
      setLoading(false);
    }
  };

  // 3. Force Proceed to Solutions
  const handleProceedToSolutions = async () => {
    if (!sessionId) return;
    setLoadingMessage('Formulating Tailored Digital Transformation Solutions with AI Agent...');
    setLoading(true);
    setError(null);
    try {
      const solRes = await generateSolutions(sessionId);
      setSolutions(solRes.solutions);
      setStage(solRes.stage);
      setMaxUnlockedStage(solRes.stage);

      saveOrUpdateHistory(rawProblem, sessionId, solRes.stage, {
        maxUnlockedStage: solRes.stage,
        solutions: solRes.solutions
      });
    } catch (err) {
      setError(err.message || 'Error generating solution options');
    } finally {
      setLoading(false);
    }
  };

  // 4. Select Solution Option
  const handleSelectSolution = async (solId) => {
    if (!sessionId) return;
    setLoadingMessage('Performing Deep Architectural Breakdown & Risk Analysis for Selected Option...');
    setLoading(true);
    setError(null);
    setSelectedSolutionId(solId);
    const updatedSolutions = solutions.map(s => ({ ...s, is_selected: s.id === solId }));
    setSolutions(updatedSolutions);

    try {
      const res = await selectSolution(sessionId, solId);
      setSelectedSolution(res.selected_solution);
      setAnalysis(res.analysis);

      if (stage === 'DOCUMENTS_GENERATED') {
        const docRes = await generateDocuments(sessionId);
        setDocuments(docRes.documents);
        setSuccessCriteriaBenefits(docRes.success_criteria_benefits);

        saveOrUpdateHistory(rawProblem, sessionId, 'DOCUMENTS_GENERATED', {
          solutions: updatedSolutions,
          selectedSolutionId: solId,
          selectedSolution: res.selected_solution,
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
          selectedSolution: res.selected_solution,
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
    if (targetStageKey === 'DOCUMENTS_GENERATED' && documents.length === 0) {
      handleGenerateDocuments();
      return;
    }
    if (targetStageKey === 'SOLUTION_CHOICE') {
      setStage('SOLUTIONS_GENERATED');
      return;
    }
    setStage(targetStageKey);
  };

  // Restore session from History Drawer
  const handleRestoreHistoryItem = (stateSnapshot) => {
    if (!stateSnapshot) return;
    setSessionId(stateSnapshot.sessionId || null);
    setRawProblem(stateSnapshot.rawProblem || '');
    setStage(stateSnapshot.stage || 'INTAKE');
    setMaxUnlockedStage(stateSnapshot.maxUnlockedStage || stateSnapshot.stage || 'INTAKE');
    setClarificationQuestion(stateSnapshot.clarificationQuestion || null);
    setMissingInfo(stateSnapshot.missingInfo || []);
    setRoundCount(stateSnapshot.roundCount || 0);
    setIsClear(stateSnapshot.isClear || false);
    setQaHistory(stateSnapshot.qaHistory || []);
    setSolutions(stateSnapshot.solutions || []);
    setSelectedSolutionId(stateSnapshot.selectedSolutionId || null);
    setSelectedSolution(stateSnapshot.selectedSolution || null);
    setAnalysis(stateSnapshot.analysis || null);
    setDocuments(stateSnapshot.documents || []);
    setSuccessCriteriaBenefits(stateSnapshot.successCriteriaBenefits || null);
  };

  // Reuse question text into IntakeForm
  const handleReuseQuestion = (questionText) => {
    handleResetSession();
    setRawProblem(questionText);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1300px', margin: '0 auto' }}>
      <LoadingModal show={loading} message={loadingMessage} />

      <Header 
        onReset={handleResetSession} 
        stage={stage} 
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyCount}
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
          maxWidth: '850px',
          margin: '0 auto 24px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Stage 1: INTAKE */}
      {stage === 'INTAKE' && (
        <IntakeForm onSubmit={handleSubmitProblem} loading={loading} initialValue={rawProblem} />
      )}

      {/* Stage 2 & 3: CLARIFICATION & UNDERSTANDING AGENT CHECK */}
      {(stage === 'CLARIFICATION' || stage === 'SOLUTIONS_READY') && (
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
        />
      )}

      {/* Stage 4 & 5 & 6 & 7 */}
      {(stage === 'SOLUTIONS_GENERATED' || stage === 'SOLUTION_SELECTED' || stage === 'DOCUMENTS_GENERATED') && (
        <>
          <SolutionDeck
            solutions={solutions}
            selectedSolutionId={selectedSolutionId}
            onSelectSolution={handleSelectSolution}
            loading={loading}
          />

          {/* Stage 6: DEEP ANALYSIS VIEW */}
          {(stage === 'SOLUTION_SELECTED' || stage === 'DOCUMENTS_GENERATED') && analysis && (
            <DeepAnalysisView
              solution={selectedSolution}
              analysis={analysis}
              onGenerateDocuments={handleGenerateDocuments}
              loading={loading}
            />
          )}

          {/* Stage 7: DOCUMENT HUB */}
          {stage === 'DOCUMENTS_GENERATED' && (
            <DocumentHub
              documents={documents}
              successCriteriaBenefits={successCriteriaBenefits}
            />
          )}
        </>
      )}
    </div>
  );
}
