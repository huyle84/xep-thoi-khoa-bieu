"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssignmentsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const assignments = [
    { class: "10A1", subjects: { "Toán": { teacher: "Nguyễn Văn A", periods: 4 }, "Ngữ văn": null } },
    { class: "10A2", subjects: { "Toán": null, "Ngữ văn": { teacher: "Trần Thị B", periods: 4 } } },
  ];

  const getProgressColor = (assigned: number, max: number) => {
    const ratio = assigned / max;
    if (ratio > 1) return "bg-red-600";
    if (ratio >= 0.8) return "bg-yellow-500";
    return "bg-green-600";
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <Header title="Phân công chuyên môn">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Thêm phân công
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Phân công giáo viên</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 py-4" onSubmit={(e) => { e.preventDefault(); setIsOpen(false); toast({title:"Thành công"}); }}>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Lớp</Label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10A1">10A1</SelectItem>
                      <SelectItem value="10A2">10A2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Môn học</Label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Chọn môn" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOAN">Toán học</SelectItem>
                      <SelectItem value="VAN">Ngữ văn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Giáo viên</Label>
                <div className="col-span-3">
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Chọn giáo viên" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GV01">Nguyễn Văn A</SelectItem>
                      <SelectItem value="GV02">Trần Thị B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Số tiết/tuần</Label>
                <Input type="number" defaultValue={4} className="col-span-3" required />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit">Lưu phân công</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Header>
      
      <div className="p-6 flex-1 overflow-auto flex flex-col lg:flex-row gap-6">
        <div className="flex-1 rounded-md border bg-white shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px] bg-gray-50 sticky left-0 z-10">Lớp \ Môn</TableHead>
                <TableHead className="text-center min-w-[180px]">Toán học</TableHead>
                <TableHead className="text-center min-w-[180px]">Ngữ văn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-bold bg-gray-50 sticky left-0 z-10 border-r">{row.class}</TableCell>
                  {["Toán", "Ngữ văn"].map(sub => (
                    <TableCell key={sub} className="text-center p-2 border-r">
                      {row.subjects[sub as keyof typeof row.subjects] ? (
                        <div className="flex flex-col items-center gap-1 group relative bg-blue-50/50 p-2 rounded-md border border-blue-100">
                          <span className="font-medium text-sm text-blue-900">
                            {row.subjects[sub as keyof typeof row.subjects]?.teacher}
                          </span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            {row.subjects[sub as keyof typeof row.subjects]?.periods} tiết
                          </span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 rounded-full">
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-blue-600 border border-dashed border-gray-200" onClick={() => setIsOpen(true)}>
                          <Plus className="h-4 w-4 mr-1" /> Thêm
                        </Button>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="w-full lg:w-[350px] shrink-0">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base">Tải công việc giáo viên</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {[
                { name: "Nguyễn Văn A", assigned: 16, max: 18 },
                { name: "Trần Thị B", assigned: 18, max: 18 },
                { name: "Lê Văn C", assigned: 20, max: 18 },
              ].map(t => (
                <div key={t.name} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground">{t.assigned}/{t.max} tiết</span>
                  </div>
                  <Progress 
                    value={Math.min((t.assigned / t.max) * 100, 100)} 
                    className="h-2" 
                    indicatorColor={getProgressColor(t.assigned, t.max)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
