'use client';

import React, { useState, useEffect } from 'react';

interface GradeBlock {
  id: string;
  name: string;
  gradeNum: number;
  order: number;
  color: string;
}

export default function Step1Khoi() {
  const [blocks, setBlocks] = useState<GradeBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBlock, setNewBlock] = useState({ name: '', gradeNum: 10, color: '#3b82f6' });

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const res = await fetch('/api/grade-blocks');
      if (res.ok) {
        const data = await res.json();
        setBlocks(data);
      }
    } catch (e) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/grade-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBlock, order: blocks.length + 1 })
      });
      setNewBlock({ name: '', gradeNum: 10, color: '#3b82f6' });
      fetchBlocks();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/grade-blocks/${id}`, { method: 'DELETE' });
      fetchBlocks();
    } catch (e) {}
  };

  const createDefaults = async () => {
    setLoading(true);
    const defaults = [
      { name: 'Khối 10', gradeNum: 10, order: 1, color: '#3b82f6' },
      { name: 'Khối 11', gradeNum: 11, order: 2, color: '#f59e0b' },
      { name: 'Khối 12', gradeNum: 12, order: 3, color: '#10b981' }
    ];
    for (const d of defaults) {
      await fetch('/api/grade-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      });
    }
    await fetchBlocks();
    setLoading(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📚 Bước 1: Thiết lập Khối
        </h2>
        <p className="text-gray-600 mt-2">Thêm các khối lớp trong trường. Ví dụ: Khối 10, Khối 11, Khối 12</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Thêm Khối mới</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên khối</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={newBlock.name}
                onChange={e => setNewBlock({...newBlock, name: e.target.value})}
                placeholder="VD: Khối 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số lớp (Cấp)</label>
              <input
                type="number"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                value={newBlock.gradeNum}
                onChange={e => setNewBlock({...newBlock, gradeNum: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
              <input
                type="color"
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-1 border"
                value={newBlock.color}
                onChange={e => setNewBlock({...newBlock, color: e.target.value})}
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Thêm Khối
            </button>
          </form>

          {blocks.length === 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={createDefaults}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Đang tạo...' : 'Tạo mặc định (Khối 10,11,12)'}
              </button>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">Danh sách Khối ({blocks.length})</h3>
          <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khối</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blocks.map((block) => (
                  <tr key={block.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{block.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: block.color }}></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button onClick={() => handleDelete(block.id)} className="text-red-600 hover:text-red-900 font-medium">Xóa</button>
                    </td>
                  </tr>
                ))}
                {blocks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">Chưa có khối nào. Vui lòng thêm khối.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
