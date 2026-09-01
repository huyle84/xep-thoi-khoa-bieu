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

export default function ClassesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const classes = [
    { id: 1, grade: 10, name: "10A1", roomId: "P101", subjectCount: 12 },
    { id: 2, grade: 10, name: "10A2", roomId: "P102", subjectCount: 12 },
    { id: 3, grade: 11, name: "11A1", roomId: "P201", subjectCount: 13 },
  ];

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <Header title="Quản lý Lớp học">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Thêm lớp học
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm/Sửa lớp học</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" onSubmit={(e) => { e.preventDefault(); setIsOpen(false); toast({title:"Đã lưu"}); }}>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">Khối</Label>
                <div className="col-span-3">
                  <Select defaultValue="10">
                    <SelectTrigger><SelectValue placeholder="Chọn khối" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Khối 10</SelectItem>
                      <SelectItem value="11">Khối 11</SelectItem>
                      <SelectItem value="12">Khối 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Tên lớp</Label>
                <Input id="name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="room" className="text-right">Phòng cố định</Label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Chọn phòng" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P101">Phòng 101</SelectItem>
                      <SelectItem value="P102">Phòng 102</SelectItem>
                    </SelectContent>
                  </Select>
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
                <TableHead>Khối</TableHead>
                <TableHead>Tên lớp</TableHead>
                <TableHead>Phòng cố định</TableHead>
                <TableHead className="text-center">Số môn học</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>Khối {cls.grade}</TableCell>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.roomId}</TableCell>
                  <TableCell className="text-center">{cls.subjectCount}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
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
