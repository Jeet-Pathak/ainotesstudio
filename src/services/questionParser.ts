import { Question, QuestionType, SubQuestionItem, ImagePlaceholderConfig, DiagramConfig } from '../types';

export interface ParsedMarksResult {
  marks: number | null;
  isExplicit: boolean;
  marksSource: 'explicit' | 'subquestion' | 'section-shared' | 'inferred';
  cleanedText: string;
  subQuestions?: SubQuestionItem[];
}

export class QuestionParser {
  /**
   * Extracts marks from a question string in all academic examination formats:
   * - "What is an operating system? (2 Marks)"
   * - "Explain the working of a compiler. [5 Marks]"
   * - "Define an algorithm. — 1M" / "– 1M" / "- 1M" / "— 1 Mark"
   * - "Explain deadlock (10 marks)."
   * - "Differentiate between RAM and ROM. (5M)"
   * - "Describe the architecture of a computer. (15 Marks)"
   * - "Discuss the complete architecture and working of a computer system. (20 Marks)"
   * - "Explain the following: (a) Process (2) (b) Thread (3)"
   * - "Q1. Explain paging. [10]"
   * - "What is a process? 2 marks"
   * - "Explain the following questions for 5 marks each."
   * - Variations: 1M, 2M, 3M, 4M, 5M, 8M, 10M, 12M, 15M, 20M, [10], (2), etc.
   * - Composite marks: (10+5), [10+5 Marks] -> 15 Marks
   * - Detection priority:
   *   1. Explicit marks within/beside question.
   *   2. Subquestion individual marks.
   *   3. Shared section marks if passed as context.
   *   4. Automatic inference based on semantics, complexity, and depth.
   */
  public static parseMarks(rawText: string, contextSectionMarks?: number | null): ParsedMarksResult {
    let text = rawText.trim();
    let marks: number | null = null;
    let isExplicit = false;
    let marksSource: 'explicit' | 'subquestion' | 'section-shared' | 'inferred' = 'inferred';

    // ------------------------------------------------------------------
    // Step 0: Check for Subquestions with individual marks e.g.
    // "Explain the following: (a) Process (2) (b) Thread (3)"
    // ------------------------------------------------------------------
    const subQuestions = this.detectSubQuestions(text);
    if (subQuestions && subQuestions.length > 0) {
      const subMarksSum = subQuestions.reduce((sum, sq) => sum + (sq.marks || 0), 0);
      if (subMarksSum > 0) {
        marks = subMarksSum;
        isExplicit = true;
        marksSource = 'subquestion';
      }
    }

    // ------------------------------------------------------------------
    // Step 1: Composite Marks e.g. (10+5), [10+5], (10 + 5 marks), [10+5 Marks], (5+5M)
    // ------------------------------------------------------------------
    if (!isExplicit) {
      const compositeRegex = /[\[\(]\s*(\d{1,2})\s*\+\s*(\d{1,2})\s*(?:marks?|m)?\s*[\]\)]/i;
      const mComp = text.match(compositeRegex);
      if (mComp) {
        const p1 = parseInt(mComp[1], 10);
        const p2 = parseInt(mComp[2], 10);
        marks = p1 + p2;
        isExplicit = true;
        marksSource = 'explicit';
        text = text.replace(compositeRegex, ' ').trim();
      }
    }

    // ------------------------------------------------------------------
    // Step 2: [Marks: 10], (Marks: 10), Marks: 10, Marks - 10, Marks = 10, [Marks 10]
    // ------------------------------------------------------------------
    if (!isExplicit) {
      const p1 = /(?:\[|\()?\s*marks?\s*[:=\-]?\s*(\d{1,2})\s*(?:\]|\))?/i;
      const m1 = text.match(p1);
      if (m1) {
        marks = parseInt(m1[1], 10);
        isExplicit = true;
        marksSource = 'explicit';
        text = text.replace(p1, ' ').trim();
      }
    }

    // ------------------------------------------------------------------
    // Step 3: Explicit [10 marks], (10 marks), [10 Marks], (10 Mark), [1 mark], (1 mark), (20 Marks), [20 Marks]
    // ------------------------------------------------------------------
    if (!isExplicit) {
      const p2 = /[\[\(]\s*(\d{1,2})\s*marks?\s*[\]\)]/i;
      const m2 = text.match(p2);
      if (m2) {
        marks = parseInt(m2[1], 10);
        isExplicit = true;
        marksSource = 'explicit';
        text = text.replace(p2, ' ').trim();
      }
    }

    // ------------------------------------------------------------------
    // Step 4: Dash or em-dash / en-dash with marks e.g. " — 1M", " – 5M", " - 5M", " — 5 Marks", " - 10 marks", " — 20M"
    // ------------------------------------------------------------------
    if (!isExplicit) {
      const pDash = /(?:[\u2014\u2013\-]{1,2})\s*(\d{1,2})\s*(?:marks?|m)\.?$/i;
      const mDash = text.match(pDash);
      if (mDash) {
        marks = parseInt(mDash[1], 10);
        isExplicit = true;
        marksSource = 'explicit';
        text = text.replace(pDash, '').trim();
      }
    }

    // ------------------------------------------------------------------
    // Step 5: Ending or starting with "10 Marks", "10 marks", "1 Mark", "15 marks", "20 marks", "2 marks"
    // ------------------------------------------------------------------
    if (!isExplicit) {
      const p3End = /(?:,\s*|\s+)(\d{1,2})\s*marks?\.?$/i;
      const m3End = text.match(p3End);
      if (m3End) {
        marks = parseInt(m3End[1], 10);
        isExplicit = true;
        marksSource = 'explicit';
        text = text.replace(p3End, '').trim();
      }
    }

    // ------------------------------------------------------------------
    // Step 6: Ending with "10M", "5M", "15M", "20M", "1M", "2M", "3M" or [10M], (10M), (5M), [20M]
    // ------------------------------------------------------------------
    if (!isExplicit) {
      const p4 = /(?:[\[\(]\s*(\d{1,2})m\s*[\]\)]|(?:\s+)(\d{1,2})m)\.?$/i;
      const m4 = text.match(p4);
      if (m4) {
        marks = parseInt(m4[1] || m4[2], 10);
        isExplicit = true;
        marksSource = 'explicit';
        text = text.replace(p4, '').trim();
      }
    }

    // ------------------------------------------------------------------
    // Step 7: Parenthesized or Bracketed number at the end: "Explain paging. [10]" or "...computer. (15)" or "...(2)."
    // ------------------------------------------------------------------
    if (!isExplicit) {
      const p5 = /[\[\(]\s*(\d{1,2})\s*[\]\)]\s*\.?\s*$/;
      const m5 = text.match(p5);
      if (m5) {
        const num = parseInt(m5[1], 10);
        if (num >= 1 && num <= 50) {
          marks = num;
          isExplicit = true;
          marksSource = 'explicit';
          text = text.replace(p5, '').trim();
        }
      }
    }

    // ------------------------------------------------------------------
    // Step 8: Leading bracketed marks e.g. "[10 Marks] Explain carry look-ahead adder..." or "(15M) Explain..."
    // ------------------------------------------------------------------
    if (!isExplicit) {
      const p6 = /^[\[\(]\s*(\d{1,2})\s*(?:marks?|m)?\s*[\]\)]\s*/i;
      const m6 = text.match(p6);
      if (m6 && (m6[0].toLowerCase().includes('mark') || m6[0].toLowerCase().includes('m'))) {
        marks = parseInt(m6[1], 10);
        isExplicit = true;
        marksSource = 'explicit';
        text = text.replace(p6, '').trim();
      }
    }

    // ------------------------------------------------------------------
    // Step 9: Section Shared Marks fallback (if provided by section heading context)
    // ------------------------------------------------------------------
    if (!isExplicit && contextSectionMarks && contextSectionMarks > 0) {
      marks = contextSectionMarks;
      marksSource = 'section-shared';
      isExplicit = true;
    }

    // ------------------------------------------------------------------
    // Step 10: Automatic Inference when marks are missing
    // ------------------------------------------------------------------
    if (marks === null) {
      const inferred = this.inferMarks(text);
      marks = inferred;
      marksSource = 'inferred';
      isExplicit = false;
    }

    // Clean up trailing punctuation, dashes, colons, or double spaces
    let cleanedText = text
      .replace(/[\u2014\u2013\-]\s*$/, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([,\.\?;:])$/, '$1')
      .trim();

    if (!cleanedText) {
      cleanedText = rawText.trim();
    }

    return {
      marks,
      isExplicit,
      marksSource,
      cleanedText,
      subQuestions: subQuestions.length > 0 ? subQuestions : undefined,
    };
  }

  /**
   * Identifies and extracts subquestions with individual marks from multi-part questions, e.g.:
   * - "Explain the following: (a) Process (2) (b) Thread (3)"
   * - "Q1. Answer the following: (a) Define a process. (2 Marks) (b) Explain different states of a process. (5 Marks) (c) Explain process scheduling with diagram. (10 Marks)"
   */
  public static detectSubQuestions(text: string): SubQuestionItem[] {
    const subQuestions: SubQuestionItem[] = [];
    
    // Find all subquestion markers: (a), (b) or a), b) or (i), (ii)
    const markerRegex = /(?:^|\s|\n)(?:\(([a-zA-Z]|[ivxlcdm]+)\)|([a-zA-Z]|[ivxlcdm]+)\))\s+/gi;
    const markers: { index: number; length: number; label: string }[] = [];

    let match: RegExpExecArray | null;
    while ((match = markerRegex.exec(text)) !== null) {
      const label = match[1] || match[2];
      markers.push({
        index: match.index + (match[0].startsWith(' ') || match[0].startsWith('\n') ? 1 : 0),
        length: match[0].trim().length,
        label: `(${label.toLowerCase()})`,
      });
    }

    if (markers.length >= 2) {
      for (let i = 0; i < markers.length; i++) {
        const currentMarker = markers[i];
        const nextMarker = markers[i + 1];
        const rawContent = text.slice(
          currentMarker.index + currentMarker.length,
          nextMarker ? nextMarker.index : undefined
        ).trim();

        if (!rawContent) continue;

        const { marks: subMark, cleanedText: subText } = this.parseMarksSingle(rawContent);
        const detectedType = this.detectQuestionType(subText, subMark);

        subQuestions.push({
          part: currentMarker.label,
          text: subText,
          marks: subMark || (detectedType === 'Definition' ? 2 : 5),
          detectedType,
        });
      }
    }

    return subQuestions;
  }

  /**
   * Helper to parse marks of a single isolated snippet without recursing on subquestions
   */
  private static parseMarksSingle(snippet: string): { marks: number | null; cleanedText: string } {
    let text = snippet.trim();
    let marks: number | null = null;

    // Pattern 1: [5 Marks], (5 Marks), (5 marks), [5 marks], (5M), [5M]
    const p1 = /[\[\(]\s*(\d{1,2})\s*(?:marks?|m)\s*[\]\)]/i;
    const m1 = text.match(p1);
    if (m1) {
      marks = parseInt(m1[1], 10);
      text = text.replace(p1, '').trim();
    }

    // Pattern 2: (2), [2], (10), [10] at the end
    if (marks === null) {
      const p2 = /[\[\(]\s*(\d{1,2})\s*[\]\)]\s*$/;
      const m2 = text.match(p2);
      if (m2) {
        marks = parseInt(m2[1], 10);
        text = text.replace(p2, '').trim();
      }
    }

    // Pattern 3: — 2M, - 2M, 2 marks at the end
    if (marks === null) {
      const p3 = /(?:[\u2014\u2013\-]\s*|\s+)(\d{1,2})\s*(?:marks?|m)\.?$/i;
      const m3 = text.match(p3);
      if (m3) {
        marks = parseInt(m3[1], 10);
        text = text.replace(p3, '').trim();
      }
    }

    // Pattern 4: Ending with direct number e.g. "Process (2)"
    if (marks === null) {
      const p4 = /\s*\(\s*(\d{1,2})\s*\)\s*$/;
      const m4 = text.match(p4);
      if (m4) {
        marks = parseInt(m4[1], 10);
        text = text.replace(p4, '').trim();
      }
    }

    // Clean up trailing punctuation
    text = text.replace(/[\u2014\u2013\-:\.]\s*$/, '').trim();

    return { marks, cleanedText: text };
  }

  /**
   * Automatic Marks Inference:
   * When marks are NOT specified in the question or paper, Gemini & AI Note Studio estimates
   * the appropriate depth from its wording, complexity, and expected academic depth:
   * - "Define an algorithm." -> 1 mark
   * - "What is a compiler?" -> 2 marks
   * - "Differentiate between RAM and ROM." -> 5 marks
   * - "Explain the functions of an operating system." -> 5 marks
   * - "Explain the working of a compiler with a diagram." -> 10 marks
   * - "Explain the architecture of an operating system in detail." -> 15 marks
   * - "Discuss the complete architecture and working of a computer system." -> 20 marks
   */
  public static inferMarks(text: string, detectedType?: QuestionType): number {
    const lower = text.toLowerCase().trim();

    // 1. Extensive 20-mark descriptive topics
    if (
      lower.includes('complete architecture and working') ||
      lower.includes('complete architecture & working') ||
      lower.includes('architecture and working of a computer system') ||
      lower.includes('comprehensive analysis of') ||
      (lower.startsWith('discuss') && (lower.includes('complete') || lower.includes('in detail') || lower.includes('end-to-end') || lower.includes('exhaustive'))) ||
      lower.includes('detailed case study and implementation')
    ) {
      return 20;
    }

    // 2. Comprehensive 15-mark university long answers
    if (
      lower.includes('in detail') ||
      lower.includes('with neat diagram and working') ||
      lower.includes('architecture of an operating system') ||
      lower.includes('instruction execution cycle with diagram') ||
      lower.includes('carry look-ahead adder and compare') ||
      lower.includes('pipeline stages and pipeline hazards') ||
      (lower.startsWith('describe the architecture') && lower.length > 25) ||
      (lower.startsWith('explain the architecture') && lower.length > 25) ||
      lower.includes('discuss the complete')
    ) {
      return 15;
    }

    // 3. Structured 10-mark detailed questions
    if (
      lower.includes('with diagram') ||
      lower.includes('with a diagram') ||
      lower.includes('with neat diagram') ||
      lower.includes('with a neat diagram') ||
      lower.includes('draw and explain') ||
      lower.includes('sketch and explain') ||
      lower.includes('working of a compiler with a diagram') ||
      lower.includes('step-by-step formula') ||
      lower.includes('booth multiplication algorithm') ||
      lower.includes('ieee-754') ||
      lower.includes('numerical problem') ||
      lower.includes('derive the expression') ||
      lower.includes('derivation of') ||
      (lower.startsWith('explain the working of') && lower.length > 20) ||
      (lower.startsWith('discuss the') && lower.length > 20)
    ) {
      return 10;
    }

    // 4. 8-mark questions (Moderate descriptive / structured)
    if (
      lower.startsWith('critically examine') ||
      lower.startsWith('evaluate the performance') ||
      lower.includes('advantages and disadvantages') ||
      lower.includes('merits and demerits') ||
      lower.includes('benefits and limitations')
    ) {
      return 8;
    }

    // 5. 5-mark questions (Comparison, moderate explanations, functions)
    if (
      lower.includes('differentiate') ||
      lower.includes('distinguish') ||
      lower.includes('difference between') ||
      lower.includes('compare') ||
      lower.includes('functions of') ||
      lower.includes('types of') ||
      lower.includes('characteristics of') ||
      lower.includes('parameters and variables') ||
      lower.startsWith('explain') ||
      lower.startsWith('describe') ||
      lower.startsWith('how does') ||
      lower.startsWith('why is') ||
      lower.startsWith('illustrate')
    ) {
      return 5;
    }

    // 6. 3-mark questions (Concise short notes or listings)
    if (
      lower.startsWith('write a short note on') ||
      lower.startsWith('short note on') ||
      lower.startsWith('briefly explain') ||
      lower.startsWith('list the') ||
      lower.startsWith('mention the') ||
      lower.startsWith('state the properties of')
    ) {
      return 3;
    }

    // 7. 2-mark questions (Brief explanation or "What is...")
    if (
      lower.startsWith('what is') ||
      lower.startsWith('what are') ||
      lower.startsWith('give two') ||
      lower.startsWith('state two')
    ) {
      return 2;
    }

    // 8. 1-mark questions (Direct definitions / opcode / single fact)
    if (
      lower.startsWith('define') ||
      lower.startsWith('what is meant by') ||
      lower.startsWith('give the definition of') ||
      lower.startsWith('state the definition') ||
      lower.startsWith('name the') ||
      lower.startsWith('expand') ||
      lower.startsWith('what is the full form of')
    ) {
      return 1;
    }

    // Fallback based on explicit detectedType
    if (detectedType === 'Definition' || detectedType === 'Very Short Answer') return 1;
    if (detectedType === 'Compare' || detectedType === 'Diagram-Based' || detectedType === 'Explain') return 5;
    if (detectedType === 'Long Answer' || detectedType === 'Long descriptive question') return 10;
    if (detectedType === 'Numerical' || detectedType === 'Numerical problem') return 5;

    return 5;
  }

  /**
   * Intelligently classifies Question Type according to Section 2 of requirements:
   * - Definition
   * - Short explanation
   * - Detailed explanation
   * - Difference or comparison
   * - Advantages and disadvantages
   * - Derivation
   * - Numerical problem
   * - Algorithm or programming problem
   * - Diagram-based question
   * - Short note
   * - Long descriptive question
   * - Discuss or evaluate question
   * - Multiple-part question
   */
  public static detectQuestionType(text: string, marks?: number | null): QuestionType {
    const lower = text.toLowerCase().trim();

    // 1. Multiple-part question check
    const subparts = this.detectSubQuestions(text);
    if (subparts && subparts.length >= 2) {
      return 'Multiple-part question';
    }

    // 2. Numerical problem check
    if (
      /\b(calculate|calculating|calculation|compute|computing|computation|solve|solving|solution of|evaluate the value|find the value|determine the value|numerical)\b/i.test(lower) ||
      /\b\d+\s*[\+\-\*\/]\s*\d+\b/.test(lower) ||
      /\b(given|find|derive)\b.*\b(formula|equation|value|mass|speed|frequency|voltage|current|resistance|probability|matrix)\b/i.test(lower)
    ) {
      return 'Numerical';
    }

    // 3. Difference or Comparison check
    if (
      /\b(compare|comparing|comparison|differentiate|differentiation|distinguish|distinction|difference between|vs\.?|versus)\b/i.test(lower)
    ) {
      return 'Compare';
    }

    // 4. Advantages and Disadvantages check
    if (
      lower.includes('advantages and disadvantages') ||
      lower.includes('pros and cons') ||
      lower.includes('merits and demerits') ||
      lower.includes('benefits and limitations') ||
      lower.includes('trade-offs')
    ) {
      return 'Advantages and disadvantages';
    }

    // 5. Derivation check
    if (
      lower.startsWith('derive') ||
      lower.includes('derivation of') ||
      lower.includes('derive the expression') ||
      lower.includes('derive the formula') ||
      lower.includes('prove that') ||
      lower.includes('show that')
    ) {
      return 'Derivation';
    }

    // 6. Algorithm or Programming Problem check
    if (
      lower.includes('algorithm') ||
      lower.includes('pseudocode') ||
      lower.includes('write a program') ||
      lower.includes('flowchart and algorithm') ||
      lower.includes('trace the execution') ||
      lower.includes('booth multiplication')
    ) {
      return 'Algorithm or programming problem';
    }

    // 7. Diagram-Based Question check
    if (
      /\b(diagram|flowchart|circuit|schematic|timing diagram|waveform|block diagram)\b/i.test(lower) ||
      lower.includes('draw and explain') ||
      lower.includes('draw the') ||
      lower.includes('sketch and explain') ||
      lower.includes('with diagram') ||
      lower.includes('with a diagram') ||
      lower.includes('with neat diagram') ||
      lower.includes('with a neat diagram') ||
      lower.includes('illustrate with diagram')
    ) {
      return 'Diagram-Based';
    }

    // 8. Short Note check
    if (
      lower.startsWith('write a short note on') ||
      lower.startsWith('write short notes on') ||
      lower.startsWith('short note on') ||
      lower.startsWith('brief note on')
    ) {
      return 'Short note';
    }

    // 9. Definition check
    if (
      (lower.startsWith('define') ||
        lower.startsWith('what is meant by') ||
        lower.startsWith('give the definition of') ||
        lower.startsWith('state the definition') ||
        lower.includes('definition of')) &&
      (!marks || marks <= 3)
    ) {
      return 'Definition';
    }

    // 10. Discuss or Evaluate Question check
    if (
      lower.startsWith('discuss') ||
      lower.startsWith('evaluate') ||
      lower.startsWith('critically examine') ||
      lower.startsWith('analyze the impact')
    ) {
      if (marks && marks >= 15) {
        return 'Long descriptive question';
      }
      return 'Discuss or evaluate question';
    }

    // 11. Marks-based classification for General Questions
    if (marks !== undefined && marks !== null) {
      if (marks === 1) {
        return lower.startsWith('define') ? 'Definition' : '1 Mark';
      }
      if (marks === 2) {
        return lower.startsWith('define') ? 'Definition' : '2 Marks';
      }
      if (marks === 3) {
        return 'Short explanation';
      }
      if (marks >= 4 && marks <= 5) {
        return 'Short explanation';
      }
      if (marks >= 8 && marks <= 10) {
        return 'Detailed explanation';
      }
      if (marks >= 15) {
        return 'Long descriptive question';
      }
    }

    // 12. Linguistic phrasing fallback
    if (
      lower.startsWith('what is') ||
      lower.startsWith('state') ||
      lower.startsWith('name') ||
      lower.startsWith('list') ||
      lower.startsWith('mention')
    ) {
      return marks && marks > 3 ? 'Short explanation' : 'Definition';
    }

    if (
      lower.startsWith('explain') ||
      lower.startsWith('describe') ||
      lower.startsWith('illustrate')
    ) {
      if (marks && marks >= 10) {
        return 'Long descriptive question';
      }
      return 'Detailed explanation';
    }

    return 'Short explanation';
  }

  /**
   * Resolves effective QuestionType and marks depth for answer synthesis.
   */
  public static resolveAnswerConfig(question: Question): { effectiveType: QuestionType; effectiveMarks: number } {
    const rawType = (question.type || 'Auto Detect').replace(/[\u2013\u2014]/g, '-').trim();
    
    // Automatically parse marks from text if not already explicitly provided
    let extractedMarks = question.marks;
    if (extractedMarks === undefined || extractedMarks === null) {
      const parsed = this.parseMarks(question.text || '');
      extractedMarks = parsed.marks || 5;
    }

    let effectiveMarks = extractedMarks || 5;
    let effectiveType: QuestionType = question.type;

    if (rawType === 'Auto' || rawType === 'Auto Detect') {
      effectiveType = question.detectedType || this.detectQuestionType(question.text, extractedMarks);
      effectiveMarks = extractedMarks;
    } else if (rawType === '1 Mark') {
      effectiveMarks = 1;
      effectiveType = 'Definition';
    } else if (rawType === '2 Marks' || rawType === '2-3 Marks' || rawType === '2–3 Marks') {
      effectiveMarks = (extractedMarks && extractedMarks <= 3 && extractedMarks >= 2) ? extractedMarks : 2;
      effectiveType = 'Short explanation';
    } else if (rawType === '3 Marks') {
      effectiveMarks = 3;
      effectiveType = 'Short explanation';
    } else if (rawType === '4-5 Marks' || rawType === '4–5 Marks' || rawType === '5 Marks') {
      effectiveMarks = (extractedMarks && extractedMarks <= 5 && extractedMarks >= 4) ? extractedMarks : 5;
      effectiveType = 'Short explanation';
    } else if (rawType === '8 Marks') {
      effectiveMarks = 8;
      effectiveType = 'Detailed explanation';
    } else if (rawType === '10 Marks' || rawType === '10-15 Marks' || rawType === '10–15 Marks') {
      effectiveMarks = (extractedMarks && extractedMarks >= 10) ? extractedMarks : 10;
      effectiveType = 'Detailed explanation';
    } else if (rawType === '15 Marks') {
      effectiveMarks = 15;
      effectiveType = 'Long descriptive question';
    } else if (rawType === '20 Marks') {
      effectiveMarks = 20;
      effectiveType = 'Long descriptive question';
    } else {
      effectiveType = question.type;
    }

    return {
      effectiveType,
      effectiveMarks,
    };
  }

  /**
   * Detects whether an image/diagram placeholder is required for the question.
   */
  public static detectImageRequirement(
    text: string,
    marks?: number | null
  ): ImagePlaceholderConfig | null {
    const lower = text.toLowerCase().trim();

    const explicitDiagramKeywords = [
      'diagram',
      'neat diagram',
      'figure',
      'flowchart',
      'circuit',
      'schematic',
      'timing diagram',
      'waveform',
      'block diagram',
      'draw and explain',
      'draw the',
      'sketch and explain',
      'with diagram',
      'with a diagram',
      'with neat diagram',
      'with a neat diagram',
      'illustrate with diagram',
      'architecture diagram',
    ];

    const isExplicit = explicitDiagramKeywords.some((kw) => lower.includes(kw));

    const isImplicitVisual =
      marks && marks >= 5
        ? /\b(pipelining|pipeline stages|von neumann|fetch decode execute|instruction cycle|compiler phases|osi model|osi layers|water cycle|hydrological cycle|photosynthesis|full adder|ripple carry|carry lookahead|binary tree)\b/i.test(
            lower
          )
        : false;

    if (!isExplicit && !isImplicitVisual) {
      return null;
    }

    let topicName = text
      .replace(/^(explain|describe|draw and explain|draw the|sketch and explain|what is|discuss|illustrate)\s+/i, '')
      .replace(/\s+with (?:a )?(?:neat )?diagram.*$/i, '')
      .replace(/\s+using (?:a )?(?:neat )?diagram.*$/i, '')
      .replace(/[\[\(].*?[\]\)]/g, '')
      .trim();

    topicName = topicName
      .split(' ')
      .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(' ');

    if (!topicName || topicName.length < 3) {
      topicName = 'System Architecture & Working Principle';
    }

    return {
      isRequired: true,
      placeholderText: `[IMAGE REQUIRED: ${topicName} Diagram]`,
      figureTitle: `Figure 1: Diagram Showing ${topicName}`,
      caption: `Labeled schematic diagram illustrating the functional components and working mechanism of ${topicName}.`,
      imagePlacement: 'below-intro',
    };
  }

  /**
   * Parses bulk pasted text into individual Question cards with module groupings,
   * section shared marks recognition, subquestion extraction, and automatic marks detection.
   */
  public static parseBulkText(bulkText: string, currentTotalQuestions: number = 0): Question[] {
    if (!bulkText || !bulkText.trim()) return [];

    const lines = bulkText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const parsed: Question[] = [];
    let currentModule = 'Module-1';
    let currentSectionMarks: number | null = null;

    // Check for Section Header with Shared Marks e.g.:
    // "SECTION A - Answer each question for 2 marks"
    // "Explain the following questions for 5 marks each."
    // "Part B [10 Marks each]"
    const parseSectionHeader = (line: string): { isHeader: boolean; moduleName?: string; sharedMarks?: number | null } => {
      const isHeader =
        /^(?:module|unit|section|part|chapter)\s*[-:#]?\s*([0-9a-zA-Z]+)/i.test(line) ||
        /(?:answer|explain|attempt).*(?:for\s+(\d{1,2})\s*marks?|(\d{1,2})\s*marks?\s*each)/i.test(line);

      if (!isHeader) return { isHeader: false };

      let sharedMarks: number | null = null;
      const matchMarks = line.match(/(?:for\s+(\d{1,2})\s*marks?|(\d{1,2})\s*marks?\s*each|\[(\d{1,2})\s*marks?\s*each\]|\((\d{1,2})\s*marks?\s*each\))/i);
      if (matchMarks) {
        sharedMarks = parseInt(matchMarks[1] || matchMarks[2] || matchMarks[3] || matchMarks[4], 10);
      }

      return { isHeader: true, moduleName: line, sharedMarks };
    };

    const questionNumberRegex = /^([0-9]+[\.\)]|\bQ[0-9]+[:\.\)]|[a-zA-Z]\)|\([0-9a-zA-Z]+\))\s*/i;

    let pendingQuestion: {
      text: string;
      number?: number;
      module: string;
      sectionMarks?: number | null;
    } | null = null;

    const finalizePendingQuestion = () => {
      if (!pendingQuestion || !pendingQuestion.text.trim()) return;

      const raw = pendingQuestion.text.trim();
      const { marks, isExplicit, marksSource, cleanedText, subQuestions } = this.parseMarks(raw, pendingQuestion.sectionMarks);
      const detectedType = this.detectQuestionType(cleanedText, marks);

      const qIndex = currentTotalQuestions + parsed.length + 1;

      parsed.push({
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        number: pendingQuestion.number || qIndex,
        text: cleanedText,
        type: 'Auto',
        detectedType,
        marks: marks || 5,
        marksSource,
        isMarksAutoDetected: !isExplicit,
        subQuestions,
        module: pendingQuestion.module,
        order: qIndex,
        answerStatus: 'not_generated',
      });

      pendingQuestion = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const headerInfo = parseSectionHeader(line);
      if (headerInfo.isHeader) {
        finalizePendingQuestion();
        if (headerInfo.moduleName) {
          currentModule = headerInfo.moduleName;
        }
        if (headerInfo.sharedMarks !== undefined && headerInfo.sharedMarks !== null) {
          currentSectionMarks = headerInfo.sharedMarks;
        }
        continue;
      }

      const subpartRegex = /^(?:\([a-zA-Z0-9]+\)|[a-zA-Z]\)|\([ivxlcdm]+\))\s+/i;
      if (pendingQuestion && subpartRegex.test(line)) {
        pendingQuestion.text += ' ' + line;
        continue;
      }

      const matchNum = line.match(questionNumberRegex);
      if (matchNum && !subpartRegex.test(line)) {
        finalizePendingQuestion();

        const rawNum = matchNum[1].replace(/[^0-9]/g, '');
        const qNum = rawNum ? parseInt(rawNum, 10) : undefined;
        const textWithoutNum = line.replace(questionNumberRegex, '').trim();

        pendingQuestion = {
          text: textWithoutNum,
          number: qNum,
          module: currentModule,
          sectionMarks: currentSectionMarks,
        };
      } else {
        if (pendingQuestion) {
          // Check if the line looks like an independent question starting without number
          if (
            (line.toLowerCase().startsWith('what is') ||
            line.toLowerCase().startsWith('explain') ||
            line.toLowerCase().startsWith('define') ||
            line.toLowerCase().startsWith('compare') ||
            line.toLowerCase().startsWith('discuss') ||
            line.toLowerCase().startsWith('calculate') ||
            line.toLowerCase().startsWith('differentiate')) &&
            !pendingQuestion.text.endsWith(':')
          ) {
            finalizePendingQuestion();
            pendingQuestion = {
              text: line,
              module: currentModule,
              sectionMarks: currentSectionMarks,
            };
          } else {
            pendingQuestion.text += ' ' + line;
          }
        } else {
          pendingQuestion = {
            text: line,
            module: currentModule,
            sectionMarks: currentSectionMarks,
          };
        }
      }
    }

    finalizePendingQuestion();

    // Renumber sequentially if numbers were duplicated or missing
    parsed.forEach((q, idx) => {
      if (!q.number || q.number <= 0) {
        q.number = currentTotalQuestions + idx + 1;
      }
      q.order = currentTotalQuestions + idx + 1;
    });

    return parsed;
  }
}
