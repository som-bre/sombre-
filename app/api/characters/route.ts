import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'

export const dynamic = 'force-dynamic'

const CHARACTERS_KEY = 'character_data'

export interface CharacterPhaseData {
  id: string
  symbol: string
  label: string
  name: string
  quote: string
  nameKr: string
  nameEn: string
  age: string
  height: string
  weight: string
  personality: string[]
  abilityName: string
  abilityDesc: string
  mainQuote: string
  stats?: { label: string; value: number }[]
  profileImage?: string
  voiceFile?: string
  voiceLabel?: string
}

export interface CharacterData {
  media: CharacterPhaseData[]
  sadham: CharacterPhaseData[]
  mediaAvatars?: string[]   // 메디아 채팅 아바타 후보
  sadhamAvatars?: string[]  // 사드함 채팅 아바타 후보
}

// 기존 Record 형식 → 배열로 마이그레이션
function migrateData(data: any): CharacterData {
  if (!data) return { media: [], sadham: [] }

  const migrateCharacter = (charData: any): CharacterPhaseData[] => {
    if (Array.isArray(charData)) return charData
    // Record<string, PhaseData> → PhaseData[]
    return Object.entries(charData).map(([key, value]: [string, any]) => ({
      id: key,
      ...value,
    }))
  }

  return {
    media: data.media ? migrateCharacter(data.media) : [],
    sadham: data.sadham ? migrateCharacter(data.sadham) : [],
  }
}

// GET: 캐릭터 데이터 조회
export async function GET() {
  try {
    const raw = await kv.get(CHARACTERS_KEY)
    const data = migrateData(raw)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch character data:', error)
    return NextResponse.json({ media: [], sadham: [] }, { status: 200 })
  }
}

// PUT: 캐릭터 데이터 전체 저장
export async function PUT(request: NextRequest) {
  try {
    const data: CharacterData = await request.json()
    await kv.set(CHARACTERS_KEY, data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save character data:', error)
    return NextResponse.json(
      { error: '캐릭터 데이터 저장에 실패했습니다.' },
      { status: 500 }
    )
  }
}
