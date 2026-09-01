import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const assignments = await prisma.homeroomAssignment.findMany({
      include: {
        class: {
          include: {
            gradeBlock: true,
          }
        },
        teacher: true,
      },
    })
    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching homeroom assignments:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tải phân công chủ nhiệm' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { classId, teacherId, academicYear } = body

    if (!classId || !teacherId) {
      return NextResponse.json(
        { error: 'Lớp và giáo viên là bắt buộc' },
        { status: 400 }
      )
    }

    const assignment = await prisma.homeroomAssignment.upsert({
      where: { classId },
      update: {
        teacherId,
        academicYear: academicYear || '2025-2026',
      },
      create: {
        classId,
        teacherId,
        academicYear: academicYear || '2025-2026',
      },
      include: {
        class: true,
        teacher: true,
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating homeroom assignment:', error)
    return NextResponse.json(
      { error: 'Lỗi khi phân công chủ nhiệm' },
      { status: 500 }
    )
  }
}
