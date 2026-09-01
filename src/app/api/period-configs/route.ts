import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const configs = await prisma.periodConfig.findMany({
      orderBy: { periodNumber: 'asc' },
    })
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Error fetching period configs:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tải cấu hình tiết học' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { periodNumber, session, label, startTime, endTime, order } = body

    if (periodNumber === undefined || !label) {
      return NextResponse.json(
        { error: 'Số tiết và nhãn là bắt buộc' },
        { status: 400 }
      )
    }

    const existing = await prisma.periodConfig.findUnique({
      where: { periodNumber },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Tiết học với số này đã tồn tại' },
        { status: 400 }
      )
    }

    const config = await prisma.periodConfig.create({
      data: {
        periodNumber,
        session: session || 'MORNING',
        label,
        startTime: startTime || '',
        endTime: endTime || '',
        order: order !== undefined ? order : periodNumber,
      },
    })

    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error('Error creating period config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tạo cấu hình tiết học' },
      { status: 500 }
    )
  }
}
