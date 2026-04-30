import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'

export const dynamic = 'force-dynamic'

const SHEETS_KEY = 'sheets_v1'

export interface Sheet {
  id: string
  title: string
  description?: string
  url?: string
}

export interface SheetsData {
  sheets: Sheet[]
}

const defaultData: SheetsData = { sheets: [] }

export async function GET() {
  try {
    const data = await kv.get(SHEETS_KEY)
    return NextResponse.json(data || defaultData)
  } catch (error) {
    console.error('Failed to fetch sheets:', error)
    return NextResponse.json(defaultData)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: SheetsData = await request.json()
    await kv.set(SHEETS_KEY, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save sheets:', error)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
