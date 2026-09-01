'use client';

import React, { useState, useEffect } from 'react';

interface PeriodConfig {
  id: string;
  periodNumber: number;
  session: string;
  label: string;
  startTime: string;
  endTime: string;
  order: number;
}

export default function Step3Tiet() {
  const [periods, setPeriods] = useState<PeriodConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const res = await fetch('/api/period-configs');
      if (res.ok) {
        const data = await res.json();
        setPeriods(data.sort((a: any, b: any) => a.order - b.order));
      }
    } catch (e) {}
  };

  const createDefaults = async () => {
    setLoading(true);
    const defaults = [
      { periodNumber: 1, session: 'Sáng', label: 'Tiết 1 Sáng', startTime: '07:00', endTime: '07:45', order: 1 },
      { periodNumber: 2, session: 'Sáng', label: 'Tiết 2 Sáng', startTime: '07:50', endTime: '08:35', order: 2 },
      { periodNumber: 3, session: 'Sáng', label: 'Tiết 3 Sáng', startTime: '08:55', endTime: '09:40', order: 3 },
      { periodNumber: 4, session: 'Sáng', label: 'Tiết 4 Sáng', startTime: '09:45', endTime: '10:30', order: 4 },
      { periodNumber: 5, session: 'Sáng', label: 'Tiết 5 Sáng', startTime: '10:35', endTime: '11:20', order: 5 },
      { periodNumber: 6, session: 'Chiều', label: 'Tiết 1 Chiều', startTime: '13:30', endTime: '14:15', order: 6 },
      { periodNumber: 7, session: 'Chiều', label: 'Tiết 2 Chiều', startTime: '14:20', endTime: '15:05', order: 7 },
      { periodNumber: 8, session: 'Chiều', label: 'Tiết 3 Chiều', startTime: '15:25', endTime: '16:10', order: 8 },
      { periodNumber: 9, session: 'Chiều', label: 'Tiết 4 Chiều', startTime: '16:15', endTime: '17:00', order: 9 },
      { periodNumber: 10, session: 'Chiều', label: 'Tiết 5 Chiều', startTime: '17:05', endTime: '17:50', order: 10 },
    ];
    
    try {
      // Clear existing first in real app, but for simplicity here we just post
      for (const d of defaults) {
        await fetch('/api/period-configs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(d)
        });
      }
      await fetchPeriods();
    } catch(e) {}
    setLoading(false);
  };

  const handleUpdate = async (id: string, field: string, value: string) => {
    const period = periods.find(p => p.id === id);
    if (!period) return;
    
    const updated = { ...period, [field]: value };
    setPeriods(periods.map(p => p.id === id ? updated : p));
    
    try {
      await fetch(`/api/period-configs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch(e) {}
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ⏰ Bước 3: Cấu hình Tiết học
          </h2>
          <p className="text-gray-600 mt-2">Thiết lập thời gian cho các tiết học trong ngày.</p>
        </div>
        {periods.length === 0 && (
          <button
            onClick={createDefaults}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-medium"
          >
            {loading ? 'Đang tạo...' : 'Tạo 10 tiết mặc định'}
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiết (1-10)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buổi</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhãn hiển thị</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ bắt đầu</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giờ kết thúc</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {periods.map((period) => (
              <tr key={period.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.periodNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select 
                    value={period.session}
                    onChange={(e) => handleUpdate(period.id, 'session', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-1 border"
                  >
                    <option value="Sáng">Sáng</option>
                    <option value="Chiều">Chiều</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input 
                    type="text" 
                    value={period.label}
                    onChange={(e) => setPeriods(periods.map(p => p.id === period.id ? {...p, label: e.target.value} : p))}
                    onBlur={(e) => handleUpdate(period.id, 'label', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-1 border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input 
                    type="time" 
                    value={period.startTime}
                    onChange={(e) => setPeriods(periods.map(p => p.id === period.id ? {...p, startTime: e.target.value} : p))}
                    onBlur={(e) => handleUpdate(period.id, 'startTime', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-1 border"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input 
                    type="time" 
                    value={period.endTime}
                    onChange={(e) => setPeriods(periods.map(p => p.id === period.id ? {...p, endTime: e.target.value} : p))}
                    onBlur={(e) => handleUpdate(period.id, 'endTime', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-1 border"
                  />
                </td>
              </tr>
            ))}
            {periods.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Chưa có cấu hình tiết học. Vui lòng bấm "Tạo 10 tiết mặc định".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
