import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const entries = await prisma.scheduleEntry.findMany({
      include: {
        assignment: {
          include: {
            class: true,
            subject: true,
            teacher: {
              include: {
                busySlots: true,
              },
            },
          },
        },
      },
    });

    const violations = [];

    for (const entry of entries) {
      if (!entry.assignment?.teacher?.busySlots) continue;
      
      const teacher = entry.assignment.teacher;
      const isBusy = teacher.busySlots.some(
        (slot) => slot.dayOfWeek === entry.dayOfWeek && slot.period === entry.period
      );

      if (isBusy) {
        violations.push({
          className: entry.assignment.class.name,
          subjectName: entry.assignment.subject.name,
          teacherName: teacher.name,
          day: entry.dayOfWeek,
          period: entry.period,
        });
      }
    }

    return NextResponse.json({ violations });
  } catch (error) {
    console.error('Lỗi khi kiểm tra NV:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi' }, { status: 500 });
  }
}
