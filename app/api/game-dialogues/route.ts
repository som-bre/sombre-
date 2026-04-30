import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'

export const dynamic = 'force-dynamic'

const GAME_DIALOGUES_KEY = 'game_dialogues'

export interface BodyPart {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  dialogue: string
  points?: [number, number][]  // 다각형 꼭짓점 [x%, y%] 배열 (있으면 다각형 모드)
}

export interface GameDialogueData {
  foreword: {
    characterImage?: string
    parts: BodyPart[]
  }
  rebuttal: {
    characterImage?: string
    parts: BodyPart[]
  }
}

const defaultData: GameDialogueData = {
  foreword: { parts: [] },
  rebuttal: { parts: [] },
}

export async function GET() {
  try {
    const data = await kv.get(GAME_DIALOGUES_KEY)
    return NextResponse.json(data || defaultData)
  } catch (error) {
    console.error('Failed to fetch game dialogues:', error)
    return NextResponse.json(defaultData)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: GameDialogueData = await request.json()
    await kv.set(GAME_DIALOGUES_KEY, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save game dialogues:', error)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
