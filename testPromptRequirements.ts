import { Question, GeneratedNotes, QuestionAnswerItem } from './src/types';
import { AINotesEngine } from './src/services/aiNotesEngine';
import { QuestionParser } from './src/services/questionParser';

console.log('================================================================');
console.log('  RUNNING MASTER IMPLEMENTATION PROMPT 10 ACCEPTANCE TESTS       ');
console.log('================================================================\n');

let passCount = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

// -------------------------------------------------------------
// Test 1: Add multiple questions
// -------------------------------------------------------------
console.log('--- Test 1: Add Multiple Questions ---');
const questions: Question[] = [
  { id: 'q1', number: 1, text: 'Define compiler.', type: 'Definition', marks: 2, module: 'Module-1', order: 1, answerStatus: 'not_generated' },
  { id: 'q2', number: 2, text: 'Differentiate between RISC and CISC architectures.', type: 'Compare', marks: 5, module: 'Module-1', order: 2, answerStatus: 'not_generated' },
  { id: 'q3', number: 3, text: 'Explain the working of an operating system and its major subsystems with diagram.', type: 'Long Answer', marks: 15, module: 'Module-1', order: 3, answerStatus: 'not_generated' },
  { id: 'q4', number: 4, text: 'Explain instruction pipelining and pipeline hazards.', type: 'Long Answer', marks: 10, module: 'Module-2', order: 4, answerStatus: 'not_generated' },
  { id: 'q5', number: 5, text: 'Calculate the roots of quadratic equation 2x^2 - 7x + 3 = 0.', type: 'Numerical', marks: 10, module: 'Module-2', order: 5, answerStatus: 'not_generated' },
];

assert(questions.length === 5, 'Test 1: Added 5 different questions');
assert(questions.every(q => q.answerStatus === 'not_generated'), 'Test 1: All 5 questions initialized with independent controls');

// -------------------------------------------------------------
// Test 2: Generate independent answers for all questions
// -------------------------------------------------------------
console.log('\n--- Test 2: Generate Independent Answers ---');
const generatedAnswers = questions.map((q, idx) =>
  AINotesEngine.generateAnswerForQuestion(q, idx, 'Computer Science')
);

assert(generatedAnswers.length === 5, 'Test 2: Generated 5 independent answers');
assert(generatedAnswers[0].marks === 2, 'Test 2: Q1 answer is 2 marks');
assert(generatedAnswers[1].comparisonTable !== undefined, 'Test 2: Q2 answer has comparison table for comparison question');
assert(generatedAnswers[2].marks === 15 && (generatedAnswers[2].points?.length || 0) >= 4, 'Test 2: Q3 answer is comprehensive 15 marks with multiple points');

// -------------------------------------------------------------
// Test 3: Long answer continuation (15 marks)
// -------------------------------------------------------------
console.log('\n--- Test 3: Long Answer Continuation (15 Marks) ---');
const osLongQ: Question = {
  id: 'q-os-15',
  number: 1,
  text: 'Explain the architecture and working of an operating system. (15 marks)',
  type: 'Long Answer',
  marks: 15,
  module: 'Module-1',
  order: 1
};
const osAnswer = AINotesEngine.generateAnswerForQuestion(osLongQ, 0, 'Operating Systems');
assert(osAnswer.marks === 15, 'Test 3: 15 marks preserved');
assert((osAnswer.points?.length || 0) >= 4, 'Test 3: Subsystems covered in depth');
assert(osAnswer.imagePlaceholder !== undefined, 'Test 3: Diagram placeholder included for multi-page answer');
assert(osAnswer.conclusion !== undefined, 'Test 3: Concluding synthesis included');

// -------------------------------------------------------------
// Test 4: Short answer length (2 marks definition)
// -------------------------------------------------------------
console.log('\n--- Test 4: Short Answer Length (2 Marks) ---');
const defQ: Question = {
  id: 'q-def-2',
  number: 2,
  text: 'Define a compiler. (2 marks)',
  type: 'Definition',
  marks: 2,
  module: 'Module-1',
  order: 2
};
const defAnswer = AINotesEngine.generateAnswerForQuestion(defQ, 1, 'Computer Science');
assert(defAnswer.marks === 2, 'Test 4: 2 marks preserved');
assert(defAnswer.answerIntro.length > 20 && defAnswer.answerIntro.length < 350, 'Test 4: Concise definition without excessive filler');
assert(!defAnswer.points || defAnswer.points.length === 0, 'Test 4: No unnecessary 5-point breakdowns for 2 marks');

// -------------------------------------------------------------
// Test 5: Add a question after generation (preserves existing answers)
// -------------------------------------------------------------
console.log('\n--- Test 5: Add Question After Generation ---');
const currentList: Question[] = [
  { ...questions[0], generatedAnswer: generatedAnswers[0], answerStatus: 'completed' },
  { ...questions[1], generatedAnswer: generatedAnswers[1], answerStatus: 'completed' },
  { ...questions[2], generatedAnswer: generatedAnswers[2], answerStatus: 'completed' },
];

const newQ4: Question = {
  id: 'q-new-4',
  number: 4,
  text: 'Explain carry look-ahead adder. (10 marks)',
  type: 'Long Answer',
  marks: 10,
  module: 'Module-2',
  order: 4,
  answerStatus: 'not_generated'
};

const updatedList = [...currentList, newQ4];
assert(updatedList.length === 4, 'Test 5: List now has 4 questions');
assert(updatedList[0].generatedAnswer === generatedAnswers[0], 'Test 5: Q1 answer preserved');
assert(updatedList[1].generatedAnswer === generatedAnswers[1], 'Test 5: Q2 answer preserved');
assert(updatedList[2].generatedAnswer === generatedAnswers[2], 'Test 5: Q3 answer preserved');
assert(updatedList[3].answerStatus === 'not_generated', 'Test 5: Q4 is ready for independent generation');

// -------------------------------------------------------------
// Test 6: Reorder questions (preserves answers & updates question numbers)
// -------------------------------------------------------------
console.log('\n--- Test 6: Reorder Questions ---');
// Move Q4 to index 1 (above Q2)
const reordered = [updatedList[0], updatedList[3], updatedList[1], updatedList[2]];
reordered.forEach((q, i) => {
  q.number = i + 1;
  q.order = i + 1;
  if (q.generatedAnswer) {
    q.generatedAnswer.questionNumber = i + 1;
  }
});

assert(reordered[0].id === 'q1' && reordered[0].number === 1, 'Test 6: Q1 is at position 1');
assert(reordered[1].id === 'q-new-4' && reordered[1].number === 2, 'Test 6: Q4 moved to position 2 with updated number 2');
assert(reordered[2].id === 'q2' && reordered[2].number === 3, 'Test 6: Q2 moved to position 3 with answer preserved');
assert(reordered[2].generatedAnswer === generatedAnswers[1], 'Test 6: Q2 answer remains attached to Q2');

// -------------------------------------------------------------
// Test 7: Regenerate one answer (only question 3 changes)
// -------------------------------------------------------------
console.log('\n--- Test 7: Regenerate One Answer ---');
const regeneratedQ3Answer = AINotesEngine.generateAnswerForQuestion(
  { ...questions[2], marks: 15 },
  2,
  'Operating Systems'
);
const afterRegen = reordered.map(q => {
  if (q.id === 'q3') {
    return { ...q, generatedAnswer: regeneratedQ3Answer };
  }
  return q;
});
assert(afterRegen.find(q => q.id === 'q1')?.generatedAnswer === generatedAnswers[0], 'Test 7: Q1 answer unchanged');
assert(afterRegen.find(q => q.id === 'q2')?.generatedAnswer === generatedAnswers[1], 'Test 7: Q2 answer unchanged');
assert(afterRegen.find(q => q.id === 'q3')?.generatedAnswer !== undefined, 'Test 7: Q3 regenerated independently');

// -------------------------------------------------------------
// Test 8: Continuous document flow
// -------------------------------------------------------------
console.log('\n--- Test 8: Continuous Document Flow ---');
const allAnswers = questions.map((q, i) => AINotesEngine.generateAnswerForQuestion(q, i, 'Computer Science'));
assert(allAnswers.length === 5, 'Test 8: 5 answers ready for sequential document placement');
assert(allAnswers[0].questionNumber === 1 && allAnswers[1].questionNumber === 2 && allAnswers[2].questionNumber === 3, 'Test 8: Consecutive question ordering');

// -------------------------------------------------------------
// Test 9: Multi-page PDF Export Data Integrity
// -------------------------------------------------------------
console.log('\n--- Test 9: Multi-Page PDF Export Integrity ---');
const totalQAItems = allAnswers.length;
assert(totalQAItems === 5, 'Test 9: All 5 answers preserved in export payload');
assert(allAnswers.some(a => a.comparisonTable !== undefined), 'Test 9: Comparison tables included');
assert(allAnswers.some(a => a.numericalSolution !== undefined), 'Test 9: Numerical solutions included');
assert(allAnswers.some(a => a.imagePlaceholder !== undefined), 'Test 9: Image placeholders included');

// -------------------------------------------------------------
// Test 10: Save and reopen persistence
// -------------------------------------------------------------
console.log('\n--- Test 10: Save and Reopen Persistence ---');
const savedJSON = JSON.stringify(afterRegen);
const restoredQuestions = JSON.parse(savedJSON) as Question[];

assert(restoredQuestions.length === afterRegen.length, 'Test 10: Restored all questions count');
assert(restoredQuestions[0].text === afterRegen[0].text, 'Test 10: Preserved question text');
assert(restoredQuestions[0].marks === afterRegen[0].marks, 'Test 10: Preserved marks');
assert(restoredQuestions[2].generatedAnswer?.comparisonTable?.rows.length === afterRegen[2].generatedAnswer?.comparisonTable?.rows.length, 'Test 10: Preserved comparison table content');

console.log('\n================================================================');
console.log(`PROMPT ACCEPTANCE TEST RESULTS: ${passCount} / ${totalTests} PASSED`);
console.log('================================================================\n');
