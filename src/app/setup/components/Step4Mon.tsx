'use client';

import React, { useState, useEffect } from 'react';

interface Subject {
  id: string;
  code: string;
  name: string;
  isCore: boolean;
  color: string;
}

export default function Step4Mon() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSubject, setNewSubject] = useState({ code: '', name: '', isCore: true, color: '#e5e7eb' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (e) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubject)
      });
      setNewSubject({ code: '', name: '', isCore: true, color: '#e5e7eb' });
      fetchSubjects();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      fetchSubjects();
    } catch (e) {}
  };

  const createDefaultSubjects = async () => {
    setLoading(true);
    const defaults = [
      { code: 'TOAN', name: 'Toán', isCore: true, color: '#fca5a5' },
      { code: 'VAN', name: 'Ngữ Văn', isCore: true, color: '#93c5fd' },
      { code: 'ANH', name: 'Tiếng Anh', isCore: true, color: '#fcd34d' },
      { code: 'LY', name: 'Vật Lý', isCore: false, color: '#86efac' },
      { code: 'HOA', name: 'Hóa Học', isCore: false, color: '#c4b5fd' },
      { code: 'SINH', name: 'Sinh Học', isCore: false, color: '#bef264' },
      { code: 'SU', name: 'Lịch Sử', isCore: false, color: '#fdba74' },
      { code: 'DIA', name: 'Địa Lý', isCore: false, color: '#a7f3d0' },
      { code: 'GDCD', name: 'GDCD', isCore: false, color: '#f9a8d4' },
      { code: 'TD', name: 'Thể Dục', isCore: false, color: '#d1d5db' },
      { code: 'TIN', name: 'Tin Học', isCore: false, color: '#9ca3af' },
    ];
    try {
      for (const d of defaults) {
        await fetch('/api/subjects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(d)
        });
      }
      await fetchSubjects();
    } catch(e) {}
    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📖 Bước 4: Thiết lập Môn học
          </h2>
          <p className="text-gray-600 mt-2">Quản lý danh sách các môn học được giảng dạy.</p>
        </div>
        {subjects.length === 0 && (
          <button
            onClick={createDefaultSubjects}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-medium"
          >
            {loading ? 'Đang tạo...' : 'Thêm môn phổ thông'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Thêm Môn học</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mã môn</label>
              <input type="text" required value={newSubject.code} onChange={e=>setNewSubject({...newSubject, code: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border shadow-sm" placeholder="VD: TOAN" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên môn</label>
              <input type="text" required value={newSubject.name} onChange={e=>setNewSubject({...newSubject, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border shadow-sm" placeholder="VD: Toán học" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="isCore" checked={newSubject.isCore} onChange={e=>setNewSubject({...newSubject, isCore: e.target.checked})} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
              <label htmlFor="isCore" className="ml-2 block text-sm text-gray-900">Môn chính (Cốt lõi)</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Màu sắc trên TKB</label>
              <input type="color" value={newSubject.color} onChange={e=>setNewSubject({...newSubject, color: e.target.value})} className="mt-1 block w-full h-10 rounded-md border-gray-300 p-1 border shadow-sm" />
            </div>
            <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Thêm Môn</button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên môn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Màu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.map(subject => (
                  <tr key={subject.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subject.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.isCore ? 'Môn chính' : 'Môn phụ'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="w-6 h-6 rounded border border-gray-200" style={{backgroundColor: subject.color}}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={()=>handleDelete(subject.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Chưa có môn học.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
