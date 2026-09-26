import React, { useState } from 'react';
import {
  GeneratedNotes,
  NoteSection,
  QuestionAnswerItem,
  TemplateId,
  AppSettings,
} from '../../types';
import { AINotesEngine } from '../../services/aiNotesEngine';
import { PDFNotesDocument, ImagePlaceholderView } from '../pdf/PDFNotesDocument';
import { MathBlock } from '../math/MathBlock';
import { AcademicDiagram } from '../diagrams/AcademicDiagrams';
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  FileDown,
  RefreshCw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Lightbulb,
  Split,
  Eye,
  Edit3,
  Cpu,
  Layers,
  Save,
  Check,
} from 'lucide-react';

interface NotesEditorProps {
  notes: GeneratedNotes;
  onUpdateNotes: (updated: GeneratedNotes) => void;
  settings: AppSettings;
  onNavigateToPreview: () => void;
  onSaveVersion: () => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  notes,
  onUpdateNotes,
  settings,
  onNavigateToPreview,
  onSaveVersion,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [activeSectionId, setActiveSectionId] = useState<string>(notes.sections[0]?.id || '');
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // Update Top-level Metadata
  const handleMetaChange = (field: keyof GeneratedNotes, val: any) => {
    onUpdateNotes({
      ...notes,
      [field]: val,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update Section
  const handleSectionUpdate = (secId: string, updatedSec: Partial<NoteSection>) => {
    const updated = notes.sections.map((s) => (s.id === secId ? { ...s, ...updatedSec } : s));
    onUpdateNotes({
      ...notes,
      sections: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // Update QA Item
  const handleQAUpdate = (qaId: string, updatedQA: Partial<QuestionAnswerItem>) => {
    const updated = notes.qaSection.map((q) => (q.id === qaId ? { ...q, ...updatedQA } : q));
    onUpdateNotes({
      ...notes,
      qaSection: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  const [sectionPrompts, setSectionPrompts] = useState<Record<string, string>>({});
  const [qaPrompts, setQaPrompts] = useState<Record<string, string>>({});

  // Section AI Refinement
  const handleAIRefine = async (
    section: NoteSection,
    action: 'simplify' | 'expand' | 'exam-oriented' | 'add-example' | 'add-diagram' | 'improve' | 'custom-prompt',
    customPrompt?: string
  ) => {
    setIsRegenerating(section.id);
    try {
      const refined = await AINotesEngine.regenerateSection(section, action, customPrompt, notes.subject);
      const updated = notes.sections.map((s) => (s.id === section.id ? refined : s));
      onUpdateNotes({
        ...notes,
        sections: updated,
        updatedAt: new Date().toISOString(),
      });
      if (customPrompt) {
        setSectionPrompts((prev) => ({ ...prev, [section.id]: '' }));
      }
    } finally {
      setIsRegenerating(null);
    }
  };

  // QA Item AI Refinement
  const handleAIRefineQA = async (
    qa: QuestionAnswerItem,
    action: 'simplify' | 'expand' | 'exam-oriented' | 'add-table' | 'add-steps' | 'add-diagram' | 'custom-prompt',
    customPrompt?: string
  ) => {
    setIsRegenerating(qa.id);
    try {
      const refined = await AINotesEngine.regenerateQAItem(qa, action, customPrompt, notes.subject);
      const updated = notes.qaSection.map((q) => (q.id === qa.id ? refined : q));
      onUpdateNotes({
        ...notes,
        qaSection: updated,
        updatedAt: new Date().toISOString(),
      });
      if (customPrompt) {
        setQaPrompts((prev) => ({ ...prev, [qa.id]: '' }));
      }
    } finally {
      setIsRegenerating(null);
    }
  };

  // Section Management
  const addSection = () => {
    const newSec: NoteSection = {
      id: `sec-${Date.now()}`,
      moduleNumber: 1,
      moduleTitle: 'MODULE 1: CORE CONCEPTS',
      topicTitle: 'New Topic Analysis',
      topicNumber: `1.${notes.sections.length + 1}`,
      introduction: 'Enter introductory explanation for this topic here.',
      definition: {
        term: 'New Concept Term',
        explanation: 'Clear and simple academic definition.',
      },
      keyCharacteristics: ['Primary property or behavior', 'Second important characteristic'],
    };
    onUpdateNotes({
      ...notes,
      sections: [...notes.sections, newSec],
    });
    setActiveSectionId(newSec.id);
  };

  const deleteSection = (secId: string) => {
    if (notes.sections.length <= 1) return;
    const filtered = notes.sections.filter((s) => s.id !== secId);
    onUpdateNotes({
      ...notes,
      sections: filtered,
    });
    if (activeSectionId === secId) {
      setActiveSectionId(filtered[0]?.id || '');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Top Action Bar */}
      <div className="clay-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Notes Studio Editor & Live Customizer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any section or answer page, use custom AI prompts to remake it, or refine keywords with one click.
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'editor'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editor Only
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              Split View
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              PDF Live Preview
            </button>
          </div>

          <button
            onClick={() => {
              onSaveVersion();
              setSaveToast(true);
              setTimeout(() => setSaveToast(false), 2000);
            }}
            className="clay-btn-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            {saveToast ? <Check className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
            <span>{saveToast ? 'Version Saved!' : 'Save Version'}</span>
          </button>

          <button
            onClick={onNavigateToPreview}
            className="clay-btn-primary px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-500/25"
          >
            <FileDown className="w-4 h-4" />
            Proceed to PDF Export
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================
            LEFT COLUMN: EDITOR FORMS
           ========================================================= */}
        <div
          className={`space-y-6 ${
            viewMode === 'split' ? 'lg:col-span-6' : viewMode === 'editor' ? 'lg:col-span-12' : 'hidden'
          }`}
        >
          {/* Metadata Card */}
          <div className="clay-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Document Header & Academic Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={notes.subject}
                  onChange={(e) => handleMetaChange('subject', e.target.value)}
                  className="clay-input w-full p-2 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Institute / Organization
                </label>
                <input
                  type="text"
                  value={notes.institute}
                  onChange={(e) => handleMetaChange('institute', e.target.value)}
                  className="clay-input w-full p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Document Subtitle / Module
                </label>
                <input
                  type="text"
                  value={notes.module}
                  onChange={(e) => handleMetaChange('module', e.target.value)}
                  className="clay-input w-full p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Prepared By (Author)
                </label>
                <input
                  type="text"
                  value={notes.preparedBy}
                  onChange={(e) => handleMetaChange('preparedBy', e.target.value)}
                  className="clay-input w-full p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {notes.sections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  activeSectionId === sec.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : 'clay-card-flat text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>Section {idx + 1}: {sec.topicTitle.slice(0, 18)}...</span>
              </button>
            ))}
            <button
              onClick={addSection}
              className="clay-btn-secondary px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Section
            </button>
          </div>

          {/* Active Section Editor */}
          {notes.sections
            .filter((sec) => sec.id === activeSectionId || (!activeSectionId && sec === notes.sections[0]))
            .map((sec) => (
              <div key={sec.id} className="clay-card p-5 space-y-5">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                      {sec.moduleTitle || 'Module Topic'}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Editing: {sec.topicTitle}
                    </h4>
                  </div>

                  <button
                    onClick={() => deleteSection(sec.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 self-end sm:self-auto"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* AI REMAKE PROMPT SECTION */}
                <div className="p-3.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 rounded-2xl border border-blue-200/60 dark:border-blue-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      AI Page & Section Remake with Custom Prompt
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Powered by Gemini AI
                    </span>
                  </div>

                  {/* Custom Prompt Input Bar */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sectionPrompts[sec.id] || ''}
                      onChange={(e) =>
                        setSectionPrompts((prev) => ({ ...prev, [sec.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && sectionPrompts[sec.id]?.trim()) {
                          handleAIRefine(sec, 'custom-prompt', sectionPrompts[sec.id].trim());
                        }
                      }}
                      placeholder='e.g. "Remake this section with detailed points, clear formulas, and bold keywords..."'
                      className="clay-input flex-1 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                    <button
                      onClick={() =>
                        sectionPrompts[sec.id]?.trim() &&
                        handleAIRefine(sec, 'custom-prompt', sectionPrompts[sec.id].trim())
                      }
                      disabled={isRegenerating === sec.id || !sectionPrompts[sec.id]?.trim()}
                      className="clay-btn-primary px-3 py-2 text-xs font-extrabold flex items-center gap-1 shrink-0 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Remake
                    </button>
                  </div>

                  {/* Quick AI Action Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleAIRefine(sec, 'simplify')}
                      disabled={isRegenerating === sec.id}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      ✦ Simplify
                    </button>
                    <button
                      onClick={() => handleAIRefine(sec, 'expand')}
                      disabled={isRegenerating === sec.id}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      ✦ Expand
                    </button>
                    <button
                      onClick={() => handleAIRefine(sec, 'exam-oriented')}
                      disabled={isRegenerating === sec.id}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors flex items-center gap-1"
                    >
                      <Lightbulb className="w-3 h-3" />
                      ✦ Exam Tips
                    </button>
                    <button
                      onClick={() => handleAIRefine(sec, 'add-diagram')}
                      disabled={isRegenerating === sec.id}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-1"
                    >
                      <Cpu className="w-3 h-3" />
                      ✦ Diagram
                    </button>
                  </div>
                </div>

                {isRegenerating === sec.id && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI is remaking and refining this page with Google Gemini...</span>
                  </div>
                )}

                {/* Topic Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Topic Heading
                  </label>
                  <input
                    type="text"
                    value={sec.topicTitle}
                    onChange={(e) => handleSectionUpdate(sec.id, { topicTitle: e.target.value })}
                    className="clay-input w-full p-2.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Introduction Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Overview / Introduction
                  </label>
                  <textarea
                    rows={3}
                    value={sec.introduction || ''}
                    onChange={(e) => handleSectionUpdate(sec.id, { introduction: e.target.value })}
                    className="clay-input w-full p-3 text-xs text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                {/* Definition Box */}
                {sec.definition && (
                  <div className="p-4 bg-blue-50/60 dark:bg-slate-800/60 rounded-xl border border-blue-100 dark:border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">
                      Highlighted Definition Box
                    </span>
                    <div>
                      <input
                        type="text"
                        value={sec.definition.term}
                        onChange={(e) =>
                          handleSectionUpdate(sec.id, {
                            definition: { ...sec.definition!, term: e.target.value },
                          })
                        }
                        placeholder="Term to define"
                        className="clay-input w-full p-2 text-xs font-bold text-slate-900 dark:text-white mb-2"
                      />
                      <textarea
                        rows={2}
                        value={sec.definition.explanation}
                        onChange={(e) =>
                          handleSectionUpdate(sec.id, {
                            definition: { ...sec.definition!, explanation: e.target.value },
                          })
                        }
                        placeholder="Concise explanation"
                        className="clay-input w-full p-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* LaTeX Formula Editor with KaTeX live preview */}
                {sec.formulaBox && (
                  <div className="p-4 bg-indigo-50/50 dark:bg-slate-800/60 rounded-xl border border-indigo-100 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                        Mathematical Formula (LaTeX / KaTeX)
                      </span>
                      <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded text-indigo-800 dark:text-indigo-200">
                        KaTeX Ready
                      </span>
                    </div>
                    <input
                      type="text"
                      value={sec.formulaBox.latex}
                      onChange={(e) =>
                        handleSectionUpdate(sec.id, {
                          formulaBox: { ...sec.formulaBox!, latex: e.target.value },
                        })
                      }
                      className="clay-input w-full p-2.5 font-mono text-xs text-slate-900 dark:text-white"
                    />
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block mb-1">Live LaTeX Render:</span>
                      <MathBlock latex={sec.formulaBox.latex} />
                    </div>
                  </div>
                )}

                {/* Section Diagram Box */}
                {sec.diagram && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Section Diagram: {sec.diagram.title || 'Technical Schematic'}
                        </span>
                        <button
                          onClick={() => handleAIRefine(sec, 'add-diagram')}
                          disabled={isRegenerating === sec.id}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Regenerate Diagram
                        </button>
                      </div>
                      <AcademicDiagram config={sec.diagram} />
                    </div>
                  )}
                </div>
              ))}

          {/* Model Exam Q&A List with AI Prompt & Remake support */}
          <div className="clay-card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-rose-600" />
              Exam Q&A Solutions & AI Remake ({notes.qaSection.length} Questions)
            </h3>

            <div className="space-y-4">
              {notes.qaSection.map((qa, qIdx) => (
                <div
                  key={qa.id || qIdx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Q{qa.questionNumber}. {qa.questionText}
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
                      {qa.marks} Marks • {qa.resolvedType || qa.questionType}
                    </span>
                  </div>

                  {/* QA AI Remake Bar */}
                  <div className="p-2.5 bg-blue-50/70 dark:bg-slate-900/60 rounded-xl border border-blue-100 dark:border-slate-700/80 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={qaPrompts[qa.id] || ''}
                        onChange={(e) =>
                          setQaPrompts((prev) => ({ ...prev, [qa.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && qaPrompts[qa.id]?.trim()) {
                            handleAIRefineQA(qa, 'custom-prompt', qaPrompts[qa.id].trim());
                          }
                        }}
                        placeholder='e.g. "Add structured bullet points and emphasize keywords in bold"'
                        className="clay-input flex-1 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                      />
                      <button
                        onClick={() =>
                          qaPrompts[qa.id]?.trim() &&
                          handleAIRefineQA(qa, 'custom-prompt', qaPrompts[qa.id].trim())
                        }
                        disabled={isRegenerating === qa.id || !qaPrompts[qa.id]?.trim()}
                        className="clay-btn-primary px-2.5 py-1.5 text-[11px] font-bold flex items-center gap-1 shrink-0 disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3" />
                        Remake
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handleAIRefineQA(qa, 'simplify')}
                        disabled={isRegenerating === qa.id}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700"
                      >
                        ✦ Simplify
                      </button>
                      <button
                        onClick={() => handleAIRefineQA(qa, 'expand')}
                        disabled={isRegenerating === qa.id}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700"
                      >
                        ✦ Expand
                      </button>
                      <button
                        onClick={() => handleAIRefineQA(qa, 'exam-oriented')}
                        disabled={isRegenerating === qa.id}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700"
                      >
                        ✦ Exam Tips
                      </button>
                      <button
                        onClick={() => handleAIRefineQA(qa, 'add-diagram')}
                        disabled={isRegenerating === qa.id}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700"
                      >
                        ✦ Add Diagram
                      </button>
                    </div>
                  </div>

                  {isRegenerating === qa.id && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI is remaking this answer with Gemini...</span>
                    </div>
                  )}

                  <textarea
                    rows={3}
                    value={qa.answerIntro}
                    onChange={(e) => handleQAUpdate(qa.id, { answerIntro: e.target.value })}
                    className="clay-input w-full p-2 text-xs text-slate-900 dark:text-white leading-relaxed"
                    placeholder="Model answer text..."
                  />

                  {/* Attached Image / Diagram Placeholder in QA Item */}
                  {qa.imagePlaceholder ? (
                    <div className="mt-3">
                      <ImagePlaceholderView item={qa} onUpdateQAItem={handleQAUpdate} isInteractive={true} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleQAUpdate(qa.id, {
                            imagePlaceholder: {
                              isRequired: true,
                              placeholderText: `[IMAGE REQUIRED: ${qa.questionText.slice(0, 35)} Diagram]`,
                              figureTitle: `Figure ${qa.questionNumber}: Diagram for ${qa.questionText.slice(0, 40)}`,
                              caption: 'Labeled schematic diagram for this question.',
                              imagePlacement: 'below-intro',
                            },
                          })
                        }
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        + Add Image Placeholder / Diagram Space
                      </button>
                    </div>
                  )}

                  {/* Attached Diagram / Image Preview in QA Item if no placeholder component */}
                  {!qa.imagePlaceholder && (qa.diagramKey || qa.diagramSvg || qa.diagramImageUrl) && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Attached Technical Diagram / Schematic
                        </span>
                        <button
                          onClick={() => handleAIRefineQA(qa, 'add-diagram')}
                          disabled={isRegenerating === qa.id}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Regenerate Diagram
                        </button>
                      </div>
                      <AcademicDiagram
                        config={{
                          title: qa.diagramTitle || `Figure: Diagram for Q${qa.questionNumber}`,
                          caption: qa.diagramCaption || 'Precision vector schematic diagram.',
                          diagramKey: qa.diagramKey || 'custom',
                          svgMarkup: qa.diagramSvg,
                          imageUrl: qa.diagramImageUrl,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: LIVE A4 PDF PREVIEW
           ========================================================= */}
        <div
          className={`space-y-4 ${
            viewMode === 'split' ? 'lg:col-span-6' : viewMode === 'preview' ? 'lg:col-span-12' : 'hidden'
          }`}
        >
          <div className="sticky top-20">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                  Live A4 Document Rendering
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Watermarked with Gen-Zineers Official Logo
              </span>
            </div>

            {/* Document Container with zoom scaling for responsive fit */}
            <div className="border border-slate-300 dark:border-slate-700 rounded-3xl p-4 bg-slate-200/70 dark:bg-slate-950/80 shadow-inner overflow-y-auto max-h-[calc(100vh-140px)]">
              <div className="transform scale-[0.62] sm:scale-[0.72] xl:scale-[0.80] origin-top">
                <PDFNotesDocument
                  notes={notes}
                  settings={settings}
                  previewMode={true}
                  onUpdateQAItem={handleQAUpdate}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
