import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        gradeBlock: true,
        room: true,
        homeroom: { include: { teacher: true } },
        _count: { select: { assignments: true } },
      },
      orderBy: [{ gradeBlockId: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(classes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Lỗi lấy danh sách lớp' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, gradeBlockId, capacity } = data;

    if (!name || !gradeBlockId) {
      return NextResponse.json({ error: 'Tên lớp và khối là bắt buộc' }, { status: 400 });
    }

    // Lấy gradeBlock để biết gradeNum
    const block = await prisma.gradeBlock.findUnique({ where: { id: gradeBlockId } });
    if (!block) {
      return NextResponse.json({ error: 'Không tìm thấy khối' }, { status: 404 });
    }

    const existing = await prisma.class.findFirst({
      where: { name, gradeBlockId },
    });
    if (existing) {
      return NextResponse.json({ error: `Lớp ${name} đã tồn tại trong khối này` }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade: block.gradeNum,
        gradeBlockId,
        roomId: null,
      },
      include: { gradeBlock: true, room: true },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Lỗi tạo lớp' }, { status: 500 });
  }
}
