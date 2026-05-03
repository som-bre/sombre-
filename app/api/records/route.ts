import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db' // ✅ 우리가 만든 DB 연결
import { DialogueRecord } from '@/lib/parseDialogue' // ✅ 타입 가져오기

export const dynamic = 'force-dynamic'

// DB 키 이름 정의
const RECORDS_KEY = 'dialogue_records'

// GET: 모든 기록 조회
export async function GET() {
  try {
    const records = await kv.get<DialogueRecord[]>(RECORDS_KEY) || []
    return NextResponse.json(records)
  } catch (error) {
    console.error('Failed to fetch records:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// POST: 새 기록 추가
export async function POST(request: NextRequest) {
  try {
    // isAdmin 체크는 생략 (필요하다면 별도 인증 로직 구현 필요)
    
    const record: DialogueRecord = await request.json()
    
    // DB에서 목록 가져오기 (없으면 빈 배열)
    // ⚠️ 중요: records가 배열이 아닐 경우를 대비해 타입 단언 및 초기화
    let records = await kv.get<DialogueRecord[]>(RECORDS_KEY)
    if (!Array.isArray(records)) records = []

    records.unshift(record) // 최신 기록을 맨 앞에 추가
    
    await kv.set(RECORDS_KEY, records)
    
    return NextResponse.json(record)
  } catch (error) {
    console.error('Failed to create record:', error)
    return NextResponse.json(
      { error: '기록 저장에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 기록 수정
export async function PUT(request: NextRequest) {
  try {
    const updatedRecord: DialogueRecord = await request.json()
    updatedRecord.updatedAt = new Date().toISOString()
    
    let records = await kv.get<DialogueRecord[]>(RECORDS_KEY)
    if (!Array.isArray(records)) records = []

    const index = records.findIndex(r => r.id === updatedRecord.id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: '기록을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    records[index] = updatedRecord
    await kv.set(RECORDS_KEY, records)
    
    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error('Failed to update record:', error)
    return NextResponse.json(
      { error: '기록 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH: 기록 순서 재정렬
export async function PATCH(request: NextRequest) {
  try {
    const { orderedIds } = await request.json() as { orderedIds: string[] }
    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: 'orderedIds 배열이 필요합니다.' }, { status: 400 })
    }
    let records = await kv.get<DialogueRecord[]>(RECORDS_KEY)
    if (!Array.isArray(records)) records = []
    const byId = new Map(records.map(r => [r.id, r]))
    const reordered = orderedIds.map(id => byId.get(id)).filter(Boolean) as DialogueRecord[]
    const missing = records.filter(r => !orderedIds.includes(r.id))
    await kv.set(RECORDS_KEY, [...reordered, ...missing])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to reorder records:', error)
    return NextResponse.json({ error: '순서 변경 실패' }, { status: 500 })
  }
}

// DELETE: 기록 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }
    
    let records = await kv.get<DialogueRecord[]>(RECORDS_KEY)
    if (!Array.isArray(records)) records = []

    const filteredRecords = records.filter(r => r.id !== id)
    
    await kv.set(RECORDS_KEY, filteredRecords)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete record:', error)
    return NextResponse.json(
      { error: '기록 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}