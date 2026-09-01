'use client';

import React, { useState, useEffect } from 'react';

interface GradeBlock {
  id: string;
  name: string;
  color: string;
}

interface Class {
  id: string;
  name: string;
  gradeBlockId: string;
}

export default function Step2Lop() {
  const [blocks, setBlocks] = useState<GradeBlock[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeBlock, setActiveBlock] = useState<string>('');
  const [newClassName, setNewClassName] = useState('');
  const [quickAddNames, setQuickAddNames] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [blocksRes, classesRes] = await Promise.all([
        fetch('/api/grade-blocks'),
        fetch('/api/classes')
      ]);
      const [blocksData, classesData] = await Promise.all([
        blocksRes.json(),
        classesRes.json()
      ]);
      setBlocks(blocksData);
      setClasses(classesData);
      if (blocksData.length > 0 && !activeBlock) {
        setActiveBlock(blocksData[0].id);
      }
    } catch (e) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !activeBlock) return;
    try {
      await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName, gradeBlockId: activeBlock, grade: blocks.find(b=>b.id===activeBlock)?.name.replace('Khối ', '') })
      });
      setNewClassName('');
      fetchData();
    } catch (e) {}
  };

  const handleQuickAdd = async () => {
    if (!quickAddNames.trim() || !activeBlock) return;
    const names = quickAddNames.split(',').map(n => n.trim()).filter(n => n);
    const gradeName = blocks.find(b=>b.id===activeBlock)?.name.replace('Khối ', '') || '10';
    try {
      await Promise.all(names.map(name => 
        fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, gradeBlockId: activeBlock, grade: gradeName })
        })
      ));
      setQuickAddNames('');
      fetchData();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {}
  };

  const activeClasses = classes.filter(c => c.gradeBlockId === activeBlock);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          🏫 Bước 2: Thiết lập Lớp học
        </h2>
        <p className="text-gray-600 mt-2">Tạo danh sách các lớp học theo từng khối.</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {blocks.map(block => (
          <button
            key={block.id}
            onClick={() => setActiveBlock(block.id)}
            className={`py-3 px-6 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${
              activeBlock === block.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {block.name} ({classes.filter(c => c.gradeBlockId === block.id).length} lớp)
          </button>
        ))}
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chưa có khối nào. Vui lòng quay lại Bước 1 để thêm khối.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Thêm từng lớp</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên lớp</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    placeholder="VD: 10A1"
                  />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Thêm Lớp
                </button>
              </form>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Thêm nhanh nhiều lớp</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhập danh sách (cách nhau bởi dấu phẩy)</label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    value={quickAddNames}
                    onChange={e => setQuickAddNames(e.target.value)}
                    placeholder="10A1, 10A2, 10A3..."
                  />
                </div>
                <button onClick={handleQuickAdd} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Tạo hàng loạt
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Danh sách lớp ({activeClasses.length})</h3>
            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {activeClasses.map(cls => (
                  <li key={cls.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                    </div>
                    <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Xóa</button>
                  </li>
                ))}
                {activeClasses.length === 0 && (
                  <li className="px-6 py-8 text-center text-gray-500 text-sm">Chưa có lớp nào trong khối này.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
