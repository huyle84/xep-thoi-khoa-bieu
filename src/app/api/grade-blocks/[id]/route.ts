import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gradeBlock = await prisma.gradeBlock.findUnique({
      where: { id: params.id },
      include: { classes: true },
    })

    if (!gradeBlock) {
      return NextResponse.json(
        { error: 'Không tìm thấy khối lớp' },
        { status: 404 }
      )
    }

    return NextResponse.json(gradeBlock)
  } catch (error) {
    console.error('Error fetching grade block:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tải thông tin khối lớp' },
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
    const { name, color, order } = body

    const gradeBlock = await prisma.gradeBlock.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(gradeBlock)
  } catch (error) {
    console.error('Error updating grade block:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật khối lớp' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gradeBlock = await prisma.gradeBlock.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { classes: true } },
      },
    })

    if (!gradeBlock) {
      return NextResponse.json(
        { error: 'Không tìm thấy khối lớp' },
        { status: 404 }
      )
    }

    if (gradeBlock._count.classes > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa khối lớp đang có lớp học. Hãy xóa các lớp học trước.' },
        { status: 400 }
      )
    }

    await prisma.gradeBlock.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting grade block:', error)
    return NextResponse.json(
      { error: 'Lỗi khi xóa khối lớp' },
      { status: 500 }
    )
  }
}
