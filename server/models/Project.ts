import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  id: string;
  number: number;
  text: string;
  type: string;
  marks?: number;
  module?: string;
  order: number;
}

export interface INoteSection {
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
  formulaBox?: {
    title: string;
    latex: string;
    variables: { sym: string; meaning: string }[];
    notes?: string;
  };
  diagram?: {
    title: string;
    caption: string;
    diagramKey: string;
    svgMarkup?: string;
  };
  comparisonTable?: {
    title: string;
    headers: string[];
    rows: string[][];
  };
  examples?: {
    title: string;
    scenario: string;
    takeaway: string;
  }[];
  importantExamNote?: string;
  conclusion?: string;
}

export interface IQuestionAnswerItem {
  id: string;
  questionNumber: number;
  questionText: string;
  marks: number;
  questionType: string;
  module: string;
  answerIntro: string;
  points: { title?: string; text: string }[];
  formulaLatex?: string;
  diagramKey?: string;
  examTip?: string;
  conclusion?: string;
}

export interface IGeneratedNotes {
  id: string;
  projectId: string;
  documentTitle: string;
  subject: string;
  module: string;
  preparedBy: string;
  institute: string;
  date: string;
  template: string;
  sections: INoteSection[];
  qaSection: IQuestionAnswerItem[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProject extends Document {
  id: string;
  title: string;
  subject: string;
  description: string;
  questions: IQuestion[];
  analysis?: any;
  generatedNotes?: IGeneratedNotes;
  versions: IGeneratedNotes[];
  status: 'draft' | 'analyzed' | 'generated' | 'exported';
  createdAt: string;
  updatedAt: string;
}

const ProjectSchema = new Schema<IProject>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subject: { type: String, default: 'General Engineering & Applied Sciences' },
    description: { type: String, default: '' },
    questions: { type: [Schema.Types.Mixed], default: [] },
    analysis: { type: Schema.Types.Mixed },
    generatedNotes: { type: Schema.Types.Mixed },
    versions: { type: [Schema.Types.Mixed], default: [] },
    status: {
      type: String,
      enum: ['draft', 'analyzed', 'generated', 'exported'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);
