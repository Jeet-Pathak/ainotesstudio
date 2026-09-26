import React, { useState, useRef } from 'react';
import {
  GeneratedNotes,
  AppSettings,
  QuestionAnswerItem,
  NumericalSolution,
  ComparisonTable,
  ImagePlaceholderConfig,
  SubPartAnswer,
} from '../../types';
import { InlineMath } from '../math/MathBlock';
import { AcademicDiagram } from '../diagrams/AcademicDiagrams';
import { Upload, Trash2, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface PDFNotesDocumentProps {
  notes: GeneratedNotes;
  settings: AppSettings;
  previewMode?: boolean;
  onUpdateQAItem?: (qaId: string, updatedQA: Partial<QuestionAnswerItem>) => void;
}

/**
 * Helper to render academic text with key terms formatted in bold dark navy-blue (#002060),
 * matching academic exam standards. Supports Markdown **bold** or raw text.
 */
export const renderAcademicText = (text?: string | null) => {
  if (!text) return null;

  // Split by **markdown bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const inner = part.slice(2, -2);
          return (
            <strong key={idx} className="font-bold text-[#002060]">
              {inner}
            </strong>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
};

/**
 * Interactive Image Upload and Placeholder Component
 * Enforces strict < 1MB file size limit and preserves aspect ratio.
 */
export const ImagePlaceholderView: React.FC<{
  item: QuestionAnswerItem;
  onUpdateQAItem?: (qaId: string, updatedQA: Partial<QuestionAnswerItem>) => void;
  isInteractive?: boolean;
}> = ({ item, onUpdateQAItem, isInteractive = true }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const placeholder = item.imagePlaceholder;
  const currentImageUrl = placeholder?.uploadedImageUrl || item.diagramImageUrl;
  const figureTitle =
    placeholder?.figureTitle ||
    item.diagramTitle ||
    `Figure ${item.questionNumber}: Diagram for ${item.questionText.slice(0, 45)}`;
  const caption =
    placeholder?.caption ||
    item.diagramCaption ||
    'Labeled schematic visual diagram with structural details.';
  const placeholderLabel =
    placeholder?.placeholderText ||
    `[IMAGE REQUIRED: ${item.questionText.slice(0, 35)} Diagram]`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Invalid file format. Please upload a JPG, PNG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const MAX_SIZE_BYTES = 1000000; // 1 MB
    if (file.size >= MAX_SIZE_BYTES) {
      const sizeKB = (file.size / 1024).toFixed(1);
      setErrorMessage(
        `File rejected: Size (${sizeKB} KB) exceeds the strict 1 MB limit (1,000,000 bytes). Please select a file smaller than 1 MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (onUpdateQAItem) {
        onUpdateQAItem(item.id, {
          diagramImageUrl: dataUrl,
          imagePlaceholder: {
            isRequired: true,
            placeholderText: placeholderLabel,
            figureTitle,
            caption,
            uploadedImageUrl: dataUrl,
            uploadedFileName: file.name,
            uploadedFileSize: file.size,
          },
        });
      }
      setSuccessMessage(`Image "${file.name}" attached successfully (${(file.size / 1024).toFixed(1)} KB)!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (onUpdateQAItem) {
      onUpdateQAItem(item.id, {
        diagramImageUrl: undefined,
        imagePlaceholder: {
          isRequired: true,
          placeholderText: placeholderLabel,
          figureTitle,
          caption,
          uploadedImageUrl: undefined,
          uploadedFileName: undefined,
          uploadedFileSize: undefined,
        },
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSuccessMessage('Image removed.');
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  return (
    <div className="my-2.5 p-3 rounded-lg border border-dashed border-slate-400/80 bg-slate-50/70 text-center prevent-split">
      <div className="font-serif font-extrabold text-[12.5px] text-[#c00000] tracking-wide mb-1.5 uppercase">
        {placeholderLabel}
      </div>

      {currentImageUrl ? (
        <div className="space-y-1.5">
          <div className="flex justify-center items-center py-1.5 bg-white rounded border border-black/20 p-2 shadow-xs">
            <img
              src={currentImageUrl}
              alt={figureTitle}
              className="max-h-[220px] w-auto max-w-full object-contain rounded"
            />
          </div>

          {isInteractive && onUpdateQAItem && (
            <div className="flex items-center justify-center gap-2 pt-1 no-print">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] font-sans font-bold rounded bg-slate-200 hover:bg-slate-300 text-slate-800 transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Replace Image
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-2.5 py-1 text-[11px] font-sans font-bold rounded bg-rose-100 hover:bg-rose-200 text-rose-800 transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Remove Image
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-3 px-3 bg-white/90 rounded border border-slate-300 space-y-2">
          <div className="text-[11.5px] font-serif text-slate-500 italic">
            [Reserved image area for user upload]
          </div>

          {item.diagramKey && item.diagramKey !== 'custom' && (
            <div className="my-1.5 border-t border-b border-slate-200 py-1.5">
              <span className="text-[10px] font-sans font-bold text-blue-700 block mb-1">
                ✦ AI Vector Diagram Preview (Will render in print/PDF unless replaced by custom upload)
              </span>
              <AcademicDiagram
                config={{
                  title: figureTitle,
                  caption,
                  diagramKey: item.diagramKey,
                  svgMarkup: item.diagramSvg,
                }}
              />
            </div>
          )}

          {isInteractive && onUpdateQAItem && (
            <div className="pt-1 no-print">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 text-xs font-sans font-extrabold rounded-md bg-[#002060] text-white hover:bg-blue-900 transition shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Image (Max 1 MB)
              </button>
              <div className="text-[10px] font-sans text-slate-500 mt-1">
                Supported formats: JPG, PNG, WebP (Strictly &lt; 1,000,000 bytes)
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="mt-2 p-1.5 bg-rose-50 border border-rose-300 rounded text-rose-700 text-xs font-sans flex items-center justify-center gap-1.5 no-print">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="mt-1.5 p-1 bg-emerald-50 border border-emerald-300 rounded text-emerald-700 text-xs font-sans flex items-center justify-center gap-1 no-print">
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="mt-1.5 text-center">
        <div className="font-serif font-bold text-[13px] text-[#002060]">
          {figureTitle}
        </div>
        {caption && (
          <div className="font-serif text-[11px] text-slate-600 italic mt-0.5">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// DATA MODELS FOR DYNAMIC PAGINATION AND CONTINUOUS NUMBERING
// =========================================================================

export interface PointSliceItem {
  /** Original 0-based index in question.points (e.g., 0 for point 1, 3 for point 4) */
  originalIndex: number;
  title?: string;
  text: string;
  splitPart?: 'full' | 'first' | 'continuation';
}

export interface QuestionRenderSlice {
  qa: QuestionAnswerItem;
  /** True ONLY for the initial appearance of the question (Page where question starts) */
  isFirstChunkOfQuestion: boolean;
  renderIntro?: boolean;
  renderDiagram?: boolean;
  renderMainBodyHeading?: boolean;
  pointsSlice?: PointSliceItem[];
  subPartAnswersSlice?: SubPartAnswer[];
  renderComparisonTable?: boolean;
  renderNumerical?: boolean;
  renderFormulaLatex?: boolean;
  renderSubSection?: boolean;
  renderConclusion?: boolean;
}

// Height budget constants (in calibrated screen pixels for 210x297mm A4)
const USABLE_PAGE_HEIGHT_PX = 920;

function estimateQuestionHeaderHeight(questionText: string): number {
  const len = questionText ? questionText.length : 0;
  const textLines = Math.max(1, Math.ceil(len / 65));
  return 24 + textLines * 24 + 10;
}

function estimateIntroHeight(introHeading?: string, introText?: string): number {
  if (!introText) return 0;
  const headingH = introHeading ? 26 : 0;
  const lines = Math.max(1, Math.ceil(introText.length / 85));
  return headingH + lines * 21.5 + 12;
}

function estimateDiagramHeight(item: QuestionAnswerItem): number {
  if (item.imagePlaceholder) return 250;
  if (item.diagramKey || item.diagramSvg || item.diagramImageUrl) return 230;
  return 0;
}

function estimatePointHeight(title?: string, text?: string): number {
  const tLen = title ? title.length + 6 : 0;
  const bLen = text ? text.length : 0;
  const lines = Math.max(1, Math.ceil((tLen + bLen) / 85));
  return lines * 21.5 + 8;
}

function estimateSubPartHeight(sp: SubPartAnswer): number {
  const headerH = 26;
  const introLines = Math.max(1, Math.ceil((sp.partIntro?.length || 0) / 85));
  const pointsH = (sp.points || []).reduce((acc, p) => {
    const pLines = Math.max(1, Math.ceil(((p.title?.length || 0) + p.text.length + 5) / 85));
    return acc + pLines * 21 + 6;
  }, 0);
  return headerH + introLines * 21 + pointsH + 18;
}

function estimateComparisonTableHeight(table?: ComparisonTable): number {
  if (!table) return 0;
  const titleH = table.title ? 26 : 0;
  const headerRowH = 32;
  const rowsH = (table.rows?.length || 0) * 32;
  return titleH + headerRowH + rowsH + 18;
}

function estimateNumericalHeight(num?: NumericalSolution): number {
  if (!num) return 0;
  const givenH = 22 + Math.ceil((num.given?.length || 0) / 2) * 20;
  const toFindH = num.toFind ? 22 : 0;
  const formulaH = num.formula ? 36 : 0;
  const stepsH = (num.steps?.length || 0) * 38;
  const resultH = num.finalResult ? 34 : 0;
  return givenH + toFindH + formulaH + stepsH + resultH + 20;
}

function estimateSubSectionHeight(subHeading?: string, subContent?: string): number {
  if (!subContent) return 0;
  const headH = subHeading ? 26 : 0;
  const lines = Math.max(1, Math.ceil(subContent.length / 85));
  return headH + lines * 21.5 + 12;
}

function estimateConclusionHeight(conclusionHeading?: string, conclusion?: string): number {
  if (!conclusion) return 0;
  const headH = conclusionHeading ? 26 : 24;
  const lines = Math.max(1, Math.ceil(conclusion.length / 85));
  return headH + lines * 21.5 + 10;
}

/**
 * Finds a natural sentence boundary (.!?) near the target character count for clean point splitting.
 */
function findSentenceSplitIndex(text: string, targetIndex: number): number {
  if (targetIndex <= 0 || targetIndex >= text.length) return -1;
  const searchRadius = 70;
  const start = Math.max(20, targetIndex - searchRadius);
  const end = Math.min(text.length - 20, targetIndex + searchRadius);
  const sub = text.slice(start, end);
  const matches = [...sub.matchAll(/([.!?])\s+/g)];
  if (matches.length === 0) return -1;

  let bestPos = -1;
  let minDiff = Infinity;
  for (const m of matches) {
    const absPos = start + (m.index || 0) + 1;
    const diff = Math.abs(absPos - targetIndex);
    if (diff < minDiff) {
      minDiff = diff;
      bestPos = absPos;
    }
  }
  return bestPos;
}

/**
 * Core dynamic pagination engine: Computes continuous layout flow across A4 pages,
 * preserving unbroken point sequence numbers (1..N) and eliminating redundant headers.
 */
export function computeContinuousPagination(answerItems: QuestionAnswerItem[]): QuestionRenderSlice[][] {
  const pages: QuestionRenderSlice[][] = [];
  let currentPage: QuestionRenderSlice[] = [];
  let spaceLeft = USABLE_PAGE_HEIGHT_PX;

  const commitPage = () => {
    if (currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      spaceLeft = USABLE_PAGE_HEIGHT_PX;
    }
  };

  answerItems.forEach((item) => {
    const headerH = estimateQuestionHeaderHeight(item.questionText);
    const introH = estimateIntroHeight(item.introHeading, item.answerIntro);
    const firstPointH =
      item.points && item.points.length > 0
        ? estimatePointHeight(item.points[0].title, item.points[0].text)
        : 40;

    // Minimum space needed to start a new question on current page
    const minNeededToStart = headerH + Math.min(introH > 0 ? introH : 50, firstPointH);

    if (spaceLeft < minNeededToStart && currentPage.length > 0) {
      commitPage();
    }

    let currentSlice: QuestionRenderSlice = {
      qa: item,
      isFirstChunkOfQuestion: true,
    };
    spaceLeft -= headerH;

    // 1. Introduction
    if (item.answerIntro) {
      const iH = estimateIntroHeight(item.introHeading, item.answerIntro);
      if (iH <= spaceLeft || spaceLeft > USABLE_PAGE_HEIGHT_PX * 0.45) {
        currentSlice.renderIntro = true;
        spaceLeft -= iH;
      } else {
        currentPage.push(currentSlice);
        commitPage();
        currentSlice = {
          qa: item,
          isFirstChunkOfQuestion: false,
          renderIntro: true,
        };
        spaceLeft -= iH;
      }
    }

    // 2. Attached Diagram / Image Placeholder
    const hasDiagram = !!(
      item.imagePlaceholder ||
      item.diagramKey ||
      item.diagramSvg ||
      item.diagramImageUrl ||
      item.questionType === 'Diagram-Based' ||
      item.questionType === 'Diagram-based'
    );

    if (hasDiagram) {
      const dH = estimateDiagramHeight(item);
      if (dH <= spaceLeft) {
        currentSlice.renderDiagram = true;
        spaceLeft -= dH;
      } else {
        currentPage.push(currentSlice);
        commitPage();
        currentSlice = {
          qa: item,
          isFirstChunkOfQuestion: false,
          renderDiagram: true,
        };
        spaceLeft -= dH;
      }
    }

    // 3. Numbered Points (Sequential across all pages)
    if (item.points && item.points.length > 0) {
      let mainBodyHeadingRendered = false;
      const mbhHeight = item.mainBodyHeading ? 28 : 0;

      if (item.mainBodyHeading && spaceLeft >= mbhHeight + 35) {
        currentSlice.renderMainBodyHeading = true;
        spaceLeft -= mbhHeight;
        mainBodyHeadingRendered = true;
      }

      if (!currentSlice.pointsSlice) {
        currentSlice.pointsSlice = [];
      }

      for (let pIdx = 0; pIdx < item.points.length; pIdx++) {
        const pt = item.points[pIdx];
        const ptHeight = estimatePointHeight(pt.title, pt.text);

        if (!currentSlice.pointsSlice) {
          currentSlice.pointsSlice = [];
        }

        if (ptHeight <= spaceLeft) {
          // Point fits on current page
          currentSlice.pointsSlice.push({
            originalIndex: pIdx,
            title: pt.title,
            text: pt.text,
            splitPart: 'full',
          });
          spaceLeft -= ptHeight;
        } else {
          // Point exceeds remaining space. Check if sentence splitting is suitable
          if (spaceLeft >= 75 && pt.text.length > 250) {
            const charBudget = Math.floor(((spaceLeft - 20) / 21.5) * 80);
            const splitIdx = findSentenceSplitIndex(pt.text, charBudget);

            if (splitIdx > 60 && splitIdx < pt.text.length - 40) {
              const part1 = pt.text.slice(0, splitIdx).trim();
              const part2 = pt.text.slice(splitIdx).trim();

              currentSlice.pointsSlice.push({
                originalIndex: pIdx,
                title: pt.title,
                text: part1,
                splitPart: 'first',
              });

              currentPage.push(currentSlice);
              commitPage();

              // Continuation page begins directly with remainder of the point
              currentSlice = {
                qa: item,
                isFirstChunkOfQuestion: false,
                pointsSlice: [
                  {
                    originalIndex: pIdx,
                    title: undefined,
                    text: part2,
                    splitPart: 'continuation',
                  },
                ],
              };
              const part2H = Math.ceil(part2.length / 85) * 21.5 + 8;
              spaceLeft -= part2H;
              continue;
            }
          }

          // Move the whole point to the next page
          if (
            (currentSlice.pointsSlice && currentSlice.pointsSlice.length > 0) ||
            currentSlice.renderIntro ||
            currentSlice.renderDiagram ||
            currentSlice.isFirstChunkOfQuestion
          ) {
            currentPage.push(currentSlice);
          }
          commitPage();

          currentSlice = {
            qa: item,
            isFirstChunkOfQuestion: false,
            pointsSlice: [
              {
                originalIndex: pIdx,
                title: pt.title,
                text: pt.text,
                splitPart: 'full',
              },
            ],
          };

          if (item.mainBodyHeading && !mainBodyHeadingRendered) {
            currentSlice.renderMainBodyHeading = true;
            spaceLeft -= mbhHeight;
            mainBodyHeadingRendered = true;
          }

          spaceLeft -= ptHeight;
        }
      }
    }

    // 4. SubPart Answers
    if (item.subPartAnswers && item.subPartAnswers.length > 0) {
      item.subPartAnswers.forEach((sp) => {
        const spH = estimateSubPartHeight(sp);
        if (
          spH > spaceLeft &&
          ((currentSlice.pointsSlice && currentSlice.pointsSlice.length > 0) ||
            currentSlice.renderIntro ||
            currentSlice.renderDiagram)
        ) {
          currentPage.push(currentSlice);
          commitPage();
          currentSlice = {
            qa: item,
            isFirstChunkOfQuestion: false,
            subPartAnswersSlice: [],
          };
        }
        if (!currentSlice.subPartAnswersSlice) currentSlice.subPartAnswersSlice = [];
        currentSlice.subPartAnswersSlice.push(sp);
        spaceLeft -= spH;
      });
    }

    // 5. Comparison Table
    if (item.comparisonTable) {
      const ctH = estimateComparisonTableHeight(item.comparisonTable);
      if (
        ctH > spaceLeft &&
        ((currentSlice.pointsSlice && currentSlice.pointsSlice.length > 0) ||
          currentSlice.renderIntro ||
          currentSlice.renderDiagram)
      ) {
        currentPage.push(currentSlice);
        commitPage();
        currentSlice = {
          qa: item,
          isFirstChunkOfQuestion: false,
        };
      }
      currentSlice.renderComparisonTable = true;
      spaceLeft -= ctH;
    }

    // 6. Numerical Solution
    if (item.numericalSolution) {
      const numH = estimateNumericalHeight(item.numericalSolution);
      if (
        numH > spaceLeft &&
        ((currentSlice.pointsSlice && currentSlice.pointsSlice.length > 0) ||
          currentSlice.renderIntro ||
          currentSlice.renderDiagram)
      ) {
        currentPage.push(currentSlice);
        commitPage();
        currentSlice = {
          qa: item,
          isFirstChunkOfQuestion: false,
        };
      }
      currentSlice.renderNumerical = true;
      spaceLeft -= numH;
    }

    // 7. KaTeX Formula
    if (item.formulaLatex && !item.numericalSolution) {
      const fH = 42;
      if (fH > spaceLeft) {
        currentPage.push(currentSlice);
        commitPage();
        currentSlice = {
          qa: item,
          isFirstChunkOfQuestion: false,
        };
      }
      currentSlice.renderFormulaLatex = true;
      spaceLeft -= fH;
    }

    // 8. Extended SubSection
    if (item.subHeading && item.subContent) {
      const subH = estimateSubSectionHeight(item.subHeading, item.subContent);
      if (
        subH > spaceLeft &&
        ((currentSlice.pointsSlice && currentSlice.pointsSlice.length > 0) ||
          currentSlice.renderIntro ||
          currentSlice.renderDiagram)
      ) {
        currentPage.push(currentSlice);
        commitPage();
        currentSlice = {
          qa: item,
          isFirstChunkOfQuestion: false,
        };
      }
      currentSlice.renderSubSection = true;
      spaceLeft -= subH;
    }

    // 9. Concluding Synthesis
    if (item.conclusion) {
      const concH = estimateConclusionHeight(item.conclusionHeading, item.conclusion);
      if (
        concH > spaceLeft &&
        ((currentSlice.pointsSlice && currentSlice.pointsSlice.length > 0) ||
          currentSlice.renderIntro ||
          currentSlice.renderDiagram)
      ) {
        currentPage.push(currentSlice);
        commitPage();
        currentSlice = {
          qa: item,
          isFirstChunkOfQuestion: false,
        };
      }
      currentSlice.renderConclusion = true;
      spaceLeft -= concH;
    }

    currentPage.push(currentSlice);
    // Add small divider gap between consecutive questions on the same page
    spaceLeft -= 16;
  });

  commitPage();

  return pages;
}

export const PDFNotesDocument: React.FC<PDFNotesDocumentProps> = ({
  notes,
  settings,
  previewMode = false,
  onUpdateQAItem,
}) => {
  const { watermarkOpacity = 0.10, watermarkPosition = 'diagonal' } = settings;

  // Watermark styling based on position & opacity
  const getWatermarkStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      opacity: watermarkOpacity,
      position: 'absolute',
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 1,
      maxWidth: '82%',
      maxHeight: '75%',
      objectFit: 'contain',
    };

    switch (watermarkPosition) {
      case 'diagonal':
        return {
          ...baseStyle,
          transform: 'rotate(-25deg) scale(1.05)',
        };
      case 'corner':
        return {
          ...baseStyle,
          right: '25px',
          bottom: '25px',
          maxWidth: '45%',
          transform: 'none',
        };
      case 'center':
      default:
        return {
          ...baseStyle,
          transform: 'scale(0.95)',
        };
    }
  };

  // Group questions by Module for Page 1 Overview Bank
  const questionsByModule: Record<string, QuestionAnswerItem[]> = {};
  if (notes.qaSection && notes.qaSection.length > 0) {
    notes.qaSection.forEach((q) => {
      const mod = q.module || 'Module-1';
      if (!questionsByModule[mod]) questionsByModule[mod] = [];
      questionsByModule[mod].push(q);
    });
  }

  const answerItems = notes.qaSection && notes.qaSection.length > 0 ? notes.qaSection : [];

  // =========================================================================
  // CONTINUOUS-FLOW PAGINATION ENGINE
  // Eliminates white gaps, maintains continuous 1..N numbering, and removes
  // repeated headers on continuation pages.
  // =========================================================================
  const layoutPages = computeContinuousPagination(answerItems);

  // Dynamic Total Page Calculation
  const totalPages = Math.max(1, 1 + layoutPages.length);

  return (
    <div id="pdf-render-document" className="w-full flex flex-col items-center select-text">
      {/* =========================================================================
          PAGE 1: TRADITIONAL ACADEMIC QUESTION PAPER & SYLLABUS OVERVIEW
         ========================================================================= */}
      <div
        className="a4-page-sheet a4-page-academic relative bg-white text-black mb-8"
        data-page-number="1"
      >
        {/* Watermark Asset */}
        <div className="watermark-container">
          <img
            src="/assets/genzineers_watermark.png"
            alt="Watermark"
            className="watermark-logo"
            style={getWatermarkStyle()}
          />
        </div>

        {/* Clean Thin Black Rectangular Border Around the Entire Page */}
        <div className="a4-page-border flex flex-col justify-between h-full relative z-10">
          <div>
            {/* Top Running Header */}
            <div className="flex items-center justify-between text-[11px] font-serif text-slate-800 pb-1 mb-2 border-b border-black/20">
              <span>{notes.institute || 'MAKAUT CSE / IT Department'}</span>
              <span className="font-semibold text-[#002060]">{notes.subject || 'ACADEMIC SYLLABUS & QUESTION BANK'}</span>
            </div>

            {/* Modules and Categorized Questions */}
            {Object.keys(questionsByModule).length > 0 ? (
              Object.entries(questionsByModule).map(([modName, modQuestions], mIdx) => {
                const veryShort = modQuestions.filter(
                  (q) => q.marks <= 2 || q.questionType === 'Very Short Answer' || q.questionType === 'Definition'
                );
                const shortAns = modQuestions.filter(
                  (q) => (q.marks > 2 && q.marks <= 5) || q.questionType === 'Short Answer'
                );
                const longAns = modQuestions.filter(
                  (q) =>
                    q.marks > 5 ||
                    q.questionType === 'Long Answer' ||
                    q.questionType === 'Explain' ||
                    q.questionType === 'Compare' ||
                    q.questionType === 'Numerical' ||
                    q.questionType === 'Diagram-Based'
                );

                return (
                  <div key={mIdx} className="mb-4 prevent-split">
                    {/* Centered Yellow Highlight Module Banner */}
                    <div className="text-center my-2">
                      <mark className="bg-[#FFFF00] text-black font-serif font-bold text-xs sm:text-sm px-3.5 py-0.5 border border-black/40 inline-block">
                        {modName}
                      </mark>
                    </div>

                    {/* Very Short Answer Section */}
                    {veryShort.length > 0 && (
                      <div className="mb-2.5">
                        <div className="font-serif font-bold text-[13.5px] text-black flex items-center gap-1 mb-1">
                          <span className="text-[#c00000] text-base">★</span>
                          <u className="font-bold">Very Short Answer (1 or 2 marks)</u>
                        </div>
                        <div className="space-y-1 pl-3">
                          {veryShort.map((q, idx) => (
                            <div key={q.id || idx} className="font-serif font-bold text-[13px] text-[#c00000] leading-snug">
                              {q.questionNumber || idx + 1}. {q.questionText} {q.marks ? `[${q.marks}M]` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Short Answer Section */}
                    {shortAns.length > 0 && (
                      <div className="mb-2.5">
                        <div className="font-serif font-bold text-[13.5px] text-black flex items-center gap-1 mb-1">
                          <span className="text-[#c00000] text-base">★</span>
                          <u className="font-bold">Short Answer (3–5 marks)</u>
                        </div>
                        <div className="space-y-1 pl-3">
                          {shortAns.map((q, idx) => (
                            <div key={q.id || idx} className="font-serif font-bold text-[13px] text-[#c00000] leading-snug">
                              {q.questionNumber || idx + 1}. {q.questionText} {q.marks ? `[${q.marks}M]` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Long Answer Section */}
                    {longAns.length > 0 && (
                      <div className="mb-2.5">
                        <div className="font-serif font-bold text-[13.5px] text-black flex items-center gap-1 mb-1">
                          <span className="text-[#c00000] text-base">★</span>
                          <u className="font-bold">Long Answer (10/15 marks) (VERY IMPORTANT)</u>
                        </div>
                        <div className="space-y-1 pl-3">
                          {longAns.map((q, idx) => (
                            <div key={q.id || idx} className="font-serif font-bold text-[13px] text-[#c00000] leading-snug">
                              {q.questionNumber || idx + 1}. {q.questionText} {q.marks ? `[${q.marks}M]` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-500 font-serif">
                No questions loaded yet.
              </div>
            )}
          </div>

          {/* Bottom Footer with Clean Academic Page Number */}
          <div className="border-t border-black/20 pt-1.5 mt-auto flex items-center justify-between text-[11px] font-serif text-slate-700">
            <span>{notes.institute || 'MAKAUT CSE / IT Department'}</span>
            <span className="font-bold">Page 1 of {totalPages}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PAGES 2+: EXAM-READY ACADEMIC ANSWER SHEETS (CONTINUOUS FLOW)
         ========================================================================= */}
      {layoutPages.map((pageSlices, pageIdx) => {
        const pageNum = pageIdx + 2;

        return (
          <div
            key={`page-${pageNum}`}
            className="a4-page-sheet a4-page-academic relative bg-white text-black mb-8"
            data-page-number={pageNum}
          >
            {/* Watermark Asset */}
            <div className="watermark-container">
              <img
                src="/assets/genzineers_watermark.png"
                alt="Watermark"
                className="watermark-logo"
                style={getWatermarkStyle()}
              />
            </div>

            {/* Clean Thin Black Rectangular Border Around the Entire Page */}
            <div className="a4-page-border flex flex-col justify-between h-full relative z-10">
              <div className="space-y-2.5">
                {pageSlices.map((slice, sliceIdx) => {
                  const item = slice.qa;

                  return (
                    <div
                      key={`slice-${item.id || sliceIdx}-${slice.isFirstChunkOfQuestion ? 'first' : 'cont'}-${sliceIdx}`}
                      className={
                        sliceIdx > 0 && slice.isFirstChunkOfQuestion
                          ? 'pt-2.5 border-t border-black/15'
                          : ''
                      }
                    >
                      {/* 1. TOP QUESTION HEADING - ONLY ON THE FIRST PAGE WHERE QUESTION STARTS */}
                      {slice.isFirstChunkOfQuestion && (
                        <div className="flex items-start justify-between gap-3 mb-2 pb-1 border-b border-black/10">
                          <div className="flex items-baseline gap-1.5 flex-1">
                            {/* Question Number in Bold Red */}
                            <span className="font-serif font-extrabold text-[19px] text-[#c00000] shrink-0 leading-tight">
                              {item.questionNumber}.
                            </span>
                            {/* Question Text in Large Bold Dark Navy-Blue Serif Typography */}
                            <h2 className="font-serif font-bold text-[18px] text-[#002060] leading-[1.3] text-justify">
                              {item.questionText}
                            </h2>
                          </div>
                          {/* Marks Displayed on Upper Right in Gray */}
                          <div className="shrink-0 text-right pt-0.5">
                            <span className="font-serif text-[15px] font-medium text-[#4b5563]">
                              [{item.marks || 10} Marks]
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 2. SECTION 1: INTRODUCTION & MEANING */}
                      {slice.renderIntro && item.answerIntro && (
                        <div className="mb-2">
                          {item.introHeading && (
                            <h3 className="font-serif font-bold text-[16px] text-[#002060] mb-1">
                              {item.introHeading}
                            </h3>
                          )}
                          <p className="font-serif text-[14.5px] text-black leading-[1.48] text-justify">
                            {renderAcademicText(item.answerIntro)}
                          </p>
                        </div>
                      )}

                      {/* 3. IMAGE PLACEHOLDER OR ATTACHED DIAGRAM */}
                      {slice.renderDiagram && (
                        item.imagePlaceholder ? (
                          <ImagePlaceholderView
                            item={item}
                            onUpdateQAItem={onUpdateQAItem}
                            isInteractive={previewMode || !!onUpdateQAItem}
                          />
                        ) : (item.diagramKey || item.diagramSvg || item.diagramImageUrl) ? (
                          <div className="my-2.5 text-center">
                            <AcademicDiagram
                              config={{
                                title:
                                  item.diagramTitle ||
                                  `Figure ${item.questionNumber}: Architectural Diagram for ${item.questionText.slice(0, 40)}`,
                                caption:
                                  item.diagramCaption ||
                                  'Precision vector diagram with labeled functional components.',
                                diagramKey: item.diagramKey || 'custom',
                                svgMarkup: item.diagramSvg,
                                imageUrl: item.diagramImageUrl,
                              }}
                            />
                          </div>
                        ) : null
                      )}

                      {/* 4. SECTION 2: MAIN BODY & CONTINUOUS NUMBERED POINTS */}
                      {slice.pointsSlice && slice.pointsSlice.length > 0 && (
                        <div className="mb-2">
                          {slice.renderMainBodyHeading && item.mainBodyHeading && (
                            <h3 className="font-serif font-bold text-[16px] text-[#002060] mb-1.5">
                              {item.mainBodyHeading}
                            </h3>
                          )}
                          <div className="space-y-1.5 pl-0.5">
                            {slice.pointsSlice.map((pt, pIdx) => {
                              const globalPointNum = pt.originalIndex + 1;
                              const cleanTitle = pt.title
                                ? pt.title.replace(/^\d+[\.\)]\s*/, '').trim()
                                : '';

                              if (pt.splitPart === 'continuation') {
                                return (
                                  <div
                                    key={`split-cont-${pt.originalIndex}-${pIdx}`}
                                    className="font-serif text-[14.5px] text-black leading-[1.48] text-justify"
                                  >
                                    <span>{renderAcademicText(pt.text)}</span>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={`pt-${pt.originalIndex}-${pIdx}`}
                                  className="font-serif text-[14.5px] text-black leading-[1.48] text-justify"
                                >
                                  {cleanTitle ? (
                                    <>
                                      <strong className="font-serif font-bold text-[#002060]">
                                        {globalPointNum}. {cleanTitle}:{' '}
                                      </strong>
                                      <span>{renderAcademicText(pt.text)}</span>
                                    </>
                                  ) : (
                                    <>
                                      <strong className="font-serif font-bold text-[#002060]">
                                        {globalPointNum}.{' '}
                                      </strong>
                                      <span>{renderAcademicText(pt.text)}</span>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 4.1 SUBPART ANSWERS (Multi-part question) */}
                      {slice.subPartAnswersSlice && slice.subPartAnswersSlice.length > 0 && (
                        <div className="space-y-2.5 my-2 pl-1">
                          {slice.subPartAnswersSlice.map((sp, spIdx) => (
                            <div key={spIdx} className="p-2.5 rounded border border-black/20 bg-slate-50/50">
                              <div className="font-serif font-bold text-[15px] text-[#002060] mb-1 flex items-center justify-between">
                                <span>{sp.partLabel}: {sp.partQuestion}</span>
                                <span className="text-xs font-normal text-slate-600">[{sp.partMarks} Marks]</span>
                              </div>
                              <p className="font-serif text-[14px] text-black leading-snug">
                                {renderAcademicText(sp.partIntro)}
                              </p>
                              {sp.points && sp.points.length > 0 && (
                                <div className="mt-1.5 space-y-1 pl-2">
                                  {sp.points.map((spt, sidx) => (
                                    <div key={sidx} className="font-serif text-[13.5px]">
                                      {spt.title && <strong className="text-[#002060]">• {spt.title}: </strong>}
                                      <span>{renderAcademicText(spt.text)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 5. COMPARISON TABLE */}
                      {slice.renderComparisonTable && item.comparisonTable && (
                        <div className="my-2.5 overflow-hidden rounded border border-black/30">
                          {item.comparisonTable.title && (
                            <div className="bg-[#002060] text-white font-serif font-bold text-xs sm:text-[13px] px-3 py-1 text-center">
                              {item.comparisonTable.title}
                            </div>
                          )}
                          <table className="w-full text-[13.5px] font-serif border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b border-black/30 font-bold text-[#002060]">
                                {item.comparisonTable.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="p-2 text-left border-r last:border-r-0 border-black/20">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {item.comparisonTable.rows.map((row, rIdx) => (
                                <tr
                                  key={rIdx}
                                  className={`border-b border-black/15 last:border-b-0 ${
                                    rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                                  }`}
                                >
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={`p-2 align-top border-r last:border-r-0 border-black/15 ${
                                        cIdx === 0 ? 'font-bold text-[#002060]' : 'text-black'
                                      }`}
                                    >
                                      {renderAcademicText(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* 6. NUMERICAL SOLUTION */}
                      {slice.renderNumerical && item.numericalSolution && (
                        <div className="my-2 p-3 rounded border border-black/25 bg-slate-50/50 space-y-2">
                          {/* Given Data */}
                          {item.numericalSolution.given && item.numericalSolution.given.length > 0 && (
                            <div>
                              <strong className="font-serif font-bold text-[#002060] text-[14px] block mb-1">
                                Given Data:
                              </strong>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[13.5px] font-serif pl-2">
                                {item.numericalSolution.given.map((g, gIdx) => (
                                  <div key={gIdx}>
                                    <span className="font-semibold text-slate-700">• {g.param}:</span>{' '}
                                    <span className="font-mono font-bold text-[#002060]">{g.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* To Find */}
                          {item.numericalSolution.toFind && (
                            <div className="text-[13.5px] font-serif">
                              <strong className="font-bold text-[#002060]">To Calculate: </strong>
                              <span>{item.numericalSolution.toFind}</span>
                            </div>
                          )}

                          {/* Formula */}
                          {item.numericalSolution.formula && (
                            <div className="my-1 py-1 px-2.5 bg-white rounded border border-black/20 text-center">
                              <span className="text-[11px] font-bold text-slate-500 block uppercase">Governing Formula</span>
                              <InlineMath latex={item.numericalSolution.formula} />
                            </div>
                          )}

                          {/* Step by step calculations */}
                          {item.numericalSolution.steps && item.numericalSolution.steps.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <strong className="font-serif font-bold text-[#002060] text-[14px] block">
                                Step-by-Step Calculation:
                              </strong>
                              {item.numericalSolution.steps.map((st) => (
                                <div key={st.stepNumber} className="text-[13.5px] font-serif pl-2">
                                  <span className="font-bold text-[#002060]">Step {st.stepNumber} ({st.title}): </span>
                                  <span>{st.explanation}</span>
                                  {st.equation && (
                                    <div className="my-0.5 pl-3 font-serif">
                                      <InlineMath latex={st.equation} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Final Result Box */}
                          {item.numericalSolution.finalResult && (
                            <div className="mt-2 p-2 bg-[#002060]/10 border border-[#002060]/30 rounded flex items-center justify-between text-[14px] font-serif">
                              <div>
                                <span className="font-bold text-[#002060]">Final Result: </span>
                                <span className="font-bold text-black">{item.numericalSolution.finalResult}</span>
                              </div>
                              {item.numericalSolution.unit && (
                                <span className="text-xs font-bold text-slate-600 font-mono">
                                  [{item.numericalSolution.unit}]
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 7. OPTIONAL KaTeX FORMULA BLOCK */}
                      {slice.renderFormulaLatex && item.formulaLatex && !slice.renderNumerical && (
                        <div className="my-2 py-1.5 px-3 text-center border border-black/20 bg-slate-50/50 font-serif rounded">
                          <InlineMath latex={item.formulaLatex} />
                        </div>
                      )}

                      {/* 8. SECTION 3: FACTORS / INFLUENCES / EXTENDED SUBSECTION */}
                      {slice.renderSubSection && item.subHeading && item.subContent && (
                        <div className="mb-2">
                          <h3 className="font-serif font-bold text-[16px] text-[#002060] mb-1">
                            {item.subHeading}
                          </h3>
                          <p className="font-serif text-[14.5px] text-black leading-[1.48] text-justify">
                            {renderAcademicText(item.subContent)}
                          </p>
                        </div>
                      )}

                      {/* 9. SECTION 4: CONCLUSION */}
                      {slice.renderConclusion && item.conclusion && (
                        <div className="mb-1">
                          <h3 className="font-serif font-bold text-[16px] text-[#002060] mb-1">
                            {item.conclusionHeading || 'Conclusion'}
                          </h3>
                          <p className="font-serif text-[14.5px] text-black leading-[1.48] text-justify">
                            {renderAcademicText(item.conclusion.replace(/^conclusion:\s*/i, ''))}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Footer with Clean Academic Page Number */}
              <div className="border-t border-black/20 pt-1.5 mt-auto flex items-center justify-between text-[11px] font-serif text-slate-700">
                <span>{notes.subject || 'University Examination Notes'}</span>
                <span className="font-bold">Page {pageNum} of {totalPages}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
