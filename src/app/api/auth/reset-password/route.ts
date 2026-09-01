import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Thiếu thông tin.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 8 ký tự.' }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken || verificationToken.expires < new Date() || !verificationToken.identifier.startsWith('reset:')) {
      return NextResponse.json({ error: 'Token không hợp lệ hoặc đã hết hạn.' }, { status: 400 });
    }

    const email = verificationToken.identifier.replace('reset:', '');

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    });

    return NextResponse.json({ message: 'Đặt lại mật khẩu thành công.' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra.' }, { status: 500 });
  }
}
