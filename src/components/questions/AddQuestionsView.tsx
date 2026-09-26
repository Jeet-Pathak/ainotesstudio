import React, { useState } from 'react';
import {
  Question,
  QuestionType,
  QuestionAnswerItem,
  GeneratedNotes,
  AppSettings,
} from '../../types';
import { QuestionParser } from '../../services/questionParser';
import { AINotesEngine } from '../../services/aiNotesEngine';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Layers,
  BookOpen,
  Check,
  Zap,
  Edit2,
  CheckCircle2,
  UploadCloud,
  RefreshCw,
  AlertCircle,
  FileText,
  Eye,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  Clock,
} from 'lucide-react';

interface AddQuestionsViewProps {
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
  projectTitle: string;
  onUpdateProjectTitle: (title: string) => void;
  projectSubject?: string;
  onUpdateProjectSubject?: (subject: string) => void;
  generatedNotes?: GeneratedNotes;
  onUpdateNotes?: (notes: GeneratedNotes) => void;
  onStartAnalysis: () => void;
  onNavigateToEditor?: () => void;
  onNavigateToPreview?: () => void;
  settings?: AppSettings;
}

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'Auto Detect', label: '✦ Auto Detect (AI Marks & Classification)' },
  { value: '1 Mark', label: '1 Mark (Direct Definition / Fact)' },
  { value: '2 Marks', label: '2 Marks (Short Complete Answer)' },
  { value: '3 Marks', label: '3 Marks (Concise Structured Answer)' },
  { value: '5 Marks', label: '5 Marks (Moderately Detailed Answer)' },
  { value: '8 Marks', label: '8 Marks (Structured University Points)' },
  { value: '10 Marks', label: '10 Marks (Detailed Long Answer with Diagrams)' },
  { value: '15 Marks', label: '15 Marks (Comprehensive Multi-Page Answer)' },
  { value: '20 Marks', label: '20 Marks (Extensive Master Analysis)' },
  { value: 'Definition', label: 'Definition (Academic Terminology)' },
  { value: 'Short explanation', label: 'Short Explanation (Brief Core Points)' },
  { value: 'Detailed explanation', label: 'Detailed Explanation (Working & Architecture)' },
  { value: 'Compare', label: 'Difference or Comparison (Comparison Table)' },
  { value: 'Advantages and disadvantages', label: 'Advantages and Disadvantages' },
  { value: 'Derivation', label: 'Derivation (Step-by-Step Mathematical)' },
  { value: 'Numerical', label: 'Numerical Problem (Given, Formula, Steps)' },
  { value: 'Algorithm or programming problem', label: 'Algorithm or Programming Problem' },
  { value: 'Diagram-Based', label: 'Diagram-Based Question (Visual Schematic)' },
  { value: 'Short note', label: 'Short Note' },
  { value: 'Long descriptive question', label: 'Long Descriptive Question' },
  { value: 'Discuss or evaluate question', label: 'Discuss or Evaluate Question' },
  { value: 'Multiple-part question', label: 'Multiple-Part Question (Subparts a, b, c)' },
  { value: 'Other', label: 'Other' },
];

export const AddQuestionsView: React.FC<AddQuestionsViewProps> = ({
  questions,
  onUpdateQuestions,
  projectTitle,
  onUpdateProjectTitle,
  projectSubject = 'General Engineering & Applied Sciences',
  onUpdateProjectSubject,
  generatedNotes,
  onUpdateNotes,
  onStartAnalysis,
  onNavigateToEditor,
  onNavigateToPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk' | 'import'>('manual');

  // Manual Form States (Default to 'Auto Detect')
  const [manualText, setManualText] = useState('');
  const [manualType, setManualType] = useState<QuestionType>('Auto Detect');
  const [manualMarks, setManualMarks] = useState<number>(5);
  const [manualModule, setManualModule] = useState<string>('Module-1');
  const [manualSubjectOrTopic, setManualSubjectOrTopic] = useState<string>('');

  // Bulk State
  const [bulkText, setBulkText] = useState('');

  // Import / OCR simulation state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Card Editing State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editSubjectOrTopic, setEditSubjectOrTopic] = useState('');

  // Individual Question Answering State
  const [generatingQuestionId, setGeneratingQuestionId] = useState<string | null>(null);
  const [expandedAnswerIds, setExpandedAnswerIds] = useState<Record<string, boolean>>({});

  // Batch Generation State
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    currentStep: string;
    currentIndex: number;
    total: number;
    completed: number;
    status: 'idle' | 'running' | 'done' | 'error';
    message?: string;
  }>({
    currentStep: '',
    currentIndex: 0,
    total: 0,
    completed: 0,
    status: 'idle',
  });

  // Handle Manual Type Change (adjust default marks if user changes type)
  const handleManualTypeChange = (type: QuestionType) => {
    setManualType(type);
    if (type === '1 Mark' || type === 'Very Short Answer' || type === 'Definition') {
      setManualMarks(1);
    } else if (type === '2–3 Marks') {
      setManualMarks(3);
    } else if (type === '4–5 Marks' || type === 'Short Answer') {
      setManualMarks(5);
    } else if (type === '10–15 Marks' || type === 'Long Answer') {
      setManualMarks(15);
    } else if (type === 'Numerical' || type === 'Compare' || type === 'Diagram-Based' || type === 'Explain') {
      setManualMarks(10);
    } else if (type === 'Auto Detect' || type === 'Auto') {
      setManualMarks(5);
    }
  };

  // Synchronize generated notes qaSection whenever questions or their answers change
  const syncQASectionToNotes = (updatedQuestions: Question[]) => {
    if (!onUpdateNotes || !generatedNotes) return;

    // Collect all generated answers from questions in exact order
    const updatedQASection: QuestionAnswerItem[] = [];
    updatedQuestions.forEach((q, idx) => {
      if (q.generatedAnswer) {
        updatedQASection.push({
          ...q.generatedAnswer,
          questionNumber: idx + 1,
          questionText: q.text,
          marks: q.marks || q.generatedAnswer.marks || 5,
          module: q.module || q.generatedAnswer.module || 'Module-1',
        });
      }
    });

    onUpdateNotes({
      ...generatedNotes,
      qaSection: updatedQASection,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Single Question (Always preserves existing questions and answers)
  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;

    const { marks: extractedMarks, isExplicit, marksSource, cleanedText, subQuestions } = QuestionParser.parseMarks(manualText.trim());
    const detectedType = QuestionParser.detectQuestionType(cleanedText, extractedMarks || manualMarks);
    const finalMarks = extractedMarks !== null ? extractedMarks : (manualMarks || 5);

    const newQuestion: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: questions.length + 1,
      text: cleanedText,
      type: manualType,
      detectedType,
      marks: finalMarks,
      marksSource,
      isMarksAutoDetected: !isExplicit,
      subQuestions,
      subjectOrTopic: manualSubjectOrTopic.trim() || undefined,
      module: manualModule.trim() || 'Module-1',
      order: questions.length + 1,
      answerStatus: 'not_generated',
    };

    const updated = [...questions, newQuestion];
    onUpdateQuestions(updated);
    syncQASectionToNotes(updated);
    setManualText('');
    setManualSubjectOrTopic('');
  };

  // Add a blank question card directly
  const handleAddBlankQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: questions.length + 1,
      text: '',
      type: 'Auto Detect',
      marks: 5,
      marksSource: 'inferred',
      module: 'Module-1',
      order: questions.length + 1,
      answerStatus: 'not_generated',
    };

    const updated = [...questions, newQuestion];
    onUpdateQuestions(updated);
    setEditingCardId(newQuestion.id);
    setEditText('');
    setEditSubjectOrTopic('');
  };

  // Bulk Input Parser
  const handleProcessBulk = () => {
    if (!bulkText.trim()) return;

    const parsed = QuestionParser.parseBulkText(bulkText, questions.length);

    if (parsed.length > 0) {
      const updated = [
        ...questions,
        ...parsed.map((p) => ({ ...p, answerStatus: 'not_generated' as const })),
      ];
      // Renumber
      updated.forEach((q, i) => {
        q.number = i + 1;
        q.order = i + 1;
      });
      onUpdateQuestions(updated);
      syncQASectionToNotes(updated);
      setBulkText('');
      setActiveTab('manual');
    }
  };

  // Preset Loaders with authentic exact marks & modules
  const loadPreset = (presetName: 'coa' | 'industrial' | 'math') => {
    if (presetName === 'coa') {
      onUpdateProjectTitle('Computer Organization & Architecture (Modules 1 & 2)');
      if (onUpdateProjectSubject) {
        onUpdateProjectSubject('Computer Organization & Architecture');
      }
      const coaQuestions: Question[] = [
        { id: 'q1', number: 1, text: 'What is stored program concept?', type: 'Auto', detectedType: 'Definition', marks: 1, marksSource: 'explicit', module: 'Module-1', order: 1, answerStatus: 'not_generated' },
        { id: 'q2', number: 2, text: 'What is instruction format?', type: 'Auto', detectedType: 'Short explanation', marks: 2, marksSource: 'explicit', module: 'Module-1', order: 2, answerStatus: 'not_generated' },
        { id: 'q3', number: 3, text: 'Explain stored program computer organization.', type: 'Auto', detectedType: 'Detailed explanation', marks: 5, marksSource: 'inferred', module: 'Module-1', order: 3, answerStatus: 'not_generated' },
        { id: 'q4', number: 4, text: 'Explain the fetch-decode-execute cycle with diagram.', type: 'Auto', detectedType: 'Diagram-Based', marks: 15, marksSource: 'explicit', module: 'Module-1', order: 4, answerStatus: 'not_generated' },
        { id: 'q5', number: 5, text: 'Explain different addressing modes with examples.', type: 'Auto', detectedType: 'Detailed explanation', marks: 10, marksSource: 'inferred', module: 'Module-1', order: 5, answerStatus: 'not_generated' },
        { id: 'q6', number: 6, text: 'What is overflow?', type: 'Auto', detectedType: 'Definition', marks: 1, marksSource: 'explicit', module: 'Module-2', order: 6, answerStatus: 'not_generated' },
        { id: 'q7', number: 7, text: 'What is underflow?', type: 'Auto', detectedType: 'Definition', marks: 1, marksSource: 'explicit', module: 'Module-2', order: 7, answerStatus: 'not_generated' },
        { id: 'q8', number: 8, text: 'Explain ripple carry adder.', type: 'Auto', detectedType: 'Short explanation', marks: 5, marksSource: 'explicit', module: 'Module-2', order: 8, answerStatus: 'not_generated' },
        { id: 'q9', number: 9, text: 'Explain carry look-ahead adder and compare it with ripple carry adder.', type: 'Auto', detectedType: 'Compare', marks: 15, marksSource: 'explicit', module: 'Module-2', order: 9, answerStatus: 'not_generated' },
        { id: 'q10', number: 10, text: 'Solve the Booth multiplication algorithm for multiplying (+7) by (-3).', type: 'Numerical', detectedType: 'Numerical', marks: 10, marksSource: 'explicit', module: 'Module-2', order: 10, answerStatus: 'not_generated' },
      ];
      onUpdateQuestions(coaQuestions);
    } else if (presetName === 'industrial') {
      onUpdateProjectTitle('Industrial Management — Systems Concept & Morale');
      if (onUpdateProjectSubject) {
        onUpdateProjectSubject('Industrial Management & Systems');
      }
      const indQuestions: Question[] = [
        { id: 'qi1', number: 1, text: 'What is a system and what are its key characteristics?', type: 'Short explanation', marks: 5, marksSource: 'explicit', module: 'Module-1', order: 1, answerStatus: 'not_generated' },
        { id: 'qi2', number: 2, text: 'Explain different types of systems (Open loop vs Closed loop).', type: 'Compare', marks: 5, marksSource: 'explicit', module: 'Module-1', order: 2, answerStatus: 'not_generated' },
        { id: 'qi3', number: 3, text: 'What are parameters and variables in system behavior?', type: 'Definition', marks: 5, marksSource: 'explicit', module: 'Module-1', order: 3, answerStatus: 'not_generated' },
        { id: 'qi4', number: 4, text: 'Explain the meaning of morale and discuss its connection with employee productivity.', type: 'Long descriptive question', marks: 10, marksSource: 'explicit', module: 'Module-2', order: 4, answerStatus: 'not_generated' },
      ];
      onUpdateQuestions(indQuestions);
    } else if (presetName === 'math') {
      onUpdateProjectTitle('Applied Mathematics — Numerical & Coordinate Graphs');
      if (onUpdateProjectSubject) {
        onUpdateProjectSubject('Applied Mathematics');
      }
      const mathQuestions: Question[] = [
        { id: 'qm1', number: 1, text: 'Calculate the roots of the quadratic equation 2x² - 7x + 3 = 0 using step-by-step formula.', type: 'Numerical', marks: 10, marksSource: 'explicit', module: 'Module-1', order: 1, answerStatus: 'not_generated' },
        { id: 'qm2', number: 2, text: 'Plot and analyze the coordinate graph curve of y = x² with labeled axes.', type: 'Diagram-Based', marks: 10, marksSource: 'explicit', module: 'Module-1', order: 2, answerStatus: 'not_generated' },
      ];
      onUpdateQuestions(mathQuestions);
    }
  };

  // Update Individual Card Fields
  const updateQuestionCard = (id: string, updates: Partial<Question>) => {
    const updated = questions.map((q) => (q.id === id ? { ...q, ...updates } : q));
    onUpdateQuestions(updated);
    syncQASectionToNotes(updated);
  };

  // Start Inline Editing of Question Text
  const startEditingCard = (q: Question) => {
    setEditingCardId(q.id);
    setEditText(q.text);
    setEditSubjectOrTopic(q.subjectOrTopic || '');
  };

  const saveEditingCard = (id: string) => {
    if (editText.trim()) {
      const { marks, isExplicit, marksSource, cleanedText, subQuestions } = QuestionParser.parseMarks(editText.trim());
      const current = questions.find((q) => q.id === id);
      const newMarks = marks !== null ? marks : (current?.marks || 5);
      const newDetectedType = QuestionParser.detectQuestionType(cleanedText, newMarks);

      const updated = questions.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            text: cleanedText,
            marks: newMarks,
            marksSource,
            isMarksAutoDetected: !isExplicit,
            subQuestions,
            detectedType: newDetectedType,
            subjectOrTopic: editSubjectOrTopic.trim() || undefined,
          };
        }
        return q;
      });

      onUpdateQuestions(updated);
      syncQASectionToNotes(updated);
    }
    setEditingCardId(null);
  };

  // Generate Answer for a Single Question (Independent generation)
  const handleGenerateSingleAnswer = async (questionId: string) => {
    const targetQ = questions.find((q) => q.id === questionId);
    if (!targetQ || !targetQ.text.trim()) return;

    setGeneratingQuestionId(questionId);
    // Mark question as generating
    updateQuestionCard(questionId, { answerStatus: 'generating' });

    try {
      await new Promise((r) => setTimeout(r, 450));
      const targetIndex = questions.findIndex((q) => q.id === questionId);
      const answer = AINotesEngine.generateAnswerForQuestion(
        targetQ,
        targetIndex >= 0 ? targetIndex : 0,
        projectSubject || 'General Engineering'
      );

      const updated = questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            answerStatus: 'completed' as const,
            generatedAnswer: answer,
            answerError: undefined,
          };
        }
        return q;
      });

      onUpdateQuestions(updated);
      syncQASectionToNotes(updated);
      setExpandedAnswerIds((prev) => ({ ...prev, [questionId]: true }));
    } catch (err: any) {
      console.error(err);
      updateQuestionCard(questionId, {
        answerStatus: 'error',
        answerError: err?.message || 'Failed to generate answer. Please retry.',
      });
    } finally {
      setGeneratingQuestionId(null);
    }
  };

  // Generate All Answers Sequentially with Progressive Feedback
  const handleGenerateAllAnswers = async (forceRegenerateAll: boolean = false) => {
    if (questions.length === 0 || isBatchGenerating) return;

    setIsBatchGenerating(true);
    const toProcess = questions.filter(
      (q) => forceRegenerateAll || !q.generatedAnswer || q.answerStatus !== 'completed'
    );

    const totalToProcess = toProcess.length > 0 ? toProcess.length : questions.length;
    const targetList = toProcess.length > 0 ? toProcess : questions;

    setBatchProgress({
      currentStep: `Preparing to generate ${targetList.length} answers...`,
      currentIndex: 0,
      total: targetList.length,
      completed: 0,
      status: 'running',
    });

    let currentQuestions = [...questions];

    for (let i = 0; i < targetList.length; i++) {
      const q = targetList[i];
      const qIndex = currentQuestions.findIndex((item) => item.id === q.id);

      setBatchProgress({
        currentStep: `Analyzing & Generating Question ${i + 1} of ${targetList.length}: "${q.text.slice(0, 32)}..."`,
        currentIndex: i + 1,
        total: targetList.length,
        completed: i,
        status: 'running',
      });

      // Mark status as generating
      currentQuestions = currentQuestions.map((item) =>
        item.id === q.id ? { ...item, answerStatus: 'generating' as const } : item
      );
      onUpdateQuestions(currentQuestions);

      await new Promise((resolve) => setTimeout(resolve, 350));

      try {
        const answer = AINotesEngine.generateAnswerForQuestion(
          q,
          qIndex >= 0 ? qIndex : i,
          projectSubject || 'General Engineering'
        );

        currentQuestions = currentQuestions.map((item) =>
          item.id === q.id
            ? {
                ...item,
                answerStatus: 'completed' as const,
                generatedAnswer: answer,
                answerError: undefined,
              }
            : item
        );
        onUpdateQuestions(currentQuestions);
        syncQASectionToNotes(currentQuestions);
      } catch (err: any) {
        currentQuestions = currentQuestions.map((item) =>
          item.id === q.id
            ? {
                ...item,
                answerStatus: 'error' as const,
                answerError: err?.message || 'Error generating answer',
              }
            : item
        );
        onUpdateQuestions(currentQuestions);
      }
    }

    setBatchProgress({
      currentStep: 'All selected answers have been generated successfully!',
      currentIndex: targetList.length,
      total: targetList.length,
      completed: targetList.length,
      status: 'done',
      message: 'All selected answers have been generated successfully.',
    });

    setIsBatchGenerating(false);
  };

  // Reorder & Action Handlers (strictly preserves answers)
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const copy = [...questions];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Renumber while preserving answers and statuses
    copy.forEach((q, i) => {
      q.number = i + 1;
      q.order = i + 1;
      if (q.generatedAnswer) {
        q.generatedAnswer.questionNumber = i + 1;
      }
    });

    onUpdateQuestions(copy);
    syncQASectionToNotes(copy);
  };

  const duplicateQuestion = (index: number) => {
    const orig = questions[index];
    const copy: Question = {
      ...orig,
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: questions.length + 1,
      order: questions.length + 1,
      text: `${orig.text} (Copy)`,
      answerStatus: orig.answerStatus,
      generatedAnswer: orig.generatedAnswer
        ? {
            ...orig.generatedAnswer,
            id: `qa-copy-${Date.now()}`,
            questionNumber: questions.length + 1,
            questionText: `${orig.text} (Copy)`,
          }
        : undefined,
    };
    const newList = [...questions.slice(0, index + 1), copy, ...questions.slice(index + 1)];
    newList.forEach((q, i) => {
      q.number = i + 1;
      q.order = i + 1;
      if (q.generatedAnswer) {
        q.generatedAnswer.questionNumber = i + 1;
      }
    });
    onUpdateQuestions(newList);
    syncQASectionToNotes(newList);
  };

  const deleteQuestion = (index: number) => {
    const filtered = questions.filter((_, i) => i !== index);
    filtered.forEach((q, i) => {
      q.number = i + 1;
      q.order = i + 1;
      if (q.generatedAnswer) {
        q.generatedAnswer.questionNumber = i + 1;
      }
    });
    onUpdateQuestions(filtered);
    syncQASectionToNotes(filtered);
  };

  // Toggle Card Answer Accordion
  const toggleAnswerExpanded = (qId: string) => {
    setExpandedAnswerIds((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Total Marks and Completed Count Calculations
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const completedAnswersCount = questions.filter(
    (q) => q.answerStatus === 'completed' || !!q.generatedAnswer
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner: Project Title, Subject & Quick Stats */}
      <div className="clay-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Examination & Subject Header
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Questions & Answers Workspace
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Document / Exam Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => onUpdateProjectTitle(e.target.value)}
                  placeholder="e.g. Computer Organization & Architecture — Semester Exam"
                  className="clay-input w-full px-3.5 py-2 text-sm sm:text-base font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Academic Subject / Discipline
                </label>
                <input
                  type="text"
                  value={projectSubject}
                  onChange={(e) => onUpdateProjectSubject && onUpdateProjectSubject(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="clay-input w-full px-3.5 py-2 text-sm sm:text-base font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-blue-50 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 px-4 py-2.5 rounded-2xl text-center min-w-[80px]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Questions</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">{questions.length}</span>
            </div>
            <div className="bg-indigo-50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 px-4 py-2.5 rounded-2xl text-center min-w-[80px]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Total Marks</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{totalMarks} M</span>
            </div>
            <div className="bg-emerald-50 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Answers Ready</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {completedAnswersCount} / {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={handleAddBlankQuestion}
            className="clay-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            Add Question Card
          </button>
          {completedAnswersCount > 0 && onNavigateToPreview && (
            <button
              onClick={onNavigateToPreview}
              className="clay-btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              View Multi-Page A4 Preview
            </button>
          )}
        </div>
      </div>

      {/* Batch Generation Progress Indicator Modal / Bar */}
      {batchProgress.status !== 'idle' && (
        <div className="clay-card p-5 border-2 border-blue-400 bg-blue-50/70 dark:bg-slate-900/90 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {batchProgress.status === 'running' ? (
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {batchProgress.status === 'running'
                    ? 'AI Independent Answer Generation in Progress'
                    : 'All Answers Generated Successfully!'}
                </h4>
                <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                  {batchProgress.currentStep}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold bg-blue-200 dark:bg-blue-800 px-2.5 py-1 rounded-lg text-blue-900 dark:text-white">
              {batchProgress.currentIndex} / {batchProgress.total} Questions
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
              style={{
                width: `${batchProgress.total > 0 ? (batchProgress.completed / batchProgress.total) * 100 : 0}%`,
              }}
            ></div>
          </div>

          {batchProgress.status === 'done' && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                ✓ Every question has received its own complete, marks-calibrated answer.
              </span>
              <div className="flex items-center gap-2">
                {onNavigateToEditor && (
                  <button
                    onClick={onNavigateToEditor}
                    className="clay-btn-secondary px-3 py-1 text-xs font-bold flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Open in Notes Editor
                  </button>
                )}
                {onNavigateToPreview && (
                  <button
                    onClick={onNavigateToPreview}
                    className="clay-btn-primary px-3 py-1 text-xs font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Live PDF Preview
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Left Column (Add Input Form) & Right Column (Question Bank List) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================
            LEFT COLUMN: INPUT METHODS (Manual, Bulk Paste, File Import)
           ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="clay-card p-5">
            {/* Input Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-5">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'manual'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Question
              </button>
              <button
                onClick={() => setActiveTab('bulk')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'bulk'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Bulk Paste
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'import'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                File / OCR
              </button>
            </div>

            {/* TAB 1: MANUAL ENTRY */}
            {activeTab === 'manual' && (
              <form onSubmit={handleAddManual} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Question Text
                  </label>
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="e.g. Explain the architecture and working of an operating system with diagram. [15 marks]"
                    className="clay-input w-full p-3 text-xs sm:text-sm text-slate-900 dark:text-white resize-none font-medium"
                  />
                  {manualText.trim().length > 3 && (() => {
                    const parsed = QuestionParser.parseMarks(manualText);
                    const qType = QuestionParser.detectQuestionType(parsed.cleanedText, parsed.marks);
                    return (
                      <div className="mt-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>Auto-detected: <strong>{parsed.marks} Marks</strong> ({parsed.marksSource === 'explicit' ? 'Explicit' : parsed.marksSource === 'subquestion' ? 'Subparts' : parsed.marksSource === 'section-shared' ? 'Section' : 'Auto Inferred'})</span>
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-blue-200/80 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-bold">
                          {qType}
                        </span>
                      </div>
                    );
                  })()}
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Tip: You can include marks like (2 Marks), [5 Marks], — 1M, (10 marks), [10], (2), etc. — AI will detect them automatically!
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Question Type
                    </label>
                    <select
                      value={manualType}
                      onChange={(e) => handleManualTypeChange(e.target.value as QuestionType)}
                      className="clay-input w-full p-2.5 text-xs text-slate-900 dark:text-white font-medium"
                    >
                      {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Marks (Weightage)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={manualMarks}
                      onChange={(e) => setManualMarks(parseInt(e.target.value, 10) || 1)}
                      className="clay-input w-full p-2.5 text-xs text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Subject / Topic (Optional)
                    </label>
                    <input
                      type="text"
                      value={manualSubjectOrTopic}
                      onChange={(e) => setManualSubjectOrTopic(e.target.value)}
                      placeholder="e.g. Memory Management"
                      className="clay-input w-full p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Module / Unit
                    </label>
                    <input
                      type="text"
                      value={manualModule}
                      onChange={(e) => setManualModule(e.target.value)}
                      placeholder="e.g. Module-1"
                      className="clay-input w-full p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!manualText.trim()}
                  className="clay-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Add Question to Document
                </button>
              </form>
            )}

            {/* TAB 2: BULK PASTE */}
            {activeTab === 'bulk' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Paste Full Question Paper / List
                  </label>
                  <textarea
                    rows={9}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={`Module-1\n1. What is stored program concept? [1 mark]\n2. What is instruction format? [1 mark]\n3. Explain stored program computer with diagram. [15 marks]\n\nModule-2\n4. What is ripple carry adder? [1 mark]\n5. Explain carry look-ahead adder and compare with ripple carry adder. [15 marks]`}
                    className="clay-input w-full p-3 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={handleProcessBulk}
                  disabled={!bulkText.trim()}
                  className="clay-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Auto-Detect & Append Questions
                </button>
              </div>
            )}

            {/* TAB 3: FILE / OCR IMPORT */}
            {activeTab === 'import' && (
              <div className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                    uploadSuccess
                      ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <UploadCloud className="w-10 h-10 mx-auto mb-2 text-blue-500 animate-bounce" />
                  <span className="text-xs font-bold text-slate-800 dark:text-white block mb-1">
                    Upload PDF, DOCX, TXT or Question Sheet
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-3">
                    Extracts examination questions with auto marks detection
                  </span>

                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIsUploading(true);
                        setTimeout(() => {
                          setIsUploading(false);
                          setUploadSuccess(true);
                          loadPreset('coa');
                        }, 1200);
                      }
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="clay-btn-secondary px-4 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isUploading ? 'Running OCR Extraction...' : 'Choose File to Scan'}
                  </label>
                </div>

                {uploadSuccess && (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Successfully extracted 10 questions from question sheet!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: QUESTION CARDS WITH INDEPENDENT ANSWER CONTROLS
           ========================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Toolbar Header */}
          <div className="clay-card p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Questions & Answers List ({questions.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {questions.length > 0 && (
                <>
                  <button
                    onClick={() => handleGenerateAllAnswers(false)}
                    disabled={isBatchGenerating}
                    className="clay-btn-primary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate All Answers
                  </button>
                  <button
                    onClick={() => handleAddBlankQuestion()}
                    className="clay-btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Empty State */}
          {questions.length === 0 ? (
            <div className="clay-card p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <FileText className="w-14 h-14 mx-auto opacity-40 text-blue-500" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                No Questions Added Yet
              </h4>
              <p className="text-xs max-w-md mx-auto">
                Add your exam questions using the form on the left, paste a question paper, or load a preset. Each question will receive an independent, complete answer according to its marks.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => loadPreset('coa')}
                  className="clay-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Load COA Sample Question Paper
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => {
                const isExpanded = !!expandedAnswerIds[q.id];
                const hasAnswer = !!q.generatedAnswer;
                const status = q.answerStatus || (hasAnswer ? 'completed' : 'not_generated');
                const isGeneratingThis = generatingQuestionId === q.id || status === 'generating';

                return (
                  <div
                    key={q.id}
                    className={`clay-card p-5 transition-all space-y-3.5 border ${
                      hasAnswer
                        ? 'border-blue-200 dark:border-blue-900/60'
                        : 'border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    {/* Top Row: Question Number, Text/Editor, Status Badge & Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-mono text-xs font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          {q.number || idx + 1}
                        </span>

                        <div className="flex-1 min-w-0">
                          {editingCardId === q.id ? (
                            <div className="space-y-2">
                              <textarea
                                rows={2}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="clay-input w-full p-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white"
                                placeholder="Enter question text..."
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editSubjectOrTopic}
                                  onChange={(e) => setEditSubjectOrTopic(e.target.value)}
                                  placeholder="Subject or Topic (optional)"
                                  className="clay-input p-2 text-xs text-slate-900 dark:text-white"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => saveEditingCard(q.id)}
                                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-700"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Save Question
                                </button>
                                <button
                                  onClick={() => setEditingCardId(null)}
                                  className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug break-words">
                                {q.text || <span className="text-slate-400 italic">Empty Question Text — click Edit to add</span>}
                              </p>
                              
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                {/* Marks & Source Indicator Badge */}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-bold rounded-md border ${
                                  q.marksSource === 'explicit'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                    : q.marksSource === 'subquestion'
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                                    : q.marksSource === 'section-shared'
                                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                    : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                }`}>
                                  <Sparkles className="w-3 h-3" />
                                  <span>{q.marks || 5} Marks</span>
                                  <span className="opacity-70 font-normal">
                                    • {q.marksSource === 'explicit' ? 'Explicit' : q.marksSource === 'subquestion' ? 'Subquestions' : q.marksSource === 'section-shared' ? 'Shared' : 'Inferred'}
                                  </span>
                                </span>

                                {/* Detected Question Type Badge */}
                                {q.detectedType && (
                                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {q.detectedType}
                                  </span>
                                )}

                                {q.subjectOrTopic && (
                                  <span className="text-[10.5px] font-semibold text-blue-600 dark:text-blue-400">
                                    Topic: {q.subjectOrTopic}
                                  </span>
                                )}
                              </div>

                              {/* Subquestions breakdown if multi-part */}
                              {q.subQuestions && q.subQuestions.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {q.subQuestions.map((sq, sIdx) => (
                                    <span key={sIdx} className="px-2 py-0.5 text-[10px] rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium">
                                      <strong>{sq.part}</strong> {sq.text.slice(0, 26)}... <strong>[{sq.marks}M]</strong>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Top Right: Status Badge & Card Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Badge */}
                        {status === 'generating' || isGeneratingThis ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center gap-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Generating...
                          </span>
                        ) : status === 'completed' || hasAnswer ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Completed
                          </span>
                        ) : status === 'error' ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Error
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Not Generated
                          </span>
                        )}

                        {/* Card Menu Buttons: Reorder, Edit, Duplicate, Delete */}
                        <div className="flex items-center gap-0.5">
                          {editingCardId !== q.id && (
                            <button
                              onClick={() => startEditingCard(q)}
                              title="Edit Question"
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => moveQuestion(idx, 'up')}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 rounded-lg"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveQuestion(idx, 'down')}
                            disabled={idx === questions.length - 1}
                            title="Move Down"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 rounded-lg"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => duplicateQuestion(idx)}
                            title="Duplicate"
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteQuestion(idx)}
                            title="Delete Question"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Question Type, Marks, and Generation Control Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Type Selector */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Type:
                          </span>
                          <select
                            value={q.type}
                            onChange={(e) => {
                              const newType = e.target.value as QuestionType;
                              let newMarks = q.marks;
                              if (newType === '1 Mark' || newType === 'Very Short Answer' || newType === 'Definition') {
                                newMarks = 1;
                              } else if (newType === '2–3 Marks') {
                                newMarks = 3;
                              } else if (newType === '4–5 Marks' || newType === 'Short Answer') {
                                newMarks = 5;
                              } else if (newType === '10–15 Marks' || newType === 'Long Answer') {
                                newMarks = 15;
                              } else if (newType === 'Numerical' || newType === 'Compare' || newType === 'Diagram-Based' || newType === 'Explain') {
                                newMarks = 10;
                              }
                              updateQuestionCard(q.id, { type: newType, marks: newMarks });
                            }}
                            className="clay-input px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-slate-800 border border-blue-200/60 dark:border-slate-700 rounded-lg cursor-pointer"
                          >
                            {QUESTION_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Marks Field */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Marks:
                          </span>
                          <div className="flex items-center">
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={q.marks || 5}
                              onChange={(e) =>
                                updateQuestionCard(q.id, { marks: parseInt(e.target.value, 10) || 1 })
                              }
                              className="clay-input w-14 px-2 py-1 text-xs font-black text-center text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-slate-800 border border-indigo-200/60 dark:border-slate-700 rounded-lg"
                            />
                            <span className="text-[11px] font-bold text-slate-400 ml-1">M</span>
                          </div>
                        </div>

                        {/* Module Tag */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Module:
                          </span>
                          <input
                            type="text"
                            value={q.module || 'Module-1'}
                            onChange={(e) => updateQuestionCard(q.id, { module: e.target.value })}
                            className="clay-input w-24 px-2 py-1 text-[11px] font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                            placeholder="Module-1"
                          />
                        </div>
                      </div>

                      {/* Primary Independent Generation CTA on Card */}
                      <div className="flex items-center gap-2">
                        {hasAnswer ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleAnswerExpanded(q.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              {isExpanded ? 'Hide Answer' : 'View Answer'}
                            </button>
                            <button
                              onClick={() => handleGenerateSingleAnswer(q.id)}
                              disabled={isGeneratingThis}
                              className="clay-btn-secondary px-2.5 py-1 text-xs font-bold flex items-center gap-1 text-indigo-600 dark:text-indigo-400"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Regenerate Answer
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGenerateSingleAnswer(q.id)}
                            disabled={isGeneratingThis || !q.text.trim()}
                            className="clay-btn-primary px-3 py-1 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate Answer ({q.marks || 5}M)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Generated Answer Preview / In-Card Viewer */}
                    {hasAnswer && isExpanded && q.generatedAnswer && (
                      <div className="mt-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-900/60 border border-blue-200/70 dark:border-blue-800/60 space-y-3 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-slate-800">
                          <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Generated Answer ({q.generatedAnswer.marks} Marks • {q.generatedAnswer.resolvedType || q.generatedAnswer.questionType})
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Automatic Multi-Page Document Support
                          </span>
                        </div>

                        {/* Answer Intro */}
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                          {q.generatedAnswer.answerIntro}
                        </p>

                        {/* Main Body Points */}
                        {q.generatedAnswer.points && q.generatedAnswer.points.length > 0 && (
                          <div className="space-y-2 pt-1">
                            {q.generatedAnswer.points.map((pt, pIdx) => (
                              <div key={pIdx} className="text-xs text-slate-800 dark:text-slate-200">
                                {pt.title && (
                                  <span className="font-bold text-blue-700 dark:text-blue-300 block">
                                    {pt.title}
                                  </span>
                                )}
                                <span className="leading-relaxed">{pt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comparison Table Preview */}
                        {q.generatedAnswer.comparisonTable && (
                          <div className="overflow-x-auto my-2">
                            <table className="min-w-full text-[11px] border border-slate-300 dark:border-slate-700">
                              <thead className="bg-blue-100 dark:bg-slate-800 font-bold">
                                <tr>
                                  {q.generatedAnswer.comparisonTable.headers.map((h, hi) => (
                                    <th key={hi} className="p-1.5 border border-slate-300 dark:border-slate-700 text-left">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {q.generatedAnswer.comparisonTable.rows.map((row, ri) => (
                                  <tr key={ri} className="border-b border-slate-200 dark:border-slate-800">
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="p-1.5 border border-slate-300 dark:border-slate-700">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Image / Diagram Placeholder Info */}
                        {q.generatedAnswer.imagePlaceholder && (
                          <div className="p-2.5 bg-blue-100/60 dark:bg-slate-800/80 rounded-xl border border-blue-200 dark:border-slate-700 text-xs">
                            <span className="font-bold text-blue-900 dark:text-blue-200 block">
                              📷 Diagram Included: {q.generatedAnswer.imagePlaceholder.figureTitle}
                            </span>
                            <span className="text-[11px] text-slate-600 dark:text-slate-400">
                              {q.generatedAnswer.imagePlaceholder.caption || 'Upload schematic in Notes Editor or PDF Preview.'}
                            </span>
                          </div>
                        )}

                        {/* Conclusion */}
                        {q.generatedAnswer.conclusion && (
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-800">
                            <strong>Conclusion: </strong>
                            {q.generatedAnswer.conclusion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Primary Action Bar */}
          {questions.length > 0 && (
            <div className="clay-card p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Full Document AI Synthesis
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Analyze all {questions.length} questions, build multi-page exam notes, and generate missing answers.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleGenerateAllAnswers(false)}
                    disabled={isBatchGenerating}
                    className="clay-btn-secondary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Generate All ({questions.length}) Answers
                  </button>

                  <button
                    onClick={onStartAnalysis}
                    className="clay-btn-primary px-5 py-2.5 text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-blue-500/25"
                  >
                    <Zap className="w-4 h-4" />
                    Synthesize Full Notes & Open Editor
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
