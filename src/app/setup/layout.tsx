'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200 py-3 px-6 flex items-center justify-between">
        {/* Back to dashboard */}
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay về menu chính
        </Link>

        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Thiết lập hệ thống</h1>
        </div>

        {/* Right spacer to center title */}
        <div className="w-32" />
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
