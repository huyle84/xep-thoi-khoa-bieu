"use client";

import React from "react";
import { UserCircle } from "lucide-react";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export default function Header({ title, children }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {children}
        </div>
        <div className="h-6 w-px bg-gray-200"></div>
        <div className="flex items-center space-x-2">
          <UserCircle className="h-8 w-8 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
}
