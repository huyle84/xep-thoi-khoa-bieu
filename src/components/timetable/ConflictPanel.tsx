'use client';
import React, { useState } from 'react';
import { Conflict, SoftViolation } from '@/lib/algorithms/types';
import { ShieldAlert, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface ConflictPanelProps {
  conflicts: Conflict[];
  softViolations: SoftViolation[];
}

export default function ConflictPanel({ conflicts, softViolations }: ConflictPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const totalIssues = conflicts.length + softViolations.length;

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm w-full max-h-[calc(100vh-120px)] overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-800">Báo cáo kiểm tra</h2>
          {totalIssues > 0 ? (
            <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">
              {totalIssues}
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">
              OK
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </div>

      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {totalIssues === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-green-600">
              <CheckCircle2 className="w-12 h-12 mb-2 opacity-50" />
              <p className="font-medium">Không có xung đột</p>
              <p className="text-sm text-green-700/70 mt-1">Lịch học hoàn toàn hợp lệ</p>
            </div>
          ) : (
            <>
              {conflicts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-red-800">
                    <ShieldAlert className="w-4 h-4" />
                    Xung đột nghiêm trọng (Lỗi)
                  </h3>
                  {conflicts.map((c, i) => (
                    <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-xs font-semibold text-red-800 uppercase mb-1">
                        {c.type === 'TEACHER_CONFLICT' ? 'Giáo viên' : c.type === 'CLASS_CONFLICT' ? 'Lớp học' : 'Phòng học'}
                      </p>
                      <p className="text-sm text-red-700">{c.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {softViolations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    Cảnh báo tối ưu
                  </h3>
                  {softViolations.map((v, i) => (
                    <div key={i} className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-semibold text-yellow-800 uppercase">{v.type}</p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded font-bold">
                          Mức {v.severity}
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">{v.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
