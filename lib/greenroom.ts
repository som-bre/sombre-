// Greenroom — to-do list + character care game.
// Shared between the page (client) and the API route (server).

export type Who = 'dylan' | 'manon'
export const WHOS: Who[] = ['dylan', 'manon']

export interface Todo {
  id: string
  text: string
  tier: number // index into TIERS
  done: boolean
  createdAt: number
  doneAt?: number
  paid?: number // coins actually paid out (includes gear bonus), refunded on un-check
  date?: string // 'YYYY-MM-DD' — the day this belongs to
  cat?: string // category id
  time?: string // 'HH:MM'
  memo?: string
  routine?: string // id of the routine this is an instance of
  skip?: boolean // a routine instance the player removed for that day
  since?: string // the day it was first due, once it has slipped or been put off
}

export interface Category { id: string; name: string; color: string }
export interface Routine {
  id: string
  text: string
  tier: number
  cat?: string
  time?: string
  memo?: string
  days: number[] // weekdays, 0 = Sunday
  from: string // first day it applies
}

// ── RPG layer ──
export type Slot = 'wand' | 'robe' | 'hat' | 'amulet'
export const SLOTS: Slot[] = ['wand', 'robe', 'hat', 'amulet']

export interface GearSub { k: string; v: number }
export interface Gear {
  id: string
  base: string // recipe id
  rarity: number // 0..4
  plus: number // enhancement level
  main: number // main stat at +0
  subs: GearSub[]
}
export interface Plot { seed: string; plantedAt: number; readyAt: number }
export interface Job {
  kind: 'fish' | 'trip'
  where: string
  startedAt: number
  endsAt: number
  rolls: number
}
export interface Brew { id: string; startedAt: number; readyAt: number }
export interface Dex {
  m: Record<string, number> // creature id → times defeated
  i: Record<string, number> // item id → 1 once it has been held
  g: Record<string, number> // recipe id → best rarity crafted + 1
}
export interface Rpg {
  lv: number
  xp: number
  inv: Record<string, number>
  gear: Gear[]
  equip: Partial<Record<Slot, string>>
  plots: (Plot | null)[]
  job: Job | null
  brew: Brew | null
  dex: Dex
  perks: Record<string, number> // permanent upgrades bought with starlight
  boon: number // duels left with doubled rewards
  stage: number // highest unlocked zone index
  zv: number // zone-list version the stage index refers to (see tidy in greenroomRpg)
  meal: { id: string; left: number } | null // a dish's battle buff and how many duels it lasts
  kills: number
}

export interface Pet {
  coins: number // "별빛" — earned only by finishing to-dos
  gold: number // "금화" — everyday money from adventuring
  // 0..100
  full: number
  clean: number
  mood: number
  energy: number
  asleep: boolean
  at: number // stats are valid as of this timestamp (ms)
  todos: Todo[]
  doneCount: number
  cats: Category[]
  routines: Routine[]
  hist: Record<string, number> // day → finished count, for days whose to-dos were archived
  perfectOn: string // last day the all-done bonus was paid
  autoCarry: boolean // move unfinished to-dos to today automatically
  rpg: Rpg
  rev: number // last-modified timestamp, used to pick the newer copy
}

export type PetsData = Record<Who, Pet>

export const TIERS = [
  { label: '가볍게', coins: 10 },
  { label: '보통', coins: 25 },
  { label: '큰일', coins: 50 },
]

export const WASH_COST = 10
export const MAX_TODOS = 2000 // hard ceiling for the live list; old finished days move to the archive long before this
export const ARCHIVE_AT = 400 // once the live list is this long…
export const ARCHIVE_DAYS = 60 // …finished to-dos older than this many days move to the monthly archive
export const MAX_ARCHIVE = 4000 // per month
export const MAX_CATS = 12
export const MAX_ROUTINES = 40
export const MAX_MEMO = 300
export const MAX_TEXT = 120

// Change per hour
const AWAKE = { full: -4, clean: -2.5, mood: -3, energy: -4 }
const ASLEEP = { full: -2, clean: -1, mood: -1, energy: 14 }

const clamp = (n: number) => Math.max(0, Math.min(100, n))

export const ZONE_VERSION = 2

export function defaultRpg(): Rpg {
  return { lv: 1, xp: 0, inv: {}, gear: [], equip: {}, plots: [null, null, null], job: null, brew: null, dex: { m: {}, i: {}, g: {} }, perks: {}, boon: 0, stage: 0, zv: ZONE_VERSION, meal: null, kills: 0 }
}

export const defaultCats = (): Category[] => [
  { id: 'work', name: '공부·일', color: '#7FAEE0' },
  { id: 'life', name: '생활', color: '#8FC7A0' },
  { id: 'self', name: '나를 위해', color: '#D9809A' },
]

export function defaultPet(now = Date.now()): Pet {
  return {
    coins: 0,
    gold: 0,
    full: 70, clean: 70, mood: 70, energy: 80,
    asleep: false,
    at: now,
    todos: [],
    doneCount: 0,
    cats: defaultCats(),
    routines: [],
    hist: {},
    perfectOn: '',
    autoCarry: false,
    rpg: defaultRpg(),
    rev: 0,
  }
}

// Advance the stats to `now`. Pure — returns the same object when nothing changes.
export function settle(p: Pet, now: number): Pet {
  let h = (now - p.at) / 3600000
  if (!(h > 0)) return p
  h = Math.min(h, 24 * 30)
  let { full, clean, mood, energy, asleep } = p

  if (asleep) {
    // Sleeps until rested, then wakes up on its own.
    const untilRested = Math.max(0, (100 - energy) / ASLEEP.energy)
    const hs = Math.min(h, untilRested)
    full += ASLEEP.full * hs
    clean += ASLEEP.clean * hs
    mood += ASLEEP.mood * hs
    energy += ASLEEP.energy * hs
    h -= hs
    if (h > 0) asleep = false
  }
  if (h > 0) {
    full += AWAKE.full * h
    clean += AWAKE.clean * h
    mood += AWAKE.mood * h
    energy += AWAKE.energy * h
  }
  return {
    ...p,
    full: clamp(full), clean: clamp(clean), mood: clamp(mood), energy: clamp(energy),
    asleep, at: now,
  }
}

const num = (v: unknown, fallback: number, min: number, max: number) => {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fallback
  return Math.max(min, Math.min(max, n))
}

const ID_RE = /^[a-z0-9_]{1,24}$/
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/
const COLOR_RE = /^#[0-9a-fA-F]{6}$/
const FAR = 86400000 * 3 // timers never run longer than this

function sanitizeRpg(raw: unknown, now: number): Rpg {
  const d = defaultRpg()
  if (!raw || typeof raw !== 'object') return d
  const r = raw as Record<string, unknown>

  const inv: Record<string, number> = {}
  if (r.inv && typeof r.inv === 'object') {
    for (const [k, v] of Object.entries(r.inv as Record<string, unknown>).slice(0, 80)) {
      const n = Math.floor(num(v, 0, 0, 99999))
      if (ID_RE.test(k) && n > 0) inv[k] = n
    }
  }

  const gear: Gear[] = Array.isArray(r.gear)
    ? r.gear.slice(0, 60).flatMap((g): Gear[] => {
        if (!g || typeof g !== 'object') return []
        const o = g as Record<string, unknown>
        if (typeof o.id !== 'string' || typeof o.base !== 'string' || !ID_RE.test(o.base)) return []
        const subs: GearSub[] = Array.isArray(o.subs)
          ? o.subs.slice(0, 6).flatMap((s): GearSub[] => {
              if (!s || typeof s !== 'object') return []
              const so = s as Record<string, unknown>
              if (typeof so.k !== 'string' || !ID_RE.test(so.k)) return []
              return [{ k: so.k, v: num(so.v, 0, 0, 9999) }]
            })
          : []
        return [{
          id: o.id.slice(0, 40), base: o.base,
          rarity: Math.round(num(o.rarity, 0, 0, 4)),
          plus: Math.round(num(o.plus, 0, 0, 20)),
          main: num(o.main, 1, 0, 99999),
          subs,
        }]
      })
    : []

  const equip: Partial<Record<Slot, string>> = {}
  if (r.equip && typeof r.equip === 'object') {
    const e = r.equip as Record<string, unknown>
    for (const s of SLOTS) {
      const id = e[s]
      if (typeof id === 'string' && gear.some(g => g.id === id)) equip[s] = id
    }
  }

  const plots: (Plot | null)[] = Array.isArray(r.plots)
    ? r.plots.slice(0, 8).map((p): Plot | null => {
        if (!p || typeof p !== 'object') return null
        const o = p as Record<string, unknown>
        if (typeof o.seed !== 'string' || !ID_RE.test(o.seed)) return null
        return { seed: o.seed, plantedAt: num(o.plantedAt, now, 0, now + 60000), readyAt: num(o.readyAt, now, 0, now + FAR) }
      })
    : d.plots
  while (plots.length < 3) plots.push(null)

  let job: Job | null = null
  if (r.job && typeof r.job === 'object') {
    const o = r.job as Record<string, unknown>
    if ((o.kind === 'fish' || o.kind === 'trip') && typeof o.where === 'string' && ID_RE.test(o.where)) {
      job = {
        kind: o.kind, where: o.where,
        startedAt: num(o.startedAt, now, 0, now + 60000),
        endsAt: num(o.endsAt, now, 0, now + FAR),
        rolls: Math.round(num(o.rolls, 1, 0, 200)),
      }
    }
  }

  let brew: Brew | null = null
  if (r.brew && typeof r.brew === 'object') {
    const o = r.brew as Record<string, unknown>
    if (typeof o.id === 'string' && ID_RE.test(o.id)) {
      brew = { id: o.id, startedAt: num(o.startedAt, now, 0, now + 60000), readyAt: num(o.readyAt, now, 0, now + FAR) }
    }
  }

  const counts = (v: unknown, max: number): Record<string, number> => {
    const out: Record<string, number> = {}
    if (v && typeof v === 'object') {
      for (const [k, n] of Object.entries(v as Record<string, unknown>).slice(0, 120)) {
        const c = Math.floor(num(n, 0, 0, max))
        if (ID_RE.test(k) && c > 0) out[k] = c
      }
    }
    return out
  }
  const dr = (r.dex && typeof r.dex === 'object' ? r.dex : {}) as Record<string, unknown>
  const dex: Dex = { m: counts(dr.m, 9999999), i: counts(dr.i, 1), g: counts(dr.g, 5) }

  return {
    lv: Math.round(num(r.lv, 1, 1, 99)),
    xp: Math.round(num(r.xp, 0, 0, 9999999)),
    inv, gear, equip, plots, job, brew, dex,
    perks: counts(r.perks, 20),
    boon: Math.round(num(r.boon, 0, 0, 999)),
    stage: Math.round(num(r.stage, 0, 0, 20)),
    zv: Math.round(num(r.zv, 0, 0, 99)),
    meal: (() => {
      const m = r.meal as Record<string, unknown> | null | undefined
      if (!m || typeof m !== 'object' || typeof m.id !== 'string' || !ID_RE.test(m.id)) return null
      const left = Math.round(num(m.left, 0, 0, 20))
      return left > 0 ? { id: m.id, left } : null
    })(),
    kills: Math.round(num(r.kills, 0, 0, 9999999)),
  }
}

export const MONTH_RE = /^\d{4}-\d{2}$/

export function sanitizeTodos(raw: unknown, now: number, cap: number): Todo[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, cap).flatMap((t): Todo[] => {
    if (!t || typeof t !== 'object') return []
    const o = t as Record<string, unknown>
    if (typeof o.id !== 'string' || typeof o.text !== 'string') return []
    const todo: Todo = {
      id: o.id.slice(0, 40),
      text: o.text.slice(0, MAX_TEXT),
      tier: Math.round(num(o.tier, 0, 0, TIERS.length - 1)),
      done: o.done === true,
      createdAt: num(o.createdAt, now, 0, now + 86400000),
    }
    if (typeof o.doneAt === 'number') todo.doneAt = num(o.doneAt, now, 0, now + 86400000)
    if (typeof o.paid === 'number') todo.paid = Math.round(num(o.paid, 0, 0, 99999))
    if (typeof o.date === 'string' && DAY_RE.test(o.date)) todo.date = o.date
    if (typeof o.cat === 'string') todo.cat = o.cat.slice(0, 40)
    if (typeof o.time === 'string' && TIME_RE.test(o.time)) todo.time = o.time
    if (typeof o.memo === 'string' && o.memo) todo.memo = o.memo.slice(0, MAX_MEMO)
    if (typeof o.routine === 'string') todo.routine = o.routine.slice(0, 40)
    if (o.skip === true) todo.skip = true
    if (typeof o.since === 'string' && DAY_RE.test(o.since)) todo.since = o.since
    return [todo]
  })
}

// Coerce untrusted input (request body, localStorage) into a valid Pet.
export function sanitizePet(raw: unknown, now = Date.now()): Pet {
  const d = defaultPet(now)
  if (!raw || typeof raw !== 'object') return d
  const r = raw as Record<string, unknown>
  const todos = sanitizeTodos(r.todos, now, MAX_TODOS)
  const cats: Category[] = Array.isArray(r.cats)
    ? r.cats.slice(0, MAX_CATS).flatMap((c): Category[] => {
        if (!c || typeof c !== 'object') return []
        const o = c as Record<string, unknown>
        if (typeof o.id !== 'string' || typeof o.name !== 'string') return []
        return [{ id: o.id.slice(0, 40), name: o.name.slice(0, 20), color: typeof o.color === 'string' && COLOR_RE.test(o.color) ? o.color : '#C8C8C8' }]
      })
    : d.cats

  const routines: Routine[] = Array.isArray(r.routines)
    ? r.routines.slice(0, MAX_ROUTINES).flatMap((x): Routine[] => {
        if (!x || typeof x !== 'object') return []
        const o = x as Record<string, unknown>
        if (typeof o.id !== 'string' || typeof o.text !== 'string') return []
        const days = Array.isArray(o.days) ? Array.from(new Set(o.days.filter((n): n is number => Number.isInteger(n) && n >= 0 && n <= 6))) : []
        const routine: Routine = {
          id: o.id.slice(0, 40), text: o.text.slice(0, MAX_TEXT),
          tier: Math.round(num(o.tier, 0, 0, TIERS.length - 1)),
          days, from: typeof o.from === 'string' && DAY_RE.test(o.from) ? o.from : '2000-01-01',
        }
        if (typeof o.cat === 'string') routine.cat = o.cat.slice(0, 40)
        if (typeof o.time === 'string' && TIME_RE.test(o.time)) routine.time = o.time
        if (typeof o.memo === 'string' && o.memo) routine.memo = o.memo.slice(0, MAX_MEMO)
        return [routine]
      })
    : []

  const hist: Record<string, number> = {}
  if (r.hist && typeof r.hist === 'object') {
    for (const [k, v] of Object.entries(r.hist as Record<string, unknown>).slice(-800)) {
      const n = Math.floor(num(v, 0, 0, 999))
      if (DAY_RE.test(k) && n > 0) hist[k] = n
    }
  }

  return {
    coins: Math.round(num(r.coins, d.coins, 0, 9999999)),
    gold: Math.round(num(r.gold, d.gold, 0, 99999999)),
    full: num(r.full, d.full, 0, 100),
    clean: num(r.clean, d.clean, 0, 100),
    mood: num(r.mood, d.mood, 0, 100),
    energy: num(r.energy, d.energy, 0, 100),
    asleep: r.asleep === true,
    at: num(r.at, now, 0, now + 60000),
    todos,
    doneCount: Math.round(num(r.doneCount, 0, 0, 9999999)),
    cats, routines, hist,
    perfectOn: typeof r.perfectOn === 'string' && DAY_RE.test(r.perfectOn) ? r.perfectOn : '',
    autoCarry: r.autoCarry === true,
    rpg: sanitizeRpg(r.rpg, now),
    rev: num(r.rev, 0, 0, now + 60000),
  }
}
