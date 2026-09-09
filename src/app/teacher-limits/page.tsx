'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Sun, Moon, Info } from 'lucide-react';

interface Teacher {
  id: string;
  code: string;
  name: string;
  shortName: string;
  maxPeriodsPerWeek: number;
  maxPeriodsPerMorning: number;
  maxPeriodsPerAfternoon: number;
}

export default function TeacherLimitsPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [globalMorning, setGlobalMorning] = useState(4);
  const [globalAfternoon, setGlobalAfternoon] = useState(4);

  useEffect(() => {
    fetch('/api/teachers')
      .then(r => r.json())
      .then(data => { setTeachers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateTeacher = (id: string, field: keyof Teacher, value: number) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveTeacher = async (teacher: Teacher) => {
    setSaving(teacher.id);
    try {
      const res = await fetch('/api/teachers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: teacher.id,
          maxPeriodsPerWeek: teacher.maxPeriodsPerWeek,
          maxPeriodsPerMorning: teacher.maxPeriodsPerMorning,
          maxPeriodsPerAfternoon: teacher.maxPeriodsPerAfternoon,
        }),
      });
      if (res.ok) {
        toast({ title: '✅ Đã lưu', description: `Cập nhật giới hạn cho ${teacher.name}` });
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể lưu', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  const applyGlobalLimit = async () => {
    setSaving('global');
    try {
      await Promise.all(teachers.map(t =>
        fetch('/api/teachers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: t.id,
            maxPeriodsPerMorning: globalMorning,
            maxPeriodsPerAfternoon: globalAfternoon,
          }),
        })
      ));
      setTeachers(prev => prev.map(t => ({
        ...t,
        maxPeriodsPerMorning: globalMorning,
        maxPeriodsPerAfternoon: globalAfternoon,
      })));
      toast({ title: '✅ Đã áp dụng cho tất cả giáo viên' });
    } catch {
      toast({ title: 'Lỗi', variant: 'destructive' });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <Header title="Giới hạn số tiết dạy / buổi" />

      <div className="p-6 space-y-6">
        {/* Global settings */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">Áp dụng giới hạn chung</h3>
              <p className="text-xs text-blue-700 mt-0.5">Đặt giới hạn mặc định và áp dụng cho tất cả giáo viên cùng lúc</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Buổi sáng:</span>
              <input
                type="number" min={1} max={8} value={globalMorning}
                onChange={e => setGlobalMorning(Number(e.target.value))}
                className="w-16 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-xs text-gray-500">tiết</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">Buổi chiều:</span>
              <input
                type="number" min={1} max={8} value={globalAfternoon}
                onChange={e => setGlobalAfternoon(Number(e.target.value))}
                className="w-16 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-xs text-gray-500">tiết</span>
            </div>
            <button
              onClick={applyGlobalLimit}
              disabled={saving === 'global'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving === 'global' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Áp dụng cho tất cả
            </button>
          </div>
        </div>

        {/* Teacher table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Giới hạn từng giáo viên</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Giáo viên</th>
                    <th className="px-4 py-3 text-center">Tên viết tắt</th>
                    <th className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-orange-400" /> Tối đa sáng
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Moon className="w-3.5 h-3.5 text-indigo-400" /> Tối đa chiều
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center">Tổng/tuần</th>
                    <th className="px-4 py-3 text-center">Lưu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{teacher.name}</div>
                        <div className="text-xs text-gray-400">{teacher.code}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-mono">
                          {teacher.shortName || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number" min={1} max={8}
                          value={teacher.maxPeriodsPerMorning ?? 4}
                          onChange={e => updateTeacher(teacher.id, 'maxPeriodsPerMorning', Number(e.target.value))}
                          className="w-16 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number" min={1} max={8}
                          value={teacher.maxPeriodsPerAfternoon ?? 4}
                          onChange={e => updateTeacher(teacher.id, 'maxPeriodsPerAfternoon', Number(e.target.value))}
                          className="w-16 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number" min={1} max={40}
                          value={teacher.maxPeriodsPerWeek}
                          onChange={e => updateTeacher(teacher.id, 'maxPeriodsPerWeek', Number(e.target.value))}
                          className="w-16 border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => saveTeacher(teacher)}
                          disabled={saving === teacher.id}
                          className="flex items-center gap-1 mx-auto px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
                        >
                          {saving === teacher.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Save className="w-3 h-3" />}
                          Lưu
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                        Chưa có giáo viên. Thêm giáo viên trước.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
