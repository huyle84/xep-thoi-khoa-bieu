import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        _count: {
          select: {
            assignments: true,
            busySlots: true,
          },
        },
        assignments: {
          select: {
            subject: {
              select: {
                periodsPerWeek: true,
              },
            },
          },
        },
      },
    });

    // Calculate total scheduled periods for each teacher
    const formattedTeachers = teachers.map((teacher) => {
      const totalScheduledPeriods = teacher.assignments.reduce(
        (total, assignment) => total + (assignment.subject?.periodsPerWeek || 0),
        0
      );
      
      const { assignments, ...rest } = teacher;
      return {
        ...rest,
        totalScheduledPeriods,
      };
    });

    return NextResponse.json(formattedTeachers);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách giáo viên:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy danh sách giáo viên' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { code, name, shortName, maxPeriodsPerWeek } = data;

    if (!code || !name) {
      return NextResponse.json({ error: 'Mã và tên giáo viên là bắt buộc' }, { status: 400 });
    }

    if (maxPeriodsPerWeek < 1 || maxPeriodsPerWeek > 40) {
      return NextResponse.json({ error: 'Số tiết tối đa/tuần phải từ 1 đến 40' }, { status: 400 });
    }

    const existingTeacher = await prisma.teacher.findUnique({ where: { code } });
    if (existingTeacher) {
      return NextResponse.json({ error: 'Mã giáo viên đã tồn tại' }, { status: 400 });
    }

    const teacher = await prisma.teacher.create({
      data: {
        code,
        name,
        shortName: shortName || "",
        maxPeriodsPerWeek: maxPeriodsPerWeek || 30,
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo giáo viên:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tạo giáo viên' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, code, name, shortName, maxPeriodsPerWeek, maxPeriodsPerMorning, maxPeriodsPerAfternoon } = data;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID giáo viên' }, { status: 400 });
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(shortName !== undefined && { shortName }),
        ...(maxPeriodsPerWeek && { maxPeriodsPerWeek }),
        ...(maxPeriodsPerMorning !== undefined && { maxPeriodsPerMorning }),
        ...(maxPeriodsPerAfternoon !== undefined && { maxPeriodsPerAfternoon }),
      },
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Lỗi khi cập nhật giáo viên:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi cập nhật giáo viên' }, { status: 500 });
  }
}
