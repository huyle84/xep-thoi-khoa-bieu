'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useToast } from '@/components/ui/use-toast';
import { Save, RefreshCw, Trash2, Download, Upload, Clock, AlertTriangle, Loader2 } from 'lucide-react';

interface Snapshot {
  id: string;
  label: string;
  entryCount: number;
  createdAt: string;
}

export default function BackupPage() {
  const { toast } = useToast();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState('');
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSnapshots = async () => {
    try {
      const res = await fetch('/api/backup');
      if (res.ok) setSnapshots(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSnapshots(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label || `Sao lưu ${new Date().toLocaleString('vi')}` }),
      });
      if (res.ok) {
        toast({ title: '✅ Đã sao lưu TKB thành công' });
        setLabel('');
        fetchSnapshots();
      } else {
        toast({ title: 'Lỗi khi sao lưu', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Lỗi kết nối', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (id: string, snLabel: string) => {
    if (!confirm(`Khôi phục TKB về phiên bản "${snLabel}"?\nTKB hiện tại sẽ bị ghi đè!`)) return;
    setRestoring(id);
    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast({ title: `✅ Đã khôi phục: ${snLabel}` });
      } else {
        toast({ title: 'Lỗi khôi phục', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Lỗi kết nối', variant: 'destructive' });
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa bản sao lưu này?')) return;
    setDeleting(id);
    try {
      const res = await fetch('/api/backup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSnapshots(prev => prev.filter(s => s.id !== id));
        toast({ title: 'Đã xóa bản sao lưu' });
      }
    } catch {
      toast({ title: 'Lỗi', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <Header title="Sao lưu & Khôi phục TKB" />

      <div className="p-6 space-y-6 max-w-3xl">
        {/* Save section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Save className="w-5 h-5 text-green-600" /> Tạo bản sao lưu mới
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={`Sao lưu ${new Date().toLocaleDateString('vi')}`}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sao lưu
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Lưu toàn bộ các tiết đã xếp hiện tại vào một bản snapshot.
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            Khi <strong>Khôi phục</strong>, toàn bộ TKB hiện tại sẽ bị xóa và thay bằng bản đã chọn. Hãy sao lưu trước khi khôi phục!
          </p>
        </div>

        {/* Snapshots list */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Danh sách bản sao lưu</h3>
            <button onClick={fetchSnapshots} className="text-gray-400 hover:text-gray-600">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : snapshots.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Chưa có bản sao lưu nào. Tạo bản sao lưu đầu tiên!
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {snapshots.map(snap => (
                <li key={snap.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{snap.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {snap.entryCount} tiết · {new Date(snap.createdAt).toLocaleString('vi')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestore(snap.id, snap.label)}
                      disabled={restoring === snap.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                      {restoring === snap.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Upload className="w-3 h-3" />}
                      Khôi phục
                    </button>
                    <button
                      onClick={() => handleDelete(snap.id)}
                      disabled={deleting === snap.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deleting === snap.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
