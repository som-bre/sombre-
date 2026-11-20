'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TIERS, MAX_TEXT, MAX_MEMO, type Todo, type Category } from '@/lib/greenroom'
import { statsOf } from '@/lib/greenroomRpg'
import {
  WEEKDAYS, CAT_COLORS, PERFECT_BONUS, PERFECT_MIN,
  dayKey, parseDay, addDays, dayLabel, itemsFor, overdue, lateDays, tally, streak, streakBonus, monthDone, routineDays,
  addTodo, toggleTodo, editTodo, removeTodo, carryOver, dropOverdue, setAutoCarry,
  addRoutine, removeRoutine, addCat, editCat, removeCat,
} from '@/lib/greenroomTodo'
import { SketchButton, Coins, PINK, LOW } from './ui'
import { Mini, Label, Note, Box, type PanelProps } from './RpgPanels'

const SERIF = "'Noto Serif KR', serif"
const DISPLAY = "'Playfair Display', serif"
const dim = (a: number) => `rgba(255,255,255,${a})`
const NONE = '#8A8A8A'

const fieldStyle: React.CSSProperties = {
  background: 'transparent', borderBottom: `1px solid ${dim(0.25)}`, color: '#fff',
  padding: '6px 2px', fontSize: '0.86rem', fontFamily: SERIF, colorScheme: 'dark',
}

function Chip({ on, onClick, color, children, title }: {
  on: boolean; onClick: () => void; color?: string; children: React.ReactNode; title?: string
}) {
  return (
    <button type="button" role="radio" aria-checked={on} onClick={onClick} title={title}
      className="cursor-pointer inline-flex items-center gap-[5px]" style={{
        background: on ? dim(0.08) : 'transparent',
        border: `1px solid ${on ? (color ?? dim(0.45)) : dim(0.12)}`,
        color: on ? '#fff' : dim(0.45),
        padding: '3px 9px', fontSize: '0.72rem', fontFamily: SERIF, transition: 'all 0.2s',
      }}>
      {color && <span style={{ width: 6, height: 6, borderRadius: 6, background: color, opacity: on ? 1 : 0.6 }} />}
      {children}
    </button>
  )
}

function Check({ done, color, label, onClick }: { done: boolean; color: string; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick} role="checkbox" aria-checked={done} aria-label={label}
      className={`relative shrink-0 mt-[3px] ${onClick ? 'cursor-pointer' : ''}`} style={{ width: 17, height: 17, background: 'none' }}>
      <span className="absolute inset-0 sketch-jitter-line" style={{ border: `1px solid ${done ? color : dim(0.5)}`, filter: 'url(#sketchy)' }} />
      {done && (
        <svg className="absolute" viewBox="0 0 20 20" style={{ left: -1, top: -4, width: 22, height: 22, filter: 'url(#sketchy)' }} aria-hidden>
          <path d="M3.5 11l4.5 4.5L18 3.5" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

// ── month calendar ──

function Calendar({ month, setMonth, day, setDay, today, marks, accent }: {
  month: string; setMonth: (m: string) => void; day: string; setDay: (d: string) => void
  today: string; marks: Record<string, [number, number]>; accent: string
}) {
  const first = parseDay(`${month}-01`)
  const start = addDays(dayKey(first), -first.getDay())
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  const weeks = cells.slice(35).some(c => c.startsWith(month)) ? 6 : 5
  const shift = (n: number) => {
    const d = new Date(first.getFullYear(), first.getMonth() + n, 1)
    setMonth(dayKey(d).slice(0, 7))
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <button onClick={() => shift(-1)} aria-label="이전 달" className="cursor-pointer px-2" style={{ background: 'none', color: dim(0.5), fontFamily: DISPLAY }}>‹</button>
        <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.9rem', color: dim(0.85) }}>
          {first.getFullYear()}. {first.getMonth() + 1}
        </span>
        <button onClick={() => shift(1)} aria-label="다음 달" className="cursor-pointer px-2" style={{ background: 'none', color: dim(0.5), fontFamily: DISPLAY }}>›</button>
      </div>
      <div className="grid grid-cols-7 text-center" role="grid" aria-label="달력">
        {WEEKDAYS.map((w, i) => (
          <span key={w} className="label-caps" style={{ fontSize: '0.5rem', color: i === 0 ? `${LOW}CC` : dim(0.3), paddingBottom: 3 }}>{w}</span>
        ))}
        {cells.slice(0, weeks * 7).map(c => {
          const inMonth = c.startsWith(month)
          const [done, total] = marks[c] ?? [0, 0]
          const all = total > 0 && done === total
          const missed = c < today && total > done
          const picked = c === day
          return (
            <button key={c} onClick={() => setDay(c)} aria-label={`${c}${total ? `, ${total}개 중 ${done}개 완료` : ''}`} aria-current={c === today ? 'date' : undefined}
              className="relative cursor-pointer flex flex-col items-center" style={{ background: 'none', padding: '3px 0 2px', opacity: inMonth ? 1 : 0.25 }}>
              {picked && <span className="absolute inset-[1px] sketch-jitter-line pointer-events-none" style={{ border: `1px solid ${accent}`, filter: 'url(#sketchy)' }} />}
              <span style={{
                fontFamily: DISPLAY, fontSize: '0.78rem', lineHeight: 1.3,
                color: picked ? '#fff' : c === today ? accent : dim(0.7),
                fontWeight: c === today ? 700 : 400, textDecoration: c === today ? 'underline' : 'none', textUnderlineOffset: 3,
              }}>{parseDay(c).getDate()}</span>
              <span style={{ height: 11, fontSize: '0.56rem', lineHeight: '11px', fontFamily: DISPLAY, fontStyle: 'italic', color: all ? accent : missed ? LOW : dim(0.4) }}>
                {total === 0 ? '' : all ? '✦' : total - done}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── one to-do's detail editor ──

function Editor({ todo, cats, today, onPatch, onRemove, onClose }: {
  todo: Todo; cats: Category[]; today: string
  onPatch: (patch: Parameters<typeof editTodo>[2]) => void; onRemove: () => void; onClose: () => void
}) {
  const [text, setText] = useState(todo.text)
  const [memo, setMemo] = useState(todo.memo ?? '')
  const [time, setTime] = useState(todo.time ?? '')
  const date = todo.date ?? today
  // Edits save themselves: the name on Enter or when the field loses focus, the memo on blur, the time at once.
  const saveText = () => {
    const v = text.trim()
    if (!v) { setText(todo.text); return }
    if (v !== todo.text) onPatch({ text: v })
  }
  const saveMemo = () => { if (memo.trim() !== (todo.memo ?? '')) onPatch({ memo }) }
  return (
    <div className="flex flex-col gap-2 pb-3 pl-[29px]" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
      <input value={text} onChange={e => setText(e.target.value)} onBlur={saveText} maxLength={MAX_TEXT} aria-label="할 일 내용"
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.blur() }
          if (e.key === 'Escape') { setText(todo.text); e.currentTarget.blur() }
        }}
        className="gr-input outline-none w-full" style={fieldStyle} />
      <textarea value={memo} onChange={e => setMemo(e.target.value)} onBlur={saveMemo} maxLength={MAX_MEMO} rows={2} placeholder="메모" aria-label="메모"
        className="gr-input outline-none w-full resize-none" style={{ ...fieldStyle, fontSize: '0.78rem', border: `1px solid ${dim(0.12)}`, padding: '6px 8px' }} />
      <div className="flex flex-wrap items-center gap-2" style={{ fontSize: '0.72rem', fontFamily: SERIF, color: dim(0.5) }}>
        <label className="inline-flex items-center gap-2">시간
          <input type="time" value={time} onChange={e => { setTime(e.target.value); onPatch({ time: e.target.value || null }) }} className="outline-none" style={{ ...fieldStyle, fontSize: '0.76rem', padding: '2px' }} />
        </label>
        <label className="inline-flex items-center gap-2">날짜
          <input type="date" value={date} onChange={e => e.target.value && onPatch({ date: e.target.value })} className="outline-none" style={{ ...fieldStyle, fontSize: '0.76rem', padding: '2px' }} />
        </label>
        {todo.since && todo.since !== date && <span>처음 예정일 {todo.since.slice(5).replace('-', '/')}</span>}
      </div>
      {!todo.done && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="보상 크기">
          {TIERS.map((t, i) => <Chip key={t.label} on={todo.tier === i} onClick={() => onPatch({ tier: i })}>{t.label} <Coins n={t.coins} size="0.68rem" /></Chip>)}
        </div>
      )}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="분류">
        {cats.map(c => <Chip key={c.id} on={todo.cat === c.id} color={c.color} onClick={() => onPatch({ cat: c.id })}>{c.name}</Chip>)}
        <Chip on={!todo.cat || !cats.some(c => c.id === todo.cat)} color={NONE} onClick={() => onPatch({ cat: null })}>분류 없음</Chip>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {!todo.done && date !== today && <Mini onClick={() => onPatch({ date: today })}>오늘로</Mini>}
        {!todo.done && <Mini onClick={() => onPatch({ date: addDays(date < today ? today : date, 1) })}>내일로 미루기</Mini>}
        <Mini onClick={onRemove}>{todo.routine && !todo.done ? '오늘은 건너뛰기' : '삭제'}</Mini>
        <Mini onClick={onClose}>닫기</Mini>
      </div>
    </div>
  )
}

// ═════════════════════════ new to-do (portal popup) ═════════════════════════

export interface Draft { text: string; memo: string; date: string; time: string; cat: string; tier: number; days: number[] }

function Composer({ start, cats, today, accent, onCreate, onClose }: {
  start: Draft; cats: Category[]; today: string; accent: string
  onCreate: (d: Draft) => boolean // true when it was added
  onClose: () => void
}) {
  const [d, setD] = useState<Draft>(start)
  const [made, setMade] = useState(0)
  const textRef = useRef<HTMLInputElement>(null)
  const set = (patch: Partial<Draft>) => setD(cur => ({ ...cur, ...patch }))
  const repeat = d.days.length > 0
  const catOk = cats.some(c => c.id === d.cat) ? d.cat : ''

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const create = (again: boolean) => {
    if (!d.text.trim() || !onCreate({ ...d, cat: catOk })) return
    if (!again) { onClose(); return }
    setMade(n => n + 1)
    set({ text: '', memo: '' })
    textRef.current?.focus()
  }
  const toggleDay = (i: number) => set({ days: d.days.includes(i) ? d.days.filter(x => x !== i) : [...d.days, i].sort() })
  const dateChip = (label: string, value: string) => (
    <Chip on={d.date === value} onClick={() => set({ date: value })}>{label}</Chip>
  )
  const field: React.CSSProperties = { ...fieldStyle, width: '100%' }

  return createPortal(
    <div className="gr-modal fixed inset-0 z-[600] flex items-end sm:items-center justify-center sm:p-4" style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(3px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div role="dialog" aria-modal="true" aria-label="새 할 일" className="relative w-full sm:max-w-md flex flex-col gap-4"
        style={{ background: '#050505', padding: '20px 20px 16px', maxHeight: '92vh', overflowY: 'auto' }}>
        <span className="absolute inset-0 pointer-events-none sketch-jitter-line" style={{ border: `1px solid ${dim(0.25)}`, filter: 'url(#sketchy)' }} />

        <div className="relative flex items-baseline justify-between">
          <span className="heading-display" style={{ fontSize: '1.15rem', fontStyle: 'italic', color: '#fff' }}>
            새 할 일{made > 0 && <span style={{ fontSize: '0.74rem', color: accent, marginLeft: 8, fontStyle: 'normal', fontFamily: SERIF }}>{made}개 추가됨</span>}
          </span>
          <button onClick={onClose} aria-label="닫기" className="cursor-pointer" style={{ background: 'none', color: dim(0.5), fontSize: '1.1rem' }}>×</button>
        </div>

        <form className="relative flex flex-col gap-4" onSubmit={e => { e.preventDefault(); create(false) }}>
          <input ref={textRef} value={d.text} onChange={e => set({ text: e.target.value })} maxLength={MAX_TEXT} autoFocus
            placeholder="할 일" aria-label="할 일 내용" className="gr-input outline-none" style={{ ...field, fontSize: '1rem', padding: '8px 2px' }} />
          <textarea value={d.memo} onChange={e => set({ memo: e.target.value })} maxLength={MAX_MEMO} rows={2} placeholder="메모" aria-label="메모"
            className="gr-input outline-none resize-none" style={{ ...field, fontSize: '0.82rem', border: `1px solid ${dim(0.12)}`, padding: '6px 8px' }} />

          <div className="flex flex-col gap-2">
            <Label>{repeat ? '시작일' : '날짜'}</Label>
            <div className="flex flex-wrap items-center gap-2">
              {dateChip('오늘', today)}
              {dateChip('내일', addDays(today, 1))}
              <input type="date" value={d.date} onChange={e => e.target.value && set({ date: e.target.value })} aria-label="날짜"
                className="outline-none" style={{ ...fieldStyle, fontSize: '0.8rem', padding: '2px' }} />
              <input type="time" value={d.time} onChange={e => set({ time: e.target.value })} aria-label="시간"
                className="outline-none" style={{ ...fieldStyle, fontSize: '0.8rem', padding: '2px' }} />
              {d.time && <Mini onClick={() => set({ time: '' })}>시간 빼기</Mini>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>반복</Label>
            <div className="flex flex-wrap items-center gap-[6px]" role="group" aria-label="반복 요일">
              {WEEKDAYS.map((w, i) => (
                <button key={w} type="button" aria-pressed={d.days.includes(i)} onClick={() => toggleDay(i)}
                  className="cursor-pointer" style={{
                    width: 30, height: 28, fontSize: '0.76rem', fontFamily: SERIF,
                    background: d.days.includes(i) ? dim(0.1) : 'transparent',
                    border: `1px solid ${d.days.includes(i) ? accent : dim(0.12)}`, color: d.days.includes(i) ? '#fff' : dim(0.4),
                  }}>{w}</button>
              ))}
              <Mini on={d.days.length === 7} onClick={() => set({ days: [0, 1, 2, 3, 4, 5, 6] })}>매일</Mini>
              <Mini on={d.days.join() === '1,2,3,4,5'} onClick={() => set({ days: [1, 2, 3, 4, 5] })}>평일</Mini>
              <Mini on={!repeat} onClick={() => set({ days: [] })}>안 함</Mini>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>분류</Label>
            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="분류">
              {cats.map(c => <Chip key={c.id} on={catOk === c.id} color={c.color} onClick={() => set({ cat: c.id })}>{c.name}</Chip>)}
              <Chip on={!catOk} color={NONE} onClick={() => set({ cat: '' })}>분류 없음</Chip>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>보상</Label>
            <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="보상 크기">
              {TIERS.map((t, i) => <Chip key={t.label} on={d.tier === i} onClick={() => set({ tier: i })}>{t.label} <Coins n={t.coins} size="0.7rem" /></Chip>)}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Mini onClick={() => create(true)} disabled={!d.text.trim()}>추가하고 하나 더</Mini>
            <SketchButton type="submit" disabled={!d.text.trim()}
              style={{ padding: '8px 22px', fontSize: '0.8rem', fontFamily: SERIF, color: accent }}>
              {repeat ? '루틴 만들기' : '추가'}
            </SketchButton>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

// ═════════════════════════ planner ═════════════════════════

type Section = null | 'routine' | 'cats'
const shortDay = (k: string) => { const d = parseDay(k); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일` }

export function TodoPanel({ pet, name, accent, apply, celebrate, onCoins, ready, archive }: PanelProps) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])
  const today = dayKey(now)

  const [view, setView] = useState<'day' | 'late'>('day')
  const [day, setDay] = useState(today)
  const [month, setMonth] = useState(today.slice(0, 7))
  const [showCal, setShowCal] = useState(true)
  const [composer, setComposer] = useState<Draft | null>(null)
  const [last, setLast] = useState(() => ({ tier: 1, cat: pet.cats[0]?.id ?? '' }))
  const [openId, setOpenId] = useState<string | null>(null)
  const [section, setSection] = useState<Section>(null)
  const [confirmDrop, setConfirmDrop] = useState(false)
  // archived months that have been opened: month → { n: archived count when loaded, list }
  const [arch, setArch] = useState<Record<string, { n: number; list: Todo[] | null }>>({})
  // category form
  const [cName, setCName] = useState('')
  const [cColor, setCColor] = useState(CAT_COLORS[3])

  const cats = pet.cats
  const catOf = (t: Todo) => cats.find(c => c.id === t.cat) ?? null
  const items = itemsFor(pet, day, today)
  const late = overdue(pet, today)
  const run = streak(pet, today)
  const bonusPct = Math.round(statsOf(pet).coin + streakBonus(run))

  const marks = useMemo(() => {
    const first = parseDay(`${month}-01`)
    const start = addDays(dayKey(first), -first.getDay())
    return tally(pet, Array.from({ length: 42 }, (_, i) => addDays(start, i)), today)
  }, [pet, month, today])

  // Days that were archived keep only a count in the main save; fetch that month's entries when it is opened.
  const dayMonth = day.slice(0, 7)
  const archivedCount = useMemo(
    () => Object.entries(pet.hist).reduce((a, [k, n]) => a + (k.startsWith(dayMonth) ? n : 0), 0),
    [pet.hist, dayMonth],
  )
  useEffect(() => {
    if (!archive || archivedCount === 0 || arch[dayMonth]?.n === archivedCount) return
    let alive = true
    setArch(a => ({ ...a, [dayMonth]: { n: archivedCount, list: null } }))
    archive(dayMonth).then(list => { if (alive) setArch(a => ({ ...a, [dayMonth]: { n: archivedCount, list } })) })
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayMonth, archivedCount])
  const archivedToday = (pet.hist[day] ?? 0) > 0
  const archList = arch[dayMonth]?.list
  const archived = archivedToday && archList ? archList.filter(t => t.date === day) : []

  // Optional: unfinished to-dos follow you to today on their own.
  useEffect(() => {
    if (ready && pet.autoCarry && late.length > 0) apply(p => carryOver(p, today))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pet.autoCarry, late.length, today])

  const pick = (d: string) => { setView('day'); setDay(d); setMonth(d.slice(0, 7)); setOpenId(null) }

  const openComposer = (days: number[] = []) =>
    setComposer({ text: '', memo: '', date: day < today ? today : day, time: '', cat: last.cat, tier: last.tier, days })
  const create = (d: Draft): boolean => {
    const base = { text: d.text, memo: d.memo, tier: d.tier, cat: d.cat || undefined, time: d.time || undefined }
    const ok = d.days.length
      ? apply(p => addRoutine(p, { ...base, days: d.days }, d.date))
      : apply(p => addTodo(p, { ...base, date: d.date }))
    if (!ok) return false
    setLast({ tier: d.tier, cat: d.cat })
    if (!d.days.length && d.date !== day) pick(d.date)
    return true
  }

  const toggle = (id: string) => {
    const r = apply(p => toggleTodo(p, id, today))
    if (!r) return
    if (openId === id) setOpenId(null)
    if (r.done) {
      onCoins?.()
      celebrate(r.perfect ? `오늘 완주! +${r.reward + PERFECT_BONUS} ✦` : `+${r.reward} ✦`)
    }
  }
  const patch = (id: string, change: Parameters<typeof editTodo>[2]) => {
    const r = apply(p => editTodo(p, id, change))
    if (!r) return
    if (change.date && change.date !== day) setOpenId(null)
    else setOpenId(r.id)
  }

  const groups: { cat: Category | null; list: Todo[] }[] = [
    ...cats.map(c => ({ cat: c as Category | null, list: items.filter(t => t.cat === c.id) })),
    { cat: null, list: items.filter(t => !catOf(t)) },
  ].filter(g => g.list.length > 0)
  const left = items.filter(t => !t.done).length

  // overdue view: grouped by the day each was due
  const lateDates = Array.from(new Set(late.map(t => t.date!)))
  const oldest = late.length ? lateDays(late[0], today) : 0

  return (
    <div className="flex flex-col gap-3">
      {composer && (
        <Composer start={composer} cats={cats} today={today} accent={accent} onCreate={create} onClose={() => setComposer(null)} />
      )}
      {/* streak & month */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1" style={{ fontSize: '0.74rem', fontFamily: SERIF, color: dim(0.55) }}>
        <span>
          <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.05rem', color: run > 0 ? accent : dim(0.4) }}>{run}</span>일 연속
          {bonusPct > 0 && <span style={{ color: accent }}> · 별빛 +{bonusPct}%</span>}
        </span>
        <span className="flex items-baseline gap-3">
          <span>이번 달 완료 <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.85) }}>{monthDone(pet, today.slice(0, 7))}</span></span>
          <button onClick={() => setShowCal(v => !v)} className="cursor-pointer label-caps" aria-expanded={showCal}
            style={{ background: 'none', fontSize: '0.5rem', letterSpacing: '0.2em', color: dim(0.4) }}>
            {showCal ? '달력 접기' : '달력 펴기'}
          </button>
        </span>
      </div>

      <div className="flex gap-2" role="tablist" aria-label="보기">
        <Mini on={view === 'day'} onClick={() => setView('day')}>날짜별</Mini>
        <Mini on={view === 'late'} onClick={() => { setView('late'); setOpenId(null) }} style={{ color: late.length && view !== 'late' ? LOW : undefined }}>
          밀린 일 {late.length}
        </Mini>
      </div>

      {view === 'late' ? (
        // ═════ overdue ═════
        <>
          {late.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-7 opacity-70">
              <span className="block h-px w-12" style={{ background: dim(0.15) }} />
              <p className="heading-condensed" style={{ fontStyle: 'italic', fontSize: '0.92rem', color: dim(0.4) }}>— Nothing overdue —</p>
              <span className="block h-px w-12" style={{ background: dim(0.15) }} />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span style={{ fontSize: '0.8rem', fontFamily: SERIF, color: dim(0.75) }}>
                  {late.length}개가 밀려 있어요 <span style={{ color: LOW }}>· 가장 오래된 건 {oldest}일째</span>
                </span>
                <span className="flex gap-2">
                  <Mini onClick={() => { if (apply(p => carryOver(p, today))) pick(today) }}>모두 오늘로</Mini>
                  <Mini onClick={() => { if (!confirmDrop) return setConfirmDrop(true); setConfirmDrop(false); apply(p => dropOverdue(p, today)) }}
                    style={{ color: confirmDrop ? LOW : undefined }}>{confirmDrop ? '정말 모두 지우기' : '모두 지우기'}</Mini>
                </span>
              </div>
              {lateDates.map(d => (
                <section key={d}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <button onClick={() => pick(d)} className="cursor-pointer" style={{ background: 'none', fontFamily: SERIF, fontSize: '0.8rem', color: dim(0.7) }}>{shortDay(d)}</button>
                    <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.72rem', color: LOW }}>{lateDays({ date: d } as Todo, today)}일 전</span>
                  </div>
                  <ul>
                    {late.filter(t => t.date === d).map(t => {
                      const c = catOf(t)
                      const color = c?.color ?? NONE
                      const slipped = lateDays(t, today)
                      return (
                        <li key={t.id} className="flex items-start gap-3 py-[8px]" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                          <Check done={false} color={color} label={`${t.text} 완료`} onClick={() => toggle(t.id)} />
                          <span className="flex-1 min-w-0">
                            <span className="break-words" style={{ fontSize: '0.9rem', lineHeight: 1.55, fontFamily: SERIF, color: dim(0.88) }}>{t.text}</span>
                            <span className="flex flex-wrap gap-x-3" style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.4) }}>
                              <span style={{ color }}>{c?.name ?? '분류 없음'}</span>
                              <span style={{ color: LOW }}>{slipped}일 밀림</span>
                              {t.memo && <span className="truncate" style={{ maxWidth: 200 }}>{t.memo}</span>}
                            </span>
                          </span>
                          <span className="flex flex-wrap justify-end gap-[6px] shrink-0" style={{ maxWidth: 170 }}>
                            <Mini onClick={() => apply(p => editTodo(p, t.id, { date: today }))}>오늘로</Mini>
                            <Mini onClick={() => apply(p => editTodo(p, t.id, { date: addDays(today, 1) }))}>내일로</Mini>
                            <Mini onClick={() => apply(p => removeTodo(p, t.id))}>삭제</Mini>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </>
          )}
          <label className="inline-flex items-center gap-2 cursor-pointer" style={{ fontSize: '0.76rem', fontFamily: SERIF, color: pet.autoCarry ? accent : dim(0.55) }}>
            <input type="checkbox" checked={pet.autoCarry} onChange={e => apply(p => setAutoCarry(p, e.target.checked))} />
            못 끝낸 일은 다음 날로 자동으로 넘기기
          </label>
        </>
      ) : (
        // ═════ one day ═════
        <>
          {showCal && <Calendar month={month} setMonth={setMonth} day={day} setDay={pick} today={today} marks={marks} accent={accent} />}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => pick(addDays(day, -1))} aria-label="전날" className="cursor-pointer" style={{ background: 'none', color: dim(0.5), fontFamily: DISPLAY, padding: '0 4px' }}>‹</button>
              <span className="whitespace-nowrap" style={{ fontFamily: SERIF, fontSize: 'clamp(0.8rem, 3.4vw, 0.92rem)', color: day === today ? '#fff' : dim(0.8) }}>{dayLabel(day, today)}</span>
              <button onClick={() => pick(addDays(day, 1))} aria-label="다음 날" className="cursor-pointer" style={{ background: 'none', color: dim(0.5), fontFamily: DISPLAY, padding: '0 4px' }}>›</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-caps hidden sm:inline" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', color: dim(0.35) }}>{left} LEFT · {items.length - left + archived.length} DONE</span>
              {day !== today && <Mini onClick={() => pick(today)}>오늘</Mini>}
            </div>
          </div>

          {day === today && late.length > 0 && (
            <Box tone={`${LOW}90`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span style={{ fontSize: '0.8rem', fontFamily: SERIF, color: dim(0.85) }}>
                  밀린 일 {late.length}개 <span style={{ color: LOW, fontSize: '0.72rem' }}>· 가장 오래된 건 {oldest}일째</span>
                  <span className="block truncate" style={{ fontSize: '0.7rem', color: dim(0.45), maxWidth: 260 }}>{late.slice(0, 3).map(t => t.text).join(' · ')}{late.length > 3 ? ' …' : ''}</span>
                </span>
                <span className="flex gap-2">
                  <Mini onClick={() => setView('late')}>살펴보기</Mini>
                  <Mini onClick={() => apply(p => carryOver(p, today))}>모두 오늘로</Mini>
                </span>
              </div>
            </Box>
          )}

          <SketchButton onClick={() => openComposer()} style={{ padding: '10px', fontFamily: SERIF, fontSize: '0.86rem', color: accent }}>
            + 새 할 일
          </SketchButton>

          {items.length === 0 && !archivedToday ? (
            <div className="flex flex-col items-center gap-3 py-7 opacity-70">
              <span className="block h-px w-12" style={{ background: dim(0.15) }} />
              <p className="heading-condensed" style={{ fontStyle: 'italic', fontSize: '0.92rem', color: dim(0.4) }}>— No cues for this day —</p>
              <span className="block h-px w-12" style={{ background: dim(0.15) }} />
            </div>
          ) : groups.map(g => {
            const color = g.cat?.color ?? NONE
            return (
              <section key={g.cat?.id ?? 'none'}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ width: 7, height: 7, borderRadius: 7, background: color }} />
                  <span style={{ fontFamily: SERIF, fontSize: '0.8rem', color }}>{g.cat?.name ?? '분류 없음'}</span>
                  <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.7rem', color: dim(0.35) }}>{g.list.filter(t => t.done).length}/{g.list.length}</span>
                </div>
                <ul>
                  {g.list.map(t => {
                    const reward = t.paid ?? TIERS[t.tier]?.coins ?? TIERS[0].coins
                    const open = openId === t.id
                    const slipped = t.since ? lateDays(t, day) : 0
                    return (
                      <li key={t.id}>
                        <div className="flex items-start gap-3 py-[8px]" style={{ borderBottom: open ? 'none' : `1px solid ${dim(0.06)}` }}>
                          <Check done={t.done} color={color} label={t.done ? `${t.text} 완료 취소` : `${t.text} 완료`} onClick={() => toggle(t.id)} />
                          <button onClick={() => setOpenId(open ? null : t.id)} aria-expanded={open} className="flex-1 min-w-0 text-left cursor-pointer" style={{ background: 'none' }}>
                            <span className="break-words" style={{
                              fontSize: '0.9rem', lineHeight: 1.55, fontFamily: SERIF,
                              color: t.done ? dim(0.3) : dim(0.88), textDecoration: t.done ? 'line-through' : 'none',
                            }}>{t.text}</span>
                            <span className="flex flex-wrap gap-x-3" style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.4) }}>
                              {t.time && <span style={{ fontFamily: DISPLAY, fontStyle: 'italic' }}>{t.time}</span>}
                              {t.routine && <span>루틴</span>}
                              {slipped > 0 && <span style={{ color: t.done ? dim(0.4) : LOW }}>{t.done ? `${slipped}일 늦게 끝냄` : `${slipped}일 밀림`}</span>}
                              {t.memo && !open && <span className="truncate" style={{ maxWidth: 220 }}>{t.memo}</span>}
                            </span>
                          </button>
                          <span className="shrink-0 mt-[3px]" style={{ color: t.done ? dim(0.25) : color }}><Coins n={reward} /></span>
                        </div>
                        {open && (
                          <Editor key={t.id} todo={t} cats={cats} today={today}
                            onPatch={change => patch(t.id, change)}
                            onRemove={() => { if (apply(p => removeTodo(p, t.id))) setOpenId(null) }}
                            onClose={() => setOpenId(null)} />
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}

          {/* entries that have moved to the archive: shown as they were, read-only */}
          {archivedToday && (
            <section>
              <Label>보관된 기록 · {pet.hist[day]}개</Label>
              {!archList ? (
                <Note>보관함에서 불러오는 중…</Note>
              ) : archived.length === 0 ? (
                <Note>내용 없음 (개수만 남음)</Note>
              ) : (
                <ul>
                  {archived.map(t => {
                    const c = catOf(t)
                    const color = c?.color ?? NONE
                    return (
                      <li key={t.id} className="flex items-start gap-3 py-[8px]" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                        <Check done color={color} label={`${t.text} 완료됨`} />
                        <span className="flex-1 min-w-0">
                          <span className="break-words" style={{ fontSize: '0.9rem', lineHeight: 1.55, fontFamily: SERIF, color: dim(0.5) }}>{t.text}</span>
                          <span className="flex flex-wrap gap-x-3" style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.4) }}>
                            <span style={{ color }}>{c?.name ?? '분류 없음'}</span>
                            {t.time && <span style={{ fontFamily: DISPLAY, fontStyle: 'italic' }}>{t.time}</span>}
                            {t.memo && <span className="break-words">{t.memo}</span>}
                          </span>
                        </span>
                        <span className="shrink-0 mt-[3px]" style={{ color: dim(0.3) }}><Coins n={t.paid ?? TIERS[t.tier]?.coins ?? 0} /></span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}

          {day === today && items.length > 0 && (
            <Note>
              {pet.perfectOn === today ? <>오늘 완주 · <Coins n={PERFECT_BONUS} size="0.7rem" /> 받음</> : <>{PERFECT_MIN}개 이상 전부 끝내면 완주 보너스 <Coins n={PERFECT_BONUS} size="0.7rem" /></>}
            </Note>
          )}
        </>
      )}

      {/* management */}
      <div className="flex gap-2 pt-1">
        <Mini on={section === 'routine'} onClick={() => setSection(s => (s === 'routine' ? null : 'routine'))}>루틴 {pet.routines.length}</Mini>
        <Mini on={section === 'cats'} onClick={() => setSection(s => (s === 'cats' ? null : 'cats'))}>분류 관리 {cats.length}</Mini>
      </div>

      {section === 'routine' && (
        <section>
          <Label>반복 루틴</Label>
          <ul>
            {pet.routines.map(r => {
              const c = cats.find(x => x.id === r.cat)
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                  <span className="min-w-0">
                    <span className="break-words" style={{ fontFamily: SERIF, fontSize: '0.86rem', color: dim(0.9) }}>{r.text}</span>
                    <span className="block" style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.45) }}>
                      {routineDays(r)}{r.time ? ` · ${r.time}` : ''}{r.memo ? ` · ${r.memo}` : ''} · <span style={{ color: c?.color ?? NONE }}>{c?.name ?? '분류 없음'}</span> · <Coins n={TIERS[r.tier]?.coins ?? 0} size="0.68rem" />
                    </span>
                  </span>
                  <Mini onClick={() => apply(p => removeRoutine(p, r.id))}>삭제</Mini>
                </li>
              )
            })}
          </ul>
          <div className="mt-3">
            <Mini onClick={() => openComposer([1, 2, 3, 4, 5])} style={{ color: accent }}>+ 새 루틴</Mini>
          </div>
        </section>
      )}

      {section === 'cats' && (
        <section>
          <Label>분류</Label>
          <ul>
            {cats.map(c => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                <input defaultValue={c.name} maxLength={20} aria-label={`${c.name} 이름`} className="gr-input outline-none flex-1 min-w-0"
                  onBlur={e => { if (e.target.value.trim() && e.target.value.trim() !== c.name) apply(p => editCat(p, c.id, { name: e.target.value })) }}
                  onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                  style={{ ...fieldStyle, color: c.color, borderBottom: `1px solid ${dim(0.1)}` }} />
                <span className="flex items-center gap-[5px]" role="radiogroup" aria-label={`${c.name} 색`}>
                  {CAT_COLORS.map(col => (
                    <button key={col} type="button" role="radio" aria-checked={c.color === col} aria-label={col} onClick={() => apply(p => editCat(p, c.id, { color: col }))}
                      className="cursor-pointer" style={{ width: 13, height: 13, borderRadius: 13, background: col, opacity: c.color === col ? 1 : 0.35, outline: c.color === col ? `1px solid ${dim(0.8)}` : 'none', outlineOffset: 2 }} />
                  ))}
                </span>
                <Mini onClick={() => apply(p => removeCat(p, c.id))} title="이 분류의 할 일은 '분류 없음'으로 옮겨집니다.">삭제</Mini>
              </li>
            ))}
          </ul>
          <form className="flex items-center gap-2 mt-3" onSubmit={e => { e.preventDefault(); if (apply(p => addCat(p, cName, cColor))) setCName('') }}>
            <input value={cName} onChange={e => setCName(e.target.value)} maxLength={20} placeholder="새 분류 이름" aria-label="새 분류 이름"
              className="gr-input flex-1 min-w-0 outline-none" style={{ ...fieldStyle, color: cColor }} />
            <span className="flex items-center gap-[5px]" role="radiogroup" aria-label="새 분류 색">
              {CAT_COLORS.map(col => (
                <button key={col} type="button" role="radio" aria-checked={cColor === col} aria-label={col} onClick={() => setCColor(col)}
                  className="cursor-pointer" style={{ width: 13, height: 13, borderRadius: 13, background: col, opacity: cColor === col ? 1 : 0.35, outline: cColor === col ? `1px solid ${dim(0.8)}` : 'none', outlineOffset: 2 }} />
              ))}
            </span>
            <SketchButton type="submit" disabled={!cName.trim()} style={{ padding: '6px 14px', fontSize: '0.74rem', fontFamily: SERIF, whiteSpace: 'nowrap' }}>추가</SketchButton>
          </form>
        </section>
      )}
    </div>
  )
}
