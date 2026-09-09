"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Check, Info } from "lucide-react";

interface Subject { id: string; name: string }
interface GradeBlock { id: string; name: string }
interface FixedPeriod { id?: string; subjectId: string; gradeBlockId: string; dayOfWeek: number; periodNumber: number }

export default function FixedPeriodsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [gradeBlocks, setGradeBlocks] = useState<GradeBlock[]>([]);
  const [fixedPeriods, setFixedPeriods] = useState<FixedPeriod[]>([]);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedGradeBlockId, setSelectedGradeBlockId] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch("/api/subjects").then(r => r.json()),
      fetch("/api/grade-blocks").then(r => r.json()),
      fetch("/api/fixed-periods").then(r => r.ok ? r.json() : [])
    ]).then(([subs, gbs, fixed]) => {
      setSubjects(subs || []);
      setGradeBlocks(gbs || []);
      setFixedPeriods(fixed || []);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const isFixed = (day: number, period: number) => {
    return fixedPeriods.some(f => 
      f.subjectId === selectedSubjectId && 
      f.gradeBlockId === selectedGradeBlockId && 
      f.dayOfWeek === day && 
      f.periodNumber === period
    );
  };

  const toggleFix = async (day: number, period: number) => {
    if (!selectedSubjectId || !selectedGradeBlockId) return;
    
    const existing = fixedPeriods.find(f => 
      f.subjectId === selectedSubjectId && 
      f.gradeBlockId === selectedGradeBlockId && 
      f.dayOfWeek === day && 
      f.periodNumber === period
    );

    if (existing) {
      setFixedPeriods(prev => prev.filter(f => f !== existing));
      try {
        if (existing.id) {
          await fetch(`/api/fixed-periods/${existing.id}`, { method: "DELETE" });
        }
        toast({ title: "Đã hủy cố định tiết" });
      } catch (e) {
        setFixedPeriods(prev => [...prev, existing]);
        toast({ title: "Lỗi", variant: "destructive" });
      }
    } else {
      const newFixed = { 
        subjectId: selectedSubjectId, 
        gradeBlockId: selectedGradeBlockId, 
        dayOfWeek: day, 
        periodNumber: period 
      };
      // Optimistic
      setFixedPeriods(prev => [...prev, newFixed]);
      try {
        const res = await fetch("/api/fixed-periods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newFixed)
        });
        const data = await res.json();
        // Update with ID
        setFixedPeriods(prev => prev.map(f => f === newFixed ? { ...f, id: data.id } : f));
        toast({ title: "Đã cố định tiết" });
      } catch (e) {
        setFixedPeriods(prev => prev.filter(f => f !== newFixed));
        toast({ title: "Lỗi", variant: "destructive" });
      }
    }
  };

  const days = [2, 3, 4, 5, 6];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8]; // Example 1-8 periods a day

  if (loading) return <div className="p-8">Đang tải...</div>;

  return (
    <div className="flex h-screen bg-gray-50/50 flex-col">
      <Header title="Tiết cố định" />
      
      <div className="p-6 max-w-4xl space-y-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md flex items-start gap-3">
          <Info className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Hướng dẫn sử dụng</p>
            <p className="text-sm mt-1">Chọn Khối và Môn học để cấu hình tiết cố định. Ví dụ: Chào cờ thường cố định vào Thứ 2 Tiết 1, Sinh hoạt lớp cố định vào Thứ 6 Tiết cuối.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border shadow-sm flex gap-4 items-end">
          <div className="space-y-1.5 flex-1">
            <label className="text-sm font-medium">Khối</label>
            <Select value={selectedGradeBlockId} onValueChange={setSelectedGradeBlockId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khối..." />
              </SelectTrigger>
              <SelectContent>
                {gradeBlocks.map(gb => (
                  <SelectItem key={gb.id} value={gb.id}>{gb.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1">
            <label className="text-sm font-medium">Môn học</label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn môn học..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedGradeBlockId && selectedSubjectId ? (
          <div className="bg-white border rounded-md shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 border-r w-24">Tiết \ Thứ</th>
                  {days.map(d => (
                    <th key={d} className="p-3 text-center border-r font-semibold">Thứ {d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map(period => (
                  <tr key={period} className="border-b">
                    <td className="p-3 border-r font-medium text-center bg-gray-50">
                      Tiết {period}
                    </td>
                    {days.map(day => {
                      const fixed = isFixed(day, period);
                      return (
                        <td 
                          key={day} 
                          className={`p-0 border-r cursor-pointer transition-colors hover:bg-gray-100 ${fixed ? 'bg-indigo-50 hover:bg-indigo-100' : ''}`}
                          onClick={() => toggleFix(day, period)}
                        >
                          <div className="flex h-12 items-center justify-center">
                            {fixed ? (
                              <Check className="text-indigo-600 w-5 h-5" />
                            ) : (
                              <span className="text-transparent hover:text-gray-300 transition-colors">
                                <Check className="w-5 h-5" />
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-md border border-dashed text-gray-500">
            Vui lòng chọn Khối và Môn học để xem lưới thời khóa biểu
          </div>
        )}
      </div>
    </div>
  );
}
