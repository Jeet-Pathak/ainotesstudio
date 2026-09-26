import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  watermarkOpacity: number;
  watermarkPosition: 'center' | 'diagonal' | 'corner';
  watermarkScale: number;
  defaultFont: string;
  defaultTemplate: string;
  instituteName: string;
  authorName: string;
  aiTone: 'simple-academic' | 'comprehensive' | 'high-yield-bullet';
  apiKey?: string;
  aiProvider: 'gemini-flash' | 'local-deep-engine' | 'custom';
  createdAt?: string;
  updatedAt?: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, default: 'global_settings', index: true },
    watermarkOpacity: { type: Number, default: 0.12, min: 0.02, max: 0.9 },
    watermarkPosition: {
      type: String,
      enum: ['center', 'diagonal', 'corner'],
      default: 'diagonal',
    },
    watermarkScale: { type: Number, default: 0.95 },
    defaultFont: { type: String, default: 'SF Pro Display' },
    defaultTemplate: { type: String, default: 'reference-style' },
    instituteName: { type: String, default: 'MAKAUT CSE / IT Department' },
    authorName: { type: String, default: 'Gen-Zineers Academic Studio' },
    aiTone: {
      type: String,
      enum: ['simple-academic', 'comprehensive', 'high-yield-bullet'],
      default: 'simple-academic',
    },
    apiKey: { type: String, default: '' },
    aiProvider: {
      type: String,
      enum: ['gemini-flash', 'local-deep-engine', 'custom'],
      default: 'gemini-flash',
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

export const SettingsModel = mongoose.model<ISettings>('Settings', SettingsSchema);
