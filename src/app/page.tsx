import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, School, Calendar, Play, Eye, Download } from "lucide-react";

export default function DashboardPage() {
  // Mock data for initial render
  const stats = [
    { name: "Tổng số môn học", value: "24", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Tổng số giáo viên", value: "45", icon: Users, color: "text-green-600", bg: "bg-green-100" },
    { name: "Tổng số lớp học", value: "18", icon: School, color: "text-purple-600", bg: "bg-purple-100" },
    { name: "Tổng số tiết TKB", value: "1,240", icon: Calendar, color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="flex h-full flex-col">
      <Header title="Tổng quan" />
      
      <div className="p-6 space-y-6 flex-1 overflow-auto">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Xin chào, Admin!</h2>
            <p className="text-muted-foreground mt-1">Chào mừng bạn trở lại hệ thống quản lý thời khóa biểu.</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              Xem TKB
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Play className="w-4 h-4 fill-current" />
              Xếp TKB tự động
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cảnh báo xung đột (0)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-green-100 text-green-600 p-3 rounded-full mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <p className="text-sm font-medium text-gray-900">Hệ thống đang hoạt động tốt</p>
              <p className="text-xs text-gray-500 mt-1">Không phát hiện xung đột nào trong phân công và thời khóa biểu hiện tại.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
