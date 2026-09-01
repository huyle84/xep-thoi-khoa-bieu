import React from 'react';

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200 py-4 px-6 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            TKB
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Thiết lập hệ thống</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
