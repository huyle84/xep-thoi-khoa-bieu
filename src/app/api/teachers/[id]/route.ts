import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: params.id },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Không tìm thấy giáo viên' },
        { status: 404 }
      )
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tải thông tin giáo viên' },
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
    const { name, shortName, subject, isFullTime, avatarUrl } = body

    const data: any = {}
    if (name !== undefined) data.name = name
    if (shortName !== undefined) data.shortName = shortName
    if (subject !== undefined) data.subject = subject
    if (isFullTime !== undefined) data.isFullTime = isFullTime
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl

    const teacher = await prisma.teacher.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật giáo viên' },
      { status: 500 }
    )
  }
}
