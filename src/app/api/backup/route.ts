import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: list all snapshots
export async function GET() {
  try {
    const snapshots = await prisma.tKBSnapshot.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, label: true, entryCount: true, createdAt: true },
    });
    return NextResponse.json(snapshots);
  } catch (e: any) {
    // If table doesn't exist yet
    if (e.code === 'P2021') return NextResponse.json([]);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: create snapshot
export async function POST(req: Request) {
  try {
    const { label } = await req.json();
    const entries = await prisma.scheduleEntry.findMany({
      include: { assignment: { include: { class: true, subject: true, teacher: true } } },
    });
    const data = JSON.stringify(entries);
    const snapshot = await prisma.tKBSnapshot.create({
      data: { label: label || `Sao lưu ${new Date().toISOString()}`, data, entryCount: entries.length },
    });
    return NextResponse.json(snapshot);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: remove snapshot
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.tKBSnapshot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
