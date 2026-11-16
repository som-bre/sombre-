import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { WHOS, sanitizePet, type Pet, type Who } from '@/lib/greenroom'

export const dynamic = 'force-dynamic'

// One key per character so the two players never overwrite each other.
const key = (who: Who) => `greenroom_v1:${who}`

export async function GET() {
  try {
    const authed = await isAdmin()
    const stored = await Promise.all(WHOS.map(w => kv.get<Pet>(key(w))))
    const pets: Record<string, Pet | null> = {}
    WHOS.forEach((w, i) => {
      const raw = stored[i]
      if (!raw) { pets[w] = null; return }
      const pet = sanitizePet(raw)
      // Visitors can watch the characters, but the to-do text stays private.
      if (!authed) {
        pet.todos = pet.todos.map(t => ({ ...t, text: '', memo: undefined }))
        pet.routines = pet.routines.map(r => ({ ...r, text: '' }))
        pet.cats = pet.cats.map(c => ({ ...c, name: '' }))
      }
      pets[w] = pet
    })
    return NextResponse.json({ ok: true, authed, pets })
  } catch (error) {
    console.error('Failed to fetch greenroom:', error)
    return NextResponse.json({ ok: false })
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: '로그인이 필요합니다.' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const who = body?.who as Who
    if (!WHOS.includes(who)) {
      return NextResponse.json({ ok: false, error: '잘못된 요청입니다.' }, { status: 400 })
    }
    await kv.set(key(who), sanitizePet(body.pet))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to save greenroom:', error)
    return NextResponse.json({ ok: false, error: '저장 실패' }, { status: 500 })
  }
}
