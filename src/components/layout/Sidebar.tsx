"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { 
  Home, 
  Layers, 
  Users, 
  BookOpen, 
  GraduationCap, 
  UserCheck, 
  ClipboardList, 
  Calendar, 
  Clock, 
  Wand2 
} from "lucide-react";

const navigation = [
  { name: "Tổng quan", href: "/", icon: Home },
  { name: "Khối học", href: "/grade-blocks", icon: Layers },
  { name: "Lớp học", href: "/classes", icon: Users },
  { name: "Môn học", href: "/subjects", icon: BookOpen },
  { name: "Giáo viên", href: "/teachers", icon: GraduationCap },
  { name: "GVCN", href: "/homeroom", icon: UserCheck },
  { name: "Phân công", href: "/assignments", icon: ClipboardList },
  { name: "Cấu hình Tiết", href: "/period-configs", icon: Clock },
  { name: "Thời khóa biểu", href: "/timetable", icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [setupCompleted, setSetupCompleted] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.setupCompleted !== undefined) {
          setSetupCompleted(data.setupCompleted);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex flex-col flex-grow bg-gray-800 pt-5 pb-4 overflow-y-auto w-64 h-screen fixed">
      <div className="flex items-center flex-shrink-0 px-4">
        <span className="text-white text-xl font-bold">Xếp TKB V2</span>
      </div>
      <div className="mt-8 flex-1 flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <item.icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
          
          <Link
            href="/setup"
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mt-4 ${
              pathname === "/setup"
                ? "bg-indigo-800 text-white"
                : "text-indigo-300 hover:bg-indigo-700 hover:text-white"
            }`}
          >
            <Wand2
              className={`mr-3 flex-shrink-0 h-6 w-6 ${
                pathname === "/setup" ? "text-white" : "text-indigo-400 group-hover:text-indigo-300"
              }`}
              aria-hidden="true"
            />
            Setup Wizard
            {!setupCompleted && (
              <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-red-500 text-white">
                Mới
              </span>
            )}
          </Link>
        </nav>
      </div>
      
      {session?.user && (
        <div className="flex-shrink-0 flex bg-gray-700 p-4">
          <Link href="/profile" className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-indigo-500 text-white font-medium">
                  {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{session.user.name || session.user.email}</p>
                <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200 truncate">
                  {(session.user as any).role || 'User'}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
