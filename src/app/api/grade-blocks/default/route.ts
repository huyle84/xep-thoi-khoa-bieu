import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    const defaults = [
      { name: 'Khối 10', gradeNum: 10, order: 10, color: '#EF4444' }, // Red
      { name: 'Khối 11', gradeNum: 11, order: 11, color: '#3B82F6' }, // Blue
      { name: 'Khối 12', gradeNum: 12, order: 12, color: '#F59E0B' }, // Yellow/Orange
    ]

    const created = []

    for (const data of defaults) {
      const existing = await prisma.gradeBlock.findUnique({
        where: { gradeNum: data.gradeNum },
      })

      if (!existing) {
        const block = await prisma.gradeBlock.create({ data })
        created.push(block)
      }
    }

    return NextResponse.json({
      message: 'Khởi tạo khối lớp mặc định thành công',
      created,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating default grade blocks:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tạo khối lớp mặc định' },
      { status: 500 }
    )
  }
}
