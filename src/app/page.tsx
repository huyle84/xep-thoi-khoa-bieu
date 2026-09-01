import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  CalendarCheck, 
  ClipboardList,
  Wand2,
  Calendar,
  Activity
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch config and stats
  const [configRes, statsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/config`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/stats`, { cache: 'no-store' }).catch(() => null)
  ]);

  const config = configRes.ok ? await configRes.json() : { setupCompleted: true };
  const stats = statsRes && statsRes.ok ? await statsRes.json() : {
    gradeBlocks: 3,
    classes: 15,
    subjects: 12,
    teachers: 25,
    assignments: 120,
    periodsScheduled: 450
  };

  return (
    <div className="space-y-6">
      {!config.setupCompleted && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="flex-shrink-0">
                <Wand2 className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Thiết lập hệ thống chưa hoàn tất</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Vui lòng hoàn thành các bước thiết lập cơ bản để bắt đầu sử dụng phần mềm.</p>
                </div>
              </div>
            </div>
            <div>
              <Link
                href="/setup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Tới trang thiết lập
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
        <div className="flex space-x-3">
          <Link href="/setup" className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Wand2 className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Wizard thiết lập
          </Link>
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            <Calendar className="-ml-1 mr-2 h-5 w-5" />
            Xem TKB
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
            <CalendarCheck className="-ml-1 mr-2 h-5 w-5" />
            Xếp TKB tự động
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Khối học" value={stats.gradeBlocks} icon={Layers} color="bg-blue-500" />
        <StatCard title="Lớp học" value={stats.classes} icon={Users} color="bg-green-500" />
        <StatCard title="Môn học" value={stats.subjects} icon={BookOpen} color="bg-purple-500" />
        <StatCard title="Giáo viên" value={stats.teachers} icon={GraduationCap} color="bg-orange-500" />
        <StatCard title="Phân công" value={stats.assignments} icon={ClipboardList} color="bg-red-500" />
        <StatCard title="Tiết đã xếp" value={stats.periodsScheduled} icon={CalendarCheck} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Thống kê phân công theo khối</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="w-16 text-sm font-medium">Khối 10</span>
              <div className="flex-1 ml-4 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: '45%' }}></div>
              </div>
              <span className="ml-4 text-sm text-gray-500">45/100</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 text-sm font-medium">Khối 11</span>
              <div className="flex-1 ml-4 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: '60%' }}></div>
              </div>
              <span className="ml-4 text-sm text-gray-500">60/100</span>
            </div>
            <div className="flex items-center">
              <span className="w-16 text-sm font-medium">Khối 12</span>
              <div className="flex-1 ml-4 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: '30%' }}></div>
              </div>
              <span className="ml-4 text-sm text-gray-500">30/100</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-gray-400" />
            Hoạt động gần đây
          </h2>
          <ul className="divide-y divide-gray-200">
            <li className="py-3">
              <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Cập nhật phân công chuyên môn</h3>
                    <p className="text-sm text-gray-500">1 giờ trước</p>
                  </div>
                  <p className="text-sm text-gray-500">Nguyễn Văn A đã cập nhật phân công cho giáo viên Trần Thị B</p>
                </div>
              </div>
            </li>
            <li className="py-3">
              <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Thêm lớp mới</h3>
                    <p className="text-sm text-gray-500">3 giờ trước</p>
                  </div>
                  <p className="text-sm text-gray-500">Đã thêm lớp 10A1 vào Khối 10</p>
                </div>
              </div>
            </li>
            <li className="py-3">
              <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Thay đổi cấu hình tiết học</h3>
                    <p className="text-sm text-gray-500">Hôm qua</p>
                  </div>
                  <p className="text-sm text-gray-500">Quản trị viên đã thay đổi giờ bắt đầu tiết 1 buổi sáng</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${color} text-white`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
