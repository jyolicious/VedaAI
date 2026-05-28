'use client';

import { useState } from 'react';
import { Download, RefreshCw, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import clsx from 'clsx';
import type { GeneratedPaper, Difficulty } from '@/types';

// ── Difficulty badge ──────────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const map = {
    easy: { label: 'Easy', className: 'badge-easy' },
    moderate: { label: 'Moderate', className: 'badge-moderate' },
    hard: { label: 'Hard', className: 'badge-hard' },
  };
  const config = map[difficulty];
  return <span className={config.className}>{config.label}</span>;
}

// ── Question item ─────────────────────────────────────────────────
function QuestionItem({
  number,
  question,
}: {
  number: number;
  question: GeneratedPaper['sections'][0]['questions'][0];
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-50 last:border-0 group">
      <span className="text-sm text-gray-500 font-medium w-7 flex-shrink-0 pt-0.5 tabular-nums">
        {number}.
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-relaxed">{question.text}</p>
        <div className="flex items-center gap-2 mt-2">
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="text-xs text-gray-400 font-medium">[{question.marks} mark{question.marks !== 1 ? 's' : ''}]</span>
        </div>
      </div>
    </div>
  );
}

// ── Answer key section ────────────────────────────────────────────
function AnswerKey({ paper }: { paper: GeneratedPaper }) {
  const [open, setOpen] = useState(false);
  if (!paper.answerKey || paper.answerKey.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
      >
        <BookOpen size={16} />
        Answer Key
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="mt-4 space-y-3 animate-slide-up">
          {paper.answerKey.map((ak) => (
            <div key={ak.questionId} className="flex gap-3 text-sm">
              <span className="font-semibold text-gray-500 w-10 flex-shrink-0">{ak.questionId}.</span>
              <p className="text-gray-700 leading-relaxed">{ak.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main paper display ────────────────────────────────────────────
interface QuestionPaperDisplayProps {
  paper: GeneratedPaper;
  assignmentId: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export default function QuestionPaperDisplay({
  paper,
  assignmentId,
  onRegenerate,
  isRegenerating,
}: QuestionPaperDisplayProps) {
  let globalQuestionNumber = 1;

  const handleDownload = async () => {
    // Generate printable HTML and open a print dialog
    const printContent = document.getElementById('paper-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${paper.title}</title>
          <style>
            body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
            h2 { text-align: center; font-size: 14px; font-weight: normal; margin-bottom: 2px; }
            .meta { display: flex; justify-content: space-between; margin: 16px 0; font-size: 12px; }
            .student-info { margin: 16px 0; }
            .student-info input { border: none; border-bottom: 1px solid #000; width: 200px; }
            .section { margin-top: 24px; }
            .section-title { font-weight: bold; font-size: 14px; text-align: center; text-decoration: underline; }
            .instruction { font-size: 12px; text-align: center; margin: 4px 0; }
            .question { display: flex; gap: 8px; margin: 10px 0; font-size: 12px; line-height: 1.6; }
            .diff-badge { font-size: 10px; border: 1px solid #ccc; padding: 1px 6px; border-radius: 10px; }
            hr { border-top: 1px solid #eee; margin: 16px 0; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      {/* Action bar (no-print) */}
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{paper.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-generated question paper</p>
        </div>
        <div className="flex items-center gap-3">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="btn-secondary disabled:opacity-60"
            >
              <RefreshCw size={15} className={clsx(isRegenerating && 'animate-spin')} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          )}
          <button onClick={handleDownload} className="btn-primary">
            <Download size={15} />
            Download as PDF
          </button>
        </div>
      </div>

      {/* The paper */}
      <div id="paper-content" className="card p-8 print-paper">
        {/* School header */}
        <div className="text-center border-b border-gray-200 pb-5 mb-6">
          <h1 className="text-lg font-bold text-gray-900">{paper.title}</h1>
          <p className="text-sm text-gray-600 mt-1">Subject: {paper.subject}</p>
          {/* Class line can be added if passed */}
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
          <span>Time Allowed: {paper.timeAllowed}</span>
          <span>Maximum Marks: {paper.totalMarks}</span>
        </div>

        {/* Student info */}
        <div className="flex gap-8 text-sm text-gray-700 mb-6 border border-gray-100 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="font-medium">Name:</span>
            <span className="border-b border-gray-400 w-40 inline-block">&nbsp;</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">Roll Number:</span>
            <span className="border-b border-gray-400 w-24 inline-block">&nbsp;</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium">Section:</span>
            <span className="border-b border-gray-400 w-20 inline-block">&nbsp;</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6 italic">
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Sections */}
        {paper.sections.map((section) => (
          <div key={section.title} className="mb-8">
            {/* Section header */}
            <div className="text-center mb-4">
              <h2 className="text-base font-bold text-gray-900 underline">{section.title}</h2>
              <p className="text-sm text-gray-500 mt-1 italic">{section.instruction}</p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-1">
                <span>Type: {section.questionType}</span>
                <span>·</span>
                <span>{section.marksPerQuestion} mark{section.marksPerQuestion !== 1 ? 's' : ''} each</span>
              </div>
            </div>

            {/* Difficulty summary for this section */}
            <div className="flex gap-2 justify-center mb-4">
              {(['easy', 'moderate', 'hard'] as Difficulty[]).map((d) => {
                const count = section.questions.filter((q) => q.difficulty === d).length;
                if (count === 0) return null;
                return (
                  <span key={d} className={`badge-${d} text-xs`}>
                    {count} {d}
                  </span>
                );
              })}
            </div>

            {/* Questions */}
            <div className="bg-gray-50/50 rounded-xl px-5">
              {section.questions.map((q) => {
                const n = globalQuestionNumber++;
                return (
                  <QuestionItem key={q.id} number={n} question={q} />
                );
              })}
            </div>
          </div>
        ))}

        <div className="text-center text-sm text-gray-400 italic mt-8 pt-6 border-t border-gray-100">
          — End of Question Paper —
        </div>

        <AnswerKey paper={paper} />
      </div>
    </div>
  );
}