import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { entryAId, entryBId } = data;

    if (!entryAId || !entryBId) {
      return NextResponse.json({ error: 'Thiếu ID của các tiết học cần hoán đổi' }, { status: 400 });
    }

    const [entryA, entryB] = await Promise.all([
      prisma.scheduleEntry.findUnique({
        where: { id: entryAId },
        include: { assignment: { include: { subject: true } } },
      }),
      prisma.scheduleEntry.findUnique({
        where: { id: entryBId },
        include: { assignment: { include: { subject: true } } },
      }),
    ]);

    if (!entryA || !entryB) {
      return NextResponse.json({ error: 'Không tìm thấy một trong hai tiết học' }, { status: 404 });
    }

    const conflicts: any[] = [];
    const weekNumber = entryA.weekNumber;

    // We simulate the swap and check conflicts for both entries
    const simulatedA = { ...entryA, dayOfWeek: entryB.dayOfWeek, period: entryB.period };
    const simulatedB = { ...entryB, dayOfWeek: entryA.dayOfWeek, period: entryA.period };

    // Function to check basic conflicts for an entry
    const checkConflicts = async (simulated: typeof simulatedA, originalId: string) => {
      // 1. Teacher conflict
      const teacherConflict = await prisma.scheduleEntry.findFirst({
        where: {
          id: { notIn: [entryAId, entryBId] },
          weekNumber,
          dayOfWeek: simulated.dayOfWeek,
          period: simulated.period,
          assignment: { teacherId: simulated.assignment.teacherId }
        }
      });
      if (teacherConflict) conflicts.push(`Giáo viên của môn ${simulated.assignment.subject.name} đã có lịch dạy vào Thứ ${simulated.dayOfWeek} Tiết ${simulated.period}`);

      // 2. Class conflict
      const classConflict = await prisma.scheduleEntry.findFirst({
        where: {
          id: { notIn: [entryAId, entryBId] },
          weekNumber,
          dayOfWeek: simulated.dayOfWeek,
          period: simulated.period,
          assignment: { classId: simulated.assignment.classId }
        }
      });
      if (classConflict) conflicts.push(`Lớp học của môn ${simulated.assignment.subject.name} đã có môn khác vào Thứ ${simulated.dayOfWeek} Tiết ${simulated.period}`);

      // 3. Busy slot
      const busySlot = await prisma.teacherBusySlot.findFirst({
        where: {
          teacherId: simulated.assignment.teacherId,
          dayOfWeek: simulated.dayOfWeek,
          period: simulated.period
        }
      });
      if (busySlot) conflicts.push(`Giáo viên của môn ${simulated.assignment.subject.name} bận vào Thứ ${simulated.dayOfWeek} Tiết ${simulated.period}`);
    };

    await Promise.all([
      checkConflicts(simulatedA, entryAId),
      checkConflicts(simulatedB, entryBId)
    ]);

    if (conflicts.length > 0) {
      return NextResponse.json({ error: 'Không thể hoán đổi do xung đột lịch biểu', conflicts }, { status: 409 });
    }

    // Execute swap using transaction
    await prisma.$transaction([
      prisma.scheduleEntry.update({
        where: { id: entryAId },
        data: { dayOfWeek: simulatedA.dayOfWeek, period: simulatedA.period },
      }),
      prisma.scheduleEntry.update({
        where: { id: entryBId },
        data: { dayOfWeek: simulatedB.dayOfWeek, period: simulatedB.period },
      }),
    ]);

    return NextResponse.json({ message: 'Hoán đổi thành công' });
  } catch (error) {
    console.error('Lỗi khi hoán đổi tiết học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi hoán đổi tiết học' }, { status: 500 });
  }
}
