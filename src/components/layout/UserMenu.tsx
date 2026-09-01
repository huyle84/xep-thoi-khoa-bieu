'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, Settings, LogOut } from 'lucide-react';

export default function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const initials = session.user.name 
    ? session.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
          {session.user.image ? (
            <img src={session.user.image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="hidden md:block text-sm text-left">
          <p className="font-medium text-gray-700 leading-tight">{session.user.name}</p>
          <p className="text-xs text-gray-500 leading-tight truncate max-w-[120px]">{session.user.email}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-100 z-50">
          <div className="px-4 py-2 border-b border-gray-100 md:hidden">
            <p className="font-medium text-gray-800">{session.user.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
          </div>
          
          <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <User size={16} className="mr-2 text-gray-400" />
            Hồ sơ cá nhân
          </Link>
          
          <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <Settings size={16} className="mr-2 text-gray-400" />
            Cài đặt
          </Link>
          
          <div className="border-t border-gray-100 my-1"></div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
          >
            <LogOut size={16} className="mr-2 text-red-400" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
