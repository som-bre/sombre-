import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('audio') as File
    
    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })
    }

    // 고유한 파일명 생성
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const ext = file.name.split('.').pop() || 'mp3'
    const filename = `voice/${timestamp}-${randomString}.${ext}`

    // Vercel Blob에 업로드
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({ path: blob.url })
  } catch (error: any) {
    console.error('Audio upload error:', error)
    return NextResponse.json({ 
      error: '업로드 실패', 
      details: error.message 
    }, { status: 500 })
  }
}
