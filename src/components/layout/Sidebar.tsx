"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Home, Layers, Users, BookOpen, GraduationCap, UserCheck,
  ClipboardList, Calendar, Clock, Wand2, Settings, BarChart2,
  Lock, ChevronDown, ChevronRight, LogOut, Grid, Database,
} from "lucide-react";


const MENU_GROUPS = [
  {
    label: "Khai báo",
    items: [
      { name: "Tổng quan",    href: "/",             icon: Home },
      { name: "Khối học",     href: "/grade-blocks", icon: Layers },
      { name: "Lớp học",      href: "/classes",      icon: Users },
      { name: "Tiết học",     href: "/period-configs", icon: Clock },
      { name: "Môn học",      href: "/subjects",     icon: BookOpen },
      { name: "Giáo viên",    href: "/teachers",     icon: GraduationCap },
    ],
  },
  {
    label: "Xếp lịch",
    items: [
      { name: "GVCN",          href: "/homeroom",       icon: UserCheck },
      { name: "Phân công GD",  href: "/assignments",    icon: ClipboardList },
      { name: "Khối-Môn-Tiết", href: "/khoi-mon-tiet",  icon: Grid },
      { name: "Phân tích PCCM",href: "/analysis",       icon: BarChart2 },
      { name: "Xếp TKB",       href: "/schedule",       icon: Calendar },
    ],
  },
  {
    label: "Cấu hình",
    items: [
      { name: "Tiết cố định",  href: "/fixed-periods",   icon: Lock },
      { name: "Giới hạn tiết", href: "/teacher-limits",  icon: Settings },
      { name: "Cài đặt chung", href: "/config",           icon: Settings },
      { name: "Sao lưu TKB",   href: "/backup",           icon: Database },
    ],
  },
];

function NavItem({ href, name, icon: Icon }: { href: string; name: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? "bg-gray-900 text-white"
          : "text-gray-300 hover:bg-gray-700 hover:text-white"
      }`}
    >
      <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`} />
      {name}
    </Link>
  );
}

export default function Sidebar() {
  const { data: session } = useSession();
  const [setupCompleted, setSetupCompleted] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.json())
      .then(d => { if (d?.setupCompleted !== undefined) setSetupCompleted(d.setupCompleted); })
      .catch(() => {});
  }, []);

  const toggleGroup = (label: string) =>
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className="flex flex-col flex-grow bg-gray-800 pt-5 pb-4 overflow-y-auto w-64 h-screen fixed">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 mb-6">
        <Calendar className="h-7 w-7 text-indigo-400 mr-2" />
        <span className="text-white text-lg font-bold">TKB Manager</span>
      </div>

      {/* Setup wizard banner */}
      {!setupCompleted && (
        <Link href="/setup" className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg text-white text-xs font-medium transition-colors">
          <Wand2 className="h-4 w-4 flex-shrink-0" />
          <span>Hoàn thành thiết lập</span>
          <span className="ml-auto bg-red-400 rounded-full px-1.5 py-0.5 text-[10px]">Mới</span>
        </Link>
      )}

      {/* Navigation groups */}
      <nav className="flex-1 px-2 space-y-1">
        {MENU_GROUPS.map(group => (
          <div key={group.label} className="mb-2">
            <button
              onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
            >
              {group.label}
              {collapsed[group.label]
                ? <ChevronRight className="h-3 w-3" />
                : <ChevronDown className="h-3 w-3" />}
            </button>

            {!collapsed[group.label] && (
              <div className="space-y-0.5 mt-0.5">
                {group.items.map(item => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Setup wizard link */}
        <div className="mt-4 border-t border-gray-700 pt-4">
          <NavItem href="/setup" name="Setup Wizard" icon={Wand2} />
        </div>
      </nav>

      {/* User info */}
      {session?.user && (
        <div className="flex-shrink-0 border-t border-gray-700 p-4">
          <Link href="/profile" className="flex items-center mb-2 group">
            <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500 text-white text-sm font-bold flex-shrink-0">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name || session.user.email}</p>
              <p className="text-xs text-gray-400">{(session.user as any).role || "User"}</p>
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-400 hover:text-red-300 hover:bg-gray-700 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
