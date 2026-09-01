import { auth } from "@/lib/auth";
import UserMenu from "@/components/layout/UserMenu";
import { Bell, Search } from "lucide-react";

import React from "react";

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export default async function Header({ title, children }: HeaderProps) {
  const session = await auth();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-200">
      <div className="flex-1 flex items-center">
        {title && <h1 className="text-xl font-semibold text-gray-900 mr-4">{title}</h1>}
        {children}
        <div className="w-full flex md:ml-4">
          <label htmlFor="search-field" className="sr-only">
            Tìm kiếm
          </label>
          <div className="relative w-full text-gray-400 focus-within:text-gray-600">
            <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <input
              id="search-field"
              className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
              placeholder="Tìm kiếm..."
              type="search"
              name="search"
            />
          </div>
        </div>
      </div>
      <div className="ml-4 flex items-center md:ml-6 space-x-4">
        <button
          type="button"
          className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="sr-only">Xem thông báo</span>
          <Bell className="h-6 w-6" aria-hidden="true" />
        </button>

        {session && session.user && (
          <UserMenu />
        )}
      </div>
    </header>
  );
}
