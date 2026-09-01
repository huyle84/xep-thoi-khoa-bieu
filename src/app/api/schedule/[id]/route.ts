import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const entry = await prisma.scheduleEntry.findUnique({
      where: { id: params.id },
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

    if (!entry) {
      return NextResponse.json({ error: 'Không tìm thấy tiết học' }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin tiết học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy thông tin tiết học' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { dayOfWeek, period, roomId } = data;

    // Fetch current entry to know which assignment/teacher it belongs to
    const currentEntry = await prisma.scheduleEntry.findUnique({
      where: { id: params.id },
      include: { assignment: true }
    });

    if (!currentEntry) {
      return NextResponse.json({ error: 'Không tìm thấy tiết học' }, { status: 404 });
    }

    // Validation for conflicts
    const conflicts = [];
    const weekNumber = currentEntry.weekNumber;

    // 1. Teacher conflict (Teacher already teaching another class in same slot)
    const teacherConflict = await prisma.scheduleEntry.findFirst({
      where: {
        id: { not: params.id },
        weekNumber,
        dayOfWeek,
        period,
        assignment: { teacherId: currentEntry.assignment.teacherId }
      },
      include: { assignment: { include: { class: true } } }
    });

    if (teacherConflict) {
      conflicts.push(`Giáo viên đã có lịch dạy lớp ${teacherConflict.assignment.class.name} vào tiết này`);
    }

    // 2. Class conflict (Class already has a subject in same slot)
    const classConflict = await prisma.scheduleEntry.findFirst({
      where: {
        id: { not: params.id },
        weekNumber,
        dayOfWeek,
        period,
        assignment: { classId: currentEntry.assignment.classId }
      },
      include: { assignment: { include: { subject: true } } }
    });

    if (classConflict) {
      conflicts.push(`Lớp này đã có môn ${classConflict.assignment.subject.name} vào tiết này`);
    }

    // 3. Room conflict
    if (roomId) {
      const roomConflict = await prisma.scheduleEntry.findFirst({
        where: {
          id: { not: params.id },
          weekNumber,
          dayOfWeek,
          period,
          roomId
        }
      });
      if (roomConflict) {
        conflicts.push(`Phòng học này đã được sử dụng vào tiết này`);
      }
    }

    // 4. Teacher busy slot
    const busySlot = await prisma.teacherBusySlot.findFirst({
      where: {
        teacherId: currentEntry.assignment.teacherId,
        dayOfWeek,
        period
      }
    });

    if (busySlot) {
      conflicts.push(`Giáo viên bận vào tiết này (Lý do: ${busySlot.reason || 'Không rõ'})`);
    }

    if (conflicts.length > 0) {
      return NextResponse.json({ error: 'Xung đột lịch biểu', conflicts }, { status: 409 });
    }

    const entry = await prisma.scheduleEntry.update({
      where: { id: params.id },
      data: { dayOfWeek, period, roomId },
      include: {
        assignment: {
          include: { class: true, subject: true, teacher: true }
        },
        room: true
      }
    });
    
    return NextResponse.json(entry);
  } catch (error) {
    console.error('Lỗi khi cập nhật tiết học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi cập nhật tiết học' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.scheduleEntry.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Đã xóa tiết học thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa tiết học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa tiết học' }, { status: 500 });
  }
}
