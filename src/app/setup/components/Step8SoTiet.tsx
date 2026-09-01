'use client';

import React, { useState, useEffect } from 'react';

interface Assignment { id: string; classId: string; subjectId: string; teacherId: string; periodsPerWeek: number; }
interface Subject { id: string; name: string; code: string; }
interface Class { id: string; name: string; }

export default function Step8SoTiet() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/teaching-assignments').then(r=>r.json().catch(()=>[])),
      fetch('/api/subjects').then(r=>r.json()),
      fetch('/api/classes').then(r=>r.json())
    ]).then(([a, s, c]) => {
      if(Array.isArray(a)) setAssignments(a);
      setSubjects(s); setClasses(c);
    });
  }, []);

  const handleChange = async (id: string, periods: number) => {
    if (periods < 0) return;
    setAssignments(assignments.map(a => a.id === id ? { ...a, periodsPerWeek: periods } : a));
    try {
      await fetch(`/api/teaching-assignments/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ periodsPerWeek: periods })
      });
    } catch(e) {}
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🔢 Bước 8: Thiết lập Số Tiết
        </h2>
        <p className="text-gray-600 mt-2">Chỉ định số tiết học mỗi tuần cho các môn đã được phân công.</p>
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
                  if (!assignment) return <td key={sub.id} className="px-2 py-2 bg-gray-50"></td>;
                  return (
                    <td key={sub.id} className="px-2 py-2 text-center">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="1" max="20"
                          value={assignment.periodsPerWeek}
                          onChange={e => handleChange(assignment.id, parseInt(e.target.value)||0)}
                          className="w-16 text-center text-sm font-bold text-indigo-600 border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-1"
                        />
                        <span className="text-xs text-gray-400 mt-1">tiết/tuần</span>
                      </div>
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
