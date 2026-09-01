import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const rooms = await prisma.room.findMany();
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy danh sách phòng học' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, type, capacity } = data;

    if (!name || !type) {
      return NextResponse.json({ error: 'Tên và loại phòng là bắt buộc' }, { status: 400 });
    }

    if (capacity < 1 || capacity > 1000) {
      return NextResponse.json({ error: 'Sức chứa phải từ 1 đến 1000' }, { status: 400 });
    }

    const validTypes = ['NORMAL', 'LAB', 'COMPUTER', 'GYM'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Loại phòng không hợp lệ' }, { status: 400 });
    }

    const existingRoom = await prisma.room.findUnique({ where: { name } });
    if (existingRoom) {
      return NextResponse.json({ error: 'Tên phòng đã tồn tại' }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        name,
        type,
        capacity: capacity || 45,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo phòng học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi tạo phòng học' }, { status: 500 });
  }
}
