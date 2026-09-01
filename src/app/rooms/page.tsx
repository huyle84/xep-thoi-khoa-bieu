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
import { Badge } from "@/components/ui/badge";

export default function RoomsPage() {
  const [isOpen, setIsOpen] = useState(false);
  
  const rooms = [
    { id: 1, name: "Phòng 101", type: "NORMAL", capacity: 45, assignedClasses: ["10A1"] },
    { id: 2, name: "Phòng Máy tính 1", type: "COMPUTER", capacity: 30, assignedClasses: [] },
    { id: 3, name: "Phòng Hóa học", type: "LAB", capacity: 40, assignedClasses: [] },
  ];

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'NORMAL': return <Badge variant="outline" className="bg-gray-100">Phòng thường</Badge>;
      case 'COMPUTER': return <Badge variant="outline" className="bg-blue-100 text-blue-700">Phòng máy</Badge>;
      case 'LAB': return <Badge variant="outline" className="bg-purple-100 text-purple-700">Thực hành</Badge>;
      case 'GYM': return <Badge variant="outline" className="bg-orange-100 text-orange-700">Đa năng</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <Header title="Quản lý Phòng học">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Thêm phòng học
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm/Sửa phòng học</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" onSubmit={(e) => { e.preventDefault(); setIsOpen(false); }}>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Tên phòng</Label>
                <Input id="name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Loại phòng</Label>
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
                <Label htmlFor="capacity" className="text-right">Sức chứa</Label>
                <Input id="capacity" type="number" defaultValue={45} className="col-span-3" required />
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
                <TableHead>Tên phòng</TableHead>
                <TableHead>Loại phòng</TableHead>
                <TableHead className="text-center">Sức chứa</TableHead>
                <TableHead>Lớp học cố định</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>{getTypeBadge(room.type)}</TableCell>
                  <TableCell className="text-center">{room.capacity}</TableCell>
                  <TableCell>
                    {room.assignedClasses.length > 0 
                      ? room.assignedClasses.join(", ")
                      : <span className="text-gray-400 italic">Chưa gắn</span>
                    }
                  </TableCell>
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
