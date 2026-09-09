import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const subjectPeriods = await prisma.subjectPeriod.findMany({
      include: {
        subject: true,
        gradeBlock: true,
      },
    });
    return NextResponse.json(subjectPeriods);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách số tiết:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy danh sách số tiết' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { subjectId, gradeBlockId, periodsPerWeek } = data;

    if (!subjectId || !gradeBlockId || periodsPerWeek === undefined) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const subjectPeriod = await prisma.subjectPeriod.upsert({
      where: {
        subjectId_gradeBlockId: {
          subjectId,
          gradeBlockId,
        },
      },
      update: {
        periodsPerWeek,
      },
      create: {
        subjectId,
        gradeBlockId,
        periodsPerWeek,
      },
      include: {
        subject: true,
        gradeBlock: true,
      },
    });

    return NextResponse.json(subjectPeriod, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo/cập nhật số tiết:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tạo/cập nhật số tiết' }, { status: 500 });
  }
}
