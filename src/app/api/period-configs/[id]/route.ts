import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const config = await prisma.periodConfig.findUnique({
      where: { id: params.id },
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Không tìm thấy cấu hình tiết học' },
        { status: 404 }
      )
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching period config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tải thông tin tiết học' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { session, label, startTime, endTime, order } = body

    const config = await prisma.periodConfig.update({
      where: { id: params.id },
      data: {
        ...(session && { session }),
        ...(label && { label }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating period config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật tiết học' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.periodConfig.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting period config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi xóa tiết học' },
      { status: 500 }
    )
  }
}
