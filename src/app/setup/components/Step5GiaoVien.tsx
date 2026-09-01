'use client';

import React, { useState, useEffect } from 'react';

interface Teacher {
  id: string;
  code: string;
  name: string;
  shortName: string;
  maxPeriodsPerWeek: number;
}

export default function Step5GiaoVien() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newTeacher, setNewTeacher] = useState({ code: '', name: '', shortName: '', maxPeriodsPerWeek: 30 });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (e) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher)
      });
      setNewTeacher({ code: '', name: '', shortName: '', maxPeriodsPerWeek: 30 });
      fetchTeachers();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      fetchTeachers();
    } catch (e) {}
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          👩‍🏫 Bước 5: Danh sách Giáo viên
        </h2>
        <p className="text-gray-600 mt-2">Nhập danh sách giáo viên của trường. Bạn có thể nhập danh sách GV từ Excel sau nếu cần.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Thêm Giáo viên</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mã GV</label>
              <input type="text" required value={newTeacher.code} onChange={e=>setNewTeacher({...newTeacher, code: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border shadow-sm" placeholder="VD: GV01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên đầy đủ</label>
              <input type="text" required value={newTeacher.name} onChange={e=>setNewTeacher({...newTeacher, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border shadow-sm" placeholder="VD: Nguyễn Văn A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên viết tắt</label>
              <input type="text" value={newTeacher.shortName} onChange={e=>setNewTeacher({...newTeacher, shortName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border shadow-sm" placeholder="VD: A.NVA" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số tiết tối đa/tuần</label>
              <input type="number" required value={newTeacher.maxPeriodsPerWeek} onChange={e=>setNewTeacher({...newTeacher, maxPeriodsPerWeek: parseInt(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 p-2 border shadow-sm" />
            </div>
            <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Thêm Giáo viên</button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã GV</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên VT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiết TĐ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map(teacher => (
                  <tr key={teacher.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.shortName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.maxPeriodsPerWeek}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={()=>handleDelete(teacher.id)} className="text-red-600 hover:text-red-900">Xóa</button>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Chưa có giáo viên.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
