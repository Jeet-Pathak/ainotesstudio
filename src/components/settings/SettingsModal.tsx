import React, { useState } from 'react';
import { AppSettings, Project } from '../../types';
import { ApiClient, HealthStatus } from '../../services/apiClient';
import {
  Settings,
  X,
  ShieldCheck,
  Cpu,
  Palette,
  BookOpen,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  dbStatus?: HealthStatus;
  projects?: Project[];
  onRefreshProjects?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  dbStatus,
  projects = [],
  onRefreshProjects,
}) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualMigration = async () => {
    setIsMigrating(true);
    setMigrationMessage(null);

    try {
      const result = await ApiClient.migrateToMongoDB(projects, settings);
      if (result.success) {
        setMigrationMessage(`✅ ${result.message || 'All records successfully synchronized to MongoDB!'}`);
        if (onRefreshProjects) onRefreshProjects();
      } else {
        setMigrationMessage(`⚠️ ${result.message}`);
      }
    } catch (err: any) {
      setMigrationMessage(`❌ Migration error: ${err?.message || 'Server unreachable'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="clay-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Admin Settings & PDF Engine Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure watermark parameters, institute metadata, typography, and MongoDB database storage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="space-y-6">
          {/* SECTION 0: MONGODB DATABASE STORAGE STATUS */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  MongoDB Cloud Database Architecture
                </h4>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                  dbStatus?.dbConnected !== false
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {dbStatus?.dbConnected !== false ? 'MongoDB Connected' : 'Local Fallback'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block mb-0.5">Database Cluster:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  ai_notes_studio (Atlas Cloud)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block mb-0.5">Persistent Projects:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {projects.length} Projects Saved in MongoDB
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                All notes, questions, and templates are stored persistently in MongoDB.
              </span>
              <button
                onClick={handleManualMigration}
                disabled={isMigrating}
                className="clay-btn-secondary px-3 py-1.5 text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                <span>{isMigrating ? 'Migrating...' : 'Sync to MongoDB'}</span>
              </button>
            </div>

            {migrationMessage && (
              <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200">
                {migrationMessage}
              </div>
            )}
          </div>

          {/* SECTION 1: GEN-ZINEERS WATERMARK CONFIG */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Gen-Zineers Watermark Parameters
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Watermark Opacity</span>
                  <span className="font-mono text-blue-600 font-bold">
                    {Math.round(settings.watermarkOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.04"
                  max="0.30"
                  step="0.02"
                  value={settings.watermarkOpacity}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, watermarkOpacity: parseFloat(e.target.value) })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Recommended: 8%–14% for maximum legibility and clear print visibility.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Watermark Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['center', 'diagonal', 'corner'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => onUpdateSettings({ ...settings, watermarkPosition: pos })}
                      className={`py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                        settings.watermarkPosition === pos
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'clay-input text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: INSTITUTION & AUTHOR DEFAULTS */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Academic Metadata & Branding
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Institute / College
                </label>
                <input
                  type="text"
                  value={settings.instituteName}
                  onChange={(e) => onUpdateSettings({ ...settings, instituteName: e.target.value })}
                  placeholder="e.g. MAKAUT CSE / IT Department"
                  className="clay-input w-full p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Author / Prepared By
                </label>
                <input
                  type="text"
                  value={settings.authorName}
                  onChange={(e) => onUpdateSettings({ ...settings, authorName: e.target.value })}
                  placeholder="e.g. Prof. Academic Committee"
                  className="clay-input w-full p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: AI ENGINE & REASONING TONE */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                AI Synthesis Engine & Tone
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'simple-academic', title: 'Simple Academic', desc: 'Clear English, core definitions, exam focus' },
                { id: 'comprehensive', title: 'Comprehensive', desc: 'Detailed mechanisms, university depth' },
                { id: 'high-yield-bullet', title: 'High-Yield', desc: 'Quick points, formulas, high scoring' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ ...settings, aiTone: t.id as any })}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
                    settings.aiTone === t.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'clay-input text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs mb-0.5">{t.title}</div>
                  <div className={`text-[10px] ${settings.aiTone === t.id ? 'text-blue-100' : 'text-slate-500'}`}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button onClick={onClose} className="clay-btn-primary px-6 py-2 text-xs font-bold cursor-pointer">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
