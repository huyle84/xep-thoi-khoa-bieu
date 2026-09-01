"use client";

import { useState, useEffect } from "react";
import { Clock, Plus, RefreshCw } from "lucide-react";

interface PeriodConfig {
  id: string;
  periodNumber: number;
  label: string;
  startTime: string;
  endTime: string;
  isMorning: boolean;
}

export default function PeriodConfigsPage() {
  const [periods, setPeriods] = useState<PeriodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PeriodConfig>>({});

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const res = await fetch("/api/period-configs");
      if (res.ok) {
        const data = await res.json();
        setPeriods(data);
      } else {
        // Fallback for demo
        setPeriods([]);
      }
    } catch (error) {
      console.error("Failed to fetch period configs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefault = async () => {
    if (!confirm("Tạo 10 tiết mặc định (5 sáng, 5 chiều)?")) return;
    try {
      await fetch("/api/period-configs/default", { method: "POST" });
      fetchPeriods();
    } catch (error) {
      console.error("Failed to create default configs", error);
    }
  };

  const handleEditClick = (period: PeriodConfig) => {
    setEditingId(period.id);
    setEditForm({ ...period });
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await fetch(`/api/period-configs/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      fetchPeriods();
    } catch (error) {
      console.error("Failed to update period", error);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  const morningPeriods = periods.filter(p => p.isMorning).sort((a, b) => a.periodNumber - b.periodNumber);
  const afternoonPeriods = periods.filter(p => !p.isMorning).sort((a, b) => a.periodNumber - b.periodNumber);

  const renderTable = (data: PeriodConfig[], title: string, colorClass: string) => (
    <div className="mb-8">
      <h3 className={`text-lg font-medium mb-4 ${colorClass}`}>{title}</h3>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Tiết</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Nhãn hiển thị</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bắt đầu</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kết thúc</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có dữ liệu</td></tr>
            ) : (
              data.map((period) => {
                const isEditing = editingId === period.id;
                return (
                  <tr key={period.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {period.periodNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.label}
                          onChange={(e) => setEditForm({...editForm, label: e.target.value})}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      ) : (
                        <span onClick={() => handleEditClick(period)} className="cursor-pointer hover:bg-gray-100 p-1 rounded block">{period.label}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="time"
                          value={editForm.startTime}
                          onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      ) : (
                        <span onClick={() => handleEditClick(period)} className="cursor-pointer hover:bg-gray-100 p-1 rounded block">{period.startTime}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isEditing ? (
                        <input
                          type="time"
                          value={editForm.endTime}
                          onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      ) : (
                        <span onClick={() => handleEditClick(period)} className="cursor-pointer hover:bg-gray-100 p-1 rounded block">{period.endTime}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing ? (
                        <div className="flex justify-end space-x-2">
                          <button onClick={handleSave} className="text-indigo-600 hover:text-indigo-900">Lưu</button>
                          <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-900">Hủy</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditClick(period)} className="text-indigo-600 hover:text-indigo-900">Sửa</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Clock className="mr-2 h-6 w-6 text-indigo-600" />
          Cấu hình Tiết học
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateDefault}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tạo mặc định
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderTable(morningPeriods, "Buổi sáng", "text-blue-600")}
        {renderTable(afternoonPeriods, "Buổi chiều", "text-orange-600")}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mt-8">
        <h3 className="text-lg font-medium mb-4 text-gray-900">Mô phỏng thời gian biểu (Visual Timeline)</h3>
        <div className="relative pt-8 pb-4 w-full overflow-x-auto">
          <div className="flex h-12 min-w-max border-t border-b border-gray-200">
            {morningPeriods.map((p, i) => (
              <div key={p.id} className="flex-1 flex flex-col items-center justify-center border-r border-gray-200 bg-blue-50 min-w-[120px] px-2">
                <span className="text-xs font-semibold text-blue-700">{p.label}</span>
                <span className="text-xs text-gray-500">{p.startTime} - {p.endTime}</span>
              </div>
            ))}
            <div className="flex items-center justify-center bg-gray-100 min-w-[100px] border-r border-gray-200 px-2">
              <span className="text-xs font-medium text-gray-600">Nghỉ trưa</span>
            </div>
            {afternoonPeriods.map((p, i) => (
              <div key={p.id} className="flex-1 flex flex-col items-center justify-center border-r border-gray-200 bg-orange-50 min-w-[120px] px-2">
                <span className="text-xs font-semibold text-orange-700">{p.label}</span>
                <span className="text-xs text-gray-500">{p.startTime} - {p.endTime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
