import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    let config = await prisma.schoolConfig.findFirst();
    if (!config) {
      // Create default config if not exists
      config = await prisma.schoolConfig.create({
        data: {
          morningPeriods: 5,
          afternoonPeriods: 5,
          workingDays: "2,3,4,5,6,7",
        },
      });
    }
    return NextResponse.json(config);
  } catch (error) {
    console.error('Lỗi khi lấy cấu hình trường học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi lấy cấu hình trường học' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { morningPeriods, afternoonPeriods, workingDays } = data;

    let config = await prisma.schoolConfig.findFirst();
    
    if (config) {
      config = await prisma.schoolConfig.update({
        where: { id: config.id },
        data: { morningPeriods, afternoonPeriods, workingDays },
      });
    } else {
      config = await prisma.schoolConfig.create({
        data: { morningPeriods, afternoonPeriods, workingDays },
      });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Lỗi khi cập nhật cấu hình trường học:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi khi cập nhật cấu hình trường học' }, { status: 500 });
  }
}
