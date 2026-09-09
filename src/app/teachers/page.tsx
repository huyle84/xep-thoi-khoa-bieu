"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Edit2, Trash2, CalendarOff, Plus } from "lucide-react";

type Teacher = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  maxPeriodsPerWeek: number;
  phone: string;
  email: string;
  assignmentsCount: number;
  busySlotsCount: number;
};

type BusySlot = {
  id: string;
  dayOfWeek: number;
  period: number;
  reason: string;
};

export default function TeachersPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isBusySlotsModalOpen, setIsBusySlotsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Forms & Selections
  const [currentTeacher, setCurrentTeacher] = useState<Partial<Teacher> | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  const [selectedTeacherForBusySlots, setSelectedTeacherForBusySlots] = useState<Teacher | null>(null);
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [isLoadingBusySlots, setIsLoadingBusySlots] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/teachers");
      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể tải danh sách giáo viên", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeacher) return;

    const isEditing = !!currentTeacher.id;
    const url = "/api/teachers";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentTeacher),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Có lỗi xảy ra");
      }

      toast({ title: "Thành công", description: isEditing ? "Cập nhật thành công" : "Thêm mới thành công" });
      setIsTeacherModalOpen(false);
      fetchTeachers();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    try {
      const res = await fetch(`/api/teachers?id=${teacherToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không thể xóa giáo viên");

      toast({ title: "Thành công", description: "Đã xóa giáo viên" });
      setTeacherToDelete(null);
      setIsDeleteDialogOpen(false);
      fetchTeachers();
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  const openBusySlots = async (teacher: Teacher) => {
    setSelectedTeacherForBusySlots(teacher);
    setIsBusySlotsModalOpen(true);
    setIsLoadingBusySlots(true);

    try {
      const res = await fetch(`/api/teachers/${teacher.id}/busy-slots`);
      const data = await res.json();
      setBusySlots(data);
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể tải lịch bận", variant: "destructive" });
    } finally {
      setIsLoadingBusySlots(false);
    }
  };

  const toggleBusySlot = async (dayOfWeek: number, period: number) => {
    if (!selectedTeacherForBusySlots) return;

    const existing = busySlots.find(s => s.dayOfWeek === dayOfWeek && s.period === period);
    const teacherId = selectedTeacherForBusySlots.id;

    try {
      if (existing) {
        // Delete
        await fetch(`/api/teachers/${teacherId}/busy-slots`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dayOfWeek, period }),
        });
        setBusySlots(prev => prev.filter(s => !(s.dayOfWeek === dayOfWeek && s.period === period)));
        
        // Update local count
        setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, busySlotsCount: t.busySlotsCount - 1 } : t));
      } else {
        // Create
        const res = await fetch(`/api/teachers/${teacherId}/busy-slots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dayOfWeek, period, reason: "" }),
        });
        const newSlot = await res.json();
        setBusySlots(prev => [...prev, newSlot]);

        // Update local count
        setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, busySlotsCount: t.busySlotsCount + 1 } : t));
      }
    } catch (error) {
      toast({ title: "Lỗi", description: "Không thể cập nhật tiết bận", variant: "destructive" });
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent > 100) return "bg-red-500";
    if (percent >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Quản lý Giáo viên" />
      
      <div className="p-6 flex-1 overflow-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Danh sách Giáo viên</h2>
          <Button onClick={() => { setCurrentTeacher({ maxPeriodsPerWeek: 20 }); setIsTeacherModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm giáo viên
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GV</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Tên viết tắt</TableHead>
                <TableHead className="text-right">Định mức</TableHead>
                <TableHead className="text-right">Đã PC</TableHead>
                <TableHead className="text-right">Tiết bận</TableHead>
                <TableHead>Tiến độ phân công</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Đang tải...</TableCell></TableRow>
              ) : teachers.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center">Chưa có giáo viên nào</TableCell></TableRow>
              ) : (
                teachers.map(t => {
                  const percent = t.maxPeriodsPerWeek ? Math.round((t.assignmentsCount / t.maxPeriodsPerWeek) * 100) : 0;
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.code}</TableCell>
                      <TableCell>{t.name}</TableCell>
                      <TableCell>{t.shortName}</TableCell>
                      <TableCell className="text-right">{t.maxPeriodsPerWeek}</TableCell>
                      <TableCell className="text-right">{t.assignmentsCount}</TableCell>
                      <TableCell className="text-right">{t.busySlotsCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(percent, 100)} className={`h-2 w-full ${getProgressColor(percent)}`} indicatorColor={getProgressColor(percent)} />
                          <span className="text-xs text-gray-500 w-10">{percent}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openBusySlots(t)} title="Nguyện vọng nghỉ">
                            <CalendarOff className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { setCurrentTeacher(t); setIsTeacherModalOpen(true); }} title="Sửa">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => { setTeacherToDelete(t.id); setIsDeleteDialogOpen(true); }} title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Teacher Form Modal */}
      <Dialog open={isTeacherModalOpen} onOpenChange={setIsTeacherModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentTeacher?.id ? "Sửa giáo viên" : "Thêm giáo viên"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTeacher} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã GV (*)</Label>
                <Input required value={currentTeacher?.code || ""} onChange={e => setCurrentTeacher(prev => ({ ...prev, code: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Họ tên (*)</Label>
                <Input required value={currentTeacher?.name || ""} onChange={e => setCurrentTeacher(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Tên viết tắt</Label>
                <Input placeholder="Để trống để tự tạo" value={currentTeacher?.shortName || ""} onChange={e => setCurrentTeacher(prev => ({ ...prev, shortName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Số tiết định mức</Label>
                <Input type="number" min="1" max="40" required value={currentTeacher?.maxPeriodsPerWeek || ""} onChange={e => setCurrentTeacher(prev => ({ ...prev, maxPeriodsPerWeek: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Điện thoại</Label>
                <Input value={currentTeacher?.phone || ""} onChange={e => setCurrentTeacher(prev => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={currentTeacher?.email || ""} onChange={e => setCurrentTeacher(prev => ({ ...prev, email: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTeacherModalOpen(false)}>Hủy</Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Busy Slots Modal */}
      <Dialog open={isBusySlotsModalOpen} onOpenChange={setIsBusySlotsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nguyện vọng nghỉ: {selectedTeacherForBusySlots?.name}</DialogTitle>
          </DialogHeader>
          {isLoadingBusySlots ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : (
            <div className="overflow-auto max-h-[60vh]">
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center border-r">Tiết</TableHead>
                    {[2, 3, 4, 5, 6].map(d => (
                      <TableHead key={d} className="text-center border-r">Thứ {d}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(period => (
                    <TableRow key={period}>
                      <TableCell className="text-center font-medium border-r bg-gray-50">{period}</TableCell>
                      {[2, 3, 4, 5, 6].map(day => {
                        const isBusy = busySlots.some(s => s.dayOfWeek === day && s.period === period);
                        return (
                          <TableCell 
                            key={day} 
                            className={`text-center p-0 cursor-pointer border-r hover:bg-gray-100 transition-colors ${isBusy ? "bg-red-100" : ""}`}
                            onClick={() => toggleBusySlot(day, period)}
                          >
                            <div className="h-10 w-full flex items-center justify-center">
                              {isBusy ? <CalendarOff className="w-4 h-4 text-red-600" /> : ""}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc chắn muốn xóa giáo viên này không? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeacher} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
