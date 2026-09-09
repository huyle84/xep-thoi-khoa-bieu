'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit2, Trash2, Loader2, BookOpen } from 'lucide-react';

interface Subject {
  id: string;
  code: string;
  name: string;
  periodsPerWeek: number;
  maxPeriodsPerDay: number;
  roomType: string;
  isCore: boolean;
  color: string;
}

const EMPTY: Partial<Subject> = { code: '', name: '', periodsPerWeek: 3, maxPeriodsPerDay: 2, roomType: 'NORMAL', isCore: false, color: '#3b82f6' };

export default function SubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Subject>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subjects');
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (e) {
      toast({ title: 'Lỗi tải dữ liệu', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowModal(true); };
  const openEdit = (s: Subject) => { setForm({ ...s }); setEditId(s.id); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId ? `/api/subjects/${editId}` : '/api/subjects';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      toast({ title: editId ? '✅ Đã cập nhật môn học' : '✅ Đã thêm môn học' });
      setShowModal(false);
      fetchSubjects();
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa môn "${name}"? Các phân công liên quan sẽ bị xóa.`)) return;
    try {
      const res = await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Lỗi xóa');
      }
      toast({ title: `✅ Đã xóa môn ${name}` });
      fetchSubjects();
    } catch (e: any) {
      toast({ title: 'Lỗi xóa', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <Header title="Quản lý Môn học">
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Thêm môn học
        </button>
      </Header>

      <div className="p-6 flex-1 overflow-auto">
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Mã</th>
                  <th className="px-4 py-3 text-left">Tên môn</th>
                  <th className="px-4 py-3 text-center">Tiết/tuần</th>
                  <th className="px-4 py-3 text-center">Max tiết/ngày</th>
                  <th className="px-4 py-3 text-center">Phòng</th>
                  <th className="px-4 py-3 text-center">Bắt buộc</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjects.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded-full" style={{ background: s.color + '20', color: s.color }}>
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: s.color }} />
                        {s.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3 text-center">{s.periodsPerWeek}</td>
                    <td className="px-4 py-3 text-center">{s.maxPeriodsPerDay}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {s.roomType === 'COMPUTER' ? 'Máy tính' : s.roomType === 'LAB' ? 'PTN' : 'Thường'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.isCore ? <span className="text-green-600">✓</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400">Chưa có môn học. Nhấn "Thêm môn học" để bắt đầu.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editId ? 'Sửa môn học' : 'Thêm môn học'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã môn (*)</label>
                  <input required value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" placeholder="VD: TOAN" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn (*)</label>
                  <input required value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="VD: Toán học" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiết/tuần</label>
                  <input type="number" min={1} max={20} value={form.periodsPerWeek || 3} onChange={e => setForm(f => ({ ...f, periodsPerWeek: +e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max tiết/ngày</label>
                  <input type="number" min={1} max={10} value={form.maxPeriodsPerDay || 2} onChange={e => setForm(f => ({ ...f, maxPeriodsPerDay: +e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                  <select value={form.roomType || 'NORMAL'} onChange={e => setForm(f => ({ ...f, roomType: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="NORMAL">Phòng thường</option>
                    <option value="COMPUTER">Phòng máy tính</option>
                    <option value="LAB">Phòng thí nghiệm</option>
                    <option value="GYM">Nhà thể chất</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                  <input type="color" value={form.color || '#3b82f6'} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    className="w-full h-10 border rounded-lg cursor-pointer" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isCore || false} onChange={e => setForm(f => ({ ...f, isCore: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-gray-700">Môn học bắt buộc (cốt lõi)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Hủy</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editId ? 'Cập nhật' : 'Thêm môn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
