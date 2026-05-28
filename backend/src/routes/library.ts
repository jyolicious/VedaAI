import express from 'express';
import multer from 'multer';
import { LibraryItem } from '../models/library';
import { User } from '../models/user';

const router = express.Router();
const upload = multer();

// simple auth middleware: expects Authorization: Bearer <token>
import jwt from 'jsonwebtoken';
const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const a = req.headers.authorization;
  if (!a) return res.status(401).json({ message: 'Unauthorized' });
  const [, token] = a.split(' ');
  try {
    const payload = jwt.verify(token, jwtSecret) as any;
    (req as any).userId = payload.sub;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

router.get('/', auth, async (req, res) => {
  const userId = (req as any).userId;
  const items = await LibraryItem.find({ ownerId: userId }).sort({ createdAt: -1 });
  res.json(items);
});

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  const userId = (req as any).userId;
  const name = req.body.name || (req.file && req.file.originalname) || 'untitled';
  const content = req.file ? req.file.buffer.toString('base64') : req.body.content;

  const item = await LibraryItem.create({ ownerId: userId, name, filename: req.file?.originalname, content });
  res.json(item);
});

export default router;
