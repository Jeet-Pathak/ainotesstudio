import React, { useMemo } from 'react';
import katex from 'katex';

interface MathBlockProps {
  latex: string;
  className?: string;
  title?: string;
  notes?: string;
}

export const MathBlock: React.FC<MathBlockProps> = ({ latex, className = '', title, notes }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        strict: false,
      });
    } catch (e) {
      return `<span class="text-red-500 font-mono text-sm">${latex}</span>`;
    }
  }, [latex]);

  return (
    <div className={`my-3 p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 shadow-sm prevent-split ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-blue-200/60 pb-1.5 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
            {title}
          </span>
          <span className="text-[10px] font-medium text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full">
            LaTeX Formula
          </span>
        </div>
      )}
      <div
        className="text-center overflow-x-auto py-1 text-slate-900"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {notes && <p className="text-[11px] text-blue-800/80 mt-1.5 text-center italic">{notes}</p>}
    </div>
  );
};

export const InlineMath: React.FC<{ latex: string }> = ({ latex }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
        strict: false,
      });
    } catch (e) {
      return `<span class="text-red-500 font-mono">${latex}</span>`;
    }
  }, [latex]);

  return <span dangerouslySetInnerHTML={{ __html: html }} className="inline-block mx-0.5" />;
};
