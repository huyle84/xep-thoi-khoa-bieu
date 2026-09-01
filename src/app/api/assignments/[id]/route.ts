import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assignment = await prisma.teachingAssignment.findUnique({
      where: { id: params.id },
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Không tìm thấy phân công' }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phân công:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy thông tin phân công' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { periodsPerWeek, teacherId } = data;

    const updateData: any = {};
    if (periodsPerWeek !== undefined) updateData.periodsPerWeek = periodsPerWeek;
    if (teacherId !== undefined) updateData.teacherId = teacherId;

    const assignment = await prisma.teachingAssignment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        class: true,
        subject: true,
        teacher: true,
      }
    });
    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Lỗi khi cập nhật phân công:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi cập nhật phân công' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Delete the assignment, this will cascade to scheduleEntries if DB is setup right
    // Or we delete entries manually if cascade is not set
    await prisma.scheduleEntry.deleteMany({
      where: { assignmentId: params.id },
    });

    await prisma.teachingAssignment.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: 'Đã xóa phân công thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa phân công:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa phân công' }, { status: 500 });
  }
}
