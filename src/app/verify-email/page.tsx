'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          {error === 'invalid' ? (
            <XCircle className="text-red-500" size={64} />
          ) : (
            <CheckCircle className="text-green-500" size={64} />
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {error === 'invalid' ? 'Xác thực thất bại' : 'Xác thực thành công'}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {error === 'invalid' 
            ? 'Link xác thực không hợp lệ hoặc đã hết hạn.' 
            : 'Email đã được xác thực! Bạn có thể đăng nhập.'}
        </p>

        <Link
          href="/login"
          className="inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
        >
          Đến trang đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-500">Đang kiểm tra...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
