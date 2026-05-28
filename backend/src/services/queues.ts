import { Queue } from 'bullmq';
import { getBullRedis } from '../utils/redis';

// Queue for AI question paper generation
export const generationQueue = new Queue('paper-generation', {
  connection: getBullRedis(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

// Queue for PDF export jobs
export const pdfQueue = new Queue('pdf-export', {
  connection: getBullRedis(),
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { count: 50 },
  },
});

console.log('✅ BullMQ queues initialized');