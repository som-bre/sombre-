import { NextResponse } from 'next/server'
import { kv } from '@/lib/db' // ✅ 우리가 만든 db 연결 (same1_ 변수 사용)
import { DialogueRecord } from '@/lib/parseDialogue' // ✅ 이 줄이 있어야 에러가 안 납니다!

export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    
    // DB에서 목록 가져오기 (만약 없으면 빈 배열)
    let records = await kv.get<DialogueRecord[]>('dialogue_records') || []
    
    // 해당 ID를 가진 기록만 쏙 빼고 나머지 남기기
    const newRecords = records.filter(r => r.id !== id)
    
    // 다시 저장
    await kv.set('dialogue_records', newRecords)
    
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 })
  }
}