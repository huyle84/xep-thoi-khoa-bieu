import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function generateShortName(fullName: string): string {
  const parts = fullName.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const lastName = parts[parts.length - 1];
  const initials = parts.slice(0, -1).map(p => p.charAt(0).toUpperCase() + '.').join('');
  return initials + lastName;
}

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        _count: {
          select: {
            busySlots: true,
          },
        },
        assignments: {
          select: {
            periodsPerWeek: true,
          },
        },
      },
    });

    const formattedTeachers = teachers.map((teacher) => {
      const totalScheduledPeriods = teacher.assignments.reduce(
        (total, assignment) => total + (assignment.periodsPerWeek || 0),
        0
      );
      
      const { assignments, _count, ...rest } = teacher;
      return {
        ...rest,
        assignmentsCount: totalScheduledPeriods,
        busySlotsCount: _count.busySlots,
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
    let { code, name, shortName, maxPeriodsPerWeek, phone, email } = data;

    if (!code || !name) {
      return NextResponse.json({ error: 'Mã và tên giáo viên là bắt buộc' }, { status: 400 });
    }

    if (!shortName) {
      shortName = generateShortName(name);
    }

    const existingTeacher = await prisma.teacher.findUnique({ where: { code } });
    if (existingTeacher) {
      return NextResponse.json({ error: 'Mã giáo viên đã tồn tại' }, { status: 400 });
    }

    const teacher = await prisma.teacher.create({
      data: {
        code,
        name,
        shortName,
        maxPeriodsPerWeek: maxPeriodsPerWeek ? Number(maxPeriodsPerWeek) : 20,
        phone: phone || "",
        email: email || "",
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
    const { id, code, name, shortName, maxPeriodsPerWeek, maxPeriodsPerMorning, maxPeriodsPerAfternoon, phone, email } = data;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID giáo viên' }, { status: 400 });
    }

    let finalShortName = shortName;
    if (name && shortName === undefined) {
      finalShortName = generateShortName(name);
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(finalShortName !== undefined && { shortName: finalShortName }),
        ...(maxPeriodsPerWeek !== undefined && { maxPeriodsPerWeek: Number(maxPeriodsPerWeek) }),
        ...(maxPeriodsPerMorning !== undefined && { maxPeriodsPerMorning: Number(maxPeriodsPerMorning) }),
        ...(maxPeriodsPerAfternoon !== undefined && { maxPeriodsPerAfternoon: Number(maxPeriodsPerAfternoon) }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
      },
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Lỗi khi cập nhật giáo viên:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi cập nhật giáo viên' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Check if ID is in search params
    const url = new URL(req.url);
    let id = url.searchParams.get('id');

    // If not in search params, check body
    if (!id) {
      const data = await req.json().catch(() => ({}));
      id = data.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID giáo viên' }, { status: 400 });
    }

    await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa giáo viên:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa giáo viên' }, { status: 500 });
  }
}
