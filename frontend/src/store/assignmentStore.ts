import { create } from 'zustand';
import type { Assignment, GeneratedPaper, JobProgress } from '@/types';

interface AssignmentStore {
  // List of all assignments
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  removeAssignment: (id: string) => void;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void;

  // Active generation job
  activeJobProgress: JobProgress | null;
  setJobProgress: (progress: JobProgress | null) => void;

  // Generated paper for the currently viewed assignment
  activePaper: GeneratedPaper | null;
  setActivePaper: (paper: GeneratedPaper | null) => void;

  // WebSocket connection status
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) =>
    set((state) => ({ assignments: [assignment, ...state.assignments] })),
  removeAssignment: (id) =>
    set((state) => ({ assignments: state.assignments.filter((a) => a._id !== id) })),
  updateAssignmentStatus: (id, status) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a._id === id ? { ...a, status } : a)),
    })),

  activeJobProgress: null,
  setJobProgress: (progress) => set({ activeJobProgress: progress }),

  activePaper: null,
  setActivePaper: (paper) => set({ activePaper: paper }),

  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));