import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const gradeBlocks = await prisma.gradeBlock.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { classes: true },
        },
      },
    })
    return NextResponse.json(gradeBlocks)
  } catch (error) {
    console.error('Error fetching grade blocks:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tải danh sách khối lớp' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, gradeNum, order, color } = body

    if (!name || gradeNum === undefined) {
      return NextResponse.json(
        { error: 'Tên và số khối là bắt buộc' },
        { status: 400 }
      )
    }

    if (gradeNum < 1 || gradeNum > 20) {
      return NextResponse.json(
        { error: 'Số khối phải từ 1 đến 20' },
        { status: 400 }
      )
    }

    const existing = await prisma.gradeBlock.findUnique({
      where: { gradeNum },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Khối lớp với số này đã tồn tại' },
        { status: 400 }
      )
    }

    const gradeBlock = await prisma.gradeBlock.create({
      data: {
        name,
        gradeNum,
        order: order !== undefined ? order : gradeNum,
        color: color || '#3B82F6',
      },
    })

    return NextResponse.json(gradeBlock, { status: 201 })
  } catch (error) {
    console.error('Error creating grade block:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tạo khối lớp' },
      { status: 500 }
    )
  }
}
