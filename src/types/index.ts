export type QuestionType =
  | 'Auto'
  | 'Auto Detect'
  | '1 Mark'
  | '2 Marks'
  | '3 Marks'
  | '2–3 Marks'
  | '2-3 Marks'
  | '4–5 Marks'
  | '4-5 Marks'
  | '5 Marks'
  | '8 Marks'
  | '10 Marks'
  | '10–15 Marks'
  | '10-15 Marks'
  | '15 Marks'
  | '20 Marks'
  | 'Very Short Answer'
  | 'Short Answer'
  | 'Long Answer'
  | 'Numerical'
  | 'Numerical problem'
  | 'Definition'
  | 'Short explanation'
  | 'Detailed explanation'
  | 'Difference or comparison'
  | 'Compare'
  | 'Advantages and disadvantages'
  | 'Derivation'
  | 'Algorithm or programming problem'
  | 'Diagram-Based'
  | 'Diagram-based'
  | 'Short note'
  | 'Long descriptive question'
  | 'Discuss or evaluate question'
  | 'Multiple-part question'
  | 'Explain'
  | 'Other';

export interface SubQuestionItem {
  part: string;
  text: string;
  marks?: number;
  detectedType?: QuestionType;
}

export interface Question {
  id: string;
  number: number;
  displayNumber?: string;
  text: string;
  type: QuestionType;
  detectedType?: QuestionType;
  marks?: number;
  marksSource?: 'explicit' | 'subquestion' | 'section-shared' | 'inferred';
  isMarksAutoDetected?: boolean;
  subQuestions?: SubQuestionItem[];
  subjectOrTopic?: string;
  module?: string;
  order: number;
  instructions?: string;
  answerStatus?: 'not_generated' | 'generating' | 'completed' | 'error';
  answerError?: string;
  generatedAnswer?: QuestionAnswerItem;
}

export interface DiagramConfig {
  title: string;
  caption: string;
  diagramKey:
    | 'vonNeumann'
    | 'fetchDecodeExecute'
    | 'pipelineStages'
    | 'pipelineProcessor'
    | 'systemFeedback'
    | 'rippleCarryAdder'
    | 'carryLookahead'
    | 'ieee754'
    | 'coordinateGraph'
    | 'moraleProductivity'
    | 'memoryHierarchy'
    | 'hydrologicalCycle'
    | 'waterCycle'
    | 'compilerPhases'
    | 'osiModel'
    | 'binaryTree'
    | 'stateTransition'
    | 'photosynthesis'
    | 'custom';
  svgMarkup?: string;
  imageUrl?: string;
  data?: Record<string, any>;
}

export interface FormulaData {
  title: string;
  latex: string;
  variables: { sym: string; meaning: string }[];
  notes?: string;
}

export interface ComparisonTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface ExampleBox {
  title: string;
  scenario: string;
  takeaway: string;
}

export interface NumericalStep {
  stepNumber: number;
  title: string;
  explanation: string;
  equation?: string;
}

export interface NumericalSolution {
  given: { param: string; value: string }[];
  toFind: string;
  formula: string;
  steps: NumericalStep[];
  finalResult: string;
  unit?: string;
  notes?: string;
}

export interface NoteSection {
  id: string;
  moduleNumber?: number;
  moduleTitle?: string;
  topicTitle: string;
  topicNumber?: string;
  introduction?: string;
  definition?: {
    term: string;
    explanation: string;
    keyHighlight?: string;
  };
  keyCharacteristics?: string[];
  typesOrCategories?: {
    name: string;
    description: string;
    points?: string[];
  }[];
  parametersAndVariables?: {
    name: string;
    symbol?: string;
    role: string;
  }[];
  formulaBox?: FormulaData;
  diagram?: DiagramConfig;
  comparisonTable?: ComparisonTable;
  examples?: ExampleBox[];
  importantExamNote?: string;
  factorsOrInfluences?: { title: string; desc: string }[];
  conclusion?: string;
}

export interface ImagePlaceholderConfig {
  isRequired: boolean;
  placeholderText: string;
  figureTitle: string;
  caption?: string;
  uploadedImageUrl?: string;
  uploadedFileName?: string;
  uploadedFileSize?: number;
  imagePlacement?: 'inline' | 'below-intro' | 'below-points' | 'end';
}

export interface SubPartAnswer {
  partLabel: string;
  partMarks: number;
  partQuestion: string;
  partIntro: string;
  points?: { title?: string; text: string }[];
  comparisonTable?: ComparisonTable;
  numericalSolution?: NumericalSolution;
  diagramKey?: DiagramConfig['diagramKey'];
  diagramTitle?: string;
  diagramCaption?: string;
}

export interface QuestionAnswerItem {
  id: string;
  questionNumber: number;
  displayNumber?: string;
  questionText: string;
  marks: number;
  questionType: QuestionType;
  resolvedType?: QuestionType;
  module: string;
  introHeading?: string;
  answerIntro: string;
  mainBodyHeading?: string;
  points?: { title?: string; text: string }[];
  subPartAnswers?: SubPartAnswer[];
  comparisonTable?: ComparisonTable;
  numericalSolution?: NumericalSolution;
  derivationSteps?: { stepNumber: number; title: string; latex?: string; explanation: string }[];
  codeSnippet?: { language: string; code: string; explanation?: string };
  subHeading?: string;
  subContent?: string;
  conclusionHeading?: string;
  conclusion?: string;
  formulaLatex?: string;
  imagePlaceholder?: ImagePlaceholderConfig;
  diagramKey?: DiagramConfig['diagramKey'];
  diagramTitle?: string;
  diagramCaption?: string;
  diagramSvg?: string;
  diagramImageUrl?: string;
  examTip?: string;
}

export type TemplateId =
  | 'reference-style'
  | 'academic-colorful'
  | 'minimal-ios'
  | 'exam-booster'
  | 'university-classic';

export interface GeneratedNotes {
  id: string;
  projectId: string;
  documentTitle: string;
  subject: string;
  module: string;
  preparedBy: string;
  institute: string;
  date: string;
  template: TemplateId;
  sections: NoteSection[];
  qaSection: QuestionAnswerItem[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisResult {
  detectedSubject: string;
  detectedModules: string[];
  coreThemes: string[];
  commonConcepts: string[];
  prerequisites: string[];
  keyFormulas: { name: string; latex: string; explanation: string }[];
  diagramsRequired: { title: string; key: DiagramConfig['diagramKey']; description: string }[];
  examWeightage: { topic: string; importance: 'High' | 'Very High' | 'Medium'; marksCoverage: number }[];
  summary: string;
}

export interface Project {
  id: string;
  title: string;
  subject: string;
  description: string;
  questions: Question[];
  analysis?: AIAnalysisResult;
  generatedNotes?: GeneratedNotes;
  versions: GeneratedNotes[];
  status: 'draft' | 'analyzed' | 'generated' | 'exported';
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  watermarkOpacity: number;
  watermarkPosition: 'center' | 'diagonal' | 'corner';
  watermarkScale: number;
  defaultFont: string;
  defaultTemplate: TemplateId;
  instituteName: string;
  authorName: string;
  aiTone: 'simple-academic' | 'comprehensive' | 'high-yield-bullet';
  apiKey?: string;
  aiProvider: 'gemini-flash' | 'local-deep-engine' | 'custom';
}
