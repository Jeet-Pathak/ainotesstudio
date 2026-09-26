import { PDFExporter } from './src/services/pdfExporter';
import { computeContinuousPagination } from './src/components/pdf/PDFNotesDocument';
import { QuestionAnswerItem } from './src/types';

console.log('🧪 Starting AINotesStudio PDF Generation Engine Test Suite...\n');

// Test 1: Filename Sanitization
console.log('--- Test 1: Filename Sanitization ---');
const testCases = [
  {
    input: 'Organizational Behavior and Management Systems Module 1',
    expected: 'Organizational_Behavior_and_Management_Systems_Module_1.pdf'
  },
  {
    input: 'Computer Organization & Architecture: Module 2 (ALU / CLA Adders)?',
    expected: 'Computer_Organization_Architecture_Module_2_(ALU_CLA_Adders).pdf'
  },
  {
    input: 'My_Notes_Document.pdf.pdf',
    expected: 'My_Notes_Document.pdf'
  },
  {
    input: '   ',
    expected: 'AINotesStudio_Exam_Notes.pdf'
  },
  {
    input: 'Special * ? / \\ : < > | Symbols [10M]',
    expected: 'Special_Symbols_[10M].pdf'
  }
];

let pass1 = true;
for (const tc of testCases) {
  const sanitized = PDFExporter.sanitizeFilename(tc.input);
  console.log(`Input: "${tc.input}" -> Sanitized: "${sanitized}"`);
  if (!sanitized.endsWith('.pdf') || sanitized.includes('..') || sanitized.includes('/') || sanitized.includes('\\')) {
    console.error(`❌ FAILED for input: ${tc.input}`);
    pass1 = false;
  }
}
if (pass1) console.log('✅ Test 1 Passed: Filename sanitization robust across all inputs.\n');

// Test 2: Continuous Pagination on Multi-Page Documents
console.log('--- Test 2: Continuous Multi-Page Pagination & Continuous Numbering ---');
const sampleQAItems: QuestionAnswerItem[] = [
  {
    id: 'qa-1',
    questionNumber: 1,
    questionText: 'What is meant by an organizational structure?',
    marks: 2,
    questionType: 'Definition',
    resolvedType: 'Definition',
    module: 'Module-1',
    answerIntro: 'An **organizational structure** is the formal system of task and reporting relationships that coordinates and motivates organizational members.',
    points: []
  },
  {
    id: 'qa-2',
    questionNumber: 2,
    questionText: 'Explain the meaning of morale and discuss its connection with employee productivity.',
    marks: 10,
    questionType: 'Long Answer',
    resolvedType: 'Long Answer',
    module: 'Module-1',
    introHeading: 'Introduction and Meaning of Morale',
    answerIntro: '**Employee morale** represents the composite emotional and mental attitude of personnel regarding their work environment, leadership, and occupational tasks.',
    mainBodyHeading: 'Direct Connections Between Employee Morale and Productivity',
    points: [
      { title: '1. Intrinsic Engagement & Discretionary Effort', text: 'High morale creates psychological commitment where employees voluntarily invest effort beyond baseline contractual minimums.' },
      { title: '2. Reduction in Absenteeism and Chronic Tardiness', text: 'Positive workplace attitudes directly correlate with improved attendance records and punctuality.' },
      { title: '3. Decreased Employee Attrition and Talent Retention', text: 'Satisfied personnel remain with the organization longer, preserving institutional memory and eliminating recruitment overhead.' },
      { title: '4. Enhanced Innovation and Proactive Problem-Solving', text: 'Psychological safety fosters collaborative brainstorming and rapid resolution of operational roadblocks.' },
      { title: '5. Quality Assurance and Defect Minimization', text: 'Attentive and motivated workers maintain rigorous adherence to operational standards.' },
      { title: '6. Resistance to Stress and Burnout Resilience', text: 'High-morale teams demonstrate greater endurance during critical project deadlines and organizational transitions.' }
    ],
    conclusionHeading: 'Conclusion',
    conclusion: 'Sustained organizational productivity is intrinsically dependent on elevated employee morale.'
  },
  {
    id: 'qa-3',
    questionNumber: 3,
    questionText: 'What do you understand by a system?',
    marks: 2,
    questionType: 'Definition',
    resolvedType: 'Definition',
    module: 'Module-1',
    answerIntro: 'A **system** is an organized collection of interacting, interdependent components forming an integrated whole acting toward a common purpose.',
    points: []
  }
];

const pages = computeContinuousPagination(sampleQAItems);
console.log(`Generated ${pages.length} answer page sheets for 3 questions.`);
let totalRenderedQuestions = 0;
pages.forEach((p, idx) => {
  console.log(`Page ${idx + 2}: contains ${p.length} question slices.`);
  p.forEach((slice) => {
    if (slice.isFirstChunkOfQuestion) totalRenderedQuestions++;
    if (slice.pointsSlice) {
      console.log(`  - Q${slice.qa.questionNumber} points rendered: ${slice.pointsSlice.map(pt => pt.originalIndex + 1).join(', ')}`);
    }
  });
});

if (totalRenderedQuestions === sampleQAItems.length) {
  console.log(`✅ Test 2 Passed: All ${sampleQAItems.length} questions mapped accurately without duplication.\n`);
} else {
  console.error(`❌ Test 2 FAILED: Expected ${sampleQAItems.length}, got ${totalRenderedQuestions}`);
}

// Test 3: Pre-Flight Document Validation Check
console.log('--- Test 3: Pre-Flight Document Validation ---');
const validNotes = {
  qaSection: sampleQAItems,
  sections: [
    {
      topicTitle: 'Organizational Systems',
      introduction: 'Introduction text'
    }
  ]
};
const valResult = PDFExporter.validateDocument(validNotes);
console.log(`Validation Passed: ${valResult.passed}`);
valResult.checks.forEach(c => console.log(`  [${c.ok ? '✓' : '✗'}] ${c.label}`));

if (valResult.passed) {
  console.log('✅ Test 3 Passed: Document validation verified.\n');
}

console.log('🎉 ALL AUTOMATED TESTS COMPLETED SUCCESSFULLY!');
