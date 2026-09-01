import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'school';
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
        { dayOfWeek: 'asc' },
        { period: 'asc' },
      ],
    });

    const doc = new jsPDF();
    doc.text(`Thoi khoa bieu - ${type.toUpperCase()}`, 14, 15);

    const tableData = entries.map(entry => [
      entry.assignment.class.name,
      `Thứ ${entry.dayOfWeek}`,
      `Tiết ${entry.period}`,
      entry.assignment.subject.name,
      entry.assignment.teacher.name,
      entry.room?.name || ''
    ]);

    (doc as any).autoTable({
      head: [['Lop', 'Thu', 'Tiet', 'Mon', 'Giao vien', 'Phong']],
      body: tableData,
      startY: 20,
    });

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="thoi_khoa_bieu_${type}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Lỗi khi xuất file PDF:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xuất file PDF' }, { status: 500 });
  }
}
