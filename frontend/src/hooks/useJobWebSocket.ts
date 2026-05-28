'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import type { WSMessage } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

export function useJobWebSocket(assignmentId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();
  const { setJobProgress, setActivePaper, updateAssignmentStatus, setWsConnected } =
    useAssignmentStore();

  const connect = useCallback(() => {
    if (!assignmentId) return;

    const ws = new WebSocket(`${WS_URL}/ws?assignmentId=${assignmentId}`);
    wsRef.current = ws;

    ws.onopen = () => {
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

    ws.onclose = () => {
      setWsConnected(false);
      console.log('🔌 WS disconnected');
    };

    ws.onerror = (err) => {
      console.error('WS error:', err);
      setWsConnected(false);
    };
  }, [assignmentId, setJobProgress, setActivePaper, updateAssignmentStatus, setWsConnected, router]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return { ws: wsRef.current };
}