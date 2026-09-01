import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Lấy dữ liệu trực tiếp từ DB - không dùng fetch nội bộ
  const [config, gradeBlockCount, classCount, subjectCount, teacherCount, assignmentCount, scheduleCount] =
    await Promise.all([
      prisma.schoolConfig.findFirst(),
      prisma.gradeBlock.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.teacher.count(),
      prisma.teachingAssignment.count(),
      prisma.scheduleEntry.count(),
    ]);

  const setupCompleted = config?.setupCompleted ?? false;

  return (
    <div className="space-y-6">
      {!setupCompleted && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex">
              <Wand2 className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Thiết lập hệ thống chưa hoàn tất</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Vui lòng hoàn thành các bước thiết lập cơ bản để bắt đầu sử dụng phần mềm.
                </p>
              </div>
            </div>
            <Link
              href="/setup"
              className="ml-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200"
            >
              Tới trang thiết lập →
            </Link>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Xin chào, <strong>{session.user?.name || session.user?.email}</strong>!
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/setup"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Wand2 className="-ml-1 mr-2 h-4 w-4 text-gray-400" />
            Wizard thiết lập
          </Link>
          <Link
            href="/schedule"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Calendar className="-ml-1 mr-2 h-4 w-4" />
            Xem TKB
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard title="Khối học" value={gradeBlockCount} icon={Layers} color="bg-blue-500" />
        <StatCard title="Lớp học" value={classCount} icon={Users} color="bg-green-500" />
        <StatCard title="Môn học" value={subjectCount} icon={BookOpen} color="bg-purple-500" />
        <StatCard title="Giáo viên" value={teacherCount} icon={GraduationCap} color="bg-orange-500" />
        <StatCard title="Phân công" value={assignmentCount} icon={ClipboardList} color="bg-red-500" />
        <StatCard title="Tiết đã xếp" value={scheduleCount} icon={CalendarCheck} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Bắt đầu nhanh</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/grade-blocks', label: '1. Thiết lập Khối', icon: Layers, color: 'text-blue-600 bg-blue-50' },
              { href: '/classes', label: '2. Thêm Lớp học', icon: Users, color: 'text-green-600 bg-green-50' },
              { href: '/subjects', label: '3. Môn học', icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
              { href: '/teachers', label: '4. Giáo viên', icon: GraduationCap, color: 'text-orange-600 bg-orange-50' },
              { href: '/assignments', label: '5. Phân công', icon: ClipboardList, color: 'text-red-600 bg-red-50' },
              { href: '/schedule', label: '6. Xếp TKB', icon: CalendarCheck, color: 'text-teal-600 bg-teal-50' },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href}
                className={`flex items-center p-3 rounded-lg border hover:shadow-sm transition-shadow ${color}`}>
                <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin hệ thống</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">Tên trường</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{config?.schoolName || 'Chưa cấu hình'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">Năm học</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{config?.academicYear || '2025-2026'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">Số tiết/buổi sáng</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{config?.morningPeriods ?? 5} tiết</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 uppercase tracking-wide">Số tiết/buổi chiều</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{config?.afternoonPeriods ?? 5} tiết</dd>
            </div>
            <div className="pt-3 border-t">
              <Link href="/config" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Cấu hình hệ thống →
              </Link>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string; value: number; icon: any; color: string;
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-md ${color} text-white flex-shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="ml-3 min-w-0">
            <dt className="text-xs font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-xl font-bold text-gray-900">{value}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}
