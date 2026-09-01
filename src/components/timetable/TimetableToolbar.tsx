'use client';
import React from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import { exportToExcel, exportToPDF } from '@/lib/utils/export';
import { 
  Users, UserCircle, Play, ShieldAlert, Trash2, 
  Download, FileSpreadsheet, Undo, Redo, Loader2
} from 'lucide-react';

export default function TimetableToolbar() {
  const { 
    viewMode, setViewMode, weekNumber, setWeekNumber,
    isGenerating, generateSchedule, validateSchedule,
    undo, redo, entries, lastConflicts, setEntries
  } = useScheduleStore();

  const handleExportExcel = () => {
    exportToExcel('school', entries, [], []);
  };

  const handleExportPDF = () => {
    exportToPDF('school', entries, 'TKB Toàn Trường');
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('class')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'class' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Users className="w-4 h-4" />
            Theo Lớp
          </button>
          <button 
            onClick={() => setViewMode('teacher')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'teacher' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <UserCircle className="w-4 h-4" />
            Theo Giáo viên
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Tuần:</label>
          <select 
            value={weekNumber}
            onChange={(e) => setWeekNumber(Number(e.target.value))}
            className="border-gray-300 rounded-md text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 bg-white border"
          >
            {[...Array(20)].map((_, i) => (
              <option key={i+1} value={i+1}>Tuần {i+1}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex border-r border-gray-300 pr-2 mr-2">
          <button onClick={undo} title="Hoàn tác (Ctrl+Z)" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
            <Undo className="w-5 h-5" />
          </button>
          <button onClick={redo} title="Làm lại (Ctrl+Y)" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
            <Redo className="w-5 h-5" />
          </button>
        </div>

        <button 
          onClick={() => validateSchedule()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors relative"
        >
          <ShieldAlert className="w-4 h-4" />
          Kiểm tra xung đột
          {lastConflicts.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {lastConflicts.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setEntries([])}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Xóa TKB
        </button>

        <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border-r border-gray-300 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Xuất Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-red-500" />
            Xuất PDF
          </button>
        </div>

        <button 
          onClick={() => generateSchedule(weekNumber)}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm ml-2"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          Xếp TKB tự động
        </button>
      </div>
    </div>
  );
}
