import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, BookOpen, Layers, Cpu, FileCheck } from 'lucide-react';

interface AIProcessingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  questionCount: number;
}

const STAGES = [
  { label: 'Analyzing questions collectively & detecting subject domain', icon: BookOpen },
  { label: 'Grouping related concepts into structured syllabus modules', icon: Layers },
  { label: 'Detecting required mathematical formulas & KaTeX equations', icon: Cpu },
  { label: 'Synthesizing high-resolution vector diagrams & architecture', icon: Sparkles },
  { label: 'Formulating student-friendly explanations & scoring points', icon: FileCheck },
  { label: 'Applying Gen-Zineers watermark & strict A4 layout formatting', icon: CheckCircle2 },
];

export const AIProcessingModal: React.FC<AIProcessingModalProps> = ({
  isOpen,
  onComplete,
  questionCount,
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIndex(0);
      setProgress(10);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 8) + 6;
        const stageIdx = Math.min(
          Math.floor((next / 100) * STAGES.length),
          STAGES.length - 1
        );
        setCurrentStageIndex(stageIdx);
        return Math.min(next, 100);
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="clay-card w-full max-w-lg p-8 bg-white/95 dark:bg-slate-900/95 border border-white/40 dark:border-slate-700 shadow-2xl relative overflow-hidden">
        {/* Animated Background Aura */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        <div className="text-center relative z-10 mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            ✦ AI NOTES STUDIO ENGINE
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Analyzing {questionCount} questions collectively & generating exam notes...
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="relative z-10 mb-6">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            <span>Synthesis in Progress</span>
            <span className="font-mono text-blue-600 dark:text-blue-400">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Live Stage Checklist */}
        <div className="space-y-3 relative z-10 bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-all ${
                  isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : isCurrent
                    ? 'text-blue-600 dark:text-blue-400 font-bold scale-[1.02]'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
                )}
                <span>{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
