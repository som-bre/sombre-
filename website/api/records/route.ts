import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { isAdmin } from '@/lib/auth'
import { DialogueRecord } from '@/lib/parseDialogue'

const RECORDS_KEY = 'dialogue_records_v2'

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
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    const record: DialogueRecord = await request.json()
    
    const records = await kv.get<DialogueRecord[]>(RECORDS_KEY) || []
    records.unshift(record) // 최신 기록을 맨 앞에
    
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
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    const updatedRecord: DialogueRecord = await request.json()
    updatedRecord.updatedAt = new Date().toISOString()
    
    const records = await kv.get<DialogueRecord[]>(RECORDS_KEY) || []
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

// DELETE: 기록 삭제
export async function DELETE(request: NextRequest) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID가 필요합니다.' },
        { status: 400 }
      )
    }
    
    const records = await kv.get<DialogueRecord[]>(RECORDS_KEY) || []
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
