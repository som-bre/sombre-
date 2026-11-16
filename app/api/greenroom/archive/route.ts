import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { WHOS, MONTH_RE, MAX_ARCHIVE, sanitizeTodos, type Todo, type Who } from '@/lib/greenroom'

export const dynamic = 'force-dynamic'

// Finished to-dos older than a couple of months live here, one key per character per month,
// so the main save stays small while nothing the player wrote is ever thrown away.
const key = (who: Who, month: string) => `greenroom_v1:${who}:arch:${month}`

const denied = () => NextResponse.json({ ok: false, error: '로그인이 필요합니다.' }, { status: 401 })
const bad = () => NextResponse.json({ ok: false, error: '잘못된 요청입니다.' }, { status: 400 })

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return denied()
  const who = request.nextUrl.searchParams.get('who') as Who
  const month = request.nextUrl.searchParams.get('month') ?? ''
  if (!WHOS.includes(who) || !MONTH_RE.test(month)) return bad()
  try {
    const stored = await kv.get<Todo[]>(key(who, month))
    return NextResponse.json({ ok: true, todos: sanitizeTodos(stored, Date.now(), MAX_ARCHIVE) })
  } catch (error) {
    console.error('Failed to fetch greenroom archive:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

// Adds to a month's archive. Entries are merged by id, so sending the same ones twice is harmless.
export async function PUT(request: NextRequest) {
  if (!(await isAdmin())) return denied()
  try {
    const body = await request.json()
    const who = body?.who as Who
    const month = typeof body?.month === 'string' ? body.month : ''
    if (!WHOS.includes(who) || !MONTH_RE.test(month)) return bad()
    const now = Date.now()
    const incoming = sanitizeTodos(body.todos, now, MAX_ARCHIVE).filter(t => t.date?.startsWith(month))
    const existing = sanitizeTodos(await kv.get<Todo[]>(key(who, month)), now, MAX_ARCHIVE)
    const byId = new Map<string, Todo>()
    existing.forEach(t => byId.set(t.id, t))
    incoming.forEach(t => byId.set(t.id, t))
    const merged = Array.from(byId.values()).slice(0, MAX_ARCHIVE)
    await kv.set(key(who, month), merged)
    return NextResponse.json({ ok: true, count: merged.length })
  } catch (error) {
    console.error('Failed to save greenroom archive:', error)
    return NextResponse.json({ ok: false, error: '저장 실패' }, { status: 500 })
  }
}
