"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  Users, 
  School, 
  Building2, 
  ClipboardList, 
  Calendar, 
  Settings,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Tổng quan", href: "/", icon: Home },
  { name: "Môn học", href: "/subjects", icon: BookOpen },
  { name: "Giáo viên", href: "/teachers", icon: Users },
  { name: "Lớp học", href: "/classes", icon: School },
  { name: "Phòng học", href: "/rooms", icon: Building2 },
  { name: "Phân công", href: "/assignments", icon: ClipboardList },
  { name: "Thời khóa biểu", href: "/schedule", icon: Calendar },
  { name: "Cài đặt", href: "/config", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white shadow-sm">
      <div className="flex h-16 items-center px-6 border-b">
        <CalendarDays className="h-6 w-6 text-blue-600 mr-2" />
        <span className="text-lg font-bold text-gray-900">TKB Manager</span>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-900">Năm học 2024-2025</p>
          <p className="text-xs text-gray-500 mt-1">Học kỳ 1</p>
        </div>
      </div>
    </div>
  );
}
