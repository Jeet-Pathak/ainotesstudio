import React from 'react';
import { Project, TemplateId } from '../../types';
import {
  Sparkles,
  PlusCircle,
  FolderKanban,
  FileText,
  FileDown,
  Layers,
  Cpu,
  Zap,
  ArrowRight,
  Clock,
  Copy,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Palette,
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onCreateNew: () => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: Project) => void;
  onSelectTemplate: (template: TemplateId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  onOpenProject,
  onCreateNew,
  onDeleteProject,
  onDuplicateProject,
  onSelectTemplate,
}) => {
  const totalQuestions = projects.reduce((acc, p) => acc + p.questions.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Apple Claymorphic Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-8 sm:p-12 shadow-2xl shadow-blue-500/20">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            AI Academic Productivity Platform
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Turn Questions into Complete Exam-Ready Notes.
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed mb-8">
            Enter questions in bulk or upload question papers. The AI engine analyzes questions collectively, groups conceptual modules, generates KaTeX math formulas, synthesizes vector diagrams, and produces watermarked A4 university study materials.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onCreateNew}
              className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3.5 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Notes
            </button>
            <button
              onClick={() => onSelectTemplate('reference-style')}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md px-5 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Palette className="w-4 h-4" />
              Explore Reference Templates
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Projects
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {projects.length}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Exam study modules in studio
          </span>
        </div>

        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Questions Processed
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalQuestions}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Analyzed & mapped to topics
          </span>
        </div>

        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              KaTeX Math Formulas
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            100% Vector
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            Zero pixelation typesetting
          </span>
        </div>

        <div className="clay-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Official Watermark
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Gen-Zineers
          </span>
          <span className="text-[11px] text-amber-600 font-semibold block mt-1">
            Every page authenticated
          </span>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            Recent Projects & Note Sets
          </h2>
          <button
            onClick={onCreateNew}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="clay-card p-10 text-center text-slate-500 dark:text-slate-400">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              No Projects Found
            </p>
            <p className="text-xs max-w-sm mx-auto mb-4">
              Get started by creating your first exam notes project with custom questions.
            </p>
            <button
              onClick={onCreateNew}
              className="clay-btn-primary px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="clay-card p-5 hover:border-blue-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      {project.status.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3
                    onClick={() => onOpenProject(project)}
                    className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors cursor-pointer mb-2"
                  >
                    {project.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                    {project.subject || 'Engineering & Academic Notes'} • {project.questions.length} Questions
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateProject(project)}
                      title="Duplicate Project"
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      title="Delete Project"
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenProject(project)}
                    className="clay-btn-primary px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Academic Templates Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            Curated Academic Document Templates
          </h2>
          <span className="text-xs text-slate-500">5 Distinct Styles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              id: 'reference-style' as TemplateId,
              title: 'Reference Image Style',
              tag: 'Exact Uploaded Match',
              desc: 'Framed notebook appearance, colored heading banners, star badges, and structured mark Q&As.',
              color: 'from-amber-500 to-yellow-400',
            },
            {
              id: 'academic-colorful' as TemplateId,
              title: 'Academic Colorful',
              tag: 'Vibrant College',
              desc: 'High-contrast definition callouts, pill badges, and distinct color codes for each module.',
              color: 'from-blue-600 to-cyan-500',
            },
            {
              id: 'minimal-ios' as TemplateId,
              title: 'Minimal iOS SF',
              tag: 'Apple Clean',
              desc: 'Pure typography-first design with subtle monochrome borders and refined spacing.',
              color: 'from-slate-700 to-slate-900',
            },
            {
              id: 'exam-booster' as TemplateId,
              title: 'Exam Booster High-Yield',
              tag: 'Fast Revision',
              desc: 'Memory mnemonics, quick-review comparison tables, and highlighted exam warning boxes.',
              color: 'from-rose-500 to-red-600',
            },
            {
              id: 'university-classic' as TemplateId,
              title: 'University Classic',
              tag: 'Formal Academic',
              desc: 'Formal textbook hierarchy, section numberings (1.1, 1.2), and serif title accents.',
              color: 'from-emerald-600 to-teal-500',
            },
          ].map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className="clay-card p-4 hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${tmpl.color} mb-3`}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                  {tmpl.tag}
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1.5">
                  {tmpl.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mb-3">
                  {tmpl.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>Select Style</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
