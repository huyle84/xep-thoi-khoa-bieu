import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const classData = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          include: {
            subject: true,
            teacher: true,
          },
        },
        room: true,
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Không tìm thấy lớp học' }, { status: 404 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin lớp học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy thông tin lớp học' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data,
      include: { room: true },
    });
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Lỗi khi cập nhật lớp học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi cập nhật lớp học' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.class.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Đã xóa lớp học thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa lớp học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa lớp học' }, { status: 500 });
  }
}
