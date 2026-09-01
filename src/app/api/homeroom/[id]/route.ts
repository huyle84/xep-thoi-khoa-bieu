import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = await prisma.homeroomAssignment.findUnique({
      where: { id: params.id },
      include: {
        class: true,
        teacher: true,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Không tìm thấy phân công' },
        { status: 404 }
      )
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching homeroom assignment:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tải thông tin phân công' },
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
    const { teacherId } = body

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Giáo viên là bắt buộc' },
        { status: 400 }
      )
    }

    const assignment = await prisma.homeroomAssignment.update({
      where: { id: params.id },
      data: { teacherId },
      include: {
        class: true,
        teacher: true,
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error updating homeroom assignment:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật phân công' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.homeroomAssignment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting homeroom assignment:', error)
    return NextResponse.json(
      { error: 'Lỗi khi xóa phân công' },
      { status: 500 }
    )
  }
}
