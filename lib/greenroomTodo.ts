// Greenroom planner — dated to-dos, categories, repeating routines, streaks.
// Pure rules over a Pet, in the same style as greenroomRpg.ts.

import {
  TIERS, MAX_TODOS, MAX_TEXT, MAX_MEMO, MAX_CATS, MAX_ROUTINES, ARCHIVE_AT, ARCHIVE_DAYS,
  type Pet, type Todo, type Routine, type Category,
} from './greenroom'
import { statsOf, type Fail } from './greenroomRpg'

const pad = (n: number) => String(n).padStart(2, '0')
const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
const clamp100 = (n: number) => Math.max(0, Math.min(100, n))

// ── days ──
export const dayKey = (t: number | Date = Date.now()) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const parseDay = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const addDays = (k: string, n: number) => {
  const d = parseDay(k)
  d.setDate(d.getDate() + n)
  return dayKey(d)
}
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
export const dayLabel = (k: string, today: string) => {
  const d = parseDay(k)
  const base = `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`
  if (k === today) return `오늘 · ${base}`
  if (k === addDays(today, 1)) return `내일 · ${base}`
  if (k === addDays(today, -1)) return `어제 · ${base}`
  return base
}

export const CAT_COLORS = ['#7FAEE0', '#8FC7A0', '#D9809A', '#E8C46A', '#BF94E4', '#E0A070', '#7FD0C8', '#C8C8C8']
export const PERFECT_BONUS = 15 // starlight for finishing every to-do of the day (needs at least PERFECT_MIN)
export const PERFECT_MIN = 3
export const STREAK_STEP = 2 // +% starlight per day of streak
export const STREAK_CAP = 30

// ── reading ──

const VIRTUAL = 'r:'
const isVirtual = (id: string) => id.startsWith(VIRTUAL)

// Give older saves a day: undated to-dos belong to the day they were finished or written.
export function tidyTodos(p: Pet): Pet {
  if (!p.todos.some(t => !t.date)) return p
  return { ...p, todos: p.todos.map(t => (t.date ? t : { ...t, date: dayKey(t.done ? (t.doneAt ?? t.createdAt) : t.createdAt) })) }
}

// Everything on a day's list. Routines that have no record yet appear as virtual items
// (only from today onward — a routine missed in the past simply did not happen).
export function itemsFor(p: Pet, day: string, today: string): Todo[] {
  const real = p.todos.filter(t => t.date === day && !t.skip)
  const out = [...real]
  if (day >= today) {
    const weekday = parseDay(day).getDay()
    for (const r of p.routines) {
      if (day < r.from || !r.days.includes(weekday)) continue
      if (p.todos.some(t => t.routine === r.id && t.date === day)) continue
      out.push({ id: `${VIRTUAL}${r.id}:${day}`, text: r.text, tier: r.tier, cat: r.cat, time: r.time, memo: r.memo, done: false, createdAt: 0, date: day, routine: r.id })
    }
  }
  return out.sort((a, b) =>
    Number(a.done) - Number(b.done) || (a.time ?? '99').localeCompare(b.time ?? '99') || a.createdAt - b.createdAt)
}

// Unfinished to-dos whose day has passed, oldest first.
export const overdue = (p: Pet, today: string) =>
  p.todos.filter(t => !t.done && !t.skip && !!t.date && t.date < today).sort((a, b) => a.date!.localeCompare(b.date!) || a.createdAt - b.createdAt)

const dayDiff = (from: string, to: string) => Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / 86400000)

// How many days a to-do has slipped past the day it was first due, as seen on `day`.
export function lateDays(t: Todo, day: string): number {
  const due = t.since ?? t.date
  return due ? Math.max(0, dayDiff(due, day)) : 0
}

// day → [done, total] for a calendar month (cells outside the month included by the caller's range)
export function tally(p: Pet, days: string[], today: string): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {}
  for (const day of days) {
    const items = itemsFor(p, day, today)
    const archived = p.hist[day] ?? 0
    out[day] = [items.filter(t => t.done).length + archived, items.length + archived]
  }
  return out
}

const finishedOn = (p: Pet, day: string) => (p.hist[day] ?? 0) > 0 || p.todos.some(t => t.done && t.date === day)

// Consecutive days with at least one finished to-do, ending today (or yesterday, if today is still open).
export function streak(p: Pet, today: string): number {
  let day = finishedOn(p, today) ? today : addDays(today, -1)
  let n = 0
  while (n < 3650 && finishedOn(p, day)) { n++; day = addDays(day, -1) }
  return n
}
export const streakBonus = (n: number) => Math.min(STREAK_CAP, n * STREAK_STEP)

export function monthDone(p: Pet, month: string): number { // month = 'YYYY-MM'
  const live = p.todos.filter(t => t.done && t.date?.startsWith(month)).length
  const old = Object.entries(p.hist).reduce((a, [k, n]) => a + (k.startsWith(month) ? n : 0), 0)
  return live + old
}

// ── writing ──

// Turn a virtual routine item into a stored to-do so it can be changed.
function materialise(p: Pet, id: string): { pet: Pet; id: string } | null {
  if (!isVirtual(id)) return p.todos.some(t => t.id === id) ? { pet: p, id } : null
  const cut = id.lastIndexOf(':')
  const routine = p.routines.find(r => r.id === id.slice(VIRTUAL.length, cut))
  const day = id.slice(cut + 1)
  if (!routine) return null
  const existing = p.todos.find(t => t.routine === routine.id && t.date === day)
  if (existing) return { pet: p, id: existing.id }
  const todo: Todo = { id: newId(), text: routine.text, tier: routine.tier, done: false, createdAt: Date.now(), date: day, routine: routine.id }
  if (routine.cat) todo.cat = routine.cat
  if (routine.time) todo.time = routine.time
  if (routine.memo) todo.memo = routine.memo
  return { pet: { ...p, todos: [...p.todos, todo] }, id: todo.id }
}

// Old finished days leave the live list for the monthly archive (the caller stores `months` first,
// then saves `pet`). The per-day counts stay in `hist` so the calendar still marks those days.
export function splitArchive(p: Pet, today: string): { pet: Pet; months: Record<string, Todo[]> } | null {
  if (p.todos.length < ARCHIVE_AT) return null
  const cutoff = addDays(today, -ARCHIVE_DAYS)
  const hist = { ...p.hist }
  const months: Record<string, Todo[]> = {}
  const todos = p.todos.filter(t => {
    if (!t.date || t.date >= cutoff) return true
    if (t.skip) return false // a skipped routine day in the past no longer matters
    if (!t.done) return true // unfinished ones stay live, as overdue
    hist[t.date] = (hist[t.date] ?? 0) + 1
    ;(months[t.date.slice(0, 7)] ??= []).push(t)
    return false
  })
  if (todos.length === p.todos.length) return null
  return { pet: { ...p, todos, hist }, months }
}

export interface NewTodo { text: string; tier: number; date: string; cat?: string; time?: string; memo?: string }

export function addTodo(p: Pet, input: NewTodo): Fail | { pet: Pet } {
  const text = input.text.trim().slice(0, MAX_TEXT)
  if (!text) return '할 일을 적어주세요.'
  if (p.todos.length >= MAX_TODOS) return '할 일이 너무 많아요. 밀린 일을 정리해주세요.'
  const todo: Todo = { id: newId(), text, tier: input.tier, done: false, createdAt: Date.now(), date: input.date }
  if (input.cat) todo.cat = input.cat
  if (input.time) todo.time = input.time
  if (input.memo?.trim()) todo.memo = input.memo.trim().slice(0, MAX_MEMO)
  return { pet: { ...p, todos: [...p.todos, todo] } }
}

export interface ToggleOut { pet: Pet; done: boolean; reward: number; perfect: boolean }

export function toggleTodo(p: Pet, id: string, today: string): Fail | ToggleOut {
  const m = materialise(p, id)
  if (!m) return '없는 할 일이에요.'
  const t = m.pet.todos.find(x => x.id === m.id)!
  const base = TIERS[t.tier]?.coins ?? TIERS[0].coins

  if (t.done) {
    const back = t.paid ?? base
    return {
      pet: {
        ...m.pet,
        coins: Math.max(0, m.pet.coins - back),
        doneCount: Math.max(0, m.pet.doneCount - 1),
        todos: m.pet.todos.map(x => (x.id === t.id ? { ...x, done: false, doneAt: undefined, paid: undefined } : x)),
      },
      done: false, reward: -back, perfect: false,
    }
  }

  const late = t.date && t.date < today ? { date: today, since: t.since ?? t.date, routine: undefined } : {}
  const bonusPct = statsOf(m.pet).coin + streakBonus(streak(m.pet, today))
  const reward = Math.round(base * (1 + bonusPct / 100))
  let pet: Pet = {
    ...m.pet,
    coins: m.pet.coins + reward,
    mood: clamp100(m.pet.mood + 4),
    doneCount: m.pet.doneCount + 1,
    todos: m.pet.todos.map(x => (x.id === t.id ? { ...x, done: true, doneAt: Date.now(), paid: reward, ...late } : x)),
  }
  // Clearing the whole day pays a one-time bonus.
  let perfect = false
  if ((late.date ?? t.date) === today && pet.perfectOn !== today) {
    const items = itemsFor(pet, today, today)
    if (items.length >= PERFECT_MIN && items.every(x => x.done)) {
      perfect = true
      pet = { ...pet, coins: pet.coins + PERFECT_BONUS, perfectOn: today }
    }
  }
  return { pet, done: true, reward, perfect }
}

export interface TodoPatch { text?: string; tier?: number; cat?: string | null; time?: string | null; memo?: string; date?: string }

export function editTodo(p: Pet, id: string, patch: TodoPatch): Fail | { pet: Pet; id: string } {
  const m = materialise(p, id)
  if (!m) return '없는 할 일이에요.'
  const cur = m.pet.todos.find(x => x.id === m.id)!
  const next: Todo = { ...cur }
  if (patch.text !== undefined) {
    const text = patch.text.trim().slice(0, MAX_TEXT)
    if (!text) return '내용을 비워둘 수는 없어요.'
    next.text = text
  }
  if (patch.tier !== undefined && !cur.done) next.tier = patch.tier
  if (patch.cat !== undefined) { if (patch.cat) next.cat = patch.cat; else delete next.cat }
  if (patch.time !== undefined) { if (patch.time) next.time = patch.time; else delete next.time }
  if (patch.memo !== undefined) { const memo = patch.memo.trim().slice(0, MAX_MEMO); if (memo) next.memo = memo; else delete next.memo }

  let todos = m.pet.todos
  if (patch.date !== undefined && patch.date !== cur.date) {
    next.date = patch.date
    if (!cur.done && cur.date) {
      const due = cur.since ?? cur.date
      if (patch.date > due) next.since = due
      else delete next.since
    }
    if (cur.routine && cur.date) {
      // A moved routine item becomes an ordinary to-do; the routine is marked handled for its original day.
      delete next.routine
      todos = [...todos, { id: newId(), text: cur.text, tier: cur.tier, done: false, createdAt: Date.now(), date: cur.date, routine: cur.routine, skip: true }]
    }
  }
  return { pet: { ...m.pet, todos: todos.map(x => (x.id === cur.id ? next : x)) }, id: cur.id }
}

export function removeTodo(p: Pet, id: string): Fail | { pet: Pet } {
  const m = materialise(p, id)
  if (!m) return '이미 없는 할 일이에요.'
  const cur = m.pet.todos.find(x => x.id === m.id)!
  // A routine's item is skipped for the day rather than deleted, so it does not come back.
  if (cur.routine && !cur.done) return { pet: { ...m.pet, todos: m.pet.todos.map(x => (x.id === cur.id ? { ...x, skip: true } : x)) } }
  return { pet: { ...m.pet, todos: m.pet.todos.filter(x => x.id !== cur.id) } }
}

export function carryOver(p: Pet, today: string): Fail | { pet: Pet; n: number } {
  const late = overdue(p, today)
  if (!late.length) return '밀린 일이 없어요.'
  const ids = new Set(late.map(t => t.id))
  return { pet: { ...p, todos: p.todos.map(t => (ids.has(t.id) ? { ...t, date: today, since: t.since ?? t.date, routine: undefined } : t)) }, n: late.length }
}

export function dropOverdue(p: Pet, today: string): Fail | { pet: Pet; n: number } {
  const late = overdue(p, today)
  if (!late.length) return '밀린 일이 없어요.'
  const ids = new Set(late.map(t => t.id))
  return { pet: { ...p, todos: p.todos.filter(t => !ids.has(t.id)) }, n: late.length }
}

export function setAutoCarry(p: Pet, on: boolean): Fail | { pet: Pet } {
  return { pet: { ...p, autoCarry: on } }
}

// ── routines ──

export interface NewRoutine { text: string; tier: number; days: number[]; cat?: string; time?: string; memo?: string }

export function addRoutine(p: Pet, input: NewRoutine, from: string): Fail | { pet: Pet } {
  const text = input.text.trim().slice(0, MAX_TEXT)
  if (!text) return '루틴 이름을 적어주세요.'
  if (!input.days.length) return '반복할 요일을 하나 이상 골라주세요.'
  if (p.routines.length >= MAX_ROUTINES) return '루틴이 너무 많아요.'
  const routine: Routine = { id: newId(), text, tier: input.tier, days: [...input.days].sort(), from }
  if (input.cat) routine.cat = input.cat
  if (input.time) routine.time = input.time
  if (input.memo?.trim()) routine.memo = input.memo.trim().slice(0, MAX_MEMO)
  return { pet: { ...p, routines: [...p.routines, routine] } }
}

export function removeRoutine(p: Pet, id: string): Fail | { pet: Pet } {
  if (!p.routines.some(r => r.id === id)) return '이미 없는 루틴이에요.'
  return {
    pet: {
      ...p,
      routines: p.routines.filter(r => r.id !== id),
      // finished instances stay as ordinary history; skip markers are no longer needed
      todos: p.todos.filter(t => !(t.routine === id && t.skip)).map(t => (t.routine === id ? { ...t, routine: undefined } : t)),
    },
  }
}

export const routineDays = (r: Routine) =>
  r.days.length === 7 ? '매일' : r.days.length === 5 && [1, 2, 3, 4, 5].every(d => r.days.includes(d)) ? '평일' : r.days.map(d => WEEKDAYS[d]).join('·')

// ── categories ──

export function addCat(p: Pet, name: string, color: string): Fail | { pet: Pet } {
  const n = name.trim().slice(0, 20)
  if (!n) return '분류 이름을 적어주세요.'
  if (p.cats.length >= MAX_CATS) return '분류는 12개까지 만들 수 있어요.'
  const cat: Category = { id: newId(), name: n, color }
  return { pet: { ...p, cats: [...p.cats, cat] } }
}

export function editCat(p: Pet, id: string, patch: { name?: string; color?: string }): Fail | { pet: Pet } {
  const name = patch.name?.trim().slice(0, 20)
  if (patch.name !== undefined && !name) return '분류 이름을 비워둘 수는 없어요.'
  return { pet: { ...p, cats: p.cats.map(c => (c.id === id ? { ...c, ...(name ? { name } : {}), ...(patch.color ? { color: patch.color } : {}) } : c)) } }
}

export function removeCat(p: Pet, id: string): Fail | { pet: Pet } {
  if (!p.cats.some(c => c.id === id)) return '이미 없는 분류예요.'
  return {
    pet: {
      ...p,
      cats: p.cats.filter(c => c.id !== id),
      todos: p.todos.map(t => (t.cat === id ? { ...t, cat: undefined } : t)),
      routines: p.routines.map(r => (r.cat === id ? { ...r, cat: undefined } : r)),
    },
  }
}
