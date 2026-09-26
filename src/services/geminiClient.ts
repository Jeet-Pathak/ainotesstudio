import { Question, QuestionAnswerItem, NoteSection } from '../types';
import { QuestionParser } from './questionParser';

const CLIENT_GEMINI_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
  '';

export const MASTER_SYSTEM_PROMPT = `# MASTER PROMPT: UNIVERSAL EXAM ANSWER GENERATION, ACCURACY & FORMATTING SYSTEM

## ROLE AND OBJECTIVE
Act as an expert university professor, subject-matter specialist, academic examiner, exam-answer writer, and professional academic typesetter.
Your task is to analyze every question provided by the user and generate a factually accurate, logically structured, complete, easy-to-understand, and exam-ready answer that is appropriate for the question's subject, difficulty level, and marks.

This system works for all academic subjects:
- Computer Science and Engineering
- Mathematics and numerical problems
- Operating Systems, AI, Software Engineering, Compiler Design, and OOPS
- Management, Organizational Behavior, and Industrial Management
- Physics, Chemistry, and other science subjects
- Theory-based, practical, analytical, and application-based questions

MOST IMPORTANT RULE: Never prioritize fancy formatting, complicated vocabulary, or unnecessary content over correctness, clarity, completeness, and exam suitability.

---

# 1. AUTOMATIC QUESTION ANALYSIS & MARKS DETECTION
Before writing an answer, independently analyze the question:
1. Identify the exact question, main topic, and command word (Define, Explain, Discuss, Compare, Differentiate, Derive, Calculate, Evaluate, Illustrate).
2. Marks Detection:
   - 1–2 Marks: Direct definition, fact, formula, or brief explanation (1-3 sentences).
   - 3–5 Marks: Definition/introduction, main concept explained in 3–5 meaningful points, example or formula when relevant.
   - 6–10 Marks: Clear introduction, detailed explanation, suitable headings and numbered points (continuous 1..N), relevant examples/diagrams/formulas, and conclusion.
   - 10–15+ Marks: Comprehensive, well-organized explanation covering mechanisms, steps, classifications, comparison tables, diagrams, equations, and concluding synthesis.
3. Multi-part Questions: If a question has subparts ((a), (b), (c)), answer every subpart with its respective marks.

---

# 2. FACTUAL ACCURACY AND CONTENT VALIDATION
Accuracy is the highest priority:
1. Every definition must be technically correct.
2. Every formula must be mathematically and conceptually accurate with correct symbols, variables, and units.
3. Every comparison must use equivalent criteria on both sides.
4. Every cause-and-effect relationship must be logically justified.
5. No unsupported claims, fabricated facts, or misleading generalizations.
6. If a formula depends on specific assumptions or conditions, clearly mention them.
7. No False Precision: Focus on delivering a sound academic answer matching university syllabus expectations.

---

# 3. SUBJECT-SPECIFIC ANSWER GENERATION
- Definition Questions: Clear and accurate definition, simple explanation, short example where helpful.
- Explain/Discuss Questions: Relevant intro, separate major points, mechanism explanation, real-world examples, conclusion.
- Difference/Comparison Questions: Accurate comparison table comparing equivalent aspects in both columns.
- Numerical/Mathematical Questions: Given data -> Required quantity -> Governing formula -> Step-by-step substitution -> Final result with units.
- Derivation Questions: Starting principle -> Symbol definitions -> Orderly step-by-step logical mathematical transformation -> Final derived equation highlighted.
- Algorithms/Programming Questions: Approach explanation -> Correct syntax / clean pseudocode -> Complexity analysis (Time/Space).
- Diagram-Based Questions: Clear vector structure, labeled components, descriptive caption.
- Management / OB Questions: Established conceptual frameworks, logical distinction between correlation and direct causation.

---

# 4. SIMPLE LANGUAGE AND EASY UNDERSTANDING
- Write in simple, clear, university-level English.
- Avoid unnecessary jargon, artificial complexity, and pretentious vocabulary.
- Sentences should be clear, concise, and easy to study and reproduce during exams.
- Highlight essential key terms using markdown bold (**term**).

---

# 5. COMPLETE ANSWERS, CONTINUOUS NUMBERING & MULTI-PAGE FLOW
- Complete coverage: Answer every part; do not truncate or stop halfway.
- Continuous Numbering: Number major points sequentially (1, 2, 3, 4, 5, 6, 7, 8, 9, 10...) across the entire answer. Never restart numbering from 1 on continuation pages.
- No Repeated Headings: Question title appears ONLY on the first page. Continuation pages begin directly with the next points.
- No Fluff / Repetition: Do not repeat the same point in different words to artificially inflate length.

---

# 6. QUALITY CONTROL DIRECTIVE
Prioritize in this strict order:
1. Factual and technical correctness
2. Complete coverage of the question
3. Correct answer depth for the marks
4. Simple and understandable language
5. Logical structure and academic quality
6. Accurate formulas, tables, and diagrams
7. Professional exam formatting`;

export class GeminiClient {
  /**
   * Generates a complete notes package across multiple questions using Gemini.
   */
  public static async generateDirect(
    questions: Question[],
    projectTitle: string = 'Academic Notes',
    tone: string = 'simple-academic'
  ): Promise<any | null> {
    const key = CLIENT_GEMINI_KEY;
    if (!key) return null;

    const questionsText = questions
      .map((q, idx) => {
        const { effectiveType, effectiveMarks } = QuestionParser.resolveAnswerConfig(q);
        return `Q${q.number || idx + 1} [Type: ${effectiveType}, Marks: ${effectiveMarks} Marks, Module: ${q.module || 'Module-1'}]: ${q.text}`;
      })
      .join('\n');

    const prompt = `
${MASTER_SYSTEM_PROMPT}

PROJECT / SYLLABUS TITLE: "${projectTitle}"
DESIRED TONE: "${tone}"

QUESTIONS TO ANSWER:
${questionsText}

CRITICAL RULES:
1. Every question MUST receive an authentic, technically sound, exam-ready answer according to its detected marks (1 mark, 2 marks, 5 marks, 10 marks, 15 marks, 20 marks).
2. For 1-2 Marks: 1-3 direct sentences or concise definition. NO essay.
3. For 3-5 Marks: Clear explanation with 3-5 structured points, comparison table, or diagram.
4. For 8-10 Marks: Detailed university breakdown with Introduction, numbered points, diagrams/tables/equations, and Conclusion.
5. For 15-20 Marks: Comprehensive multi-page breakdown with Introduction, numbered in-depth mechanisms, architectures, tables, diagrams, and concluding synthesis.
6. If the question contains subquestions (e.g. (a), (b), (c)), address each subquestion with its respective marks.
7. Highlight core terms in markdown bold (**term**).

Output ONLY a single valid JSON object with this exact structure:
{
  "detectedSubject": "Specific Subject Name",
  "detectedModules": ["Module 1: Title", "Module 2: Title"],
  "coreThemes": ["Theme 1", "Theme 2"],
  "summary": "Academic summary of the covered syllabus",
  "keyFormulas": [
    { "name": "Formula Name", "latex": "LaTeX code", "explanation": "Brief explanation" }
  ],
  "sections": [
    {
      "id": "sec-1",
      "moduleNumber": 1,
      "moduleTitle": "MODULE TITLE",
      "topicTitle": "Topic Title",
      "topicNumber": "1.1",
      "introduction": "Comprehensive introduction with **bold terms**.",
      "definition": {
        "term": "Key Concept Term",
        "explanation": "Exact accurate academic definition.",
        "keyHighlight": "Core takeaway"
      },
      "keyCharacteristics": ["Characteristic 1", "Characteristic 2"],
      "importantExamNote": "Exam tip for high scoring"
    }
  ],
  "qaSection": [
    {
      "id": "qa-1",
      "questionNumber": 1,
      "questionText": "Exact question text",
      "marks": 5,
      "questionType": "Short explanation",
      "resolvedType": "Short explanation",
      "module": "Module-1",
      "introHeading": "Introduction and Meaning of [Topic]",
      "answerIntro": "Crisp direct introductory definition or answer with **bold terms**.",
      "mainBodyHeading": "Main Body Section Heading",
      "points": [
        { "title": "Point Heading", "text": "Detailed explanation with real facts and **terms**." }
      ],
      "subPartAnswers": [
        {
          "partLabel": "Part (a)",
          "partMarks": 2,
          "partQuestion": "Subquestion text",
          "partIntro": "Concise answer for part (a) with **bold terms**.",
          "points": []
        }
      ],
      "comparisonTable": {
        "title": "Comparison Table Title",
        "headers": ["Parameter", "Concept A", "Concept B"],
        "rows": [["Criterion 1", "Detail A", "Detail B"]]
      },
      "numericalSolution": {
        "given": [{"param": "P1", "value": "Val1"}],
        "toFind": "Target metric",
        "formula": "Formula",
        "steps": [{"stepNumber": 1, "title": "Step 1", "explanation": "Exp", "equation": "Eq"}],
        "finalResult": "Result",
        "unit": "Unit"
      },
      "subHeading": "Additional Factors or Architecture",
      "subContent": "Sub-content details",
      "conclusionHeading": "Conclusion",
      "conclusion": "Final academic synthesis.",
      "formulaLatex": "Optional LaTeX formula",
      "diagramKey": "vonNeumann",
      "diagramTitle": "Diagram Title",
      "diagramCaption": "Diagram Caption",
      "diagramSvg": "optional custom SVG string",
      "examTip": "Tip for examination"
    }
  ]
}
`;

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
      'gemini-1.5-flash',
      'gemini-3.1-flash-lite'
    ];

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleaned = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            if (parsed && ((parsed.qaSection && parsed.qaSection.length > 0) || (parsed.sections && parsed.sections.length > 0))) {
              console.log(`✅ Direct Gemini (${model}) synthesis succeeded!`);
              return parsed;
            }
          }
        }
      } catch (err) {
        console.warn(`Direct Gemini attempt (${model}) failed:`, err);
      }
    }

    return null;
  }

  /**
   * Generates a single Question-Answer item using live Gemini AI matching the detected marks.
   */
  public static async generateSingleQuestionAnswer(
    question: Question,
    index: number = 0,
    subject: string = 'General Academic'
  ): Promise<QuestionAnswerItem | null> {
    const key = CLIENT_GEMINI_KEY;
    if (!key) return null;

    const { effectiveType, effectiveMarks } = QuestionParser.resolveAnswerConfig(question);
    const qNum = question.number || index + 1;

    const prompt = `
${MASTER_SYSTEM_PROMPT}

SUBJECT: ${subject}
QUESTION NUMBER: ${qNum}
QUESTION TEXT: "${question.text}"
DETECTED MARKS: ${effectiveMarks} Marks
DETECTED QUESTION TYPE: ${effectiveType}
MODULE: ${question.module || 'Module-1'}

INSTRUCTIONS:
1. Generate an exam-ready academic answer strictly calibrated to ${effectiveMarks} Marks.
2. If ${effectiveMarks} <= 2: Keep concise (1-3 sentences or direct definition).
3. If ${effectiveMarks} = 3-5: Provide structured points, comparison table if needed, and clear explanation.
4. If ${effectiveMarks} = 8-10: Detailed university answer with intro, numbered points, diagrams/tables, and conclusion.
5. If ${effectiveMarks} >= 15: Comprehensive multi-page answer covering the topic in-depth with architecture, equations, subheadings, and conclusion.
6. Highlight key terms in markdown bold (**term**).

Output ONLY valid JSON matching this exact schema:
{
  "id": "qa-${question.id || index}",
  "questionNumber": ${qNum},
  "questionText": "${question.text.replace(/"/g, '\\"')}",
  "marks": ${effectiveMarks},
  "questionType": "${effectiveType}",
  "resolvedType": "${effectiveType}",
  "module": "${question.module || 'Module-1'}",
  "introHeading": "Introduction and Meaning of [Topic]",
  "answerIntro": "Direct answer or definition with **bold terms**.",
  "mainBodyHeading": "Main Body Section Heading",
  "points": [
    { "title": "Point Heading", "text": "Detailed point explanation with **bold terms**." }
  ],
  "subPartAnswers": [
    {
      "partLabel": "Part (a)",
      "partMarks": 2,
      "partQuestion": "Subquestion",
      "partIntro": "Answer for part (a)",
      "points": []
    }
  ],
  "comparisonTable": {
    "title": "Comparison Table Title",
    "headers": ["Parameter", "Concept A", "Concept B"],
    "rows": [["Criteria", "Detail A", "Detail B"]]
  },
  "numericalSolution": {
    "given": [{"param": "P1", "value": "Val1"}],
    "toFind": "Target metric",
    "formula": "Formula",
    "steps": [{"stepNumber": 1, "title": "Step 1", "explanation": "Exp", "equation": "Eq"}],
    "finalResult": "Result",
    "unit": "Unit"
  },
  "subHeading": "Subheading or Architecture",
  "subContent": "Sub-content details",
  "conclusionHeading": "Conclusion",
  "conclusion": "Final academic synthesis.",
  "formulaLatex": "Optional LaTeX formula",
  "diagramKey": "vonNeumann",
  "diagramTitle": "Diagram Title",
  "diagramCaption": "Diagram Caption",
  "diagramSvg": "optional SVG",
  "examTip": "Scoring advice"
}
`;

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
      'gemini-1.5-flash',
      'gemini-3.1-flash-lite'
    ];

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleaned = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            if (parsed && (parsed.answerIntro || (parsed.points && parsed.points.length > 0))) {
              return parsed as QuestionAnswerItem;
            }
          }
        }
      } catch (err) {
        console.warn(`Single question Gemini generation (${model}) failed:`, err);
      }
    }

    return null;
  }

  /**
   * Remakes/Refines an individual Note Section based on action or user custom prompt.
   */
  public static async remakeSectionWithAI(
    section: NoteSection,
    action: string,
    customPrompt?: string,
    subject: string = 'General Academic'
  ): Promise<any | null> {
    const key = CLIENT_GEMINI_KEY;
    if (!key) return null;

    const instruction = customPrompt
      ? `USER CUSTOM PROMPT: "${customPrompt}"`
      : `ACTION: "${action}" (e.g. simplify, expand, add exam tips, add comparison, or add diagram)`;

    const prompt = `
${MASTER_SYSTEM_PROMPT}

Remake and upgrade the following syllabus note section according to the user instructions.

CURRENT SECTION:
${JSON.stringify(section, null, 2)}

SUBJECT: ${subject}
INSTRUCTION / USER PROMPT:
${instruction}

CRITICAL RULES:
1. Re-write the section content with high technical accuracy, subject-specific depth, and clarity.
2. Bold all core academic terms, keywords, and equations in markdown (**keyword**) so they render clearly.
3. Output ONLY a valid JSON object matching the NoteSection structure (same id: "${section.id}").
`;

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
      'gemini-1.5-flash',
      'gemini-3.1-flash-lite'
    ];

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleaned = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            if (parsed && (parsed.introduction || parsed.definition || parsed.keyCharacteristics)) {
              return parsed;
            }
          }
        }
      } catch (err) {
        console.warn(`Section remake attempt (${model}) failed:`, err);
      }
    }

    return null;
  }

  /**
   * Remakes/Refines an individual Question-Answer Item based on action or user custom prompt.
   */
  public static async remakeQAItemWithAI(
    qaItem: QuestionAnswerItem,
    action: string,
    customPrompt?: string,
    subject: string = 'General Academic'
  ): Promise<any | null> {
    const key = CLIENT_GEMINI_KEY;
    if (!key) return null;

    const instruction = customPrompt
      ? `USER CUSTOM PROMPT: "${customPrompt}"`
      : `ACTION: "${action}" (e.g. simplify, expand, add table, add numerical steps, add exam tips)`;

    const prompt = `
${MASTER_SYSTEM_PROMPT}

Remake and upgrade the following Question & Exam Answer item according to the user instructions.

CURRENT QUESTION & ANSWER:
${JSON.stringify(qaItem, null, 2)}

SUBJECT: ${subject}
INSTRUCTION / USER PROMPT:
${instruction}

CRITICAL RULES:
1. Re-write the answer with high technical accuracy and match the assigned marks (${qaItem.marks || 5} Marks).
2. Bold all core academic terms, keywords, and equations in markdown (**keyword**) for visual emphasis.
3. Incorporate the user's specific prompt instructions directly into the answer structure.
4. Output ONLY a valid JSON object matching the QuestionAnswerItem structure (same id: "${qaItem.id}").
`;

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
      'gemini-1.5-flash',
      'gemini-3.1-flash-lite'
    ];

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                responseMimeType: 'application/json'
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleaned = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);
            if (parsed && (parsed.answerIntro || (parsed.points && parsed.points.length > 0))) {
              return parsed;
            }
          }
        }
      } catch (err) {
        console.warn(`QA remake attempt (${model}) failed:`, err);
      }
    }

    return null;
  }
}
