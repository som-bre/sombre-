import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { WHOS, type Who } from '@/lib/greenroom'
import { sanitizeLetter, sanitizeMail, addToBox, giftWaiting, type Letter } from '@/lib/greenroomMail'

export const dynamic = 'force-dynamic'

// One mailbox per character, kept apart from the saves.
const key = (who: Who) => `greenroom_v1:mail:${who}`
const load = async (who: Who) => sanitizeMail(await kv.get<Letter[]>(key(who)))

const denied = () => NextResponse.json({ ok: false, error: '로그인이 필요합니다.' }, { status: 401 })
const bad = (error = '잘못된 요청입니다.') => NextResponse.json({ ok: false, error }, { status: 400 })

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return denied()
  const who = request.nextUrl.searchParams.get('who') as Who
  if (!WHOS.includes(who)) return bad()
  try {
    return NextResponse.json({ ok: true, letters: await load(who) })
  } catch (error) {
    console.error('Failed to fetch greenroom mail:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// Delivers a letter to its recipient's box.
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return denied()
  try {
    const body = await request.json()
    const letter = sanitizeLetter(body?.letter)
    if (!letter) return bad()
    const delivered: Letter = { ...letter, at: Date.now(), read: false, claimed: false }
    const box = await load(letter.to)
    if (box.some(l => l.id === letter.id)) return NextResponse.json({ ok: true, letter: box.find(l => l.id === letter.id) })
    await kv.set(key(letter.to), addToBox(box, delivered))
    return NextResponse.json({ ok: true, letter: delivered })
  } catch (error) {
    console.error('Failed to send greenroom mail:', error)
    return NextResponse.json({ ok: false, error: '보내지 못했어요.' }, { status: 500 })
  }
}

// read · claim · delete. Claiming succeeds once only, so a gift can never be taken twice.
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return denied()
  try {
    const body = await request.json()
    const who = body?.who as Who
    const id = typeof body?.id === 'string' ? body.id : ''
    const op = body?.op
    if (!WHOS.includes(who) || !id || !['read', 'claim', 'delete'].includes(op)) return bad()
    const box = await load(who)
    const letter = box.find(l => l.id === id)
    if (!letter) return NextResponse.json({ ok: false, error: '없는 편지예요.' }, { status: 404 })

    if (op === 'claim') {
      if (!giftWaiting(letter)) return NextResponse.json({ ok: false, error: '이미 받은 선물이에요.' }, { status: 409 })
      const done = { ...letter, claimed: true, read: true }
      await kv.set(key(who), box.map(l => (l.id === id ? done : l)))
      return NextResponse.json({ ok: true, letter: done })
    }
    if (op === 'delete') {
      if (giftWaiting(letter)) return bad('선물을 먼저 받아주세요.')
      await kv.set(key(who), box.filter(l => l.id !== id))
      return NextResponse.json({ ok: true })
    }
    if (!letter.read) await kv.set(key(who), box.map(l => (l.id === id ? { ...l, read: true } : l)))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to update greenroom mail:', error)
    return NextResponse.json({ ok: false, error: '처리하지 못했어요.' }, { status: 500 })
  }
}
