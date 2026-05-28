'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Plus, X, Minus, ChevronDown, Upload, Calendar, Mic, ArrowRight, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { api } from '@/lib/api';

// Simple unique ID generator
function nanoid(size = 8) {
  return Math.random().toString(36).slice(2, 2 + size);
}
import { useAssignmentStore } from '@/store/assignmentStore';
import { useJobWebSocket } from '@/hooks/useJobWebSocket';
import type { QuestionTypeConfig } from '@/types';

const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Fill in the Blanks',
  'True or False',
  'Match the Following',
];

// ── Counter component ─────────────────────────────────────────────
function Counter({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Minus size={13} />
      </button>
      <span className="w-8 text-center text-sm font-semibold text-gray-800 tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────
export default function AssignmentCreateForm() {
  const router = useRouter();
  const { addAssignment, setJobProgress } = useAssignmentStore();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [activeJobAssignmentId, setActiveJobAssignmentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [questionTypes, setQuestionTypes] = useState<QuestionTypeConfig[]>([
    { id: 'qt-1', type: 'Multiple Choice Questions', numQuestions: 4, marksPerQuestion: 1 },
    { id: 'qt-2', type: 'Short Questions', numQuestions: 3, marksPerQuestion: 2 },
  ]);

  // WebSocket hook (activates when we have an assignment ID)
  useJobWebSocket(activeJobAssignmentId);

  // File drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // Question type management
  const addQuestionType = () => {
    const used = questionTypes.map((qt) => qt.type);
    const next = QUESTION_TYPE_OPTIONS.find((o) => !used.includes(o)) || 'Short Questions';
    setQuestionTypes((prev) => [
      ...prev,
      { id: `qt-${nanoid(4)}`, type: next, numQuestions: 2, marksPerQuestion: 1 },
    ]);
  };

  const removeQuestionType = (id: string) => {
    setQuestionTypes((prev) => prev.filter((qt) => qt.id !== id));
  };

  const updateQuestionType = (id: string, field: keyof QuestionTypeConfig, value: string | number) => {
    setQuestionTypes((prev) =>
      prev.map((qt) => (qt.id === id ? { ...qt, [field]: value } : qt))
    );
  };

  const totalQuestions = questionTypes.reduce((s, qt) => s + qt.numQuestions, 0);
  const totalMarks = questionTypes.reduce((s, qt) => s + qt.numQuestions * qt.marksPerQuestion, 0);

  // Validation
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Assignment title is required';
    if (!dueDate) errs.dueDate = 'Due date is required';
    if (questionTypes.length === 0) errs.questionTypes = 'Add at least one question type';
    questionTypes.forEach((qt, i) => {
      if (!qt.type) errs[`qt_type_${i}`] = 'Select a question type';
      if (qt.numQuestions < 1) errs[`qt_num_${i}`] = 'At least 1 question required';
      if (qt.marksPerQuestion < 1) errs[`qt_marks_${i}`] = 'At least 1 mark required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('dueDate', dueDate);
      formData.append(
        'questionTypes',
        JSON.stringify(questionTypes.map(({ id: _, ...rest }) => rest))
      );
      if (additionalInstructions) {
        formData.append('additionalInstructions', additionalInstructions.trim());
      }
      if (file) {
        formData.append('file', file);
      }

      const result = await api.createAssignment(formData);

      // Add to store and start WS listening
      addAssignment(result.assignment);
      setJobProgress({ jobId: result.jobId, assignmentId: result.assignment._id, status: 'queued', progress: 0, message: 'Job queued...' });
      setActiveJobAssignmentId(result.assignment._id);

      toast.success('Assignment created! Generating paper...');
      router.push(`/assignments/${result.assignment._id}/generating`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full mb-8">
        <div className="h-full bg-orange-500 rounded-full w-1/2 transition-all" />
      </div>

      <div className="card p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Assignment Details</h2>
          <p className="text-sm text-gray-500 mt-0.5">Basic information about your assignment</p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Assignment Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quiz on Electricity — Grade 8"
            className={clsx('form-input', errors.title && 'border-red-400 ring-2 ring-red-100')}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* File upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reference Material <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div
            {...getRootProps()}
            className={clsx(
              'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
            )}
          >
            <input {...getInputProps()} />
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            {file ? (
              <p className="text-sm font-medium text-orange-600">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">
                  {isDragActive ? 'Drop it here!' : 'Choose a file or drag & drop it here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, TXT, up to 10MB</p>
              </>
            )}
            {!file && (
              <button
                type="button"
                className="mt-3 text-xs text-gray-600 border border-gray-200 rounded-lg px-4 py-1.5 hover:bg-white transition-colors"
              >
                Browse Files
              </button>
            )}
          </div>
          {file && (
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-xs text-red-500 mt-1 hover:underline"
            >
              Remove file
            </button>
          )}
          <p className="text-xs text-gray-400 mt-1.5">
            Upload your chapter/notes to generate contextual questions
          </p>
        </div>

        {/* Due date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Due Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={clsx('form-input pr-10', errors.dueDate && 'border-red-400 ring-2 ring-red-100')}
            />
            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
        </div>

        {/* Question types */}
        <div>
          <div className="grid grid-cols-[1fr,auto,auto] gap-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <span>Question Type</span>
            <span className="w-24 text-center">No. of Questions</span>
            <span className="w-20 text-center">Marks</span>
          </div>

          <div className="space-y-2">
            {questionTypes.map((qt, idx) => (
              <div key={qt.id} className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center animate-slide-up">
                {/* Type selector */}
                <div className="relative">
                  <select
                    value={qt.type}
                    onChange={(e) => updateQuestionType(qt.id, 'type', e.target.value)}
                    className="form-input appearance-none pr-8 cursor-pointer"
                  >
                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Num questions counter */}
                <Counter
                  value={qt.numQuestions}
                  onChange={(v) => updateQuestionType(qt.id, 'numQuestions', v)}
                />

                {/* Marks counter */}
                <Counter
                  value={qt.marksPerQuestion}
                  onChange={(v) => updateQuestionType(qt.id, 'marksPerQuestion', v)}
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeQuestionType(qt.id)}
                  disabled={questionTypes.length === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {errors.questionTypes && (
            <p className="text-xs text-red-500 mt-1">{errors.questionTypes}</p>
          )}

          <button
            type="button"
            onClick={addQuestionType}
            className="flex items-center gap-2 mt-3 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <span className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <Plus size={12} />
            </span>
            Add Question Type
          </button>

          {/* Totals */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 justify-end">
            <p className="text-sm text-gray-600">
              Total Questions: <span className="font-semibold text-gray-900">{totalQuestions}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total Marks: <span className="font-semibold text-gray-900">{totalMarks}</span>
            </p>
          </div>
        </div>

        {/* Additional instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Additional Information{' '}
            <span className="text-gray-400 font-normal">(for better output)</span>
          </label>
          <div className="relative">
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={3}
              placeholder="e.g. Generate a question paper for 3 hour exam duration..."
              className="form-input resize-none pr-10"
            />
            <Mic size={16} className="absolute right-3 bottom-3 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          <ArrowLeft size={16} />
          Previous
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Next'}
          {!isSubmitting && <ArrowRight size={16} />}
        </button>
      </div>
    </form>
  );
}