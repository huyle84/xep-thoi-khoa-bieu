'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';

const resetSchema = z.object({
  newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  // Nếu không có token → báo lỗi
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <XCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Link không hợp lệ</h1>
          <p className="text-gray-600 mb-6">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
          <Link href="/forgot-password"
            className="inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition text-center">
            Yêu cầu link mới
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: data.newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || 'Đã có lỗi xảy ra.');
        setStatus('error');
      } else {
        setStatus('success');
        setTimeout(() => router.push('/login'), 2500);
      }
    } catch {
      setErrorMsg('Không thể kết nối. Vui lòng thử lại.');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Đặt lại mật khẩu thành công!</h1>
          <p className="text-gray-600 mb-6">Đang chuyển hướng về trang đăng nhập...</p>
          <Loader2 className="animate-spin mx-auto text-blue-500" size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
          <p className="text-gray-500 text-sm">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('newPassword')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Tối thiểu 8 ký tự"
              />
              <button type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
