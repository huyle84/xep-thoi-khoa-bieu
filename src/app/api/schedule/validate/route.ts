import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { validateAll } from '@/lib/algorithms/validator';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json().catch(() => ({}));
    const { weekNumber = 1 } = data;

    const [entries, busySlots, rooms, config, assignments] = await Promise.all([
      prisma.scheduleEntry.findMany({
        where: { weekNumber },
        include: {
          assignment: {
            include: {
              subject: true,
            },
          },
        },
      }),
      prisma.teacherBusySlot.findMany(),
      prisma.room.findMany(),
      prisma.schoolConfig.findFirst(),
      prisma.teachingAssignment.findMany(),
    ]);

    const placedEntries = entries.map(entry => ({
      id: entry.id,
      assignmentId: entry.assignmentId,
      classId: entry.assignment.classId,
      teacherId: entry.assignment.teacherId,
      subjectId: entry.assignment.subjectId,
      dayOfWeek: entry.dayOfWeek,
      period: entry.period,
      roomId: entry.roomId,
      subject: {
        maxPeriodsPerDay: entry.assignment.subject.maxPeriodsPerDay,
        roomType: entry.assignment.subject.roomType,
      },
    }));

    const algorithmInput = {
      assignments: assignments,
      rooms: rooms,
      busySlots: busySlots,
      morningPeriods: config?.morningPeriods || 5,
      afternoonPeriods: config?.afternoonPeriods || 5,
      workingDays: (config?.workingDays || "2,3,4,5,6,7").split(',').map(Number).filter(Boolean),
    };

    const validationResult = validateAll(placedEntries as any, algorithmInput);

    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Lỗi khi kiểm tra tính hợp lệ của thời khóa biểu:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi kiểm tra tính hợp lệ' }, { status: 500 });
  }
}
