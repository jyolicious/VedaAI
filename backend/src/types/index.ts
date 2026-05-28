// Shared TypeScript types for the backend

export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface QuestionTypeConfig {
  type: string;
  numQuestions: number;
  marksPerQuestion: number;
}

export interface CreateAssignmentDTO {
  title: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string;
  fileContent?: string; // extracted text from uploaded file
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: string;
}

export interface GeneratedSection {
  title: string;       // e.g. "Section A"
  instruction: string; // e.g. "Attempt all questions"
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
  progress: number; // 0–100
  message?: string;
}