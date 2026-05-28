'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { WSMessage } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export function useJobWebSocket(assignmentId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const closedByUserRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const router = useRouter();
  const { setJobProgress, setActivePaper, updateAssignmentStatus, setWsConnected } =
    useAssignmentStore();

  const cleanupConnection = useCallback(() => {
    closedByUserRef.current = true;

    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    wsRef.current?.close();
    wsRef.current = null;
    setWsConnected(false);
  }, [setWsConnected]);

  const connect = useCallback(() => {
    if (!assignmentId) return;

    closedByUserRef.current = false;
    const ws = new WebSocket(`${WS_URL}/ws?assignmentId=${assignmentId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setWsConnected(true);
      console.log(`🔌 WS connected for ${assignmentId}`);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);

        if (msg.type === 'progress') {
          setJobProgress(msg.data);
          updateAssignmentStatus(msg.data.assignmentId, msg.data.status as 'processing');
        }

        if (msg.type === 'completed') {
          setJobProgress(null);
          setActivePaper(msg.data.paper);
          updateAssignmentStatus(msg.data.assignmentId, 'completed');
          toast.success('Question paper generated!');
          router.push(`/assignments/${msg.data.assignmentId}/paper`);
        }

        if (msg.type === 'error') {
          setJobProgress(null);
          updateAssignmentStatus(msg.data.assignmentId, 'failed');
          toast.error(`Generation failed: ${msg.data.message}`);
        }
      } catch (e) {
        console.error('WS message parse error:', e);
      }
    };

    ws.onclose = (event) => {
      setWsConnected(false);
      console.log(`🔌 WS disconnected (${event.code})`);

      if (!closedByUserRef.current && assignmentId) {
        const attempts = Math.min(reconnectAttemptsRef.current + 1, 5);
        reconnectAttemptsRef.current = attempts;
        const delay = Math.min(1000 * 2 ** (attempts - 1), 10000);
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${attempts})`);

        reconnectTimerRef.current = window.setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = (err) => {
      console.error('WS error:', err);
      setWsConnected(false);
    };
  }, [assignmentId, router, setActivePaper, setJobProgress, setWsConnected, updateAssignmentStatus]);

  useEffect(() => {
    if (!assignmentId) {
      cleanupConnection();
      return;
    }

    connect();
    return cleanupConnection;
  }, [assignmentId, cleanupConnection, connect]);

  return { ws: wsRef.current };
}
