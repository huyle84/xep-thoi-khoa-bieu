"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Layers } from "lucide-react";

interface GradeBlock {
  id: string;
  name: string;
  gradeNum: number;
  color: string;
  classes?: { id: string; name: string }[];
}

export default function GradeBlocksPage() {
  const [gradeBlocks, setGradeBlocks] = useState<GradeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<GradeBlock | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [gradeNum, setGradeNum] = useState<number>(10);
  const [color, setColor] = useState("#4f46e5");

  useEffect(() => {
    fetchGradeBlocks();
  }, []);

  const fetchGradeBlocks = async () => {
    try {
      const res = await fetch("/api/grade-blocks");
      if (res.ok) {
        const data = await res.json();
        setGradeBlocks(data);
      }
    } catch (error) {
      console.error("Failed to fetch grade blocks", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDefault = async () => {
    if (!confirm("Tạo các khối 10, 11, 12 mặc định?")) return;
    try {
      await fetch("/api/grade-blocks/default", { method: "POST" });
      fetchGradeBlocks();
    } catch (error) {
      console.error("Failed to create default blocks", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, gradeNum, color };
    
    try {
      if (editingBlock) {
        await fetch(`/api/grade-blocks/${editingBlock.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/grade-blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setShowModal(false);
      fetchGradeBlocks();
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa khối này?")) return;
    try {
      await fetch(`/api/grade-blocks/${id}`, { method: "DELETE" });
      fetchGradeBlocks();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const openModal = (block?: GradeBlock) => {
    if (block) {
      setEditingBlock(block);
      setName(block.name);
      setGradeNum(block.gradeNum);
      setColor(block.color);
    } else {
      setEditingBlock(null);
      setName("");
      setGradeNum(10);
      setColor("#4f46e5");
    }
    setShowModal(true);
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Layers className="mr-2 h-6 w-6 text-indigo-600" />
          Quản lý Khối học
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateDefault}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Tạo mặc định (Khối 10, 11, 12)
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm Khối
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gradeBlocks.map((block) => (
          <div key={block.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center" style={{ borderTop: `4px solid ${block.color}` }}>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  {block.name}
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${block.color}20`, color: block.color }}>
                    Lớp {block.gradeNum}
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">{block.classes?.length || 0} lớp học</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openModal(block)} className="text-gray-400 hover:text-indigo-600">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(block.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-5 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {block.classes && block.classes.length > 0 ? (
                  block.classes.map(c => (
                    <span key={c.id} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-700">
                      {c.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 italic">Chưa có lớp học nào</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {gradeBlocks.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
            Chưa có khối học nào. Hãy tạo mới hoặc sử dụng chức năng "Tạo mặc định".
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {editingBlock ? "Sửa Khối học" : "Thêm Khối học mới"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên khối</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="VD: Khối 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cấp lớp</label>
                <input
                  type="number"
                  required
                  value={gradeNum}
                  onChange={(e) => setGradeNum(parseInt(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    type="color"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="text-sm text-gray-500">{color}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
