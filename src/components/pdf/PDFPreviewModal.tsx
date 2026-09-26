import React, { useState } from 'react';
import { GeneratedNotes, AppSettings } from '../../types';
import { PDFNotesDocument } from './PDFNotesDocument';
import { PDFExporter } from '../../services/pdfExporter';
import confetti from 'canvas-confetti';
import {
  FileDown,
  Printer,
  Edit3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  CheckCircle2,
  ShieldCheck,
  FileEdit,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from 'lucide-react';

interface PDFPreviewModalProps {
  notes: GeneratedNotes;
  settings: AppSettings;
  onEditNotes: () => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateNotes?: (notes: GeneratedNotes) => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  notes,
  settings,
  onEditNotes,
  onUpdateSettings,
  onUpdateNotes,
}) => {
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userCustomFilename, setUserCustomFilename] = useState<boolean>(false);
  const [pdfFilename, setPdfFilename] = useState<string>(() => {
    return PDFExporter.sanitizeFilename(
      `${notes.subject || 'Notes'}_${notes.module || 'Module'}`.replace(/\s+/g, '_')
    );
  });

  React.useEffect(() => {
    if (!userCustomFilename && notes) {
      const defaultName = PDFExporter.sanitizeFilename(
        `${notes.subject || 'Notes'}_${notes.module || 'Module'}`.replace(/\s+/g, '_')
      );
      setPdfFilename(defaultName);
    }
  }, [notes.subject, notes.module, notes.id, userCustomFilename]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState('');
  const [activeThumbnailPage, setActiveThumbnailPage] = useState<number>(1);

  const handleUpdateQAItem = (qaId: string, updatedQA: any) => {
    if (onUpdateNotes) {
      const updated = notes.qaSection.map((q) => (q.id === qaId ? { ...q, ...updatedQA } : q));
      onUpdateNotes({
        ...notes,
        qaSection: updated,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Validation Status
  const validation = PDFExporter.validateDocument(notes);

  // Zoom Controls
  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.15, 1.4));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoomScale(0.85);

  // Download PDF Handler
  const handleDownloadPDF = async () => {
    setIsExporting(true);
    setExportProgress(10);
    setExportStage('Initializing high-resolution renderer...');

    try {
      await PDFExporter.exportToPDF('pdf-render-document', {
        filename: pdfFilename,
        onProgress: (prog, stage) => {
          setExportProgress(prog);
          setExportStage(stage);
        },
      });

      // Trigger Celebration Confetti
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0071E3', '#6366F1', '#10B981', '#F59E0B'],
      });
    } catch (err: any) {
      console.error('PDF export error details:', err);
      alert(`PDF Generation notice: ${err?.message || err}. You can also use the Native Print option for 100% crisp vector PDF.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Native Print Handler
  const handleNativePrint = () => {
    PDFExporter.triggerNativePrint();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Floating Action Bar */}
      <div className="clay-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Document Name & Rename button */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">PDF Document:</span>
              <span className="font-mono text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-slate-700">
                {pdfFilename}
              </span>
              <button
                onClick={() => setIsRenaming(!isRenaming)}
                className="text-[11px] font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1"
              >
                <FileEdit className="w-3.5 h-3.5" />
                Rename
              </button>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              A4 Format • Authentic Gen-Zineers Watermark • Complete Academic Document
            </span>
          </div>
        </div>

        {/* Right: Actions (Zoom, Print, Edit, Download) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onEditNotes}
            className="clay-btn-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" />
            Edit Notes
          </button>

          <button
            onClick={handleNativePrint}
            className="clay-btn-secondary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
            title="Print to PDF via native browser vector engine"
          >
            <Printer className="w-4 h-4" />
            Native Print / PDF
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="clay-btn-primary px-5 py-2 text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-60"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isExporting ? 'Generating PDF...' : 'Download Final PDF'}</span>
          </button>
        </div>
      </div>

      {/* Rename PDF Modal Overlay */}
      {isRenaming && (
        <div className="clay-card p-4 mb-6 bg-blue-50/90 dark:bg-slate-800/90 border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
              Custom PDF File Name:
            </label>
            <input
              type="text"
              value={pdfFilename}
              onChange={(e) => setPdfFilename(e.target.value)}
              className="clay-input w-full p-2 text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setPdfFilename(PDFExporter.sanitizeFilename(pdfFilename));
                setUserCustomFilename(true);
                setIsRenaming(false);
              }}
              className="clay-btn-primary px-4 py-2 text-xs font-bold"
            >
              Apply Name
            </button>
            <button
              onClick={() => setIsRenaming(false)}
              className="clay-btn-secondary px-3 py-2 text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Export Progress Notification */}
      {isExporting && (
        <div className="clay-card p-4 mb-6 bg-blue-600 text-white shadow-xl animate-pulse">
          <div className="flex items-center justify-between mb-2 text-xs font-bold">
            <span>{exportStage}</span>
            <span>{exportProgress}%</span>
          </div>
          <div className="w-full h-2 bg-blue-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Quality Check & Watermark Controls Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Settings & Pre-Flight Checks */}
        <div className="lg:col-span-3 space-y-4">
          {/* Watermark Live Customizer */}
          <div className="clay-card p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Gen-Zineers Watermark Settings
            </h4>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  <span>Watermark Opacity</span>
                  <span className="font-mono">{Math.round(settings.watermarkOpacity * 100)}%</span>
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Watermark Position
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['center', 'diagonal', 'corner'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => onUpdateSettings({ ...settings, watermarkPosition: pos })}
                      className={`py-1 text-[11px] font-bold rounded-lg capitalize transition-all ${
                        settings.watermarkPosition === pos
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Flight Quality Validation Checks */}
          <div className="clay-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                Pre-Flight Document Quality
              </h4>
            </div>

            <div className="space-y-2">
              {validation.checks.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: PDF Sheet Canvas */}
        <div className="lg:col-span-9">
          <div className="rounded-3xl border border-slate-300 dark:border-slate-800 bg-slate-200/80 dark:bg-slate-950/90 p-6 sm:p-10 shadow-inner overflow-x-auto flex justify-center">
            <div
              className="transition-transform duration-200 origin-top"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <PDFNotesDocument
                notes={notes}
                settings={settings}
                previewMode={true}
                onUpdateQAItem={handleUpdateQAItem}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
