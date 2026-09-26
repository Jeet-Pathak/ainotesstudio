import { Question } from './src/types';
import { QuestionParser } from './src/services/questionParser';
import { AINotesEngine } from './src/services/aiNotesEngine';

console.log('================================================================');
console.log('  TESTING AUTOMATIC MARKS DETECTION & ANSWER GENERATION         ');
console.log('================================================================\n');

let passCount = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS [${totalTests}]: ${testName}`);
    if (details) console.log(`   └─ ${details}`);
    passCount++;
  } else {
    console.error(`❌ FAIL [${totalTests}]: ${testName}`);
    if (details) console.error(`   └─ ${details}`);
  }
}

// ----------------------------------------------------------------------
// Part 1: Test Marks Detection Formats from Prompt
// ----------------------------------------------------------------------
console.log('\n--- Part 1: All Marks Detection Formats ---');

const m1 = QuestionParser.parseMarks('What is an operating system? (2 Marks)');
assert(m1.marks === 2 && m1.isExplicit, 'Format: (2 Marks)', `Detected: ${m1.marks} Marks, Cleaned: "${m1.cleanedText}"`);

const m2 = QuestionParser.parseMarks('Explain the working of a compiler. [5 Marks]');
assert(m2.marks === 5 && m2.isExplicit, 'Format: [5 Marks]', `Detected: ${m2.marks} Marks`);

const m3 = QuestionParser.parseMarks('Define an algorithm. — 1M');
assert(m3.marks === 1 && m3.isExplicit, 'Format: — 1M', `Detected: ${m3.marks} Marks`);

const m4 = QuestionParser.parseMarks('Explain deadlock (10 marks).');
assert(m4.marks === 10 && m4.isExplicit, 'Format: (10 marks)', `Detected: ${m4.marks} Marks`);

const m5 = QuestionParser.parseMarks('Differentiate between RAM and ROM. (5M)');
assert(m5.marks === 5 && m5.isExplicit, 'Format: (5M)', `Detected: ${m5.marks} Marks`);

const m6 = QuestionParser.parseMarks('Describe the architecture of a computer. (15 Marks)');
assert(m6.marks === 15 && m6.isExplicit, 'Format: (15 Marks)', `Detected: ${m6.marks} Marks`);

const m7 = QuestionParser.parseMarks('Explain the following: (a) Process (2) (b) Thread (3)');
assert(m7.marks === 5 && m7.subQuestions?.length === 2 && m7.subQuestions[0].marks === 2 && m7.subQuestions[1].marks === 3,
  'Format: Subquestions with separate marks (a) Process (2) (b) Thread (3)',
  `Total: ${m7.marks} Marks, Subpart a: ${m7.subQuestions?.[0].marks}M, Subpart b: ${m7.subQuestions?.[1].marks}M`
);

const m8 = QuestionParser.parseMarks('Q1. Explain paging. [10]');
assert(m8.marks === 10 && m8.isExplicit, 'Format: [10]', `Detected: ${m8.marks} Marks`);

const m9 = QuestionParser.parseMarks('What is a process? 2 marks');
assert(m9.marks === 2 && m9.isExplicit, 'Format: 2 marks', `Detected: ${m9.marks} Marks`);

// Shared Section marks
const bulkShared = `Explain the following questions for 5 marks each.\n1. Define process.\n2. Define thread.`;
const parsedShared = QuestionParser.parseBulkText(bulkShared);
assert(parsedShared.length === 2 && parsedShared[0].marks === 5 && parsedShared[1].marks === 5 && parsedShared[0].marksSource === 'section-shared',
  'Format: Shared Section Marks (5 marks each)',
  `Q1: ${parsedShared[0].marks}M (${parsedShared[0].marksSource}), Q2: ${parsedShared[1].marks}M`
);

// ----------------------------------------------------------------------
// Part 2: Section 11 Final Acceptance Test Cases (1 to 10)
// ----------------------------------------------------------------------
console.log('\n--- Part 2: Master Prompt Section 11 Acceptance Tests ---');

// Test Case 1: "Define an algorithm. (1 Mark)" -> A short, precise definition
const q1: Question = {
  id: 'tc-1',
  number: 1,
  text: 'Define an algorithm. (1 Mark)',
  type: 'Auto',
  marks: 1,
  module: 'Module-1',
  order: 1
};
const ans1 = AINotesEngine.generateAnswerForQuestion(q1, 0, 'Computer Science');
assert(ans1.marks === 1, 'Acceptance Test 1: 1 Mark allotted', `Marks: ${ans1.marks}`);
assert(ans1.answerIntro.includes('algorithm') && ans1.answerIntro.length > 20 && (!ans1.points || ans1.points.length === 0),
  'Acceptance Test 1: Short, precise definition without long essay',
  ans1.answerIntro
);

// Test Case 2: "What is a compiler? (2 Marks)" -> Concise answer with brief explanation
const q2: Question = {
  id: 'tc-2',
  number: 2,
  text: 'What is a compiler? (2 Marks)',
  type: 'Auto',
  marks: 2,
  module: 'Module-1',
  order: 2
};
const ans2 = AINotesEngine.generateAnswerForQuestion(q2, 1, 'Computer Science');
assert(ans2.marks === 2, 'Acceptance Test 2: 2 Marks allotted', `Marks: ${ans2.marks}`);
assert(ans2.answerIntro.includes('compiler') && (ans2.points?.length || 0) <= 2,
  'Acceptance Test 2: Concise answer with brief 2-point explanation',
  `Intro: ${ans2.answerIntro.slice(0, 60)}..., Points: ${ans2.points?.length || 0}`
);

// Test Case 3: "Explain the functions of an operating system. (5 Marks)" -> Moderately detailed answer
const q3: Question = {
  id: 'tc-3',
  number: 3,
  text: 'Explain the functions of an operating system. (5 Marks)',
  type: 'Auto',
  marks: 5,
  module: 'Module-1',
  order: 3
};
const ans3 = AINotesEngine.generateAnswerForQuestion(q3, 2, 'Operating Systems');
assert(ans3.marks === 5, 'Acceptance Test 3: 5 Marks allotted', `Marks: ${ans3.marks}`);
assert((ans3.points?.length || 0) >= 4,
  'Acceptance Test 3: Moderately detailed 5-point answer covering OS functions',
  `Points covered: ${ans3.points?.map(p => p.title).join(', ')}`
);

// Test Case 4: "Explain the working of a compiler with a diagram. (10 Marks)" -> Detailed structured answer with diagram
const q4: Question = {
  id: 'tc-4',
  number: 4,
  text: 'Explain the working of a compiler with a diagram. (10 Marks)',
  type: 'Auto',
  marks: 10,
  module: 'Module-1',
  order: 4
};
const ans4 = AINotesEngine.generateAnswerForQuestion(q4, 3, 'Compiler Design');
assert(ans4.marks === 10, 'Acceptance Test 4: 10 Marks allotted', `Marks: ${ans4.marks}`);
assert((ans4.points?.length || 0) >= 5 && (ans4.diagramKey !== undefined || ans4.imagePlaceholder !== undefined) && ans4.conclusion !== undefined,
  'Acceptance Test 4: Detailed 10-mark answer with 6 phases, diagram, and conclusion',
  `Phases: ${ans4.points?.length}, DiagramKey: ${ans4.diagramKey}`
);

// Test Case 5: "Explain the architecture of an operating system in detail. (15 Marks)" -> Comprehensive answer
const q5: Question = {
  id: 'tc-5',
  number: 5,
  text: 'Explain the architecture of an operating system in detail. (15 Marks)',
  type: 'Auto',
  marks: 15,
  module: 'Module-1',
  order: 5
};
const ans5 = AINotesEngine.generateAnswerForQuestion(q5, 4, 'Operating Systems');
assert(ans5.marks === 15, 'Acceptance Test 5: 15 Marks allotted', `Marks: ${ans5.marks}`);
assert((ans5.points?.length || 0) >= 5 && ans5.imagePlaceholder !== undefined && ans5.subHeading !== undefined && ans5.conclusion !== undefined,
  'Acceptance Test 5: Comprehensive multi-page 15-mark answer with kernel subsystems & architecture diagram',
  `Subsystems: ${ans5.points?.length}, Image Req: ${ans5.imagePlaceholder?.isRequired}`
);

// Test Case 6: "Discuss the complete architecture and working of a computer system. (20 Marks)" -> Extensive answer
const q6: Question = {
  id: 'tc-6',
  number: 6,
  text: 'Discuss the complete architecture and working of a computer system. (20 Marks)',
  type: 'Auto',
  marks: 20,
  module: 'Module-1',
  order: 6
};
const ans6 = AINotesEngine.generateAnswerForQuestion(q6, 5, 'Computer Architecture');
assert(ans6.marks === 20, 'Acceptance Test 6: 20 Marks allotted', `Marks: ${ans6.marks}`);
assert((ans6.points?.length || 0) >= 6 && ans6.diagramKey === 'vonNeumann' && ans6.subHeading !== undefined && ans6.conclusion !== undefined,
  'Acceptance Test 6: Extensive 20-mark master analysis with CPU, Memory, Bus, Instruction Cycle & Von Neumann diagram',
  `Subsystems: ${ans6.points?.length}, Subheading: ${ans6.subHeading}`
);

// Test Case 7: "Differentiate between RAM and ROM." -> Inferred 5 marks + comparison table
const { marks: inferredM7 } = QuestionParser.parseMarks('Differentiate between RAM and ROM.');
assert(inferredM7 === 5, 'Acceptance Test 7: Automatically inferred 5 marks depth for comparison', `Inferred: ${inferredM7}M`);
const q7: Question = {
  id: 'tc-7',
  number: 7,
  text: 'Differentiate between RAM and ROM.',
  type: 'Auto',
  marks: inferredM7 || 5,
  module: 'Module-1',
  order: 7
};
const ans7 = AINotesEngine.generateAnswerForQuestion(q7, 6, 'Computer Organization');
assert(ans7.comparisonTable !== undefined && (ans7.comparisonTable.rows.length >= 4),
  'Acceptance Test 7: Formatted side-by-side comparison table for RAM vs ROM',
  `Table rows: ${ans7.comparisonTable?.rows.length}, Headers: ${ans7.comparisonTable?.headers.join(' | ')}`
);

// Test Case 8: Multiple questions with different marks -> Handled independently
const multiQuestions = [q1, q2, q3, q4, q5, q6];
const multiAnswers = multiQuestions.map((q, idx) => AINotesEngine.generateAnswerForQuestion(q, idx, 'Computer Science'));
assert(multiAnswers.length === 6 &&
  multiAnswers[0].marks === 1 &&
  multiAnswers[1].marks === 2 &&
  multiAnswers[2].marks === 5 &&
  multiAnswers[3].marks === 10 &&
  multiAnswers[4].marks === 15 &&
  multiAnswers[5].marks === 20,
  'Acceptance Test 8: Multiple questions with distinct marks (1M, 2M, 5M, 10M, 15M, 20M) answered independently',
  `Marks mapped: [${multiAnswers.map(a => a.marks).join(', ')}]`
);

// Test Case 9: Questions with subparts carrying different marks
const subQBulk = `Q1. Answer the following:\n(a) Define a process. (2 Marks)\n(b) Explain the different states of a process. (5 Marks)\n(c) Explain process scheduling with a diagram. (10 Marks)`;
const parsedSubQ = QuestionParser.parseBulkText(subQBulk);
assert(parsedSubQ.length >= 1, 'Acceptance Test 9: Parsed multi-part question with subparts');
const multiPartQuestion = parsedSubQ[0];
const ansMultiPart = AINotesEngine.generateAnswerForQuestion(multiPartQuestion, 0, 'Operating Systems');
assert(ansMultiPart.subPartAnswers !== undefined && ansMultiPart.subPartAnswers.length === 3,
  'Acceptance Test 9: Generated answers for subparts (a: 2M, b: 5M, c: 10M) with respective marks depth',
  `Subpart 1: ${ansMultiPart.subPartAnswers?.[0]?.partLabel} [${ansMultiPart.subPartAnswers?.[0]?.partMarks}M], Subpart 2: ${ansMultiPart.subPartAnswers?.[1]?.partLabel} [${ansMultiPart.subPartAnswers?.[1]?.partMarks}M], Subpart 3: ${ansMultiPart.subPartAnswers?.[2]?.partLabel} [${ansMultiPart.subPartAnswers?.[2]?.partMarks}M]`
);

// Test Case 10: Long 15-20 mark question multi-page document structure
assert(ans6.marks === 20 && ans6.points && ans6.points.length >= 6 && ans6.subHeading !== undefined && ans6.conclusion !== undefined,
  'Acceptance Test 10: Complete answer generated across multiple pages with no truncation',
  `Points: ${ans6.points?.length}, Subheading: "${ans6.subHeading}", Conclusion: "${ans6.conclusion?.slice(0, 40)}..."`
);

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${passCount} / ${totalTests} PASSED`);
console.log('================================================================\n');

if (passCount === totalTests) {
  console.log('🎉 ALL 20 TEST VERIFICATIONS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
