import mongoose, { Schema, Document } from 'mongoose';
import type { QuestionTypeConfig, GeneratedPaper } from '../types';

// ── Assignment Model ──────────────────────────────────────────────
export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  fileContent?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  paperId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: [
      {
        type: { type: String, required: true },
        numQuestions: { type: Number, required: true, min: 1 },
        marksPerQuestion: { type: Number, required: true, min: 1 },
      },
    ],
    additionalInstructions: { type: String },
    fileContent: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    paperId: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

// ── Generated Paper Model ────────────────────────────────────────
export interface IGeneratedPaper extends Document {
  assignmentId: string;
  paper: GeneratedPaper;
  createdAt: Date;
}

const GeneratedPaperSchema = new Schema<IGeneratedPaper>(
  {
    assignmentId: { type: String, required: true, index: true },
    paper: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const GeneratedPaperModel = mongoose.model<IGeneratedPaper>(
  'GeneratedPaper',
  GeneratedPaperSchema
);