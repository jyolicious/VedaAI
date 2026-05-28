import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import type { JobProgress } from '../types';

// Map of assignmentId → Set of connected WebSocket clients
const clients = new Map<string, Set<WebSocket>>();

export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // Client connects with ?assignmentId=xxx to subscribe to a specific job
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
  const subs = clients.get(progress.assignmentId);
  if (!subs || subs.size === 0) return;

  const payload = JSON.stringify({ type: 'progress', data: progress });
  subs.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

// Broadcast completion with the full generated paper
export function broadcastCompletion(assignmentId: string, paper: unknown): void {
  const subs = clients.get(assignmentId);
  if (!subs || subs.size === 0) return;

  const payload = JSON.stringify({ type: 'completed', data: { assignmentId, paper } });
  subs.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

// Broadcast failure
export function broadcastError(assignmentId: string, message: string): void {
  const subs = clients.get(assignmentId);
  if (!subs || subs.size === 0) return;

  const payload = JSON.stringify({ type: 'error', data: { assignmentId, message } });
  subs.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}