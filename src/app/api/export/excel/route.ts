import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'school'; // 'school', 'class', 'teacher'
    const id = searchParams.get('id');

    const where: any = {};
    if (type === 'class' && id) {
      where.assignment = { classId: id };
    } else if (type === 'teacher' && id) {
      where.assignment = { teacherId: id };
    }

    const entries = await prisma.scheduleEntry.findMany({
      where,
      include: {
        assignment: {
          include: {
            class: true,
            subject: true,
            teacher: true,
          }
        },
        room: true,
      },
      orderBy: [
        { assignment: { class: { name: 'asc' } } },
        { dayOfWeek: 'asc' },
        { period: 'asc' },
      ],
    });

    const workbook = xlsx.utils.book_new();

    // Group entries for formatting
    if (type === 'school') {
      const data = entries.map(entry => ({
        Lớp: entry.assignment.class.name,
        Thứ: entry.dayOfWeek,
        Tiết: entry.period,
        'Môn học': entry.assignment.subject.name,
        'Giáo viên': entry.assignment.teacher.name,
        'Phòng học': entry.room?.name || '',
      }));
      const worksheet = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Toàn trường');
    } else if (type === 'class') {
      // Basic grid for a single class
      const data = entries.map(entry => ({
        Thứ: entry.dayOfWeek,
        Tiết: entry.period,
        'Môn học': entry.assignment.subject.name,
        'Giáo viên': entry.assignment.teacher.name,
        'Phòng học': entry.room?.name || '',
      }));
      const worksheet = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, entries[0]?.assignment.class.name || 'Lớp');
    } else if (type === 'teacher') {
      const data = entries.map(entry => ({
        Thứ: entry.dayOfWeek,
        Tiết: entry.period,
        Lớp: entry.assignment.class.name,
        'Môn học': entry.assignment.subject.name,
        'Phòng học': entry.room?.name || '',
      }));
      const worksheet = xlsx.utils.json_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet, entries[0]?.assignment.teacher.name || 'Giáo viên');
    }

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="thoi_khoa_bieu_${type}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Lỗi khi xuất file Excel:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xuất file Excel' }, { status: 500 });
  }
}
