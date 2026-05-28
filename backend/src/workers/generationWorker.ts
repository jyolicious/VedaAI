import 'dotenv/config';
import mongoose from 'mongoose';
import { Worker, Job } from 'bullmq';
import { getBullRedis, cacheSet } from '../utils/redis';
import { Assignment, GeneratedPaperModel } from '../models';
import { generateQuestionPaper } from '../services/aiService';
import { broadcastProgress, broadcastCompletion, broadcastError } from '../utils/websocket';

interface GenerationJobData {
  assignmentId: string;
  title: string;
  questionTypes: { type: string; numQuestions: number; marksPerQuestion: number }[];
  additionalInstructions: string;
  fileContent?: string;
}

async function processGenerationJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId, title, questionTypes, additionalInstructions, fileContent } = job.data;

  console.log(`🔧 Processing generation job ${job.id} for assignment ${assignmentId}`);

  // Mark as processing
  await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing', jobId: job.id });

  broadcastProgress({
    jobId: String(job.id),
    assignmentId,
    status: 'processing',
    progress: 5,
    message: 'Job picked up, starting generation...',
  });

  try {
    console.log(`🧑‍💻 Job ${job.id} using Groq provider for assignment ${assignmentId}`);
    console.log('    title:', title);
    console.log('    questionTypes:', JSON.stringify(questionTypes));
    console.log('    additionalInstructions:', additionalInstructions ? 'present' : 'none');

    const paper = await generateQuestionPaper(
      title,
      questionTypes,
      additionalInstructions,
      fileContent,
      async (percent, message) => {
        await job.updateProgress(percent);
        broadcastProgress({
          jobId: String(job.id),
          assignmentId,
          status: 'processing',
          progress: percent,
          message,
        });
      }
    );

    // Save to MongoDB
    const savedPaper = await GeneratedPaperModel.create({ assignmentId, paper });

    // Update assignment status
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'completed',
      paperId: savedPaper._id.toString(),
    });

    // Cache the paper in Redis for fast retrieval
    await cacheSet(`paper:${assignmentId}`, paper);

    // Notify all connected WebSocket clients
    broadcastCompletion(assignmentId, paper);

    console.log(`✅ Generation job ${job.id} completed for assignment ${assignmentId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Generation job ${job.id} failed:`, message);
    console.error('Error object:', error);

    await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
    broadcastError(assignmentId, message);

    throw error; // Let BullMQ handle retries
  }
}

// ── Start Worker ──────────────────────────────────────────────────
async function startWorker(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai');
  console.log('✅ Worker MongoDB connected');

  const worker = new Worker<GenerationJobData>('paper-generation', processGenerationJob, {
    connection: getBullRedis(),
    concurrency: 3, // Process up to 3 jobs simultaneously
  });

  worker.on('completed', (job) => console.log(`✅ Job ${job.id} completed`));
  worker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} failed:`, err.message));
  worker.on('progress', (job, progress) => console.log(`⏳ Job ${job.id} progress: ${progress}%`));

  console.log('🚀 Generation worker started, waiting for jobs...');
}

startWorker().catch(console.error);