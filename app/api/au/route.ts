import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'

export const dynamic = 'force-dynamic'

const AU_KEY = 'aus_v1'

export interface AU {
  id: string
  title: string             // e.g. "한국 국적 AU"
  subtitle?: string         // small text under title
  relationship: string      // e.g. "연인", "?"
  themeColor?: string       // optional accent
  manon: { image?: string; name: string; dialogue?: string }
  dylan: { image?: string; name: string; dialogue?: string }
}

export interface AUData {
  aus: AU[]
}

const defaultData: AUData = { aus: [] }

export async function GET() {
  try {
    const data = await kv.get(AU_KEY)
    return NextResponse.json(data || defaultData)
  } catch (error) {
    console.error('Failed to fetch AUs:', error)
    return NextResponse.json(defaultData)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: AUData = await request.json()
    await kv.set(AU_KEY, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save AUs:', error)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
