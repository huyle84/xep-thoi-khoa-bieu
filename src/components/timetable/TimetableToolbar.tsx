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
          onClick={async () => {
            try {
              const res = await fetch('/api/schedule/check-nv');
              const data = await res.json();
              if (data.violations && data.violations.length > 0) {
                const msgs = data.violations.map((v: any) => 
                  `${v.className} - Thứ ${v.day} Tiết ${v.period}: ${v.teacherName}`
                ).join('\n');
                alert(`Vi phạm nguyện vọng:\n${msgs}`);
              } else {
                alert('Không có vi phạm nguyện vọng!');
              }
            } catch (e) {
              console.error(e);
              alert('Lỗi kiểm tra NV');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
        >
          Check NV
        </button>

        <AutoScheduleMenu generateSchedule={generateSchedule} isGenerating={isGenerating} weekNumber={weekNumber} />
      </div>
    </div>
  );
}

function AutoScheduleMenu({ generateSchedule, isGenerating, weekNumber }: { generateSchedule: any, isGenerating: boolean, weekNumber: number }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [subjects, setSubjects] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    if (isOpen && classes.length === 0) {
      fetch('/api/classes').then(r => r.json()).then(d => setClasses(d || []));
      fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(d || []));
    }
  }, [isOpen, classes.length]);

  return (
    <div className="relative ml-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
        Xếp TKB tự động ▼
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-xl z-50 border border-gray-200 p-2 flex flex-col gap-2">
          <button 
            onClick={() => { setIsOpen(false); generateSchedule({ weekNumber, mode: 'full' }); }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md font-medium"
          >
            Auto Toàn trường
          </button>
          
          <div className="border-t border-gray-100 my-1 pt-2">
            <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto theo Lớp</span>
            <div className="flex gap-2 mt-2 px-2">
              <select id="autoClassSelect" className="flex-1 text-sm border-gray-300 rounded p-1 border">
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button 
                onClick={() => {
                  const val = (document.getElementById('autoClassSelect') as HTMLSelectElement).value;
                  setIsOpen(false);
                  generateSchedule({ weekNumber, mode: 'class', classId: val });
                }}
                className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium"
              >
                Chạy
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 my-1 pt-2">
            <span className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto Môn+Buổi</span>
            <div className="flex flex-col gap-2 mt-2 px-2">
              <select id="autoSubjectSelect" className="w-full text-sm border-gray-300 rounded p-1 border">
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="flex gap-2">
                <select id="autoSessionSelect" className="flex-1 text-sm border-gray-300 rounded p-1 border">
                  <option value="MORNING">Sáng</option>
                  <option value="AFTERNOON">Chiều</option>
                </select>
                <button 
                  onClick={() => {
                    const subj = (document.getElementById('autoSubjectSelect') as HTMLSelectElement).value;
                    const sess = (document.getElementById('autoSessionSelect') as HTMLSelectElement).value;
                    setIsOpen(false);
                    generateSchedule({ weekNumber, mode: 'subject-session', subjectId: subj, session: sess });
                  }}
                  className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-medium"
                >
                  Chạy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
