import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { initWebSocket } from './utils/websocket';
import assignmentRoutes from './routes/assignments';

const app = express();
const server = http.createServer(app);

// ── Middleware ────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/assignments', assignmentRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Error Handler ─────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ── Bootstrap ─────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  // MongoDB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai');
  console.log('✅ MongoDB connected');

  // WebSocket (attaches to HTTP server)
  initWebSocket(server);

  // Start listening
  const PORT = Number(process.env.PORT) || 4000;
  server.listen(PORT, () => {
    console.log(`🚀 VedaAI backend running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server on ws://localhost:${PORT}/ws`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});