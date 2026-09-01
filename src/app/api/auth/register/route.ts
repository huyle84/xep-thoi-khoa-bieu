import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 8 ký tự.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email này đã được sử dụng.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });

    const token = randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    const appUrl = process.env.NEXTAUTH_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;


    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Xin chào ${name},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại TKB Manager.</p>
        <p>Vui lòng click vào link bên dưới để xác thực địa chỉ email của bạn:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">Xác thực email</a>
        <p>Link này sẽ hết hạn sau 24 giờ.</p>
        <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: 'TKB Manager <noreply@resend.dev>',
        to: email,
        subject: 'Xác thực email - TKB Manager',
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // We still return success as user was created, but maybe they'll need to request a new token
    }

    return NextResponse.json({
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
