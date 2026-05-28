export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface QuestionTypeConfig {
  id: string; // client-side ID for React keys
  type: string;
  numQuestions: number;
  marksPerQuestion: number;
}

export interface Assignment {
  _id: string;
  title: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  paperId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: string;
}

export interface GeneratedSection {
  title: string;
  instruction: string;
  questionType: string;
  marksPerQuestion: number;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  title: string;
  subject: string;
  totalMarks: number;
  totalQuestions: number;
  timeAllowed: string;
  sections: GeneratedSection[];
  answerKey: { questionId: string; answer: string }[];
}

export interface JobProgress {
  jobId: string;
  assignmentId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

// WebSocket message shapes
export type WSMessage =
  | { type: 'progress'; data: JobProgress }
  | { type: 'completed'; data: { assignmentId: string; paper: GeneratedPaper } }
  | { type: 'error'; data: { assignmentId: string; message: string } };