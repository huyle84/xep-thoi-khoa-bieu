import { create } from 'zustand';
import { PlacedEntry, Conflict, SoftViolation } from '@/lib/algorithms/types';

interface ScheduleState {
  entries: PlacedEntry[];
  viewMode: 'class' | 'teacher';
  selectedId: string | null;
  weekNumber: number;
  isGenerating: boolean;
  lastConflicts: Conflict[];
  undoStack: PlacedEntry[][];
  redoStack: PlacedEntry[][];
  
  setEntries: (entries: PlacedEntry[]) => void;
  addEntry: (entry: PlacedEntry) => void;
  updateEntry: (entry: PlacedEntry) => void;
  removeEntry: (id: string) => Promise<void>;
  setViewMode: (mode: 'class' | 'teacher') => void;
  setSelectedId: (id: string | null) => void;
  setWeekNumber: (week: number) => void;
  setGenerating: (isGenerating: boolean) => void;
  
  pushToUndoStack: (entries: PlacedEntry[]) => void;
  undo: () => void;
  redo: () => void;
  
  setConflicts: (conflicts: Conflict[]) => void;
  
  fetchEntries: (classId?: string, teacherId?: string, week?: number) => Promise<void>;
  moveEntry: (entryId: string, newDay: number, newPeriod: number) => Promise<{ success: boolean; conflicts?: Conflict[] }>;
  swapEntries: (entryAId: string, entryBId: string) => Promise<{ success: boolean; conflicts?: Conflict[] }>;
  generateSchedule: (options: { weekNumber: number, mode?: string, classId?: string, subjectId?: string, session?: string, clearExisting?: boolean }) => Promise<{ success: boolean; message?: string; entryCount?: number }>;
  validateSchedule: () => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  entries: [],
  viewMode: 'class',
  selectedId: null,
  weekNumber: 1,
  isGenerating: false,
  lastConflicts: [],
  undoStack: [],
  redoStack: [],

  setEntries: (entries) => set({ entries }),
  addEntry: (entry) => set((state) => {
    state.pushToUndoStack(state.entries);
    return { entries: [...state.entries, entry] };
  }),
  updateEntry: (updatedEntry) => set((state) => {
    state.pushToUndoStack(state.entries);
    return {
      entries: state.entries.map((e) => e.id === updatedEntry.id ? updatedEntry : e)
    };
  }),
  removeEntry: async (id) => {
    try {
      await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete entry', e);
    }
    set((state) => {
      state.pushToUndoStack(state.entries);
      return { entries: state.entries.filter((e) => e.id !== id) };
    });
  },
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedId: (selectedId) => set({ selectedId }),
  setWeekNumber: (weekNumber) => set({ weekNumber }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  
  pushToUndoStack: (entries) => set((state) => {
    const newStack = [...state.undoStack, entries].slice(-20);
    return { undoStack: newStack, redoStack: [] };
  }),
  undo: () => set((state) => {
    if (state.undoStack.length === 0) return state;
    const prev = state.undoStack[state.undoStack.length - 1];
    const newUndo = state.undoStack.slice(0, -1);
    return { 
      entries: prev, 
      undoStack: newUndo, 
      redoStack: [...state.redoStack, state.entries] 
    };
  }),
  redo: () => set((state) => {
    if (state.redoStack.length === 0) return state;
    const next = state.redoStack[state.redoStack.length - 1];
    const newRedo = state.redoStack.slice(0, -1);
    return {
      entries: next,
      undoStack: [...state.undoStack, state.entries],
      redoStack: newRedo
    };
  }),
  
  setConflicts: (lastConflicts) => set({ lastConflicts }),

  fetchEntries: async (classId, teacherId, week) => {
    try {
      const url = new URL('/api/schedule', window.location.origin);
      if (classId) url.searchParams.append('classId', classId);
      if (teacherId) url.searchParams.append('teacherId', teacherId);
      if (week) url.searchParams.append('week', week.toString());
      
      const res = await fetch(url.toString());
      if (res.ok) {
        const raw = await res.json();
        // API returns array of DB records OR { entries: [...] }
        const rawEntries = Array.isArray(raw) ? raw : (raw.entries || []);
        // Map DB format -> PlacedEntry format
        const entries: PlacedEntry[] = rawEntries.map((e: any) => ({
          id: e.id,
          assignmentId: e.assignmentId || e.id,
          classId: e.assignment?.classId || e.classId,
          className: e.assignment?.class?.name || e.className || '',
          subjectId: e.assignment?.subjectId || e.subjectId,
          subjectName: e.assignment?.subject?.name || e.subjectName || '',
          teacherId: e.assignment?.teacherId || e.teacherId,
          teacherName: e.assignment?.teacher?.name || e.teacherName || '',
          teacher: e.assignment?.teacher ? {
            shortName: e.assignment.teacher.shortName || '',
          } : undefined,
          color: e.assignment?.subject?.color || e.color,
          roomId: e.roomId,
          roomName: e.room?.name,
          dayOfWeek: e.dayOfWeek,
          period: e.period,
          isLocked: e.isLocked || false,
        }));
        set({ entries });
      }
    } catch (e) {
      console.error(e);
    }
  },

  moveEntry: async (entryId, newDay, newPeriod) => {
    try {
      const res = await fetch(`/api/schedule/${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: newDay, period: newPeriod })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.conflicts) {
          return { success: false, conflicts: data.conflicts };
        }
        return { success: false };
      }
      
      set((state) => {
        state.pushToUndoStack(state.entries);
        return {
          entries: state.entries.map(e => e.id === entryId ? { ...e, dayOfWeek: newDay, period: newPeriod } : e)
        };
      });
      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  },

  swapEntries: async (entryAId, entryBId) => {
    try {
      const res = await fetch(`/api/schedule/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryAId, entryBId })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, conflicts: data.conflicts };
      }
      
      const entryA = get().entries.find(e => e.id === entryAId);
      const entryB = get().entries.find(e => e.id === entryBId);
      
      if(entryA && entryB) {
        const dayA = entryA.dayOfWeek;
        const perA = entryA.period;
        const dayB = entryB.dayOfWeek;
        const perB = entryB.period;
        
        get().pushToUndoStack(get().entries);
        set({
          entries: get().entries.map(e => {
            if (e.id === entryAId) return { ...e, dayOfWeek: dayB, period: perB };
            if (e.id === entryBId) return { ...e, dayOfWeek: dayA, period: perA };
            return e;
          })
        });
      }
      
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  },

  generateSchedule: async (options) => {
    set({ isGenerating: true });
    try {
      const res = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      const data = await res.json();
      if (res.ok) {
        await get().fetchEntries(undefined, undefined, options.weekNumber);
        return { success: true, message: data.message, entryCount: data.entries?.length || 0 };
      }
      return { success: false, message: data.error || 'Có lỗi xảy ra' };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Lỗi kết nối' };
    } finally {
      set({ isGenerating: false });
    }
  },

  validateSchedule: async () => {
    try {
      const res = await fetch('/api/schedule/validate');
      if (res.ok) {
        const data = await res.json();
        set({ lastConflicts: data.conflicts || [] });
      }
    } catch (e) {
      console.error(e);
    }
  }
}));
