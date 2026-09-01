"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, CalendarX2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function TeachersPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock data
  const teachers = [
    { id: 1, code: "GV01", name: "Nguyễn Văn A", maxPeriods: 18, assigned: 16, busySlots: 2 },
    { id: 2, code: "GV02", name: "Trần Thị B", maxPeriods: 18, assigned: 18, busySlots: 0 },
    { id: 3, code: "GV03", name: "Lê Văn C", maxPeriods: 18, assigned: 20, busySlots: 4 },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    toast({ title: "Thành công", description: "Đã lưu thông tin giáo viên." });
  };

  const getProgressColor = (assigned: number, max: number) => {
    const ratio = assigned / max;
    if (ratio > 1) return "bg-red-600";
    if (ratio >= 0.8) return "bg-yellow-500";
    return "bg-green-600";
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <Header title="Quản lý Giáo viên">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Thêm giáo viên
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm/Sửa giáo viên</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Mã GV</Label>
                <Input id="code" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Họ tên</Label>
                <Input id="name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxPeriods" className="text-right">Số tiết tối đa/tuần</Label>
                <Input id="maxPeriods" type="number" defaultValue={18} className="col-span-3" required min={1} />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Lưu thay đổi</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Header>
      
      <div className="p-6 flex-1 overflow-auto">
        <div className="rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GV</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead className="text-center">Định mức (tiết/tuần)</TableHead>
                <TableHead className="text-center">Đã phân công</TableHead>
                <TableHead className="w-[200px]">Tải công việc</TableHead>
                <TableHead className="text-center">Tiết bận</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.code}</TableCell>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell className="text-center">{teacher.maxPeriods}</TableCell>
                  <TableCell className="text-center font-medium">{teacher.assigned}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <Progress 
                        value={Math.min((teacher.assigned / teacher.maxPeriods) * 100, 100)} 
                        className="h-2" 
                        indicatorColor={getProgressColor(teacher.assigned, teacher.maxPeriods)}
                      />
                      <span className="text-xs text-muted-foreground text-right">
                        {Math.round((teacher.assigned / teacher.maxPeriods) * 100)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarX2 className="w-4 h-4" />
                      {teacher.busySlots} tiết bận
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa giáo viên này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Các phân công của giáo viên này sẽ bị gỡ bỏ.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
