import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          include: {
            class: true,
            subject: true,
          },
        },
        busySlots: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Không tìm thấy giáo viên' }, { status: 404 });
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin giáo viên:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy thông tin giáo viên' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const teacher = await prisma.teacher.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Lỗi khi cập nhật giáo viên:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi cập nhật giáo viên' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.teacher.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Đã xóa giáo viên thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa giáo viên:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa giáo viên' }, { status: 500 });
  }
}
