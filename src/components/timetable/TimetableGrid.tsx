'use client';
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { PlacedEntry } from '@/lib/algorithms/types';
import TimetableCell from './TimetableCell';
import DraggableLesson from './DraggableLesson';

interface TimetableGridProps {
  entries: PlacedEntry[];
  viewMode: 'class' | 'teacher';
  selectedId: string | null;
  conflicts?: string[];
  onDelete?: (id: string) => void;
}

const DAYS = [
  { id: 2, label: 'Thứ Hai' },
  { id: 3, label: 'Thứ Ba' },
  { id: 4, label: 'Thứ Tư' },
  { id: 5, label: 'Thứ Năm' },
  { id: 6, label: 'Thứ Sáu' },
  { id: 7, label: 'Thứ Bảy' },
];

const PERIODS = [
  { id: 1, label: 'Tiết 1', isMorning: true },
  { id: 2, label: 'Tiết 2', isMorning: true },
  { id: 3, label: 'Tiết 3', isMorning: true },
  { id: 4, label: 'Tiết 4', isMorning: true },
  { id: 5, label: 'Tiết 5', isMorning: true },
  { id: 6, label: 'Tiết 1', isMorning: false },
  { id: 7, label: 'Tiết 2', isMorning: false },
  { id: 8, label: 'Tiết 3', isMorning: false },
  { id: 9, label: 'Tiết 4', isMorning: false },
  { id: 10, label: 'Tiết 5', isMorning: false },
];

const DroppableCell = ({ day, period, children, isDivider }: { day: number, period: number, children: React.ReactNode, isDivider?: boolean }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${day}-${period}`,
    data: { day, period }
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`border border-gray-200 relative ${isDivider ? 'border-t-4 border-t-gray-400' : ''} ${isOver ? 'bg-blue-50' : ''} min-h-[100px] flex group transition-colors`}
    >
      {children}
      {!children && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-gray-300 text-2xl font-light">+</span>
        </div>
      )}
    </div>
  );
};

export default function TimetableGrid({ entries, viewMode, selectedId, conflicts = [], onDelete }: TimetableGridProps) {
  
  const getEntryAt = (day: number, period: number) => {
    return entries.find(e => e.dayOfWeek === day && e.period === period);
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="min-w-[800px]">
        {/* Header */}
        <div className="grid grid-cols-[100px_repeat(6,1fr)] bg-gray-50 border-b border-gray-200">
          <div className="p-4 font-semibold text-gray-600 border-r border-gray-200 text-center">Tiết / Ngày</div>
          {DAYS.map(day => (
            <div key={day.id} className="p-4 font-semibold text-gray-700 text-center border-r border-gray-200 last:border-r-0">
              {day.label}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-col">
          {PERIODS.map((period) => {
            const isDivider = period.id === 6;
            
            return (
              <div key={period.id} className="grid grid-cols-[100px_repeat(6,1fr)]">
                {/* Period Label */}
                <div className={`p-4 border-r border-b border-gray-200 flex flex-col items-center justify-center bg-gray-50 ${isDivider ? 'border-t-4 border-t-gray-400' : ''}`}>
                  <span className="font-semibold text-gray-700">{period.label}</span>
                  <span className="text-xs text-gray-500">{period.isMorning ? 'Sáng' : 'Chiều'}</span>
                </div>
                
                {/* Cells */}
                {DAYS.map(day => {
                  const entry = getEntryAt(day.id, period.id);
                  const hasConflict = entry && entry.id ? conflicts.includes(entry.id) : false;
                  
                  return (
                    <DroppableCell key={`${day.id}-${period.id}`} day={day.id} period={period.id} isDivider={isDivider}>
                      {entry ? (
                        <DraggableLesson entry={entry}>
                          <TimetableCell 
                            entry={entry} 
                            dayOfWeek={day.id} 
                            period={period.id} 
                            hasConflict={hasConflict}
                            viewMode={viewMode}
                            onDelete={() => {
                              if (entry.id) onDelete?.(entry.id);
                            }} 
                          />
                        </DraggableLesson>
                      ) : (
                        <TimetableCell entry={null} dayOfWeek={day.id} period={period.id} hasConflict={false} viewMode={viewMode} onDelete={() => {}} />
                      )}
                    </DroppableCell>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
