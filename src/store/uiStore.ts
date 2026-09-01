import { create } from 'zustand';
import { PlacedEntry, Conflict } from '@/lib/algorithms/types';

interface PendingMove {
  entryId: string;
  newDay: number;
  newPeriod: number;
}

interface UIState {
  draggingEntry: PlacedEntry | null;
  conflictDialogOpen: boolean;
  pendingMove: PendingMove | null;
  pendingConflicts: Conflict[];
  
  setDragging: (entry: PlacedEntry | null) => void;
  openConflictDialog: (conflicts: Conflict[], move: PendingMove) => void;
  closeConflictDialog: () => void;
  setPendingMove: (move: PendingMove | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  draggingEntry: null,
  conflictDialogOpen: false,
  pendingMove: null,
  pendingConflicts: [],
  
  setDragging: (entry) => set({ draggingEntry: entry }),
  openConflictDialog: (conflicts, move) => set({ conflictDialogOpen: true, pendingConflicts: conflicts, pendingMove: move }),
  closeConflictDialog: () => set({ conflictDialogOpen: false, pendingConflicts: [], pendingMove: null }),
  setPendingMove: (move) => set({ pendingMove: move })
}));
