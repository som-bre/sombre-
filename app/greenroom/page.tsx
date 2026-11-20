'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EdgeCurtain from '@/components/EdgeCurtain'
import { BalletRibbon, MagicSparkle } from '@/components/StageMotifs'
import {
  WHOS, WASH_COST, MAX_ARCHIVE, sanitizeTodos,
  defaultPet, settle, sanitizePet,
  type Who, type Pet, type PetsData, type Todo,
} from '@/lib/greenroom'
import { Icon, SketchButton, Coins, Gold, GOLD, PINK, LOW, type IconName } from '@/components/greenroom/ui'
import { HuntPanel, LifePanel, ForgePanel, BagPanel, ShopPanel, CodexPanel } from '@/components/greenroom/RpgPanels'
import { ITEMS, BREWS, SEEDS, isFail, tidy, josa, doEat, jobLabel, plotCount, type Fail } from '@/lib/greenroomRpg'
import { dayKey, itemsFor, overdue, tidyTodos, splitArchive } from '@/lib/greenroomTodo'
import { TodoPanel } from '@/components/greenroom/TodoPanel'
import { MailPanel, GiftModal, type MailApi } from '@/components/greenroom/Mail'
import {
  other, newLetter, packGift, unpackGift, hasGift, giftWaiting, addToBox, sanitizeMail, sanitizeLetter, MAX_MAIL, type Letter,
} from '@/lib/greenroomMail'

const LS_KEY = 'sombre_greenroom_v1'

// Mailboxes when there is no server (local play): { dylan: Letter[], manon: Letter[] }
const MAIL_KEY = 'sombre_greenroom_mail_v1'
const readMail = (): Record<string, unknown> => {
  try { return JSON.parse(localStorage.getItem(MAIL_KEY) || '{}') || {} } catch { return {} }
}
const writeMail = (all: Record<string, unknown>) => { try { localStorage.setItem(MAIL_KEY, JSON.stringify(all)) } catch {} }
const mailCall = async (method: 'POST' | 'PATCH', body: unknown) => {
  const res = await fetch('/api/greenroom/mail', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return res.json()
}

// Monthly archive of old finished to-dos, kept beside the main save: { 'manon:2026-08': Todo[] }
const ARCH_KEY = 'sombre_greenroom_arch_v1'
const readArch = (): Record<string, unknown> => {
  try { return JSON.parse(localStorage.getItem(ARCH_KEY) || '{}') || {} } catch { return {} }
}
const mergeTodos = (a: Todo[], b: Todo[]) => {
  const byId = new Map<string, Todo>()
  a.forEach(t => byId.set(t.id, t))
  b.forEach(t => byId.set(t.id, t))
  return Array.from(byId.values())
}
const putArchive = (who: Who, month: string, todos: Todo[]) =>
  fetch('/api/greenroom/archive', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ who, month, todos }) })

const CAST: Record<Who, { name: string; role: string; accent: string; x: number }> = {
  dylan: { name: 'Dylan', role: 'Wizard', accent: '#C8C8C8', x: 29 },
  manon: { name: 'Manon', role: 'Ballerina', accent: '#D9809A', x: 71 },
}

const FOODS: { id: string; label: string; icon: IconName; cost: number; full: number; mood: number }[] = [
  { id: 'tea', label: '홍차', icon: 'tea', cost: 5, full: 6, mood: 8 },
  { id: 'bread', label: '빵', icon: 'bread', cost: 8, full: 18, mood: 0 },
  { id: 'soup', label: '수프', icon: 'soup', cost: 15, full: 35, mood: 2 },
  { id: 'cake', label: '케이크', icon: 'cake', cost: 30, full: 45, mood: 15 },
]

const TOYS: { id: string; label: string; icon: IconName; cost: number; mood: number; energy: number }[] = [
  { id: 'musicbox', label: '오르골', icon: 'musicbox', cost: 15, mood: 30, energy: -4 },
  { id: 'bouquet', label: '꽃다발', icon: 'bouquet', cost: 30, mood: 55, energy: 0 },
]

type Sync = 'loading' | 'synced' | 'saving' | 'local' | 'relogin'
type Tab = 'todo' | 'shop' | 'hunt' | 'life' | 'forge' | 'bag' | 'mail' | 'dex'
const TABS: { id: Tab; label: string; en: string; title: string; icon: IconName }[] = [
  { id: 'todo', label: '할 일', en: 'CUE SHEET', title: '할 일', icon: 'list' },
  { id: 'shop', label: '상점', en: 'STARLIGHT SHOP', title: '별빛 상점', icon: 'coin' },
  { id: 'hunt', label: '탐험', en: 'DARK CORNERS', title: '탐험', icon: 'sword' },
  { id: 'life', label: '생활', en: 'THE GROUNDS', title: '생활', icon: 'leaf' },
  { id: 'forge', label: '공방', en: 'WORKSHOP', title: '공방', icon: 'hammer' },
  { id: 'bag', label: '가방', en: 'TRUNK', title: '가방', icon: 'bag' },
  { id: 'mail', label: '우편', en: 'POST', title: '우편함', icon: 'mail' },
  { id: 'dex', label: '도감', en: 'BESTIARY', title: '도감', icon: 'book' },
]
interface Fx { id: number; who: Who; kind: 'float' | 'eat'; text?: string; icon?: IconName }
interface Bubble { id: number; x: number; y: number; r: number }

const clamp = (n: number) => Math.max(0, Math.min(100, n))

const CSS = `
.gr-root { --sprite: 150px; --gut: 14px; }
@media (min-width: 640px) { .gr-root { --sprite: 186px; --gut: 9%; } }
@media (min-width: 1024px) { .gr-root { --sprite: 196px; } }
@media (min-width: 1024px) and (min-height: 820px) { .gr-root { --sprite: 232px; } }
.gr-sprite { width: var(--sprite); height: var(--sprite); }
.gr-stage { height: calc(var(--sprite) + 62px); }
.gr-dock { position: sticky; top: 0; z-index: 6; background: #000; }
@media (min-width: 1024px) { .gr-dock { position: static; background: transparent; } }
/* boxes keep the hand-drawn wobble of their lines but no longer shift position */
.gr-root .sketch-jitter-line, .gr-modal .sketch-jitter-line { animation: none; }
.gr-now-row { transition: background 0.2s; }
.gr-now-row:hover { background: rgba(255,255,255,0.04); }
@keyframes grToast { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
.gr-toast { animation: grToast 0.2s ease-out; }
.gr-px { image-rendering: crisp-edges; image-rendering: pixelated; }

@keyframes grBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.gr-bob { animation: grBob 1.1s steps(1) infinite; }
@keyframes grBreathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.975); } }
.gr-breathe { animation: grBreathe 3.2s ease-in-out infinite; transform-origin: 50% 96%; }
@keyframes grHop { 0% { transform: translateY(0); } 40% { transform: translateY(-16px); } 100% { transform: translateY(0); } }
.gr-hop { animation: grHop 0.38s cubic-bezier(0.3, 0.7, 0.4, 1); }
@keyframes grFloat {
  0% { opacity: 0; transform: translate(-50%, 6px); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -46px); }
}
.gr-float { animation: grFloat 1.1s ease-out forwards; }
@keyframes grEat {
  0% { opacity: 0; transform: translate(-50%, -70px) scale(1.3); }
  20% { opacity: 1; }
  75% { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, 6px) scale(0.2); }
}
.gr-eat { animation: grEat 0.85s ease-in forwards; }
@keyframes grPop {
  from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}
.gr-bubble { animation: grPop 0.25s ease-out both; }
@keyframes grZ {
  0% { opacity: 0; transform: translate(0, 0) scale(0.7); }
  30% { opacity: 0.9; }
  100% { opacity: 0; transform: translate(14px, -30px) scale(1.2); }
}
.gr-z { animation: grZ 2.4s ease-out infinite; }
@keyframes grBlink { 50% { opacity: 0.35; } }
.gr-blink { animation: grBlink 1s steps(1) infinite; }
@keyframes grShake {
  0%, 100% { transform: translateX(0); } 20% { transform: translateX(-5px) rotate(-2deg); }
  40% { transform: translateX(5px) rotate(2deg); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); }
}
.gr-shake { animation: grShake 0.28s ease-out; }
.gr-fade { opacity: 0.18; transition: opacity 0.6s; }
@keyframes grCoin { 0% { transform: scale(1); } 35% { transform: scale(1.25); } 100% { transform: scale(1); } }
.gr-coin-pulse { animation: grCoin 0.4s ease-out; }

.gr-btn { position: relative; color: rgba(255,255,255,0.7); transition: color 0.2s, opacity 0.2s; }
.gr-btn .gr-frame { border: 1px solid rgba(255,255,255,0.2); transition: border-color 0.2s, background 0.2s; }
.gr-btn:hover:not(:disabled) { color: #fff; }
.gr-btn:hover:not(:disabled) .gr-frame { border-color: ${PINK}; background: rgba(255,107,157,0.14); }
.gr-btn[data-on="true"] { color: #fff; }
.gr-btn[data-on="true"] .gr-frame { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.07); }
.gr-btn:disabled { opacity: 0.3; }
.gr-input::placeholder { color: rgba(255,255,255,0.28); }
.gr-row .gr-del { opacity: 0; transition: opacity 0.2s; }
.gr-row:hover .gr-del, .gr-del:focus-visible { opacity: 0.6; }
@media (hover: none) { .gr-row .gr-del { opacity: 0.45; } }
`

function StatBar({ label, value, accent }: { label: string; value: number; accent: string }) {
  const low = value < 25
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', fontFamily: "'Noto Serif KR', serif" }}>{label}</span>
        <span className={low ? 'gr-blink' : ''} style={{
          fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.78rem',
          color: low ? LOW : 'rgba(255,255,255,0.75)',
        }}>{Math.round(value)}</span>
      </div>
      <div className="relative sketch-jitter-line" style={{ height: 9, border: '1px solid rgba(255,255,255,0.3)', filter: 'url(#sketchy)' }}
        role="progressbar" aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: low ? LOW : accent, opacity: 0.85,
          transition: 'width 0.5s cubic-bezier(0.25,0.46,0.45,0.94), background 0.3s',
        }} />
      </div>
    </div>
  )
}

function emoteFor(p: Pet): string | null {
  if (p.asleep) return null // drawn as floating z's instead
  if (p.full < 25) return '꼬르륵…'
  if (p.clean < 25) return '꼬질꼬질…'
  if (p.energy < 20) return '하암…'
  if (p.mood < 25) return '……'
  if ((p.full + p.clean + p.mood + p.energy) / 4 > 80) return '♪'
  return null
}

function Character({
  who, pet, selected, washing, bubbles, fx, hop, onClick, onScrub, onScrubEnd,
}: {
  who: Who; pet: Pet; selected: boolean; washing: boolean
  bubbles: Bubble[]; fx: Fx[]; hop: number
  onClick: () => void
  onScrub: (e: React.PointerEvent<HTMLDivElement>) => void
  onScrubEnd: () => void
}) {
  const c = CAST[who]
  const emote = emoteFor(pet)
  const dirt = clamp((45 - pet.clean) / 45 * 100) / 100
  return (
    <div className="absolute flex flex-col items-center" style={{
      left: `${c.x}%`, bottom: 6, transform: 'translateX(-50%)',
      opacity: selected ? 1 : 0.5, transition: 'opacity 0.4s',
    }}>
      <div
        role="button" tabIndex={0}
        aria-label={selected ? `${c.name} 쓰다듬기` : `${c.name} 선택`}
        className="gr-sprite relative cursor-pointer select-none"
        style={{ touchAction: washing ? 'none' : 'manipulation' }}
        onClick={onClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
        onPointerMove={washing ? onScrub : undefined}
        onPointerLeave={washing ? onScrubEnd : undefined}
        onPointerUp={washing ? onScrubEnd : undefined}
      >
        <div key={hop} className={`absolute inset-0 ${hop ? 'gr-hop' : ''}`}>
          <div className={`absolute inset-0 ${pet.asleep ? 'gr-breathe' : 'gr-bob'}`}
            style={{
              animationDelay: who === 'manon' ? '-0.55s' : '0s',
              filter: pet.asleep ? 'brightness(0.45)' : 'none', transition: 'filter 0.8s',
            }}>
            {/* wobbling hand-drawn outline behind the crisp sprite */}
            <img src={`/greenroom/${who}-outline.png`} alt="" draggable={false}
              className="gr-px absolute inset-0 w-full h-full sketch-jitter"
              style={{ filter: 'url(#sketchy)', opacity: 0.9 }} />
            <img src={`/greenroom/${who}.png`} alt={c.name} draggable={false}
              className="gr-px absolute inset-0 w-full h-full" />
          </div>
        </div>

        {/* dust & smell marks when dirty */}
        {dirt > 0 && !washing && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none sketch-jitter" viewBox="0 0 100 100"
            style={{ filter: 'url(#sketchy)', opacity: dirt }} aria-hidden>
            <g stroke="rgba(255,255,255,0.75)" strokeWidth="0.9" fill="none" strokeLinecap="round">
              <path d="M20 58l3 2-3 2 3 2" />
              <path d="M80 66l-3 2 3 2-3 2" />
              <path d="M27 84l2.5-1.5M30 87l2-2.5" />
              <path d="M73 46l2 2M76 45l1 3" />
              {pet.clean < 20 && (
                <>
                  <path d="M33 13c-2-2 2-3.5 0-5.5s2-3.5 0-5.5" />
                  <path d="M50 10c-2-2 2-3.5 0-5.5" />
                  <path d="M67 13c-2-2 2-3.5 0-5.5s2-3.5 0-5.5" />
                </>
              )}
            </g>
          </svg>
        )}

        {/* soap bubbles */}
        {bubbles.map(b => (
          <span key={b.id} className="gr-bubble absolute pointer-events-none rounded-full" style={{
            left: `${b.x}%`, top: `${b.y}%`, width: b.r * 2, height: b.r * 2,
            border: '1px solid rgba(255,255,255,0.85)',
            background: 'radial-gradient(circle at 32% 30%, rgba(255,255,255,0.5), rgba(255,255,255,0.08) 60%)',
          }} />
        ))}

        {/* sleeping */}
        {pet.asleep && [0, 1, 2].map(i => (
          <span key={i} className="gr-z absolute pointer-events-none" style={{
            left: '64%', top: '18%', animationDelay: `${i * 0.8}s`,
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            fontSize: `${0.8 + i * 0.2}rem`, color: 'rgba(255,255,255,0.8)',
          }}>z</span>
        ))}

        {/* one-shot effects */}
        {fx.map(f => f.kind === 'eat' ? (
          <span key={f.id} className="gr-eat absolute pointer-events-none" style={{ left: '50%', top: '52%', color: '#fff' }}>
            {f.icon && <Icon name={f.icon} size={30} />}
          </span>
        ) : (
          <span key={f.id} className="gr-float absolute pointer-events-none whitespace-nowrap" style={{
            left: '50%', top: '6%', color: PINK,
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.15rem', fontWeight: 700,
            textShadow: '0 0 6px rgba(0,0,0,0.9)',
          }}>{f.text}</span>
        ))}

        {/* status bubble */}
        {emote && !washing && fx.length === 0 && (
          <span className="absolute pointer-events-none whitespace-nowrap sketch-jitter" style={{
            left: '50%', top: 0, transform: 'translateX(-50%)',
            padding: '1px 9px', fontSize: '0.72rem',
            fontFamily: "'Gowun Batang', 'Noto Serif KR', serif",
            color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(255,255,255,0.3)', filter: 'url(#sketchy)',
          }}>{emote}</span>
        )}
      </div>

      {/* name tag */}
      <div className="relative text-center" style={{ marginTop: 2 }}>
        <span style={{
          fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
          fontSize: '1rem', letterSpacing: selected ? '0.1em' : '0.04em',
          color: selected ? c.accent : 'rgba(255,255,255,0.6)', transition: 'letter-spacing 0.4s, color 0.3s',
        }}>{c.name}</span>
        <span className="label-caps ml-2" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)' }}>{c.role}</span>
        {selected && (
          <span className="absolute left-1/2 -translate-x-1/2 sketch-jitter-line" style={{
            bottom: -2, width: '70%', height: 1, background: c.accent, opacity: 0.6, filter: 'url(#sketchy)',
          }} />
        )}
        {pet.rpg.job && (
          <span className="label-caps block" style={{ fontSize: '0.46rem', letterSpacing: '0.2em', color: PINK, marginTop: 5, whiteSpace: 'nowrap' }}>
            {jobLabel(pet.rpg.job)}
          </span>
        )}
      </div>
    </div>
  )
}

function LoginInline({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState<Who>('manon')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem('same_logged_user')
    if (u === 'manon' || u === 'dylan') setUsername(u)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !password) return
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        localStorage.setItem('same_admin_login', 'true')
        localStorage.setItem('same_logged_user', username)
        localStorage.setItem('sombre_chat_as', username)
        setPassword('')
        onDone()
      } else {
        setError('비밀번호가 일치하지 않습니다.')
      }
    } catch {
      setError('인증 처리 중 오류가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 w-full max-w-[260px] mx-auto">
      <div className="flex gap-2">
        {WHOS.map(u => (
          <SketchButton key={u} on={username === u} onClick={() => setUsername(u)} className="flex-1"
            style={{ padding: '8px 0', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.8rem', color: username === u ? CAST[u].accent : undefined }}>
            {CAST[u].name}
          </SketchButton>
        ))}
      </div>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder="Password" aria-label="Password" autoComplete="current-password"
        className="gr-input w-full text-center outline-none"
        style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
          padding: '9px 12px', fontSize: '0.82rem', fontFamily: "'Pretendard Variable', sans-serif",
        }} />
      <SketchButton type="submit" disabled={busy || !password}
        style={{ padding: '9px 0', fontSize: '0.72rem', letterSpacing: '0.2em', fontFamily: "'Pretendard Variable', sans-serif" }}>
        ENTER
      </SketchButton>
      {error && <p role="alert" style={{ color: LOW, fontSize: '0.72rem', textAlign: 'center' }}>{error}</p>}
    </form>
  )
}

export default function GreenroomPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [pets, setPets] = useState<PetsData | null>(null)
  const petsRef = useRef<PetsData | null>(null)
  const [authed, setAuthed] = useState(false)
  const [sync, setSync] = useState<Sync>('loading')
  const [sel, setSel] = useState<Who>('dylan')
  const [now, setNow] = useState(0)
  const [panel, setPanel] = useState<'feed' | 'play' | null>(null)
  const [wash, setWash] = useState<{ who: Who; from: number; progress: number } | null>(null)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [fx, setFx] = useState<Fx[]>([])
  const [hops, setHops] = useState<Record<Who, number>>({ dylan: 0, manon: 0 })
  const [notice, setNotice] = useState<{ text: string; id: number } | null>(null)
  const panelRef = useRef<HTMLElement>(null)
  const [coinPulse, setCoinPulse] = useState(0)
  const [showLogin, setShowLogin] = useState(false)
  const [tab, setTab] = useState<Tab>('todo')

  const serverOn = useRef(false)
  const pushTimers = useRef<Partial<Record<Who, ReturnType<typeof setTimeout>>>>({})
  const seq = useRef(0)
  const lastPt = useRef<{ x: number; y: number } | null>(null)
  const scrubAcc = useRef(0)
  const lastPetAt = useRef<Record<Who, number>>({ dylan: 0, manon: 0 })
  const washRef = useRef(wash)
  washRef.current = wash

  // ── persistence ──
  const push = useCallback(async (who: Who) => {
    const pet = petsRef.current?.[who]
    if (!pet || !serverOn.current) return
    setSync('saving')
    try {
      const res = await fetch('/api/greenroom', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ who, pet }), keepalive: true,
      })
      if (res.status === 401) { setSync('relogin'); return }
      if (!res.ok) throw new Error('save failed')
      setSync('synced')
    } catch {
      setSync('local')
    }
  }, [])

  const pull = useCallback(async () => {
    const clientAuthed = localStorage.getItem('same_admin_login') === 'true'
    try {
      const res = await fetch('/api/greenroom', { cache: 'no-store' })
      const data = await res.json()
      if (!data?.ok || !petsRef.current) throw new Error('unavailable')
      serverOn.current = true
      const all = { ...petsRef.current }
      const toPush: Who[] = []
      for (const w of WHOS) {
        const remote = data.pets?.[w] ? tidyTodos(tidy(sanitizePet(data.pets[w]))) : null
        if (!clientAuthed) { all[w] = remote ?? all[w]; continue }
        if (!data.authed) continue // keep the local copy until the session is renewed
        if (remote && remote.rev >= all[w].rev) all[w] = remote
        else if (all[w].rev > 0) toPush.push(w)
      }
      petsRef.current = all
      setPets(all)
      setNow(Date.now())
      if (clientAuthed && !data.authed) { setSync('relogin'); return }
      if (clientAuthed) { try { localStorage.setItem(LS_KEY, JSON.stringify(all)) } catch {} }
      setSync('synced')
      toPush.forEach(push)
    } catch {
      serverOn.current = false
      setSync('local')
    }
  }, [push])

  useEffect(() => {
    setMounted(true)
    const isAuthed = localStorage.getItem('same_admin_login') === 'true'
    setAuthed(isAuthed)
    const user = localStorage.getItem('same_logged_user')
    if (user === 'manon' || user === 'dylan') setSel(user)

    let local: PetsData = { dylan: defaultPet(), manon: defaultPet() }
    if (isAuthed) {
      try {
        const raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null')
        if (raw) local = { dylan: tidyTodos(tidy(sanitizePet(raw.dylan))), manon: tidyTodos(tidy(sanitizePet(raw.manon))) }
      } catch {}
    }
    petsRef.current = local
    setPets(local)
    setNow(Date.now())
    pull()

    const tick = setInterval(() => setNow(Date.now()), 20000)
    const onVisible = () => { if (document.visibilityState === 'visible') pull() }
    document.addEventListener('visibilitychange', onVisible)
    const timers = pushTimers.current
    return () => {
      clearInterval(tick)
      document.removeEventListener('visibilitychange', onVisible)
      // flush pending saves
      WHOS.forEach(w => { if (timers[w]) { clearTimeout(timers[w]); timers[w] = undefined; push(w) } })
    }
  }, [pull, push])

  const commit = useCallback((who: Who, next: Pet) => {
    if (!petsRef.current) return
    const all = { ...petsRef.current, [who]: { ...next, rev: Date.now() } }
    petsRef.current = all
    setPets(all)
    setNow(Date.now())
    try { localStorage.setItem(LS_KEY, JSON.stringify(all)) } catch {}
    clearTimeout(pushTimers.current[who])
    pushTimers.current[who] = setTimeout(() => { pushTimers.current[who] = undefined; push(who) }, 500)
  }, [push])

  // ── mail ──
  const [mail, setMail] = useState<Record<Who, Letter[]>>({ dylan: [], manon: [] })
  const [compose, setCompose] = useState<{ item?: string } | null>(null)
  const [mailBusy, setMailBusy] = useState(false)
  const loadMail = useCallback(async () => {
    if (localStorage.getItem('same_admin_login') !== 'true') return
    if (!serverOn.current) {
      const all = readMail()
      setMail({ dylan: sanitizeMail(all.dylan), manon: sanitizeMail(all.manon) })
      return
    }
    try {
      const res = await Promise.all(WHOS.map(w => fetch(`/api/greenroom/mail?who=${w}`, { cache: 'no-store' }).then(r => r.json())))
      if (res.every(r => r?.ok)) setMail({ dylan: sanitizeMail(res[0].letters), manon: sanitizeMail(res[1].letters) })
    } catch {}
  }, [])
  useEffect(() => {
    if (!authed || (sync !== 'synced' && sync !== 'local')) return
    loadMail()
    const t = setInterval(() => { if (document.visibilityState === 'visible') loadMail() }, 60000)
    return () => clearInterval(t)
  }, [authed, sync, loadMail])

  // ── archive: old finished to-dos move out of the main save, but are never thrown away ──
  const storeArchive = useCallback(async (who: Who, months: Record<string, Todo[]>): Promise<boolean> => {
    try {
      const all = readArch()
      for (const [month, list] of Object.entries(months)) {
        const k = `${who}:${month}`
        all[k] = mergeTodos(sanitizeTodos(all[k], Date.now(), MAX_ARCHIVE), list)
      }
      localStorage.setItem(ARCH_KEY, JSON.stringify(all))
    } catch {
      return false
    }
    if (!serverOn.current) return true
    try {
      for (const [month, todos] of Object.entries(months)) {
        if (!(await putArchive(who, month, todos)).ok) return false
      }
      return true
    } catch {
      return false
    }
  }, [])

  const loadArchive = useCallback(async (who: Who, month: string): Promise<Todo[]> => {
    const local = sanitizeTodos(readArch()[`${who}:${month}`], Date.now(), MAX_ARCHIVE)
    if (!serverOn.current) return local
    try {
      const res = await fetch(`/api/greenroom/archive?who=${who}&month=${month}`, { cache: 'no-store' })
      const data = await res.json()
      if (!data?.ok) return local
      const remote = sanitizeTodos(data.todos, Date.now(), MAX_ARCHIVE)
      // anything archived while offline is sent up now
      const missing = local.filter(t => !remote.some(r => r.id === t.id))
      if (missing.length) putArchive(who, month, missing).catch(() => {})
      return mergeTodos(remote, local)
    } catch {
      return local
    }
  }, [])

  const archiving = useRef(false)
  useEffect(() => {
    if (!authed || (sync !== 'synced' && sync !== 'local') || archiving.current || !petsRef.current) return
    const today = dayKey()
    const jobs = WHOS.flatMap(w => {
      const r = splitArchive(petsRef.current![w], today)
      return r ? [{ who: w, months: r.months }] : []
    })
    if (!jobs.length) return
    archiving.current = true
    ;(async () => {
      for (const { who, months } of jobs) {
        // Only once the archive copy is safely stored do the to-dos leave the main save.
        if (!(await storeArchive(who, months))) continue
        const cur = petsRef.current?.[who]
        if (!cur) continue
        const moved = new Map(Object.values(months).flat().map(t => [t.id, t] as const))
        const hist = { ...cur.hist }
        const todos = cur.todos.filter(t => {
          if (!moved.has(t.id) || !t.done || !t.date) return true
          hist[t.date] = (hist[t.date] ?? 0) + 1
          return false
        })
        commit(who, { ...cur, todos, hist })
      }
      archiving.current = false
    })()
  }, [authed, sync, pets, commit, storeArchive])

  // ── small helpers ──
  const flash = (text: string) => {
    const id = ++seq.current
    setNotice({ text, id })
    setTimeout(() => setNotice(n => (n?.id === id ? null : n)), 2200)
  }
  const addFx = (f: Omit<Fx, 'id'>, ms = 1100) => {
    const id = ++seq.current
    setFx(a => [...a, { ...f, id }])
    setTimeout(() => setFx(a => a.filter(x => x.id !== id)), ms)
  }
  const hop = (who: Who) => setHops(h => ({ ...h, [who]: h[who] + 1 }))

  if (!pets) return <div className="fixed inset-0 z-[60] bg-black" />

  const canEdit = authed && sync !== 'loading' && sync !== 'relogin'
  const view = (w: Who) => settle(pets[w], now)
  const cur = (w: Who) => settle(petsRef.current![w], Date.now())
  const me = view(sel)
  const cast = CAST[sel]
  const needLogin = () => flash(sync === 'relogin' ? '다시 로그인해주세요.' : '로그인이 필요해요.')

  // Run a game rule against the freshest state of the selected character and save the result.
  const apply = <T extends { pet: Pet }>(fn: (p: Pet) => Fail | T): T | null => {
    if (!canEdit) { needLogin(); return null }
    const r = fn(cur(sel))
    if (isFail(r)) { flash(r); return null }
    commit(sel, tidy(r.pet))
    return r
  }
  const celebrate = (text: string) => { hop(sel); addFx({ who: sel, kind: 'float', text }) }

  // ── mail: a gift leaves the sender's bag first, and comes back if delivery fails ──
  const them = other(sel)
  const sendLetter = async (text: string, items: Record<string, number>, gold: number): Promise<boolean> => {
    const letter = newLetter(sel, text, items, gold)
    if (!apply(p => packGift(p, items, gold, text))) return false
    try {
      if (serverOn.current) {
        const d = await mailCall('POST', { letter })
        if (!d?.ok) throw new Error(d?.error)
      } else {
        const all = readMail()
        all[letter.to] = addToBox(sanitizeMail(all[letter.to]), letter)
        writeMail(all)
      }
      setMail(m => ({ ...m, [letter.to]: addToBox(m[letter.to], letter) }))
      hop(letter.from)
      addFx({ who: letter.from, kind: 'float', text: '✉' })
      return true
    } catch {
      if (hasGift(letter)) commit(letter.from, unpackGift(cur(letter.from), items, gold).pet)
      flash('보내지 못했어요. 선물은 돌려놨어요.')
      return false
    }
  }
  const claimLetter = async (id: string) => {
    if (!canEdit) return needLogin()
    const who = sel
    setMailBusy(true)
    try {
      let letter: Letter | null = null
      if (serverOn.current) {
        const d = await mailCall('PATCH', { who, id, op: 'claim' })
        if (!d?.ok) { flash(d?.error || '받지 못했어요.'); loadMail(); return }
        letter = sanitizeLetter(d.letter)
      } else {
        const all = readMail()
        const box = sanitizeMail(all[who])
        const found = box.find(l => l.id === id)
        if (!found || !giftWaiting(found)) { flash('이미 받은 선물이에요.'); return }
        letter = { ...found, claimed: true, read: true }
        all[who] = box.map(l => (l.id === id ? letter! : l))
        writeMail(all)
      }
      if (!letter) return
      commit(who, tidy(unpackGift(cur(who), letter.items, letter.gold).pet))
      const done = letter
      setMail(m => ({ ...m, [who]: m[who].map(l => (l.id === id ? done : l)) }))
      hop(who)
      addFx({ who, kind: 'float', text: '선물!' })
    } catch {
      flash('받지 못했어요.')
    } finally {
      setMailBusy(false)
    }
  }
  const touchLetter = (op: 'read' | 'delete', id: string) => {
    const who = sel
    setMail(m => ({ ...m, [who]: op === 'read' ? m[who].map(l => (l.id === id ? { ...l, read: true } : l)) : m[who].filter(l => l.id !== id) }))
    if (serverOn.current) { mailCall('PATCH', { who, id, op }).catch(() => {}); return }
    const all = readMail()
    const box = sanitizeMail(all[who])
    all[who] = op === 'read' ? box.map(l => (l.id === id ? { ...l, read: true } : l)) : box.filter(l => l.id !== id || giftWaiting(l))
    writeMail(all)
  }
  const mailApi: MailApi = {
    me: cast.name, them: CAST[them].name, themAccent: CAST[them].accent,
    inbox: mail[sel], sent: mail[them].filter(l => l.from === sel).slice(0, MAX_MAIL),
    unread: mail[sel].filter(l => !l.read).length, busy: mailBusy,
    compose: item => (canEdit ? setCompose({ item }) : needLogin()),
    claim: claimLetter, read: id => touchLetter('read', id), remove: id => touchLetter('delete', id), refresh: loadMail,
  }

  // ── washing ──
  const endWash = () => {
    const w = washRef.current
    if (!w) return
    washRef.current = null
    const p = cur(w.who)
    const done = w.progress >= 1
    commit(w.who, {
      ...p,
      clean: clamp(w.from + (100 - w.from) * Math.min(1, w.progress)),
      mood: clamp(p.mood + (done ? 6 : 0)),
    })
    if (done) { hop(w.who); addFx({ who: w.who, kind: 'float', text: '반짝 ✦' }) }
    setWash(null)
    lastPt.current = null
    setTimeout(() => setBubbles([]), done ? 500 : 0)
  }

  const startWash = () => {
    if (!canEdit) return needLogin()
    const p = cur(sel)
    if (p.asleep) return flash('자고 있어요. 먼저 깨워주세요.')
    if (p.clean >= 95) return flash('이미 반짝반짝해요.')
    if (p.gold < WASH_COST) return flash('금화가 모자라요. 탐험에서 벌거나 별빛 상점에서 바꿔 오세요.')
    commit(sel, { ...p, gold: p.gold - WASH_COST })
    setPanel(null)
    setBubbles([])
    scrubAcc.current = 0
    lastPt.current = null
    setWash({ who: sel, from: p.clean, progress: 0 })
  }

  const onScrub = (e: React.PointerEvent<HTMLDivElement>) => {
    const w = washRef.current
    if (!w) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const last = lastPt.current
    lastPt.current = { x, y }
    if (!last) return
    const d = Math.hypot(x - last.x, y - last.y)
    scrubAcc.current += d
    if (scrubAcc.current > 20) {
      scrubAcc.current = 0
      const id = ++seq.current
      setBubbles(b => [...b.slice(-44), {
        id, x: clamp(x / rect.width * 100), y: clamp(y / rect.height * 100), r: 5 + Math.random() * 9,
      }])
    }
    const progress = Math.min(1, w.progress + d / (rect.width * 9))
    const next = { ...w, progress }
    washRef.current = next
    if (progress >= 1) endWash()
    else setWash(next)
  }

  // ── actions ──
  const select = (who: Who) => {
    if (who === sel) return
    endWash()
    setSel(who)
    setPanel(null)
  }

  const onSpriteClick = (who: Who) => {
    if (washRef.current) return
    if (who !== sel) return select(who)
    if (view(who).asleep) return flash('쉿, 자고 있어요.')
    hop(who)
    addFx({ who, kind: 'float', text: '♥' })
    if (canEdit && Date.now() - lastPetAt.current[who] > 5000) {
      lastPetAt.current[who] = Date.now()
      const p = cur(who)
      commit(who, { ...p, mood: clamp(p.mood + 2) })
    }
  }

  const feed = (f: typeof FOODS[number]) => {
    if (!canEdit) return needLogin()
    const p = cur(sel)
    if (p.asleep) return flash('자고 있어요. 먼저 깨워주세요.')
    if (p.full >= 98) return flash('배가 불러서 더는 못 먹어요.')
    if (p.gold < f.cost) return flash('금화가 모자라요. 탐험에서 벌거나 별빛 상점에서 바꿔 오세요.')
    commit(sel, { ...p, gold: p.gold - f.cost, full: clamp(p.full + f.full), mood: clamp(p.mood + f.mood) })
    const who = sel
    addFx({ who, kind: 'eat', icon: f.icon }, 850)
    setTimeout(() => { hop(who); addFx({ who, kind: 'float', text: '냠' }, 900) }, 800)
  }

  const play = (t: typeof TOYS[number]) => {
    if (!canEdit) return needLogin()
    const p = cur(sel)
    if (p.asleep) return flash('자고 있어요. 먼저 깨워주세요.')
    if (p.mood >= 98) return flash('이미 기분이 최고예요.')
    if (p.gold < t.cost) return flash('금화가 모자라요. 탐험에서 벌거나 별빛 상점에서 바꿔 오세요.')
    commit(sel, { ...p, gold: p.gold - t.cost, mood: clamp(p.mood + t.mood), energy: clamp(p.energy + t.energy) })
    hop(sel)
    addFx({ who: sel, kind: 'float', text: t.id === 'musicbox' ? '♪ ♫' : '✿' })
  }

  const toggleSleep = () => {
    if (!canEdit) return needLogin()
    endWash()
    const p = cur(sel)
    if (p.asleep) { commit(sel, { ...p, asleep: false }); return }
    if (p.energy >= 95) return flash('아직 하나도 안 졸려 보여요.')
    setPanel(null)
    commit(sel, { ...p, asleep: true })
  }

  const ownedFood = Object.entries(me.rpg.inv).filter(([id, n]) => n > 0 && ITEMS[id]?.food)
  const eatOwned = (id: string) => {
    const who = sel
    const r = apply(p => doEat(p, id))
    if (r) { hop(who); addFx({ who, kind: 'float', text: '냠' }, 900) }
  }

  const tabDef = TABS.find(t => t.id === tab) ?? TABS[0]
  const lateCount = overdue(me, dayKey(now || Date.now())).length
  const goTab = (t: Tab) => {
    setTab(t)
    if (window.matchMedia('(max-width: 1023px)').matches) panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const short = (ms: number) => {
    const m = Math.ceil(ms / 60000)
    return m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${Math.max(1, m)}분`
  }
  const todayKey = dayKey(now || Date.now())
  const pendingToday = itemsFor(me, todayKey, todayKey).filter(t => !t.done).length
  const act = Math.floor(me.doneCount / 5) + 1
  const clock = now || Date.now()
  const plots = Array.from({ length: plotCount(me.rpg) }, (_, i) => me.rpg.plots[i] ?? null)
  const ripe = plots.filter(p => p && p.readyAt <= clock).length
  const growing = plots.filter(p => p && p.readyAt > clock)
  const nextCrop = growing.length ? Math.min(...growing.map(p => p!.readyAt)) : 0
  const nowRows = ([
    { key: 'todo', label: '오늘 할 일', value: pendingToday ? `${pendingToday}개 남음` : '모두 끝냄', tone: pendingToday ? undefined : cast.accent, tab: 'todo' },
    lateCount > 0 && { key: 'late', label: '밀린 일', value: `${lateCount}개`, tone: LOW, tab: 'todo' },
    mailApi.unread > 0 && { key: 'mail', label: '우편', value: `새 편지 ${mailApi.unread}`, tone: PINK, tab: 'mail' },
    me.rpg.job && { key: 'job', label: jobLabel(me.rpg.job), value: me.rpg.job.endsAt <= clock ? '돌아옴' : short(me.rpg.job.endsAt - clock), tone: me.rpg.job.endsAt <= clock ? GOLD : undefined, tab: 'life' },
    (ripe > 0 || growing.length > 0) && { key: 'farm', label: '텃밭', value: ripe ? `수확 ${ripe}칸` : `${growing.length}칸 · ${short(nextCrop - clock)}`, tone: ripe ? GOLD : undefined, tab: 'life' },
    me.rpg.brew && { key: 'brew', label: `가마솥 · ${ITEMS[BREWS[me.rpg.brew.id]?.out ?? '']?.name ?? ''}`, value: me.rpg.brew.readyAt <= clock ? '완성' : short(me.rpg.brew.readyAt - clock), tone: me.rpg.brew.readyAt <= clock ? GOLD : undefined, tab: 'forge' },
    me.rpg.meal && { key: 'meal', label: ITEMS[me.rpg.meal.id]?.name ?? '식사', value: `결투 ${me.rpg.meal.left}회`, tone: GOLD, tab: 'hunt' },
    me.rpg.boon > 0 && { key: 'boon', label: '별의 가호', value: `결투 ${me.rpg.boon}회`, tone: GOLD, tab: 'hunt' },
  ] as const).filter(Boolean) as { key: string; label: string; value: string; tone?: string; tab: Tab }[]
  const washing = wash?.who === sel
  const lightsOn = !me.asleep

  const syncLabel: Record<Sync, string> = {
    loading: 'loading…',
    synced: authed ? 'saved' : 'watching',
    saving: 'saving…',
    local: authed ? 'local only · 이 기기에만 저장 중' : 'offline',
    relogin: 'session expired',
  }


  return (
    <div className="gr-root fixed inset-0 z-[60] bg-black overflow-hidden text-white">
      <style>{CSS}</style>
      {compose && (
        <GiftModal pet={me} from={cast.name} to={CAST[them].name} toAccent={CAST[them].accent} start={compose.item}
          onSend={sendLetter} onClose={() => setCompose(null)} />
      )}
      <div className="hidden sm:block">
        <EdgeCurtain side="left" />
        <EdgeCurtain side="right" />
      </div>

      {/* Frame line */}
      <div className="fixed pointer-events-none z-[3] sketch-jitter-line hidden sm:block" style={{
        top: 'clamp(28px, 3vw, 48px)', left: '7%', right: '7%', height: '1px',
        background: 'rgba(255,255,255,0.1)', filter: 'url(#sketchy)',
      }} />

      {/* Top bar */}
      <div className={`fixed top-0 left-0 right-0 z-[10] flex items-center justify-between ${mounted ? 'animate-fade-slide-up' : 'opacity-0'}`}
        style={{ padding: 'clamp(16px, 3vw, 44px) max(var(--gut), clamp(16px, 9vw, 100px)) 10px', background: 'linear-gradient(to bottom, #000 70%, transparent)' }}>
        <button onClick={() => router.push('/')}
          className="label-caps text-white/40 hover:text-white/80 transition-colors cursor-pointer"
          style={{ fontSize: '0.55rem', letterSpacing: '0.25em' }}>
          ← BACK
        </button>
        <div className="flex items-baseline gap-2">
          <span className="label-caps text-white/25" style={{ fontSize: '0.5rem', letterSpacing: '0.3em' }}>GREENROOM</span>
          <span className="text-white/15">·</span>
          <span className="heading-condensed text-white/40" style={{ fontStyle: 'italic', fontSize: '0.7rem' }}>
            To-do &amp; Care
          </span>
        </div>
      </div>

      {/* Side motifs */}
      <div className="fixed pointer-events-none z-[2] hidden lg:block" style={{ top: '12%', left: '8%' }}>
        <MagicSparkle opacity={0.1} size={0.9} count={5} />
      </div>
      <div className="fixed pointer-events-none z-[2] hidden lg:block" style={{ bottom: '8%', right: '8%' }}>
        <BalletRibbon opacity={0.07} size={0.9} />
      </div>

      {/* Main */}
      <div className="absolute inset-0 flex flex-col overflow-y-auto lg:overflow-hidden" style={{
        paddingTop: 'clamp(46px, 6.5vw, 92px)',
        paddingBottom: 56,
        paddingLeft: 'var(--gut)', paddingRight: 'var(--gut)',
      }}>
        {/* Header */}
        <div className={`flex items-center justify-center gap-3 mb-4 shrink-0 ${mounted ? 'animate-fade-slide-up stagger-1' : 'opacity-0'}`}>
          <span className="block h-px sketch-jitter-line" style={{ width: 'clamp(24px, 6vw, 80px)', background: 'rgba(255,255,255,0.2)', filter: 'url(#sketchy)' }} />
          <h1 className="heading-display" style={{ fontSize: 'clamp(1.2rem, 2.2vw, 1.7rem)', color: 'rgba(255,255,255,0.92)', lineHeight: 1.1 }}>
            분장실
          </h1>
          <span className="block h-px sketch-jitter-line" style={{ width: 'clamp(24px, 6vw, 80px)', background: 'rgba(255,255,255,0.2)', filter: 'url(#sketchy)' }} />
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 lg:gap-10 lg:flex-1 lg:min-h-0 ${mounted ? 'animate-fade-slide-up stagger-2' : 'opacity-0'}`}>

          {/* ═════ Left: the room ═════ */}
          <section className="flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto lg:pr-2" aria-label="분장실">
            {/* purse and progress */}
            <div className="flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-end gap-4">
              <span className="flex items-center gap-[6px]" style={{ color: cast.accent }} title="별빛 — 할 일을 끝내면 받아요">
                <span key={coinPulse} className={coinPulse ? 'gr-coin-pulse inline-flex' : 'inline-flex'}><Icon name="coin" size={17} /></span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.45rem', fontWeight: 700, lineHeight: 1 }} aria-label={`${cast.name}의 별빛`}>{me.coins}</span>
                <span className="label-caps" style={{ fontSize: '0.46rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)' }}>별빛</span>
              </span>
              <span className="flex items-center gap-[5px]" style={{ color: GOLD }} title="금화 — 탐험과 판매로 벌어요">
                <Icon name="gold" size={14} />
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, lineHeight: 1 }} aria-label={`${cast.name}의 금화`}>{me.gold}</span>
                <span className="label-caps" style={{ fontSize: '0.46rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.35)' }}>금화</span>
              </span>
            </div>
            <div className="text-right">
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.1 }}>
                Lv.{me.rpg.lv} <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span> Act {act}
              </div>
              <div className="flex gap-[3px] justify-end mt-1" title={`다음 막까지 ${5 - (me.doneCount % 5)}개`}>
                {[0, 1, 2, 3, 4].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, border: '1px solid rgba(255,255,255,0.4)',
                    background: i < me.doneCount % 5 ? cast.accent : 'transparent',
                  }} />
                ))}
              </div>
            </div>
            </div>

            {/* Stage */}
            <div className="gr-stage relative shrink-0 overflow-hidden" style={{ marginTop: -6 }}>
              {/* floor */}
              <svg className="absolute inset-0 w-full h-full sketch-jitter-line pointer-events-none" viewBox="0 0 100 100"
                preserveAspectRatio="none" style={{ filter: 'url(#sketchy)' }} aria-hidden>
                <line x1="0" y1="62" x2="100" y2="62" stroke="rgba(255,255,255,0.22)" strokeWidth="0.4" />
                {[70, 79, 89].map((y, i) => (
                  <line key={y} x1={4 - i} y1={y} x2={96 + i} y2={y} stroke={`rgba(255,255,255,${0.07 + i * 0.03})`} strokeWidth="0.3" />
                ))}
                {[[14, 62, 70], [38, 62, 70], [61, 62, 70], [84, 62, 70], [25, 70, 79], [50, 70, 79], [74, 70, 79], [10, 79, 89], [36, 79, 89], [63, 79, 89], [88, 79, 89]].map(([x, y1, y2], i) => (
                  <line key={i} x1={x} y1={y1 + 1} x2={x} y2={y2 - 1} stroke="rgba(255,255,255,0.07)" strokeWidth="0.25" />
                ))}
              </svg>

              {/* spotlight on the selected character */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, ${cast.accent}2E 100%)`,
                clipPath: `polygon(${cast.x - 1.5}% 0, ${cast.x + 1.5}% 0, ${cast.x + 19}% calc(100% - 30px), ${cast.x - 19}% calc(100% - 30px))`,
                transition: 'clip-path 0.6s cubic-bezier(0.76,0,0.24,1), opacity 0.8s',
                opacity: lightsOn ? 1 : 0.15,
              }} />
              <div className="absolute pointer-events-none rounded-[50%]" style={{
                left: `${cast.x - 19}%`, width: '38%', bottom: 16, height: 30,
                border: '1px solid rgba(255,255,255,0.16)',
                background: `radial-gradient(ellipse, ${cast.accent}26 0%, transparent 70%)`,
                transition: 'left 0.6s cubic-bezier(0.76,0,0.24,1), opacity 0.8s',
                opacity: lightsOn ? 1 : 0.2,
              }} />

              {WHOS.map(w => (
                <Character key={w} who={w} pet={view(w)} selected={w === sel}
                  washing={wash?.who === w}
                  bubbles={wash?.who === w || (w === sel && bubbles.length > 0 && !wash) ? bubbles : []}
                  fx={fx.filter(f => f.who === w)} hop={hops[w]}
                  onClick={() => onSpriteClick(w)}
                  onScrub={onScrub}
                  onScrubEnd={() => { lastPt.current = null }} />
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-3 shrink-0">
              <StatBar label="포만감" value={me.full} accent={cast.accent} />
              <StatBar label="청결" value={me.clean} accent={cast.accent} />
              <StatBar label="기분" value={me.mood} accent={cast.accent} />
              <StatBar label="기력" value={me.energy} accent={cast.accent} />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0" style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '0.8rem' }}>
              {([
                { on: panel === 'feed', off: washing, icon: 'soup', label: '먹이기', act: () => setPanel(p => p === 'feed' ? null : 'feed') },
                { on: washing, off: false, icon: 'soap', label: washing ? '헹구기' : '씻기기', cost: washing ? 0 : WASH_COST, act: () => washing ? endWash() : startWash() },
                { on: panel === 'play', off: washing, icon: 'note', label: '놀아주기', act: () => setPanel(p => p === 'play' ? null : 'play') },
                { on: me.asleep, off: false, icon: me.asleep ? 'sun' : 'moon', label: me.asleep ? '깨우기' : '재우기', act: toggleSleep },
              ] as { on: boolean; off: boolean; icon: IconName; label: string; cost?: number; act: () => void }[]).map(b => (
                <SketchButton key={b.label} on={b.on} disabled={b.off} onClick={b.act} style={{ padding: '9px 2px', minHeight: 50 }}>
                  <span className="flex flex-col sm:flex-row items-center gap-[3px] sm:gap-2 whitespace-nowrap">
                    <Icon name={b.icon} />
                    <span className="flex flex-col items-center leading-tight">
                      <span style={{ fontSize: 'clamp(0.7rem, 2.6vw, 0.8rem)' }}>{b.label}</span>
                      {!!b.cost && <Gold n={b.cost} size="0.6rem" />}
                    </span>
                  </span>
                </SketchButton>
              ))}
            </div>

            {/* Tray */}
            <div className="shrink-0" style={{ display: washing || panel ? 'block' : 'none' }}>
              {washing && wash ? (
                <div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontFamily: "'Gowun Batang', serif" }}>
                    문질러서 씻기기
                  </p>
                  <div className="relative mt-2 sketch-jitter-line" style={{ height: 9, border: '1px solid rgba(255,255,255,0.3)', filter: 'url(#sketchy)' }}
                    role="progressbar" aria-label="씻기기 진행" aria-valuenow={Math.round(wash.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <div style={{ height: '100%', width: `${wash.progress * 100}%`, background: '#fff', opacity: 0.85 }} />
                  </div>
                </div>
              ) : panel === 'feed' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FOODS.map(f => (
                    <SketchButton key={f.id} onClick={() => feed(f)} style={{ padding: '8px 6px', opacity: me.gold < f.cost ? 0.45 : 1 }}
                      title={`포만감 +${f.full}${f.mood ? ` · 기분 +${f.mood}` : ''}`}>
                      <Icon name={f.icon} size={20} />
                      <span className="flex flex-col items-start leading-tight">
                        <span style={{ fontSize: '0.78rem', fontFamily: "'Noto Serif KR', serif" }}>{f.label}</span>
                        <Gold n={f.cost} />
                      </span>
                    </SketchButton>
                  ))}
                  {ownedFood.map(([id, n]) => (
                    <SketchButton key={id} onClick={() => eatOwned(id)} style={{ padding: '8px 6px' }} title={ITEMS[id]?.desc}>
                      <span className="flex flex-col items-center leading-tight">
                        <span style={{ fontSize: '0.78rem', fontFamily: "'Noto Serif KR', serif" }}>{ITEMS[id]?.name ?? id}</span>
                        <span style={{ fontSize: '0.68rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>가방 ×{n}</span>
                      </span>
                    </SketchButton>
                  ))}
                </div>
              ) : panel === 'play' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TOYS.map(t => (
                    <SketchButton key={t.id} onClick={() => play(t)} style={{ padding: '8px 6px', opacity: me.gold < t.cost ? 0.45 : 1 }}
                      title={`기분 +${t.mood}`}>
                      <Icon name={t.icon} size={20} />
                      <span className="flex flex-col items-start leading-tight">
                        <span style={{ fontSize: '0.78rem', fontFamily: "'Noto Serif KR', serif" }}>{t.label}</span>
                        <Gold n={t.cost} />
                      </span>
                    </SketchButton>
                  ))}
                </div>
              ) : null}
            </div>

            {/* now: what is waiting, at a glance */}
            {authed && sync !== 'relogin' && nowRows.length > 0 && (
              <div className="relative shrink-0" style={{ padding: '12px 14px 8px' }}>
                <span className="absolute inset-0 pointer-events-none sketch-jitter-line" style={{ border: '1px solid rgba(255,255,255,0.1)', filter: 'url(#sketchy)' }} />
                <p className="label-caps relative" style={{ fontSize: '0.5rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>NOW</p>
                <ul className="relative">
                  {nowRows.map(r => (
                    <li key={r.key}>
                      <button onClick={() => goTab(r.tab)} className="gr-now-row w-full flex items-baseline gap-2 cursor-pointer text-left" style={{ background: 'none', padding: '5px 4px' }}>
                        <span className="shrink-0" style={{ fontSize: '0.8rem', fontFamily: "'Noto Serif KR', serif", color: 'rgba(255,255,255,0.75)' }}>{r.label}</span>
                        <span className="flex-1 border-b border-dotted" style={{ borderColor: 'rgba(255,255,255,0.15)', transform: 'translateY(-3px)' }} />
                        <span className="shrink-0" style={{ fontSize: '0.8rem', fontFamily: "'Playfair Display', 'Noto Serif KR', serif", fontStyle: 'italic', color: r.tone ?? 'rgba(255,255,255,0.85)' }}>{r.value}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* ═════ Right: cue sheet (to-do) ═════ */}
          <section ref={panelRef} className="relative flex flex-col lg:min-h-0 px-3 sm:px-5" aria-label="할 일과 모험" style={{ paddingTop: 16, paddingBottom: 14, scrollMarginTop: 40 }}>
            <span className="absolute inset-0 pointer-events-none sketch-jitter-line" style={{
              border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)', filter: 'url(#sketchy)',
            }} />
            <span className="absolute inset-1 pointer-events-none" style={{ border: '1px solid rgba(255,255,255,0.04)' }} />

            <div className="relative flex items-end justify-between gap-3 mb-3 shrink-0">
              <div>
                <p className="label-caps" style={{ fontSize: '0.5rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)' }}>{tabDef.en}</p>
                <h2 className="heading-display" style={{ fontSize: '1.2rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.92)', lineHeight: 1.3 }}>
                  <span style={{ color: cast.accent }}>{cast.name}</span>의 {tabDef.title}
                </h2>
              </div>
              {authed && <div className="flex" role="tablist" aria-label="캐릭터 선택" style={{ border: '1px solid rgba(255,255,255,0.14)' }}>
                {WHOS.map(w => (
                  <button key={w} role="tab" aria-selected={w === sel} onClick={() => select(w)}
                    className="relative cursor-pointer" style={{
                      background: w === sel ? 'rgba(255,255,255,0.07)' : 'none', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '0.86rem',
                      color: w === sel ? CAST[w].accent : 'rgba(255,255,255,0.35)', transition: 'color 0.3s, background 0.3s', padding: '4px 12px',
                    }}>
                    {CAST[w].name}
                    {w !== sel && mail[w].some(l => !l.read) && <span aria-label="새 편지" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 5, background: PINK, marginLeft: 3, verticalAlign: 'super' }} />}
                    {w === sel && <span className="absolute left-2 right-2 sketch-jitter-line" style={{ bottom: 2, height: 1, background: CAST[w].accent, filter: 'url(#sketchy)' }} />}
                  </button>
                ))}
              </div>}
            </div>

            {authed && sync !== 'relogin' && (
              <div className="gr-dock relative grid grid-cols-8 gap-[4px] sm:gap-[6px] mb-3 shrink-0 -mx-1 px-1 py-1" role="tablist" aria-label="메뉴"
                style={{ fontFamily: "'Noto Serif KR', serif" }}>
                {TABS.map(t => (
                  <SketchButton key={t.id} on={tab === t.id} onClick={() => setTab(t.id)} style={{ padding: '6px 0 5px' }}>
                    <span className="flex flex-col items-center gap-[2px] whitespace-nowrap">
                      <Icon name={t.icon} size={15} />
                      <span style={{ fontSize: 'clamp(0.6rem, 2.4vw, 0.72rem)', letterSpacing: '-0.02em' }}>{t.label}</span>
                    </span>
                    {t.id === 'mail' && mailApi.unread > 0 && (
                      <span className="absolute flex items-center justify-center" style={{
                        top: -5, right: -4, minWidth: 15, height: 15, borderRadius: 15, padding: '0 3px',
                        background: PINK, color: '#000', fontSize: '0.58rem', fontFamily: "'Pretendard Variable', sans-serif", fontWeight: 700,
                      }}>{mailApi.unread}</span>
                    )}
                    {t.id === 'todo' && lateCount > 0 && tab !== 'todo' && (
                      <span className="absolute" style={{ top: 3, right: 4, width: 5, height: 5, borderRadius: 5, background: LOW }} />
                    )}
                  </SketchButton>
                ))}
              </div>
            )}

            {authed && sync !== 'relogin' && (
              <div key={sel} className="relative flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2" style={{ minHeight: 220 }}>
                {([
                  ['todo', TodoPanel], ['shop', ShopPanel], ['hunt', HuntPanel], ['life', LifePanel], ['forge', ForgePanel], ['bag', BagPanel], ['mail', MailPanel], ['dex', CodexPanel],
                ] as const).map(([id, Panel]) => (
                  <div key={id} hidden={tab !== id}>
                    <Panel pet={me} name={cast.name} accent={cast.accent} apply={apply} notify={flash} celebrate={celebrate} onCoins={() => setCoinPulse(n => n + 1)}
                      ready={canEdit} archive={month => loadArchive(sel, month)} mail={mailApi} />
                  </div>
                ))}
              </div>
            )}

            {!authed || sync === 'relogin' ? (
              <div className="relative flex-1 flex flex-col items-center justify-center gap-4 py-8 text-center">
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.05rem', color: 'rgba(255,255,255,0.8)' }}>
                  오늘 남은 할 일 {pendingToday} · 끝낸 일 {me.doneCount}
                </p>
                {showLogin || sync === 'relogin' ? (
                  <LoginInline onDone={() => { setAuthed(true); setShowLogin(false); setSync('loading'); pull() }} />
                ) : (
                  <SketchButton onClick={() => setShowLogin(true)}
                    style={{ padding: '8px 22px', fontSize: '0.7rem', letterSpacing: '0.22em', fontFamily: "'Pretendard Variable', sans-serif" }}>
                    LOGIN
                  </SketchButton>
                )}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {/* notices */}
      <div aria-live="polite" className="fixed z-[70] pointer-events-none" style={{ left: '50%', bottom: 44 }}>
        {notice && (
          <p key={notice.id} className="gr-toast relative" style={{
            transform: 'translateX(-50%)', width: 'max-content', maxWidth: 'calc(100vw - 32px)', textAlign: 'center', wordBreak: 'keep-all',
            padding: '8px 16px', background: '#000', color: PINK, fontSize: '0.82rem', fontFamily: "'Gowun Batang', 'Noto Serif KR', serif",
            border: `1px solid ${PINK}80`, boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
          }}>{notice.text}</p>
        )}
      </div>

      {/* Footer */}
      <div className={`fixed bottom-0 left-0 right-0 z-[5] flex justify-between items-end pointer-events-none ${mounted ? 'animate-fade-slide-up stagger-4' : 'opacity-0'}`}
        style={{ padding: '22px clamp(40px, 9vw, 100px) 12px', background: 'linear-gradient(to bottom, transparent, #000 55%)' }}>
        <span className="label-caps text-white/15" style={{ fontSize: '0.45rem', letterSpacing: '0.3em' }}>SOMBRE · GREENROOM</span>
        <span className="heading-condensed" style={{ fontStyle: 'italic', fontSize: '0.6rem', color: sync === 'relogin' ? LOW : 'rgba(255,255,255,0.3)' }}>
          {syncLabel[sync]}
        </span>
      </div>
    </div>
  )
}
