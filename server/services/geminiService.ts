import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export interface GeminiAnalysisPayload {
  questions: { number: number; text: string; marks?: number; module?: string; type?: string }[];
  projectTitle?: string;
  tone?: string;
}

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

export class GeminiService {
  /**
   * Calls Google Gemini API to analyze questions collectively and generate exam-ready syllabus structure.
   */
  public static async analyzeAndGenerateNotes(payload: GeminiAnalysisPayload): Promise<any> {
    const { questions, projectTitle, tone = 'simple-academic' } = payload;
    const questionsText = questions
      .map(
        (q) =>
          `Q${q.number} [Type: ${q.type || 'Auto'}, Marks: ${q.marks || 5} Marks, Module: ${q.module || 'Mod 1'}]: ${q.text}`
      )
      .join('\n');

    const prompt = `
${MASTER_SYSTEM_PROMPT}

PROJECT / SYLLABUS: "${projectTitle || 'Academic Syllabus Notes'}"
TONE: "${tone}"

Analyze ALL of the following examination questions COLLECTIVELY and generate high-scoring, university-standard exam answer sheets following strict academic formatting:

${questionsText}

CRITICAL RULES:
1. Every question MUST receive an authentic, technically sound, exam-ready answer according to its detected marks (1 mark, 2 marks, 5 marks, 10 marks, 15 marks, 20 marks).
2. For 1-2 Marks: 1-3 direct sentences or concise definition. NO essay.
3. For 3-5 Marks: Clear explanation with 3-5 structured points, comparison table, or diagram.
4. For 8-10 Marks: Detailed university breakdown with Introduction, numbered points, diagrams/tables/equations, and Conclusion.
5. For 15-20 Marks: Comprehensive multi-page breakdown with Introduction, numbered in-depth mechanisms, architectures, tables, diagrams, and concluding synthesis.
6. If the question contains subquestions (e.g. (a), (b), (c)), address each subquestion with its respective marks.
7. Highlight core terms in markdown bold (**term**).

Output ONLY valid JSON with this exact schema:
{
  "detectedSubject": "string",
  "detectedModules": ["Module-1: ...", "Module-2: ..."],
  "coreThemes": ["theme1", "theme2"],
  "summary": "string",
  "keyFormulas": [
    {
      "name": "string",
      "latex": "LaTeX formula string",
      "explanation": "string"
    }
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
      "importantExamNote": "Exam tip for high scoring",
      "diagram": {
        "title": "Diagram Title",
        "caption": "Diagram Caption",
        "diagramKey": "vonNeumann"
      }
    }
  ],
  "qaSection": [
    {
      "id": "qa-1",
      "questionNumber": 1,
      "questionText": "string",
      "marks": 10,
      "questionType": "Long Answer",
      "resolvedType": "Long Answer",
      "module": "Module-1",
      "introHeading": "Introduction and Meaning of [Concept]",
      "answerIntro": "Crisp direct answer or introductory paragraph with **key terms** in bold.",
      "mainBodyHeading": "Main Body Heading",
      "points": [
        { "title": "Point Title", "text": "Detailed explanation with **keywords**." }
      ],
      "subPartAnswers": [
        {
          "partLabel": "Part (a)",
          "partMarks": 2,
          "partQuestion": "Subquestion text",
          "partIntro": "Direct answer for subpart",
          "points": []
        }
      ],
      "comparisonTable": {
        "title": "Table Title",
        "headers": ["Parameter", "Concept A", "Concept B"],
        "rows": [
          ["Definition", "...", "..."],
          ["Speed", "...", "..."]
        ]
      },
      "numericalSolution": {
        "given": [{"param": "Given Param", "value": "value"}],
        "toFind": "What to calculate",
        "formula": "formula string",
        "steps": [
          {"stepNumber": 1, "title": "Step Title", "explanation": "step explanation", "equation": "eq"}
        ],
        "finalResult": "Final result",
        "unit": "unit"
      },
      "subHeading": "Subheading or Influencing Factors",
      "subContent": "Sub-content text",
      "conclusionHeading": "Conclusion",
      "conclusion": "Final concluding synthesis.",
      "formulaLatex": "optional LaTeX formula",
      "diagramKey": "vonNeumann",
      "diagramTitle": "Diagram Title",
      "diagramCaption": "Diagram Caption",
      "diagramSvg": "optional SVG string",
      "examTip": "Scoring advice"
    }
  ]
}
`;

    if (!GEMINI_API_KEY) {
      console.log('ℹ️ No GEMINI_API_KEY found, using academic local engine.');
      return null;
    }

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
      'gemini-1.5-flash',
      'gemini-3.1-flash-lite'
    ];

    for (const model of candidateModels) {
      try {
        console.log(`🤖 Sending request to Google Gemini API (${model})...`);
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 25000,
          }
        );

        const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          const cleaned = candidate.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          console.log(`✅ Gemini API (${model}) successfully synthesized structured notes JSON!`);
          return parsed;
        }
      } catch (error: any) {
        console.warn(`⚠️ Gemini model ${model} attempt info:`, error.response?.data?.error?.message || error.message);
      }
    }

    return null;
  }
}
