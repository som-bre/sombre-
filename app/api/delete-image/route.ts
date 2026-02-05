import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const { imagePath } = await request.json()
    const filepath = path.join(process.cwd(), 'public', imagePath)
    await fs.unlink(filepath)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 })
  }
}