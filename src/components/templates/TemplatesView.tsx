import React from 'react';
import { TemplateId } from '../../types';
import { Palette, Check, ArrowRight, Sparkles, BookOpen, Star } from 'lucide-react';

interface TemplatesViewProps {
  currentTemplate: TemplateId;
  onSelectTemplate: (template: TemplateId) => void;
  onNavigateToEditor: () => void;
}

const TEMPLATES: {
  id: TemplateId;
  name: string;
  badge: string;
  description: string;
  features: string[];
  bannerColor: string;
  borderColor: string;
}[] = [
  {
    id: 'reference-style',
    name: 'Reference Notebook Style',
    badge: 'Uploaded Ref Match',
    description:
      'Exact visual language of the uploaded reference images: yellow/black module badge headers, red star question numbering, mark tags [10 Marks], and highlighted definition cards.',
    features: [
      'Authentic Gen-Zineers background watermark',
      'Solid colored section banner tags',
      'Highlighted term definitions with blue accent bars',
      'Numbered structured answer points',
      'LaTeX KaTeX formula blocks & vector diagrams',
    ],
    bannerColor: 'bg-yellow-400 text-black',
    borderColor: 'border-yellow-400',
  },
  {
    id: 'academic-colorful',
    name: 'Academic Colorful Pro',
    badge: 'Modern College',
    description:
      'Vibrant modern student layout with pill tags, high-contrast definition callouts, and distinct color codes for each module.',
    features: [
      'Gradient header branding',
      'Pill badges for difficulty & marks',
      'Soft pastel callout containers',
      'Clean side-by-side comparison tables',
    ],
    bannerColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    borderColor: 'border-blue-500',
  },
  {
    id: 'minimal-ios',
    name: 'Minimal Apple iOS SF',
    badge: 'Apple Design',
    description:
      'Clean SF Pro typography, subtle monochrome borders, generous whitespace, and focus on mathematical elegance.',
    features: [
      'Pure typography-first hierarchy',
      'Subtle monochrome hairline rules',
      'Clean vector KaTeX formulas',
      'Distraction-free revision layout',
    ],
    bannerColor: 'bg-slate-900 text-white',
    borderColor: 'border-slate-800',
  },
  {
    id: 'exam-booster',
    name: 'Exam Booster High-Yield',
    badge: 'Revision Sprint',
    description:
      'Optimized for quick memorization before exams: bold key takeaways, memory mnemonics, warning boxes, and scoring tips.',
    features: [
      'Red attention banners for critical topics',
      'Quick review bullet summaries',
      'Exam trap warning callouts',
      'High-yield formula quick sheets',
    ],
    bannerColor: 'bg-rose-600 text-white',
    borderColor: 'border-rose-500',
  },
  {
    id: 'university-classic',
    name: 'University Textbook Classic',
    badge: 'Formal Standard',
    description:
      'Formal academic serif/sans layout, numbered hierarchical sections (1.1, 1.2), theorem blocks, and formal footnotes.',
    features: [
      'Formal academic section numbering',
      'Textbook-standard margin proportions',
      'Formal theorem and lemma boxes',
      'Archival print layout',
    ],
    bannerColor: 'bg-emerald-700 text-white',
    borderColor: 'border-emerald-600',
  },
];

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  currentTemplate,
  onSelectTemplate,
  onNavigateToEditor,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="clay-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Academic Notes Template Library
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an exam layout style. All templates automatically include the authentic Gen-Zineers watermark on every page.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToEditor}
          className="clay-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>Apply to Current Notes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((tmpl) => {
          const isSelected = currentTemplate === tmpl.id;

          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`clay-card p-6 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                isSelected ? 'ring-2 ring-blue-600 dark:ring-blue-400 scale-[1.01]' : 'hover:scale-[1.01]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Active Style
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {tmpl.badge}
                  </span>
                </div>

                {/* Template Mockup Header Banner */}
                <div className={`p-2.5 rounded-xl font-extrabold text-xs mb-4 shadow-sm ${tmpl.bannerColor}`}>
                  MODULE 1 — SAMPLE HEADER
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">
                  {tmpl.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {tmpl.description}
                </p>

                <div className="space-y-1.5 mb-6">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Layout Highlights:
                  </span>
                  {tmpl.features.map((feat, fIdx) => (
                    <div key={fIdx} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(tmpl.id);
                  }}
                  className={`w-full py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'clay-btn-secondary'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Current Selected Template
                    </>
                  ) : (
                    'Select This Template'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
