import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const snapshot = await prisma.tKBSnapshot.findUnique({ where: { id } });
    if (!snapshot) return NextResponse.json({ error: 'Không tìm thấy bản sao lưu' }, { status: 404 });

    const entries = JSON.parse(snapshot.data) as any[];

    // Clear current schedule
    await prisma.scheduleEntry.deleteMany({});

    // Restore entries
    for (const entry of entries) {
      await prisma.scheduleEntry.create({
        data: {
          assignmentId: entry.assignmentId,
          dayOfWeek: entry.dayOfWeek,
          period: entry.period,
          weekNumber: entry.weekNumber || 1,
          isLocked: entry.isLocked || false,
          roomId: entry.roomId || null,
        },
      }).catch(() => {}); // skip if assignment no longer exists
    }

    return NextResponse.json({ success: true, restored: entries.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
