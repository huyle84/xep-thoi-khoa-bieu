import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { generateSchedule } from '@/lib/algorithms/backtracking';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { weekNumber = 1, clearExisting = true, mode = 'full', classId, subjectId, session } = data;

    let assignmentWhere = {};
    if (mode === 'class' && classId) {
      assignmentWhere = { classId };
    } else if (mode === 'subject-session' && subjectId) {
      assignmentWhere = { subjectId };
    }

    if (clearExisting) {
      if (mode === 'full') {
        await prisma.scheduleEntry.deleteMany({
          where: { weekNumber },
        });
      } else {
        // delete entries matching the assignments
        const assignmentsToDelete = await prisma.teachingAssignment.findMany({ where: assignmentWhere, select: { id: true } });
        await prisma.scheduleEntry.deleteMany({
          where: { weekNumber, assignmentId: { in: assignmentsToDelete.map(a => a.id) } }
        });
      }
    }

    const [assignments, busySlots, rooms, config] = await Promise.all([
      prisma.teachingAssignment.findMany({
        where: assignmentWhere,
        include: {
          class: true,
          subject: true,
          teacher: true,
        },
      }),
      prisma.teacherBusySlot.findMany(),
      prisma.room.findMany(),
      prisma.schoolConfig.findFirst(),
    ]);

    // Build AlgorithmInput structure
    const algoAssignments = assignments.map(a => ({
      id: a.id,
      classId: a.classId,
      className: a.class.name,
      subjectId: a.subjectId,
      subjectName: a.subject.name,
      teacherId: a.teacherId,
      teacherName: a.teacher.name,
      periodsPerWeek: a.periodsPerWeek,
      isCore: a.subject.isCore,
      maxPeriodsPerDay: a.subject.maxPeriodsPerDay,
      roomType: a.subject.roomType,
    }));

    const algoBusySlots = busySlots.map(b => ({
      teacherId: b.teacherId,
      dayOfWeek: b.dayOfWeek,
      period: b.period,
    }));

    const algoRooms = rooms.map(r => ({
      id: r.id,
      type: r.type,
      capacity: r.capacity,
    }));

    const morningPeriods = mode === 'subject-session' && session === 'AFTERNOON' ? 0 : (config?.morningPeriods || 5);
    const afternoonPeriods = mode === 'subject-session' && session === 'MORNING' ? 0 : (config?.afternoonPeriods || 5);

    const algorithmInput = {
      assignments: algoAssignments,
      busySlots: algoBusySlots,
      rooms: algoRooms,
      morningPeriods: morningPeriods,
      afternoonPeriods: afternoonPeriods,
      workingDays: (config?.workingDays || "2,3,4,5,6,7").split(',').map(Number).filter(Boolean),
    };

    const result = await generateSchedule(algorithmInput);

    if (result.success && result.entries.length > 0) {
      // Save results to DB
      const entriesToCreate = (result as any).schedule.map((entry: any) => ({
        weekNumber,
        dayOfWeek: entry.dayOfWeek,
        period: entry.period,
        assignmentId: entry.assignmentId,
        roomId: entry.roomId || null,
      }));

      await prisma.scheduleEntry.createMany({
        data: entriesToCreate,
      });
    }

    return NextResponse.json({
      success: result.success,
      stats: {
        executionTimeMs: result.executionTimeMs,
        iterationsCount: result.iterationsCount,
      },
      placedCount: result.entries.length,
      unplacedCount: result.unscheduled.length,
      unplacedAssignments: result.unscheduled,
    });
  } catch (error) {
    console.error('Lỗi khi tự động xếp thời khóa biểu:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tự động xếp thời khóa biểu' }, { status: 500 });
  }
}
