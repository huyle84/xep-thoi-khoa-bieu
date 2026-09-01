import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const assignments = await prisma.teachingAssignment.findMany({
      include: {
        class: true,
        subject: true,
        teacher: true,
        _count: {
          select: { scheduleEntries: true },
        },
      },
    });
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phân công:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy danh sách phân công' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { classId, subjectId, teacherId } = data;

    if (!classId || !subjectId || !teacherId) {
      return NextResponse.json({ error: 'Thiếu thông tin phân công' }, { status: 400 });
    }

    const [classData, subject, teacher] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId } }),
      prisma.subject.findUnique({ where: { id: subjectId } }),
      prisma.teacher.findUnique({ 
        where: { id: teacherId },
        include: { assignments: { include: { subject: true } } }
      }),
    ]);

    if (!classData || !subject || !teacher) {
      return NextResponse.json({ error: 'Lớp, môn học hoặc giáo viên không tồn tại' }, { status: 400 });
    }

    // Check uniqueness
    const existingAssignment = await prisma.teachingAssignment.findUnique({
      where: {
        classId_subjectId: {
          classId,
          subjectId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json({ error: 'Môn học này đã được phân công cho lớp này' }, { status: 400 });
    }

    // Calculate teacher total periods
    const currentTotalPeriods = teacher.assignments.reduce(
      (total, a) => total + a.subject.periodsPerWeek,
      0
    );

    const willExceedMax = currentTotalPeriods + subject.periodsPerWeek > teacher.maxPeriodsPerWeek;

    const assignment = await prisma.teachingAssignment.create({
      data: {
        classId,
        subjectId,
        teacherId,
        periodsPerWeek: subject.periodsPerWeek,
      },
      include: {
        class: true,
        subject: true,
        teacher: true,
      }
    });

    if (willExceedMax) {
      return NextResponse.json({
        ...assignment,
        warning: 'Cảnh báo: Giáo viên này đã vượt quá số tiết tối đa/tuần'
      }, { status: 201 });
    }

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo phân công:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tạo phân công' }, { status: 500 });
  }
}
