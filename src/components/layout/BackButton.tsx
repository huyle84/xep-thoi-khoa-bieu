'use client';

import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: 'default' | 'minimal';
}

export default function BackButton({
  href = '/',
  label = 'Quay về menu chính',
  variant = 'default',
}: BackButtonProps) {
  if (variant === 'minimal') {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
    >
      <Home className="w-4 h-4" />
      {label}
    </Link>
  );
}
