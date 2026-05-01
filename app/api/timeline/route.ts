import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'

export const dynamic = 'force-dynamic'

const TIMELINE_KEY = 'timeline_v1'

export interface TimelineEvent {
  id: string
  storyDate: string       // e.g. "Year 1, Spring" or "첫 만남 이전"
  title: string
  description: string
  character?: 'manon' | 'dylan' | 'both'
  type?: 'event' | 'milestone' | 'memory' | 'turning'
  order: number           // for manual ordering
}

export interface TimelineData {
  events: TimelineEvent[]
}

const defaultData: TimelineData = { events: [] }

export async function GET() {
  try {
    const data = await kv.get(TIMELINE_KEY)
    return NextResponse.json(data || defaultData)
  } catch {
    return NextResponse.json(defaultData)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: TimelineData = await request.json()
    await kv.set(TIMELINE_KEY, data)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
