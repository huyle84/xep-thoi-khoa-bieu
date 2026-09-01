import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    let config = await prisma.schoolConfig.findFirst()

    if (!config) {
      config = await prisma.schoolConfig.create({
        data: {
          setupCompleted: false,
        }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching school config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi tải cấu hình trường học' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const config = await prisma.schoolConfig.findFirst()

    if (!config) {
      return NextResponse.json(
        { error: 'Không tìm thấy cấu hình' },
        { status: 404 }
      )
    }

    const updatedConfig = await prisma.schoolConfig.update({
      where: { id: config.id },
      data: body,
    })

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('Error partial updating config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật cấu hình' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const config = await prisma.schoolConfig.findFirst()

    if (!config) {
      const newConfig = await prisma.schoolConfig.create({ data: body })
      return NextResponse.json(newConfig)
    }

    const updatedConfig = await prisma.schoolConfig.update({
      where: { id: config.id },
      data: body,
    })

    return NextResponse.json(updatedConfig)
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật cấu hình' },
      { status: 500 }
    )
  }
}
