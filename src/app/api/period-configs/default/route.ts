import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const defaults = [
      { periodNumber: 1, session: 'MORNING', label: 'Tiết 1', startTime: '07:00', endTime: '07:45', order: 1 },
      { periodNumber: 2, session: 'MORNING', label: 'Tiết 2', startTime: '07:50', endTime: '08:35', order: 2 },
      { periodNumber: 3, session: 'MORNING', label: 'Tiết 3', startTime: '08:45', endTime: '09:30', order: 3 },
      { periodNumber: 4, session: 'MORNING', label: 'Tiết 4', startTime: '09:35', endTime: '10:20', order: 4 },
      { periodNumber: 5, session: 'MORNING', label: 'Tiết 5', startTime: '10:25', endTime: '11:10', order: 5 },
      
      { periodNumber: 6, session: 'AFTERNOON', label: 'Tiết 6', startTime: '13:00', endTime: '13:45', order: 6 },
      { periodNumber: 7, session: 'AFTERNOON', label: 'Tiết 7', startTime: '13:50', endTime: '14:35', order: 7 },
      { periodNumber: 8, session: 'AFTERNOON', label: 'Tiết 8', startTime: '14:45', endTime: '15:30', order: 8 },
      { periodNumber: 9, session: 'AFTERNOON', label: 'Tiết 9', startTime: '15:35', endTime: '16:20', order: 9 },
      { periodNumber: 10, session: 'AFTERNOON', label: 'Tiết 10', startTime: '16:25', endTime: '17:10', order: 10 },
    ]

    const upserts = defaults.map(data => 
      prisma.periodConfig.upsert({
        where: { periodNumber: data.periodNumber },
        update: data,
        create: data,
      })
    )

    await prisma.$transaction(upserts)

    return NextResponse.json({
      message: 'Khởi tạo cấu hình tiết học mặc định thành công',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating default period configs:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tạo cấu hình tiết học mặc định' },
      { status: 500 }
    )
  }
}
