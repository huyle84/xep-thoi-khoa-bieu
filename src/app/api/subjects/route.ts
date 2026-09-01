import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách môn học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy danh sách môn học' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { code, name, periodsPerWeek, maxPeriodsPerDay, roomType, isCore, color } = data;

    if (!code || !name) {
      return NextResponse.json({ error: 'Mã và tên môn học là bắt buộc' }, { status: 400 });
    }

    if (periodsPerWeek < 1 || periodsPerWeek > 10) {
      return NextResponse.json({ error: 'Số tiết/tuần phải từ 1 đến 10' }, { status: 400 });
    }

    if (maxPeriodsPerDay < 1 || maxPeriodsPerDay > 5) {
      return NextResponse.json({ error: 'Số tiết tối đa/ngày phải từ 1 đến 5' }, { status: 400 });
    }

    const existingSubject = await prisma.subject.findUnique({ where: { code } });
    if (existingSubject) {
      return NextResponse.json({ error: 'Mã môn học đã tồn tại' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        periodsPerWeek,
        maxPeriodsPerDay,
        roomType: roomType || 'NORMAL',
        isCore: isCore ?? false,
        color: color || '#FFFFFF',
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo môn học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tạo môn học' }, { status: 500 });
  }
}
