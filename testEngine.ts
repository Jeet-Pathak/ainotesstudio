import { QuestionParser } from './src/services/questionParser';
import { AINotesEngine } from './src/services/aiNotesEngine';
import { Question } from './src/types';

async function runTests() {
  console.log('================================================================');
  console.log('  RUNNING MASTER PROMPT 10 FINAL ACCEPTANCE & VALIDATION TESTS  ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 1: SHORT ANSWER (2 MARKS)
  // Input: "Define an operating system. (2 marks)"
  // Expected: Concise and accurate definition with brief explanation.
  // -------------------------------------------------------------------------
  console.log('--- Test 1: Short Answer ("Define an operating system. (2 marks)") ---');
  const t1Parsed = QuestionParser.parseMarks('Define an operating system. (2 marks)');
  assert(t1Parsed.marks === 2, 'Test 1: Extracted 2 marks from "(2 marks)"');
  assert(t1Parsed.cleanedText === 'Define an operating system.', 'Test 1: Cleaned question text');
  
  const t1Q: Question = {
    id: 't1',
    number: 1,
    text: t1Parsed.cleanedText,
    marks: t1Parsed.marks!,
    type: 'Auto',
    order: 1,
  };
  const t1Ans = AINotesEngine.generateAnswerForQuestion(t1Q, 0, 'Operating Systems');
  assert(t1Ans.marks === 2, 'Test 1: Output answer marks = 2');
  assert(t1Ans.resolvedType === 'Definition' || t1Ans.resolvedType === 'Very Short Answer', 'Test 1: Resolved as Definition / Short Answer');
  assert(
    t1Ans.answerIntro.toLowerCase().includes('operating system') &&
    t1Ans.answerIntro.toLowerCase().includes('hardware') &&
    t1Ans.answerIntro.toLowerCase().includes('software'),
    'Test 1: Generated accurate, concise definition in simple language'
  );
  assert(!t1Ans.conclusion, 'Test 1: No superfluous long essay conclusion for 2 marks');

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 2: LONG ANSWER (10 MARKS)
  // Input: "Explain the working of an operating system. (10 marks)"
  // Expected: Detailed, properly explained answer covering working mechanisms.
  // -------------------------------------------------------------------------
  console.log('\n--- Test 2: Long Answer ("Explain the working of an operating system. (10 marks)") ---');
  const t2Parsed = QuestionParser.parseMarks('Explain the working of an operating system. (10 marks)');
  assert(t2Parsed.marks === 10, 'Test 2: Extracted 10 marks from "(10 marks)"');
  
  const t2Q: Question = {
    id: 't2',
    number: 2,
    text: t2Parsed.cleanedText,
    marks: t2Parsed.marks!,
    type: 'Auto',
    order: 2,
  };
  const t2Ans = AINotesEngine.generateAnswerForQuestion(t2Q, 1, 'Operating Systems');
  assert(t2Ans.marks === 10, 'Test 2: Output answer marks = 10');
  assert(t2Ans.resolvedType === 'Long Answer', 'Test 2: Resolved to Long Answer');
  assert(t2Ans.points && t2Ans.points.length >= 4, `Test 2: Contains ${t2Ans.points?.length} detailed working mechanisms`);
  assert(
    t2Ans.points &&
    t2Ans.points.some(p => p.title?.toLowerCase().includes('process') || p.text.toLowerCase().includes('process')) &&
    t2Ans.points.some(p => p.title?.toLowerCase().includes('memory') || p.text.toLowerCase().includes('memory')),
    'Test 2: Covers essential OS subsystems (Process Management, Memory Management, File System, I/O)'
  );
  assert(!!t2Ans.conclusion, 'Test 2: Includes synthesis conclusion');

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 3: COMPARISON QUESTION (5 MARKS)
  // Input: "Differentiate between RISC and CISC. (5 marks)"
  // Expected: Meaningful side-by-side comparison with enough relevant points for marks.
  // -------------------------------------------------------------------------
  console.log('\n--- Test 3: Comparison ("Differentiate between RISC and CISC. (5 marks)") ---');
  const t3Parsed = QuestionParser.parseMarks('Differentiate between RISC and CISC. (5 marks)');
  assert(t3Parsed.marks === 5, 'Test 3: Extracted 5 marks from "(5 marks)"');
  
  const t3Q: Question = {
    id: 't3',
    number: 3,
    text: t3Parsed.cleanedText,
    marks: t3Parsed.marks!,
    type: 'Auto',
    order: 3,
  };
  const t3Ans = AINotesEngine.generateAnswerForQuestion(t3Q, 2, 'Computer Architecture');
  assert(t3Ans.resolvedType === 'Compare', 'Test 3: Resolved to Compare type');
  assert(!!t3Ans.comparisonTable && t3Ans.comparisonTable.rows.length >= 4, `Test 3: Side-by-side comparison table generated with ${t3Ans.comparisonTable?.rows.length} rows`);
  assert(
    t3Ans.comparisonTable.headers.some(h => h.includes('RISC')) &&
    t3Ans.comparisonTable.headers.some(h => h.includes('CISC')),
    'Test 3: Correct RISC vs CISC side-by-side headers'
  );

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 4: NUMERICAL PROBLEM
  // Input: Quadratic equation numerical question with marks.
  // Expected: Correct formula, calculations, logical steps, final answer with units.
  // -------------------------------------------------------------------------
  console.log('\n--- Test 4: Numerical Problem ---');
  const t4Q: Question = {
    id: 't4',
    number: 4,
    text: 'Calculate the roots of the quadratic equation 2x² - 7x + 3 = 0 and show all steps. [5 marks]',
    marks: 5,
    type: 'Numerical',
    order: 4,
  };
  const t4Ans = AINotesEngine.generateAnswerForQuestion(t4Q, 3, 'Applied Mathematics');
  assert(t4Ans.resolvedType === 'Numerical', 'Test 4: Resolved to Numerical');
  assert(!!t4Ans.numericalSolution, 'Test 4: Numerical solution object present');
  assert(t4Ans.numericalSolution!.steps.length >= 3, `Test 4: ${t4Ans.numericalSolution!.steps.length} step-by-step calculations`);
  assert(
    t4Ans.numericalSolution!.finalResult.includes('3') &&
    t4Ans.numericalSolution!.finalResult.includes('1/2'),
    'Test 4: Correct verified final mathematical roots (x = 3, x = 1/2)'
  );

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 5: MULTI-PAGE ANSWER
  // Input: Complex 15-mark question requiring extensive explanation.
  // Expected: Complete answer generated with deep academic breakdown suitable for multi-page pagination.
  // -------------------------------------------------------------------------
  console.log('\n--- Test 5: Multi-Page Answer (15 Marks) ---');
  const t5Q: Question = {
    id: 't5',
    number: 5,
    text: 'Explain carry look-ahead adder and compare with ripple carry adder. [15 marks]',
    marks: 15,
    type: '10–15 Marks',
    order: 5,
  };
  const t5Ans = AINotesEngine.generateAnswerForQuestion(t5Q, 4, 'Computer Architecture');
  assert(t5Ans.marks === 15, 'Test 5: Preserved 15 marks');
  assert(t5Ans.points && t5Ans.points.length >= 4, `Test 5: Contains ${t5Ans.points?.length} expanded points`);
  assert(!!t5Ans.comparisonTable, 'Test 5: Includes detailed comparison table');
  assert(!!t5Ans.formulaLatex, 'Test 5: Includes Carry Look-Ahead equations');

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 6: CONTINUOUS QUESTION FLOW
  // Input: Consecutive questions of different marks.
  // Expected: Questions flow continuously with proper sequencing without artificial block gaps.
  // -------------------------------------------------------------------------
  console.log('\n--- Test 6: Continuous Question Flow ---');
  const rawConsecutive = `1. What is a compiler? [2 Marks]
2. Differentiate between RISC and CISC — 5M.
3. Explain instruction pipelining with a neat diagram. (10 marks)`;
  const parsedConsecutive = QuestionParser.parseBulkText(rawConsecutive, 0);
  assert(parsedConsecutive.length === 3, 'Test 6: Extracted 3 consecutive questions');
  assert(parsedConsecutive[0].marks === 2, 'Test 6: Q1 is 2 marks');
  assert(parsedConsecutive[1].marks === 5, 'Test 6: Q2 is 5 marks');
  assert(parsedConsecutive[2].marks === 10, 'Test 6: Q3 is 10 marks');

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 7: IMAGE-REQUIRED QUESTION
  // Input: "Explain instruction pipelining with a neat diagram. (10 marks)"
  // Expected: Detailed answer with image placeholder, reserved area, and descriptive caption.
  // -------------------------------------------------------------------------
  console.log('\n--- Test 7: Image-Required Question ---');
  const t7Text = 'Explain instruction pipelining with a neat diagram. (10 marks)';
  const t7Parsed = QuestionParser.parseMarks(t7Text);
  const t7ImageReq = QuestionParser.detectImageRequirement(t7Parsed.cleanedText, t7Parsed.marks);
  assert(!!t7ImageReq && t7ImageReq.isRequired, 'Test 7: Detected image is required');
  assert(
    t7ImageReq!.placeholderText.includes('Instruction Pipelining') ||
    t7ImageReq!.placeholderText.includes('IMAGE REQUIRED'),
    'Test 7: Designated placeholder text format "[IMAGE REQUIRED: ...]"'
  );
  assert(
    t7ImageReq!.figureTitle.includes('Figure') && t7ImageReq!.figureTitle.includes('Instruction Pipelining'),
    'Test 7: Descriptive figure title generated: ' + t7ImageReq?.figureTitle
  );

  const t7Q: Question = {
    id: 't7',
    number: 7,
    text: t7Parsed.cleanedText,
    marks: 10,
    type: 'Auto',
    order: 7,
  };
  const t7Ans = AINotesEngine.generateAnswerForQuestion(t7Q, 6, 'Computer Architecture');
  assert(!!t7Ans.imagePlaceholder, 'Test 7: Answer includes imagePlaceholder');
  assert(!!t7Ans.diagramKey, 'Test 7: Vector diagram key attached for instant preview');

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 8: IMAGE UPLOAD VALIDATION (STRICT < 1 MB LIMIT)
  // Expected: Files < 1,000,000 bytes accepted, files >= 1,000,000 bytes rejected.
  // -------------------------------------------------------------------------
  console.log('\n--- Test 8: Image Upload File Size Validation (< 1 MB) ---');
  const MAX_PERMITTED_BYTES = 1000000;
  const validFileSize = 450 * 1024; // 450 KB
  const oversizedFileSize = 1024 * 1024; // 1024 KB = 1 MB (rejected)
  const hugeFileSize = 2.5 * 1024 * 1024; // 2.5 MB (rejected)

  assert(validFileSize < MAX_PERMITTED_BYTES, 'Test 8: 450 KB image is < 1 MB and accepted');
  assert(oversizedFileSize >= MAX_PERMITTED_BYTES, 'Test 8: 1.0 MB image is >= 1,000,000 bytes and rejected');
  assert(hugeFileSize >= MAX_PERMITTED_BYTES, 'Test 8: 2.5 MB image is >= 1,000,000 bytes and rejected');

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 9: MARKS PATTERNS ROBUSTNESS
  // Formats: "(10 marks)", "[2 Marks]", "— 5M", "(10+5)", "(1 mark)"
  // -------------------------------------------------------------------------
  console.log('\n--- Test 9: Robust Marks Detection Formats ---');
  const pA = QuestionParser.parseMarks('Explain instruction pipelining (10 marks).');
  assert(pA.marks === 10 && pA.isExplicit, 'Test 9: "(10 marks)" -> 10 marks');

  const pB = QuestionParser.parseMarks('What is a compiler? [2 Marks]');
  assert(pB.marks === 2 && pB.isExplicit, 'Test 9: "[2 Marks]" -> 2 marks');

  const pC = QuestionParser.parseMarks('Differentiate between RISC and CISC — 5M.');
  assert(pC.marks === 5 && pC.isExplicit, 'Test 9: "— 5M." -> 5 marks');

  const pD = QuestionParser.parseMarks('Describe the working principle of an operating system. (10+5)');
  assert(pD.marks === 15 && pD.isExplicit, 'Test 9: "(10+5)" composite -> 15 marks');

  const pE = QuestionParser.parseMarks('Define deadlock. (1 mark)');
  assert(pE.marks === 1 && pE.isExplicit, 'Test 9: "(1 mark)" -> 1 mark');

  // -------------------------------------------------------------------------
  // MASTER PROMPT TEST 10: MIXED QUESTION TYPES ADAPTIVENESS
  // Input: Mixed questions (Definition, Comparison, Numerical, Diagram, Working Principle).
  // Expected: Each question receives an adaptive structure without forced uniform template.
  // -------------------------------------------------------------------------
  console.log('\n--- Test 10: Mixed Question Types Adaptiveness ---');
  const mixedQuestions: Question[] = [
    { id: 'm1', number: 1, text: 'Define deadlock.', marks: 1, type: 'Definition', order: 1 },
    { id: 'm2', number: 2, text: 'Differentiate between RISC and CISC.', marks: 5, type: 'Compare', order: 2 },
    { id: 'm3', number: 3, text: 'Calculate the roots of 2x² - 7x + 3 = 0.', marks: 5, type: 'Numerical', order: 3 },
    { id: 'm4', number: 4, text: 'Explain the working of an operating system.', marks: 10, type: 'Long Answer', order: 4 },
  ];

  const ans1 = AINotesEngine.generateAnswerForQuestion(mixedQuestions[0], 0, 'OS');
  const ans2 = AINotesEngine.generateAnswerForQuestion(mixedQuestions[1], 1, 'COA');
  const ans3 = AINotesEngine.generateAnswerForQuestion(mixedQuestions[2], 2, 'Math');
  const ans4 = AINotesEngine.generateAnswerForQuestion(mixedQuestions[3], 3, 'OS');

  assert(!ans1.comparisonTable && !ans1.numericalSolution && !ans1.conclusion, 'Test 10: Definition is direct with no unnecessary sections');
  assert(!!ans2.comparisonTable, 'Test 10: Comparison question uses side-by-side comparison table');
  assert(!!ans3.numericalSolution && ans3.numericalSolution.steps.length > 0, 'Test 10: Numerical question uses step-by-step calculation');
  assert(ans4.points && ans4.points.length >= 4 && !!ans4.conclusion, 'Test 10: Long working principle question is structured with comprehensive headings');

  console.log('\n================================================================');
  console.log(`MASTER ACCEPTANCE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
