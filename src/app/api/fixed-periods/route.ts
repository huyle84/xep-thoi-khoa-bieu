import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const fixedPeriods = await prisma.fixedPeriod.findMany({
      include: {
        subject: true,
        gradeBlock: true,
      },
    });
    return NextResponse.json(fixedPeriods);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tiết cố định:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy danh sách tiết cố định' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { subjectId, gradeBlockId, dayOfWeek, period } = data;

    if (!subjectId || !gradeBlockId || !dayOfWeek || !period) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const fixedPeriod = await prisma.fixedPeriod.upsert({
      where: {
        gradeBlockId_dayOfWeek_period: {
          gradeBlockId,
          dayOfWeek,
          period,
        },
      },
      update: {
        subjectId,
      },
      create: {
        subjectId,
        gradeBlockId,
        dayOfWeek,
        period,
      },
      include: {
        subject: true,
        gradeBlock: true,
      },
    });

    return NextResponse.json(fixedPeriod, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo/cập nhật tiết cố định:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tạo/cập nhật tiết cố định' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID tiết cố định' }, { status: 400 });
    }

    await prisma.fixedPeriod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa tiết cố định:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa tiết cố định' }, { status: 500 });
  }
}
