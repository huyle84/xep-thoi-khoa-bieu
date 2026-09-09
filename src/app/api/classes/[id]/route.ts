import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cls = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        gradeBlock: true,
        assignments: { include: { subject: true, teacher: true } },
        room: true,
        homeroom: { include: { teacher: true } },
      },
    });
    if (!cls) return NextResponse.json({ error: 'Không tìm thấy lớp' }, { status: 404 });
    return NextResponse.json(cls);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { name, gradeBlockId, capacity } = data;

    // If gradeBlockId changed, update grade number too
    let grade: number | undefined;
    if (gradeBlockId) {
      const block = await prisma.gradeBlock.findUnique({ where: { id: gradeBlockId } });
      if (block) grade = block.gradeNum;
    }

    const updated = await prisma.class.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(gradeBlockId && { gradeBlockId }),
        ...(grade !== undefined && { grade }),
      },
      include: { gradeBlock: true, room: true },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.class.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
