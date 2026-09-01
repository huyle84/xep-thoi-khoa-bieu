"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2 } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  capacity: number;
  gradeBlockId: string;
}

interface GradeBlock {
  id: string;
  name: string;
  color: string;
}

interface Homeroom {
  classId: string;
  teacherId: string;
}

interface Teacher {
  id: string;
  name: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [blocks, setBlocks] = useState<GradeBlock[]>([]);
  const [homerooms, setHomerooms] = useState<Homeroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(40);
  const [gradeBlockId, setGradeBlockId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, blocksRes, hrRes, tRes] = await Promise.all([
        fetch("/api/classes").then(r => r.json()),
        fetch("/api/grade-blocks").then(r => r.json()),
        fetch("/api/homeroom").then(r => r.json()),
        fetch("/api/teachers").then(r => r.json())
      ]);
      
      setClasses(Array.isArray(classesRes) ? classesRes : []);
      const blocksData = Array.isArray(blocksRes) ? blocksRes : [];
      setBlocks(blocksData);
      setHomerooms(Array.isArray(hrRes) ? hrRes : []);
      setTeachers(Array.isArray(tRes) ? tRes : []);
      
      if (blocksData.length > 0 && gradeBlockId === "") {
        setGradeBlockId(blocksData[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherName = (classId: string) => {
    const hr = homerooms.find(h => h.classId === classId);
    if (!hr) return "Chưa có GVCN";
    const t = teachers.find(t => t.id === hr.teacherId);
    return t ? t.name : "Chưa có GVCN";
  };

  const openModal = (cls?: ClassItem) => {
    if (cls) {
      setEditingClass(cls);
      setName(cls.name);
      setCapacity(cls.capacity);
      setGradeBlockId(cls.gradeBlockId || (blocks.length > 0 ? blocks[0].id : ""));
    } else {
      setEditingClass(null);
      setName("");
      setCapacity(40);
      setGradeBlockId(blocks.length > 0 ? blocks[0].id : "");
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, capacity, gradeBlockId };
    try {
      if (editingClass) {
        await fetch(`/api/classes/${editingClass.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Save failed", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa lớp học này?")) return;
    try {
      await fetch(`/api/classes/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  const filteredClasses = activeTab === "all" 
    ? classes 
    : classes.filter(c => c.gradeBlockId === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="mr-2 h-6 w-6 text-indigo-600" />
          Quản lý Lớp học
        </h1>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm Lớp
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("all")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "all" ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Tất cả
            </button>
            {blocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setActiveTab(block.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === block.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {block.name}
              </button>
            ))}
          </nav>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên lớp</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khối</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sĩ số</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GVCN</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClasses.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Chưa có dữ liệu lớp học</td></tr>
            ) : (
              filteredClasses.map((cls) => {
                const block = blocks.find(b => b.id === cls.gradeBlockId);
                return (
                  <tr key={cls.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {block && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${block.color}20`, color: block.color }}>
                          {block.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.capacity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeacherName(cls.id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(cls)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{editingClass ? "Sửa Lớp học" : "Thêm Lớp học"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên lớp</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Thuộc khối</label>
                <select required value={gradeBlockId} onChange={e => setGradeBlockId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="" disabled>-- Chọn khối --</option>
                  {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sĩ số dự kiến</label>
                <input type="number" required value={capacity} onChange={e => setCapacity(parseInt(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div className="mt-5 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
