import Groq from 'groq-sdk';
import type { QuestionTypeConfig, GeneratedPaper, GeneratedSection, GeneratedQuestion } from '../types';

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL,
});

// ── Prompt Builder ────────────────────────────────────────────────
function buildPrompt(
  title: string,
  questionTypes: QuestionTypeConfig[],
  additionalInstructions: string,
  fileContent?: string
): string {
  const sectionConfigs = questionTypes.map((qt, i) => ({
    section: String.fromCharCode(65 + i), // A, B, C...
    ...qt,
  }));

  const totalMarks = questionTypes.reduce(
    (sum, qt) => sum + qt.numQuestions * qt.marksPerQuestion,
    0
  );
  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.numQuestions, 0);

  const sectionSpec = sectionConfigs
    .map(
      (s) =>
        `  Section ${s.section}: ${s.numQuestions} × "${s.type}" questions, ${s.marksPerQuestion} mark(s) each`
    )
    .join('\n');

  const contextBlock = fileContent
    ? `\n\nREFERENCE MATERIAL (use this as the knowledge source for questions):\n"""\n${fileContent.slice(0, 3000)}\n"""`
    : '';

  return `You are an expert teacher creating a formal examination paper titled "${title}".

REQUIREMENTS:
${sectionSpec}
Total questions: ${totalQuestions}
Total marks: ${totalMarks}
Additional instructions: ${additionalInstructions || 'None'}${contextBlock}

DIFFICULTY DISTRIBUTION PER SECTION:
- 40% Easy (basic recall, definitions)
- 40% Moderate (application, explanation)  
- 20% Hard (analysis, evaluation, problem-solving)

Return ONLY a valid JSON object matching this exact schema (no markdown, no backticks):

{
  "title": "string - paper title",
  "subject": "string - inferred subject",
  "totalMarks": number,
  "totalQuestions": number,
  "timeAllowed": "string - e.g. '2 hours'",
  "sections": [
    {
      "title": "Section A",
      "instruction": "string - e.g. 'Attempt all questions. Each question carries 2 marks.'",
      "questionType": "string",
      "marksPerQuestion": number,
      "questions": [
        {
          "id": "A1",
          "text": "string - the full question text",
          "difficulty": "easy" | "moderate" | "hard",
          "marks": number
        }
      ]
    }
  ],
  "answerKey": [
    {
      "questionId": "A1",
      "answer": "string - concise answer or key points"
    }
  ]
}

Make questions specific, educationally sound, and progressively challenging within each section.`;
}

// ── Response Parser ───────────────────────────────────────────────
function parseAIResponse(rawText: string): GeneratedPaper {
  // Strip any accidental markdown fences
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI returned invalid JSON. Raw: ${cleaned.slice(0, 200)}`);
  }

  const data = parsed as Record<string, unknown>;

  // Validate top-level shape
  if (!Array.isArray(data.sections)) throw new Error('Missing sections array in AI response');

  // Validate and normalise each section
  const sections: GeneratedSection[] = (data.sections as Record<string, unknown>[]).map(
    (sec, idx) => {
      if (!sec.title || !Array.isArray(sec.questions)) {
        throw new Error(`Section ${idx} is malformed`);
      }

      const questions: GeneratedQuestion[] = (sec.questions as Record<string, unknown>[]).map(
        (q, qIdx) => {
          const difficulty = q.difficulty as string;
          if (!['easy', 'moderate', 'hard'].includes(difficulty)) {
            throw new Error(`Question ${qIdx} has invalid difficulty: ${difficulty}`);
          }
          return {
            id: String(q.id || `${idx}${qIdx}`),
            text: String(q.text || ''),
            difficulty: difficulty as 'easy' | 'moderate' | 'hard',
            marks: Number(q.marks || sec.marksPerQuestion || 1),
            type: String(sec.questionType || ''),
          };
        }
      );

      return {
        title: String(sec.title),
        instruction: String(sec.instruction || 'Attempt all questions.'),
        questionType: String(sec.questionType || ''),
        marksPerQuestion: Number(sec.marksPerQuestion || 1),
        questions,
      };
    }
  );

  const answerKey = Array.isArray(data.answerKey)
    ? (data.answerKey as Record<string, unknown>[]).map((a) => ({
        questionId: String(a.questionId || ''),
        answer: String(a.answer || ''),
      }))
    : [];

  return {
    title: String(data.title || 'Question Paper'),
    subject: String(data.subject || 'General'),
    totalMarks: Number(data.totalMarks || 0),
    totalQuestions: Number(data.totalQuestions || 0),
    timeAllowed: String(data.timeAllowed || '2 hours'),
    sections,
    answerKey,
  };
}

// ── Main Generation Function ──────────────────────────────────────
export async function generateQuestionPaper(
  title: string,
  questionTypes: QuestionTypeConfig[],
  additionalInstructions: string,
  fileContent?: string,
  onProgress?: (percent: number, message: string) => void
): Promise<GeneratedPaper> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY environment variable. Set GROQ_API_KEY in .env to use Groq AI.');
  }

  const prompt = buildPrompt(title, questionTypes, additionalInstructions, fileContent);

  onProgress?.(10, 'Sending request to Groq AI...');
  console.log('🧠 Using Groq provider with model:', process.env.GROQ_MODEL || 'llama-3.3-70b-versatile');
  console.log('🔑 GROQ_API_KEY present:', Boolean(process.env.GROQ_API_KEY));

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const completion = await groqClient.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert teacher creating an examination paper. Follow the user instructions exactly and return only valid JSON with no markdown or backticks.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 4096,
  });

  onProgress?.(70, 'Parsing AI response...');

  const rawText = completion.choices?.[0]?.message?.content;
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Invalid response from Groq AI.');
  }

  const paper = parseAIResponse(rawText);

  onProgress?.(90, 'Validating output...');

  return paper;
}
