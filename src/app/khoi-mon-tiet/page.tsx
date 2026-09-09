"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface Subject { id: string; name: string }
interface GradeBlock { id: string; name: string; gradeNum: number }
interface SubjectPeriod { subjectId: string; gradeBlockId: string; periodsPerWeek: number }

export default function KhoiMonTietPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [gradeBlocks, setGradeBlocks] = useState<GradeBlock[]>([]);
  const [subjectPeriods, setSubjectPeriods] = useState<SubjectPeriod[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/subjects").then(r => r.json()),
      fetch("/api/grade-blocks").then(r => r.json()),
      fetch("/api/subject-periods").then(r => r.ok ? r.json() : [])
    ]).then(([subs, gbs, periods]) => {
      setSubjects(subs || []);
      setGradeBlocks(gbs || []);
      setSubjectPeriods(periods || []);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const getPeriods = (subjectId: string, gradeBlockId: string) => {
    return subjectPeriods.find(p => p.subjectId === subjectId && p.gradeBlockId === gradeBlockId)?.periodsPerWeek || 0;
  };

  const handleUpdate = async (subjectId: string, gradeBlockId: string, value: number) => {
    const prevPeriods = [...subjectPeriods];
    
    // Optimistic update
    setSubjectPeriods(prev => {
      const filtered = prev.filter(p => !(p.subjectId === subjectId && p.gradeBlockId === gradeBlockId));
      if (value > 0) {
        return [...filtered, { subjectId, gradeBlockId, periodsPerWeek: value }];
      }
      return filtered;
    });

    try {
      const res = await fetch("/api/subject-periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, gradeBlockId, periodsPerWeek: value })
      });
      if (!res.ok) throw new Error("Failed to save");
      toast({ title: "Đã lưu số tiết" });
    } catch (e) {
      setSubjectPeriods(prevPeriods);
      toast({ title: "Lỗi", description: "Không thể lưu số tiết", variant: "destructive" });
    }
  };

  const getRowTotal = (subjectId: string) => {
    return gradeBlocks.reduce((sum, gb) => sum + getPeriods(subjectId, gb.id), 0);
  };

  const getColTotal = (gradeBlockId: string) => {
    return subjects.reduce((sum, s) => sum + getPeriods(s.id, gradeBlockId), 0);
  };

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="flex h-screen bg-gray-50/50 flex-col">
      <Header title="Khối - Môn - Tiết" />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white border rounded shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Số tiết quy định</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left font-semibold border-r w-64">Môn học / Khối</th>
                  {gradeBlocks.map(gb => (
                    <th key={gb.id} className="p-3 text-center font-semibold border-r w-32">
                      {gb.name}
                    </th>
                  ))}
                  <th className="p-3 text-center font-bold bg-gray-100">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(subject => (
                  <tr key={subject.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border-r font-medium">
                      {subject.name}
                    </td>
                    {gradeBlocks.map(gb => {
                      const val = getPeriods(subject.id, gb.id);
                      return (
                        <td key={gb.id} className="p-2 border-r">
                          <Input
                            type="number"
                            min="0"
                            className="w-full h-8 text-center"
                            value={val || ""}
                            onChange={(e) => {
                              // We can handle onChange to update local state without saving, but onBlur to save.
                              // For simplicity in this demo, let's just trigger update onBlur
                            }}
                            onBlur={(e) => {
                              const newVal = parseInt(e.target.value) || 0;
                              if (newVal !== val) {
                                handleUpdate(subject.id, gb.id, newVal);
                              }
                            }}
                            placeholder="0"
                          />
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-bold bg-gray-50 text-indigo-700">
                      {getRowTotal(subject.id)}
                    </td>
                  </tr>
                ))}
                
                {/* Total Row */}
                <tr className="bg-gray-100 font-bold border-t-2">
                  <td className="p-3 border-r">Tổng số tiết/tuần</td>
                  {gradeBlocks.map(gb => (
                    <td key={gb.id} className="p-3 text-center border-r text-indigo-700">
                      {getColTotal(gb.id)}
                    </td>
                  ))}
                  <td className="p-3 text-center text-indigo-800">
                    {gradeBlocks.reduce((sum, gb) => sum + getColTotal(gb.id), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
