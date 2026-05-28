import Redis from 'ioredis';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import type { JobProgress } from '../types';

const WS_CHANNEL = 'vedaai:ws-events';

const publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function publishEvent(event: object): void {
  publisher
    .publish(WS_CHANNEL, JSON.stringify(event))
    .catch((err) => console.error('❌ WS publish error:', err));
}

// Map of assignmentId → Set of connected WebSocket clients
const clients = new Map<string, Set<WebSocket>>();

export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  subscriber.on('error', (err) => console.error('❌ Redis subscriber error:', err));
  subscriber.subscribe(WS_CHANNEL).then(() => {
    console.log(`✅ Subscribed to Redis channel ${WS_CHANNEL}`);
  });

  subscriber.on('message', (_channel, raw) => {
    try {
      const message = JSON.parse(raw) as { type: string; data: any };
      const assignmentId = message.data?.assignmentId;
      if (!assignmentId) return;

      const subs = clients.get(assignmentId);
      if (!subs || subs.size === 0) return;

      const payload = JSON.stringify(message);
      subs.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
    } catch (err) {
      console.error('❌ Failed to parse Redis WS event:', err);
    }
  });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://localhost`);
    const assignmentId = url.searchParams.get('assignmentId');

    if (assignmentId) {
      if (!clients.has(assignmentId)) {
        clients.set(assignmentId, new Set());
      }
      clients.get(assignmentId)!.add(ws);
      console.log(`📡 WS client connected for assignment ${assignmentId}`);

      ws.on('close', () => {
        clients.get(assignmentId)?.delete(ws);
        if (clients.get(assignmentId)?.size === 0) {
          clients.delete(assignmentId);
        }
        console.log(`📡 WS client disconnected from assignment ${assignmentId}`);
      });
    }

    ws.on('error', (err) => console.error('WS error:', err.message));
  });

  console.log('✅ WebSocket server initialized at /ws');
  return wss;
}

// Broadcast a progress event to all clients watching an assignment
export function broadcastProgress(progress: JobProgress): void {
  publishEvent({ type: 'progress', data: progress });
}

// Broadcast completion with the full generated paper
export function broadcastCompletion(assignmentId: string, paper: unknown): void {
  publishEvent({ type: 'completed', data: { assignmentId, paper } });
}

// Broadcast failure
export function broadcastError(assignmentId: string, message: string): void {
  publishEvent({ type: 'error', data: { assignmentId, message } });
}
