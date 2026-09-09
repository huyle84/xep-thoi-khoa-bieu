import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const assignments = await prisma.teachingAssignment.findMany({
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });

    const teachers = await prisma.teacher.findMany({
      include: {
        assignments: {
          select: {
            periodsPerWeek: true,
          },
        },
      },
    });

    const teachersWithTotalPeriods = teachers.map((teacher) => {
      const totalPeriodsPerWeek = teacher.assignments.reduce(
        (total, assignment) => total + assignment.periodsPerWeek,
        0
      );
      const { assignments, ...rest } = teacher;
      return {
        ...rest,
        totalPeriodsPerWeek,
      };
    });

    return NextResponse.json({
      assignments,
      teachers: teachersWithTotalPeriods,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phân công:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy danh sách phân công' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { classId, subjectId, teacherId, periodsPerWeek } = data;

    if (!classId || !subjectId || !teacherId || periodsPerWeek === undefined) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const assignment = await prisma.teachingAssignment.upsert({
      where: {
        classId_subjectId: {
          classId,
          subjectId,
        },
      },
      update: {
        teacherId,
        periodsPerWeek,
      },
      create: {
        classId,
        subjectId,
        teacherId,
        periodsPerWeek,
      },
      include: {
        class: true,
        subject: true,
        teacher: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi phân công giảng dạy:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi phân công' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID phân công' }, { status: 400 });
    }

    await prisma.teachingAssignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa phân công:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa phân công' }, { status: 500 });
  }
}
