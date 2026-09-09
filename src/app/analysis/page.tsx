"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, AlertTriangle, XCircle, AlertCircle } from "lucide-react";
import BackButton from "@/components/layout/BackButton";

type Teacher = {
  id: string;
  name: string;
  maxPeriodsPerWeek: number;
  assignmentsCount: number;
};

export default function AnalysisPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [teachersRes, assignmentsRes, subjectsRes] = await Promise.all([
        fetch("/api/teachers"),
        fetch("/api/assignments"),
        fetch("/api/subjects") // Assuming this exists to get all subjects to find unassigned ones
      ]);

      const tData = await teachersRes.json();
      const aData = await assignmentsRes.json();
      const sData = await subjectsRes.json().catch(() => []);

      setTeachers(tData);
      setAssignments(aData.assignments || []);
      setSubjects(sData || []);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể tải dữ liệu phân tích", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculations
  const totalTeachers = teachers.length;
  const totalAssignedPeriods = teachers.reduce((sum, t) => sum + t.assignmentsCount, 0);
  
  const teachersGood = teachers.filter(t => t.assignmentsCount === t.maxPeriodsPerWeek).length;
  const teachersUnder = teachers.filter(t => t.assignmentsCount < t.maxPeriodsPerWeek).length;
  const teachersOver = teachers.filter(t => t.assignmentsCount > t.maxPeriodsPerWeek).length;

  // Unassigned Subjects (naive check if a subject has no assignment)
  // Or maybe check if there are missing periods? For simplicity, we just list subjects not present in assignments.
  const assignedSubjectIds = new Set(assignments.map(a => a.subjectId));
  const unassignedSubjects = subjects.filter(s => !assignedSubjectIds.has(s.id));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Phân tích Phân công chuyên môn" />

      
      <div className="p-6 flex-1 overflow-auto space-y-6">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giáo viên</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeachers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng tiết đã PC</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignedPeriods}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GV đủ tiết</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{teachersGood}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GV thiếu tiết</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{teachersUnder}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GV vượt tiết</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{teachersOver}</div>
            </CardContent>
          </Card>
        </div>

        {/* Warning List */}
        {unassignedSubjects.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex items-center text-orange-800 font-bold mb-2">
              <AlertCircle className="w-5 h-5 mr-2" />
              Cảnh báo: Có môn học chưa được phân công
            </div>
            <ul className="list-disc list-inside text-orange-700 text-sm">
              {unassignedSubjects.map(s => (
                <li key={s.id}>{s.name} ({s.code})</li>
              ))}
            </ul>
          </div>
        )}

        {/* Workload Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold">Chi tiết số tiết giáo viên</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên GV</TableHead>
                <TableHead className="text-right">Định mức</TableHead>
                <TableHead className="text-right">Đã PC</TableHead>
                <TableHead className="text-right">Còn lại</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Đang tải...</TableCell></TableRow>
              ) : teachers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center">Không có dữ liệu</TableCell></TableRow>
              ) : (
                teachers.map(t => {
                  const remaining = t.maxPeriodsPerWeek - t.assignmentsCount;
                  let statusText = "✅ Đủ tiết";
                  let statusClass = "text-green-600";
                  
                  if (remaining > 0) {
                    statusText = "⚠️ Thiếu";
                    statusClass = "text-yellow-600";
                  } else if (remaining < 0) {
                    statusText = "🔴 Vượt";
                    statusClass = "text-red-600";
                  }

                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-right">{t.maxPeriodsPerWeek}</TableCell>
                      <TableCell className="text-right">{t.assignmentsCount}</TableCell>
                      <TableCell className="text-right font-medium">{remaining}</TableCell>
                      <TableCell className={`font-semibold ${statusClass}`}>
                        {statusText}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
