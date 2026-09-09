import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teacherId = params.id;
    if (!teacherId) {
      return NextResponse.json({ error: 'Thiếu ID giáo viên' }, { status: 400 });
    }

    const busySlots = await prisma.teacherBusySlot.findMany({
      where: { teacherId },
    });

    return NextResponse.json(busySlots);
  } catch (error) {
    console.error('Lỗi khi lấy tiết bận của giáo viên:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teacherId = params.id;
    if (!teacherId) {
      return NextResponse.json({ error: 'Thiếu ID giáo viên' }, { status: 400 });
    }

    const data = await req.json();
    const { dayOfWeek, period, reason } = data;

    if (dayOfWeek === undefined || period === undefined) {
      return NextResponse.json({ error: 'Thiếu thông tin ngày/tiết' }, { status: 400 });
    }

    const slot = await prisma.teacherBusySlot.upsert({
      where: {
        teacherId_dayOfWeek_period: {
          teacherId,
          dayOfWeek: Number(dayOfWeek),
          period: Number(period),
        }
      },
      update: {
        reason: reason || "",
      },
      create: {
        teacherId,
        dayOfWeek: Number(dayOfWeek),
        period: Number(period),
        reason: reason || "",
      },
    });

    return NextResponse.json(slot);
  } catch (error) {
    console.error('Lỗi khi cập nhật tiết bận:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const teacherId = params.id;
    if (!teacherId) {
      return NextResponse.json({ error: 'Thiếu ID giáo viên' }, { status: 400 });
    }

    const data = await req.json();
    const { dayOfWeek, period } = data;

    if (dayOfWeek === undefined || period === undefined) {
      return NextResponse.json({ error: 'Thiếu thông tin ngày/tiết' }, { status: 400 });
    }

    await prisma.teacherBusySlot.delete({
      where: {
        teacherId_dayOfWeek_period: {
          teacherId,
          dayOfWeek: Number(dayOfWeek),
          period: Number(period),
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa tiết bận:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
