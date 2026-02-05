import { NextResponse } from 'next/server'
import { parseDialogue } from '@/lib/parseDialogue'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      )
    }

    const text = await file.text()
    const record = parseDialogue(text, file.name.replace('.txt', ''))

    // ✅ phases를 먼저 확인하도록 수정된 코드
    const totalLines = record.phases.reduce((phaseSum, phase) => {
      return phaseSum + phase.sections.reduce((sectionSum, section) => {
        return sectionSum + section.lines.length
      }, 0)
    }, 0)

    if (totalLines === 0) {
      return NextResponse.json(
        { error: '파싱된 대화가 없습니다. 파일 형식을 확인해주세요.' },
        { status: 400 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}