import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const classId = searchParams.get('classId');
    const teacherId = searchParams.get('teacherId');
    const weekNumber = searchParams.get('weekNumber');

    const where: any = {};
    if (weekNumber) {
      where.weekNumber = parseInt(weekNumber);
    }
    if (classId || teacherId) {
      where.assignment = {};
      if (classId) where.assignment.classId = classId;
      if (teacherId) where.assignment.teacherId = teacherId;
    }

    const scheduleEntries = await prisma.scheduleEntry.findMany({
      where,
      include: {
        assignment: {
          include: {
            class: true,
            subject: true,
            teacher: true,
          }
        },
        room: true,
      },
    });
    
    return NextResponse.json(scheduleEntries);
  } catch (error) {
    console.error('Lỗi khi lấy thời khóa biểu:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy thời khóa biểu' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const weekNumber = searchParams.get('weekNumber');

    const where: any = {};
    if (weekNumber) {
      where.weekNumber = parseInt(weekNumber);
    }

    await prisma.scheduleEntry.deleteMany({
      where,
    });
    
    return NextResponse.json({ message: 'Đã xóa thời khóa biểu thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa thời khóa biểu:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa thời khóa biểu' }, { status: 500 });
  }
}
