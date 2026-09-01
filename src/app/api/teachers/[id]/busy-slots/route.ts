import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const busySlots = await prisma.teacherBusySlot.findMany({
      where: { teacherId: params.id },
    });
    return NextResponse.json(busySlots);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khung giờ bận:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy khung giờ bận' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { dayOfWeek, period, reason } = data;

    if (dayOfWeek < 2 || dayOfWeek > 7) {
      return NextResponse.json({ error: 'Ngày trong tuần phải từ 2 (Thứ 2) đến 7 (Thứ 7)' }, { status: 400 });
    }

    if (period < 1 || period > 10) {
      return NextResponse.json({ error: 'Tiết học phải từ 1 đến 10' }, { status: 400 });
    }

    const busySlot = await prisma.teacherBusySlot.create({
      data: {
        teacherId: params.id,
        dayOfWeek,
        period,
        reason,
      },
    });

    return NextResponse.json(busySlot, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi thêm khung giờ bận:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi thêm khung giờ bận' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const { id: slotId } = data;

    if (!slotId) {
      return NextResponse.json({ error: 'Thiếu ID khung giờ bận' }, { status: 400 });
    }

    await prisma.teacherBusySlot.delete({
      where: { id: slotId },
    });

    return NextResponse.json({ message: 'Đã xóa khung giờ bận thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa khung giờ bận:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa khung giờ bận' }, { status: 500 });
  }
}
