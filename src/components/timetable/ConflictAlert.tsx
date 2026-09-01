'use client';
import React from 'react';
import { Conflict } from '@/lib/algorithms/types';
import { AlertTriangle, RefreshCw, Undo2, X } from 'lucide-react';

interface ConflictAlertProps {
  open: boolean;
  conflicts: Conflict[];
  onSwap: () => void;
  onUndo: () => void;
  onClose: () => void;
}

export default function ConflictAlert({ open, conflicts, onSwap, onUndo, onClose }: ConflictAlertProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-red-50 px-4 py-3 flex items-center justify-between border-b border-red-100">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-lg">⚠️ Phát hiện xung đột lịch!</h3>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <p className="text-gray-600 text-sm mb-4">Hành động di chuyển vừa rồi gây ra các xung đột nghiêm trọng:</p>
          <ul className="space-y-3">
            {conflicts.map((conflict, idx) => (
              <li key={idx} className="flex gap-3 bg-red-50/50 p-3 rounded-lg border border-red-100">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-red-800 text-sm">{conflict.type === 'TEACHER_CONFLICT' ? 'Trùng lịch giáo viên' : conflict.type === 'CLASS_CONFLICT' ? 'Trùng lịch lớp học' : 'Xung đột phòng'}</span>
                  <p className="text-red-600 text-xs mt-1">{conflict.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
          <button 
            onClick={onUndo}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
          >
            <Undo2 className="w-4 h-4" />
            Hoàn tác (Undo)
          </button>
          <button 
            onClick={onSwap}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Đổi chéo tiết
          </button>
        </div>
      </div>
    </div>
  );
}
