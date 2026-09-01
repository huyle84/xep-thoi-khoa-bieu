"use client";

import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ConfigPage() {
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Thành công", description: "Đã lưu cấu hình trường học." });
  };

  return (
    <div className="flex h-full flex-col bg-gray-50/50">
      <Header title="Cài đặt hệ thống" />
      
      <div className="p-6 flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <form onSubmit={handleSave}>
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chung</CardTitle>
                <CardDescription>Cấu hình thông tin cơ bản của trường học</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Tên trường</Label>
                  <Input id="schoolName" defaultValue="Trường THPT Chuyên" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Năm học</Label>
                  <Select defaultValue="2024-2025">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023-2024">2023-2024</SelectItem>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Thông số xếp TKB</CardTitle>
                <CardDescription>Thiết lập số tiết học và ngày làm việc trong tuần</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="morningPeriods">Số tiết buổi sáng</Label>
                    <Input id="morningPeriods" type="number" defaultValue={5} min={1} max={6} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="afternoonPeriods">Số tiết buổi chiều</Label>
                    <Input id="afternoonPeriods" type="number" defaultValue={4} min={0} max={6} required />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Label>Ngày làm việc trong tuần</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"].map((day, i) => (
                      <label key={i} className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 [&:has(:checked)]:border-blue-600 [&:has(:checked)]:bg-blue-50">
                        <input type="checkbox" className="sr-only" defaultChecked />
                        <span className="text-sm font-medium">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end">
              <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Lưu cấu hình
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
