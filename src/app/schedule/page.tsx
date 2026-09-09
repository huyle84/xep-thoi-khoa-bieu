'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import TimetableToolbar from '@/components/timetable/TimetableToolbar';
import TimetableGrid from '@/components/timetable/TimetableGrid';
import ConflictPanel from '@/components/timetable/ConflictPanel';
import ConflictAlert from '@/components/timetable/ConflictAlert';
import { useScheduleStore } from '@/store/scheduleStore';
import { useUIStore } from '@/store/uiStore';
import { SoftViolation } from '@/lib/algorithms/types';

export default function SchedulePage() {
  const {
    entries, viewMode, selectedId, lastConflicts,
    fetchEntries, moveEntry, swapEntries, removeEntry, undo, redo
  } = useScheduleStore();

  const {
    conflictDialogOpen, pendingConflicts, pendingMove,
    openConflictDialog, closeConflictDialog
  } = useUIStore();

  const [softViolations, setSoftViolations] = useState<SoftViolation[]>([]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const entryId = active.id as string;
    const overData = over.data.current as { day: number; period: number } | undefined;
    if (!overData) return;

    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    if (entry.dayOfWeek === overData.day && entry.period === overData.period) return;

    const result = await moveEntry(entryId, overData.day, overData.period);
    if (!result.success && result.conflicts) {
      openConflictDialog(result.conflicts, { entryId, newDay: overData.day, newPeriod: overData.period });
    }
  }, [entries, moveEntry, openConflictDialog]);

  const handleSwap = useCallback(async () => {
    if (!pendingMove) return;
    const existingEntry = entries.find(
      e => e.dayOfWeek === pendingMove.newDay && e.period === pendingMove.newPeriod
    );
    if (existingEntry) {
      const res = await swapEntries(pendingMove.entryId, existingEntry.id!);
      if (res.success) closeConflictDialog();
      else alert('Không thể đổi chéo do vẫn còn xung đột.');
    }
  }, [pendingMove, entries, swapEntries, closeConflictDialog]);

  const handleUndo = useCallback(() => {
    closeConflictDialog();
    undo();
  }, [closeConflictDialog, undo]);

  const handleDelete = useCallback((id: string) => {
    removeEntry(id);
  }, [removeEntry]);

  const conflictEntryIds = lastConflicts.flatMap(c => {
    const ids: string[] = [];
    if (c.entryA?.id) ids.push(c.entryA.id);
    if (c.entryB?.id) ids.push(c.entryB.id);
    return ids;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <TimetableToolbar />

      <div className="flex flex-1 p-4 gap-4 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <DndContext
            sensors={sensors}
            modifiers={[restrictToWindowEdges]}
            onDragEnd={handleDragEnd}
          >
            <TimetableGrid
              entries={entries}
              viewMode={viewMode}
              selectedId={selectedId}
              conflicts={conflictEntryIds}
              onDelete={handleDelete}
            />
          </DndContext>
        </div>

        <div className="w-72 flex-shrink-0 overflow-auto">
          <ConflictPanel conflicts={lastConflicts} softViolations={softViolations} />
        </div>
      </div>

      <ConflictAlert
        open={conflictDialogOpen}
        conflicts={pendingConflicts}
        onSwap={handleSwap}
        onUndo={handleUndo}
        onClose={closeConflictDialog}
      />
    </div>
  );
}
