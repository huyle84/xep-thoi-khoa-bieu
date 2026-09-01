"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function SubjectsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock data
  const subjects = [
    { id: 1, code: "TOAN", name: "Toán học", periods: 4, maxPerDay: 2, roomType: "NORMAL", isCore: true, color: "#ef4444" },
    { id: 2, code: "VAN", name: "Ngữ văn", periods: 4, maxPerDay: 2, roomType: "NORMAL", isCore: true, color: "#3b82f6" },
    { id: 3, code: "TIN", name: "Tin học", periods: 2, maxPerDay: 2, roomType: "COMPUTER", isCore: false, color: "#10b981" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    toast({ title: "Thành công", description: "Đã lưu thông tin môn học." });
  };

  const handleDelete = () => {
    toast({ title: "Thành công", description: "Đã xóa môn học." });
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <Header title="Quản lý Môn học">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Thêm môn học
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm/Sửa môn học</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Mã môn</Label>
                <Input id="code" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Tên môn</Label>
                <Input id="name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="periods" className="text-right">Tiết/Tuần</Label>
                <Input id="periods" type="number" className="col-span-3" required min={1} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxPerDay" className="text-right">Tối đa/Ngày</Label>
                <Input id="maxPerDay" type="number" className="col-span-3" required min={1} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="roomType" className="text-right">Loại phòng</Label>
                <div className="col-span-3">
                  <Select defaultValue="NORMAL">
                    <SelectTrigger><SelectValue placeholder="Chọn loại phòng" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Phòng học thường</SelectItem>
                      <SelectItem value="COMPUTER">Phòng máy tính</SelectItem>
                      <SelectItem value="LAB">Phòng thực hành</SelectItem>
                      <SelectItem value="GYM">Nhà đa năng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Tùy chọn</Label>
                <div className="col-span-3 flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm">Môn chính</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="color" className="w-8 h-8 rounded border-none p-0 cursor-pointer" defaultValue="#3b82f6" />
                    <span className="text-sm">Màu sắc</span>
                  </label>
                </div>
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
                <TableHead>Mã môn</TableHead>
                <TableHead>Tên môn</TableHead>
                <TableHead className="text-center">Số tiết/tuần</TableHead>
                <TableHead className="text-center">Tối đa/ngày</TableHead>
                <TableHead>Loại phòng</TableHead>
                <TableHead className="text-center">Môn chính</TableHead>
                <TableHead>Màu</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.code}</TableCell>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell className="text-center">{subject.periods}</TableCell>
                  <TableCell className="text-center">{subject.maxPerDay}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{subject.roomType}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {subject.isCore ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Có</Badge> : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: subject.color }}></div>
                  </TableCell>
                  <TableCell className="text-right">
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
                          <AlertDialogTitle>Xóa môn học này?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Môn học và các phân công liên quan sẽ bị xóa.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
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
