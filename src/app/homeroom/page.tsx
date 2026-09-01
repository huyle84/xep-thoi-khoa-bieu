"use client";

import { useState, useEffect } from "react";
import { Download, UserCheck, Check, X } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
}

interface ClassItem {
  id: string;
  name: string;
  gradeBlockId: string;
}

interface HomeroomAssignment {
  id: string;
  classId: string;
  teacherId: string;
  academicYear: string;
}

interface GradeBlock {
  id: string;
  name: string;
}

export default function HomeroomPage() {
  const [blocks, setBlocks] = useState<GradeBlock[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<HomeroomAssignment[]>([]);
  
  const [activeTab, setActiveTab] = useState<string>("");
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [blocksRes, classesRes, teachersRes, assignRes] = await Promise.all([
        fetch("/api/grade-blocks").then(res => res.json()),
        fetch("/api/classes").then(res => res.json()),
        fetch("/api/teachers").then(res => res.json()),
        fetch("/api/homeroom").then(res => res.json())
      ]);
      
      const blocksData = Array.isArray(blocksRes) ? blocksRes : [];
      setBlocks(blocksData);
      setClasses(Array.isArray(classesRes) ? classesRes : []);
      setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
      setAssignments(Array.isArray(assignRes) ? assignRes : []);
      
      if (blocksData.length > 0 && !activeTab) {
        setActiveTab(blocksData[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (classId: string) => {
    try {
      const existing = assignments.find(a => a.classId === classId);
      const payload = {
        classId,
        teacherId: selectedTeacherId,
        academicYear: new Date().getFullYear().toString()
      };
      
      if (existing) {
        await fetch(`/api/homeroom/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch("/api/homeroom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      
      setEditingClassId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to save assignment", error);
    }
  };

  const handleExport = () => {
    // Mock export
    alert("Đang xuất danh sách GVCN ra file Excel...");
  };

  if (loading) return <div>Đang tải...</div>;

  const filteredClasses = classes.filter(c => c.gradeBlockId === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserCheck className="mr-2 h-6 w-6 text-indigo-600" />
          Phân công Giáo viên chủ nhiệm
        </h1>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="mr-2 h-4 w-4 text-gray-500" />
          Xuất danh sách
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {blocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setActiveTab(block.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === block.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {block.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giáo viên chủ nhiệm
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Năm học
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không có lớp nào trong khối này.
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => {
                  const assignment = assignments.find(a => a.classId === cls.id);
                  const teacher = teachers.find(t => t.id === assignment?.teacherId);
                  const isEditing = editingClassId === cls.id;
                  
                  return (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cls.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer">
                        {isEditing ? (
                          <div className="flex items-center">
                            <select
                              value={selectedTeacherId}
                              onChange={(e) => setSelectedTeacherId(e.target.value)}
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              autoFocus
                            >
                              <option value="">-- Chọn giáo viên --</option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              setEditingClassId(cls.id);
                              setSelectedTeacherId(assignment?.teacherId || "");
                            }}
                            className={`px-2 py-1 -ml-2 rounded hover:bg-gray-100 ${!teacher ? 'text-gray-400 italic' : 'text-gray-900'}`}
                          >
                            {teacher ? teacher.name : "Chưa phân công (Click để thêm)"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment ? assignment.academicYear : new Date().getFullYear().toString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isEditing ? (
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => handleSave(cls.id)} className="text-green-600 hover:text-green-900">
                              <Check className="h-5 w-5" />
                            </button>
                            <button onClick={() => setEditingClassId(null)} className="text-red-600 hover:text-red-900">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingClassId(cls.id);
                              setSelectedTeacherId(assignment?.teacherId || "");
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Sửa
                          </button>
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
    </div>
  );
}
