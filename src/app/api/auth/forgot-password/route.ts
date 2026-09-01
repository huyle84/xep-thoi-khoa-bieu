import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email là bắt buộc.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists, just return success
      return NextResponse.json({ message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' });
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token,
        expires
      }
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Xin chào,</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu tại TKB Manager.</p>
        <p>Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: 'TKB Manager <noreply@resend.dev>',
        to: email,
        subject: 'Đặt lại mật khẩu - TKB Manager',
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
    }

    return NextResponse.json({ message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.' });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra.' }, { status: 500 });
  }
}
