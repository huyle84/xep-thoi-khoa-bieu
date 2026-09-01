import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        room: true,
        _count: {
          select: { assignments: true },
        },
      },
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách lớp học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy danh sách lớp học' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, grade, roomId } = data;

    if (!name || !grade) {
      return NextResponse.json({ error: 'Tên và khối lớp là bắt buộc' }, { status: 400 });
    }

    if (grade < 10 || grade > 12) {
      return NextResponse.json({ error: 'Khối lớp phải từ 10 đến 12' }, { status: 400 });
    }

    const existingClass = await prisma.class.findFirst({
      where: {
        name,
        grade,
      },
    });

    if (existingClass) {
      return NextResponse.json({ error: `Lớp ${name} đã tồn tại trong khối ${grade}` }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        roomId: roomId || null,
      },
      include: {
        room: true,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo lớp học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tạo lớp học' }, { status: 500 });
  }
}
