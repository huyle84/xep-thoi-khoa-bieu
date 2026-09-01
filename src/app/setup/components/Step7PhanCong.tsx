'use client';

import React, { useState, useEffect } from 'react';

interface Subject { id: string; name: string; code: string; }
interface Class { id: string; name: string; }
interface Teacher { id: string; name: string; }
interface Assignment { id: string; classId: string; subjectId: string; teacherId: string; periodsPerWeek: number; }

export default function Step7PhanCong() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/subjects').then(r=>r.json()),
      fetch('/api/classes').then(r=>r.json()),
      fetch('/api/teachers').then(r=>r.json()),
      fetch('/api/teaching-assignments').then(r=>r.json().catch(()=>[]))
    ]).then(([s, c, t, a]) => {
      setSubjects(s); setClasses(c); setTeachers(t); if(Array.isArray(a)) setAssignments(a);
    });
  }, []);

  const handleChange = async (classId: string, subjectId: string, teacherId: string) => {
    const existing = assignments.find(a => a.classId === classId && a.subjectId === subjectId);
    
    if (existing) {
      if (!teacherId) {
        await fetch(`/api/teaching-assignments/${existing.id}`, { method: 'DELETE' });
        setAssignments(assignments.filter(a => a.id !== existing.id));
      } else {
        const res = await fetch(`/api/teaching-assignments/${existing.id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ teacherId })
        });
        const data = await res.json();
        setAssignments(assignments.map(a => a.id === existing.id ? data : a));
      }
    } else if (teacherId) {
      const res = await fetch('/api/teaching-assignments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ classId, subjectId, teacherId, periodsPerWeek: 1 })
      });
      const data = await res.json();
      setAssignments([...assignments, data]);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📋 Bước 7: Phân công Giảng dạy
        </h2>
        <p className="text-gray-600 mt-2">Chọn giáo viên dạy từng môn cho từng lớp.</p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10 border-r">Lớp / Môn</th>
              {subjects.map(s => (
                <th key={s.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{s.code}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map(cls => (
              <tr key={cls.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-white border-r">{cls.name}</td>
                {subjects.map(sub => {
                  const assignment = assignments.find(a => a.classId === cls.id && a.subjectId === sub.id);
                  return (
                    <td key={sub.id} className={`px-2 py-2 ${assignment ? 'bg-green-50' : ''}`}>
                      <select
                        value={assignment?.teacherId || ''}
                        onChange={e => handleChange(cls.id, sub.id, e.target.value)}
                        className={`w-full text-xs rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-1 ${assignment ? 'font-medium text-green-800 bg-transparent border-none' : 'text-gray-500'}`}
                      >
                        <option value="">Chọn GV</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
