'use client';
import React from 'react';
import { PlacedEntry } from '@/lib/algorithms/types';
import { X, AlertTriangle } from 'lucide-react';

interface TimetableCellProps {
  entry: PlacedEntry | null;
  dayOfWeek: number;
  period: number;
  hasConflict: boolean;
  viewMode?: 'class' | 'teacher';
  onDelete: () => void;
}

export default function TimetableCell({ entry, hasConflict, viewMode = 'class', onDelete }: TimetableCellProps) {
  if (!entry) {
    return <div className="w-full h-full p-2 border-dashed border-2 border-transparent"></div>;
  }

  const bgColor = entry.color || '#e2e8f0';
  
  return (
    <div 
      className={`relative w-full h-full p-2 flex flex-col justify-between group transition-shadow rounded-sm ${hasConflict ? 'ring-2 ring-red-500 ring-inset' : ''}`}
      style={{ backgroundColor: `${bgColor}33`, borderLeft: `4px solid ${bgColor}` }}
    >
      <div className="flex justify-between items-start">
        <span className="font-bold text-sm text-gray-800 line-clamp-1" style={{ color: bgColor !== '#e2e8f0' ? '#1f2937' : 'inherit' }}>
          {entry.subjectName}
        </span>
        {hasConflict && (
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
        )}
      </div>
      
      <div className="flex flex-col mt-1">
        {viewMode === 'class' ? (
          <span className="text-xs text-gray-600 line-clamp-1">{entry.teacherName}</span>
        ) : (
          <span className="text-xs font-semibold text-gray-700 line-clamp-1">{entry.className}</span>
        )}
        <span className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{entry.roomName || 'Chưa xếp phòng'}</span>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-white/80 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-all"
        title="Xóa tiết"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
