import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { Assignment, GeneratedPaperModel } from '../models';
import { generationQueue } from '../services/queues';
import { cacheGet } from '../utils/redis';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Validation Schema ─────────────────────────────────────────────
const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypes: z
    .array(
      z.object({
        type: z.string().min(1),
        numQuestions: z.number().int().min(1, 'Must have at least 1 question'),
        marksPerQuestion: z.number().int().min(1, 'Marks must be at least 1'),
      })
    )
    .min(1, 'At least one question type required'),
  additionalInstructions: z.string().optional(),
});

// ── GET /api/assignments ──────────────────────────────────────────
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .select('-fileContent')
      .lean();
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/assignments ─────────────────────────────────────────
router.post(
  '/',
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse body (comes as JSON string in form-data or plain JSON)
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (body.questionTypes && typeof body.questionTypes === 'string') {
        body.questionTypes = JSON.parse(body.questionTypes);
      }
      // Parse numbers properly
      if (Array.isArray(body.questionTypes)) {
        body.questionTypes = body.questionTypes.map(
          (qt: Record<string, unknown>) => ({
            ...qt,
            numQuestions: Number(qt.numQuestions),
            marksPerQuestion: Number(qt.marksPerQuestion),
          })
        );
      }

      const validated = createAssignmentSchema.parse(body);

      // Extract text from uploaded file if present
      let fileContent: string | undefined;
      if (req.file) {
        fileContent = req.file.buffer.toString('utf-8');
      }

      // Create assignment in DB
      const assignment = await Assignment.create({
        ...validated,
        dueDate: new Date(validated.dueDate),
        fileContent,
        status: 'pending',
      });

      // Enqueue AI generation job
      const job = await generationQueue.add('generate-paper', {
        assignmentId: assignment._id.toString(),
        title: assignment.title,
        questionTypes: assignment.questionTypes,
        additionalInstructions: assignment.additionalInstructions || '',
        fileContent,
      });

      // Update assignment with job ID
      await Assignment.findByIdAndUpdate(assignment._id, { jobId: job.id });

      res.status(201).json({
        success: true,
        data: {
          assignment: { ...assignment.toObject(), jobId: job.id },
          jobId: job.id,
          message: 'Assignment created, AI generation started',
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, errors: err.errors });
        return;
      }
      next(err);
    }
  }
);

// ── GET /api/assignments/:id ──────────────────────────────────────
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/assignments/:id/paper ───────────────────────────────
router.get('/:id/paper', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignmentId = req.params.id;

    // Try Redis cache first
    const cached = await cacheGet(`paper:${assignmentId}`);
    if (cached) {
      res.json({ success: true, data: cached, source: 'cache' });
      return;
    }

    // Fall back to MongoDB
    const paperDoc = await GeneratedPaperModel.findOne({ assignmentId }).lean();
    if (!paperDoc) {
      res.status(404).json({ success: false, message: 'Paper not yet generated' });
      return;
    }

    res.json({ success: true, data: paperDoc.paper, source: 'db' });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/assignments/:id ───────────────────────────────────
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }
    await GeneratedPaperModel.deleteOne({ assignmentId: req.params.id });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/assignments/:id/regenerate ─────────────────────────
router.post('/:id/regenerate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' });
      return;
    }

    // Delete old paper
    await GeneratedPaperModel.deleteOne({ assignmentId: req.params.id });

    // Reset status and re-queue
    await Assignment.findByIdAndUpdate(req.params.id, { status: 'pending', paperId: undefined });

    const job = await generationQueue.add('generate-paper', {
      assignmentId: assignment._id.toString(),
      title: assignment.title,
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions || '',
      fileContent: assignment.fileContent,
    });

    res.json({ success: true, data: { jobId: job.id, message: 'Regeneration started' } });
  } catch (err) {
    next(err);
  }
});

export default router;