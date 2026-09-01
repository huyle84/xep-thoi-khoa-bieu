import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
      include: { assignments: true },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Không tìm thấy môn học' }, { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin môn học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy thông tin môn học' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const subject = await prisma.subject.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(subject);
  } catch (error) {
    console.error('Lỗi khi cập nhật môn học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi cập nhật môn học' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Không tìm thấy môn học' }, { status: 404 });
    }

    if (subject._count.assignments > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa môn học đã có phân công giảng dạy' },
        { status: 400 }
      );
    }

    await prisma.subject.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Đã xóa môn học thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa môn học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa môn học' }, { status: 500 });
  }
}
