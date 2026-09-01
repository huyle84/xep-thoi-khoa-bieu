import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { classes } = body

    if (!Array.isArray(classes)) {
      return NextResponse.json(
        { error: 'Định dạng dữ liệu không hợp lệ' },
        { status: 400 }
      )
    }

    let created = 0
    let skipped = 0
    const errors: string[] = []

    for (const cls of classes) {
      try {
        const { name, grade, gradeBlockId } = cls
        
        if (!name || !grade) {
          errors.push(`Thiếu thông tin cho lớp: ${JSON.stringify(cls)}`)
          continue
        }

        const existing = await prisma.class.findFirst({
          where: { name, grade },
        })

        if (existing) {
          skipped++
          continue
        }

        await prisma.class.create({
          data: {
            name,
            grade,
            ...(gradeBlockId && { gradeBlockId }),
          },
        })
        created++
      } catch (err: any) {
        errors.push(`Lỗi khi tạo lớp ${cls?.name}: ${err.message}`)
      }
    }

    return NextResponse.json({ created, skipped, errors }, { status: 201 })
  } catch (error) {
    console.error('Error bulk creating classes:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tạo hàng loạt lớp học' },
      { status: 500 }
    )
  }
}
