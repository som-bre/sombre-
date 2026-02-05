import { NextResponse } from 'next/server'
import { kv } from '@/lib/db' 
import { DialogueRecord } from '@/lib/parseDialogue'

export async function POST(req: Request) {
  try {
    const newRecord = await req.json() as DialogueRecord
    
    // 1. DB에서 기존 목록 가져오기
    let records = await kv.get<DialogueRecord[]>('dialogue_records')
    
    // ⭐️ [핵심 수정] 만약 DB가 비어있거나 이상하면 빈 배열([])로 초기화
    // (이 부분이 없으면 "findIndex" 에러가 나서 저장이 안 됩니다)
    if (!records || !Array.isArray(records)) {
      records = []
    }
    
    // 2. 이미 있는 파일인지 확인 (ID로 비교)
    const index = records.findIndex(r => r.id === newRecord.id)
    
    if (index >= 0) {
      // 이미 있으면 -> 내용만 덮어쓰기 (수정)
      records[index] = { ...newRecord, updatedAt: new Date().toISOString() }
    } else {
      // 없으면 -> 맨 앞에 새로 추가
      records.unshift(newRecord)
    }
    
    // 3. 다시 저장하기
    await kv.set('dialogue_records', records)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Save Error:', e)
    // 에러가 나면 왜 났는지 메시지를 보내줌
    return NextResponse.json({ error: e.message || '저장 실패' }, { status: 500 })
  }
}