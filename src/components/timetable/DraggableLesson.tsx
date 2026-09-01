'use client';
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { PlacedEntry } from '@/lib/algorithms/types';

interface DraggableLessonProps {
  entry: PlacedEntry;
  children: React.ReactNode;
}

export default function DraggableLesson({ entry, children }: DraggableLessonProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.id || `temp-${entry.assignmentId}-${entry.dayOfWeek}-${entry.period}`,
    data: { entry }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`w-full h-full cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 shadow-xl' : ''}`}
    >
      {children}
    </div>
  );
}
