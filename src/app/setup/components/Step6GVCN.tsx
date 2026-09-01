'use client';

import React, { useState, useEffect } from 'react';

interface Class { id: string; name: string; gradeBlockId: string; }
interface Teacher { id: string; name: string; code: string; }
interface Homeroom { id: string; classId: string; teacherId: string; }

export default function Step6GVCN() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [homerooms, setHomerooms] = useState<Homeroom[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/classes').then(r=>r.json()),
      fetch('/api/teachers').then(r=>r.json()),
      fetch('/api/homerooms').then(r=>r.json().catch(()=>[]))
    ]).then(([c, t, h]) => {
      setClasses(c);
      setTeachers(t);
      if (Array.isArray(h)) setHomerooms(h);
    });
  }, []);

  const handleChange = async (classId: string, teacherId: string) => {
    try {
      const existing = homerooms.find(h => h.classId === classId);
      if (existing) {
        if (!teacherId) {
          await fetch(`/api/homerooms/${existing.id}`, { method: 'DELETE' });
          setHomerooms(homerooms.filter(h => h.id !== existing.id));
        } else {
          const res = await fetch(`/api/homerooms/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId })
          });
          const data = await res.json();
          setHomerooms(homerooms.map(h => h.id === existing.id ? data : h));
        }
      } else if (teacherId) {
        const res = await fetch('/api/homerooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classId, teacherId, academicYear: '2024-2025' })
        });
        const data = await res.json();
        setHomerooms([...homerooms, data]);
      }
    } catch(e) {}
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🎓 Bước 6: Phân công Giáo viên Chủ nhiệm
        </h2>
        <p className="text-gray-600 mt-2">Chọn giáo viên chủ nhiệm cho từng lớp.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(cls => {
          const homeroom = homerooms.find(h => h.classId === cls.id);
          return (
            <div key={cls.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex items-center justify-between">
              <span className="font-bold text-lg text-gray-800 w-20">{cls.name}</span>
              <select
                value={homeroom?.teacherId || ''}
                onChange={(e) => handleChange(cls.id, e.target.value)}
                className="flex-1 ml-4 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
              >
                <option value="">-- Chưa phân công --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  );
}
