import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
    });

    if (!room) {
      return NextResponse.json({ error: 'Không tìm thấy phòng học' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phòng học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy thông tin phòng học' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const room = await prisma.room.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(room);
  } catch (error) {
    console.error('Lỗi khi cập nhật phòng học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi cập nhật phòng học' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.room.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Đã xóa phòng học thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa phòng học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi xóa phòng học' }, { status: 500 });
  }
}
