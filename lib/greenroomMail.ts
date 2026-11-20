// Greenroom mail — letters and gifts between Dylan and Manon.
// Each character's mailbox is stored on its own, apart from the save, so a letter can never be
// overwritten by the other player saving their game at the same moment.

import { WHOS, type Who, type Pet } from './greenroom'
import { ITEMS, addBag, type Bag, type Fail } from './greenroomRpg'

export interface Letter {
  id: string
  from: Who
  to: Who
  at: number
  text: string
  items: Bag
  gold: number
  read: boolean
  claimed: boolean
}

export const MAX_LETTER = 500
export const MAX_MAIL = 200
export const MAX_ATTACH = 8 // kinds of items per letter

const ID_RE = /^[a-z0-9_]{1,24}$/
const num = (v: unknown, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : min)

export const other = (w: Who): Who => (w === 'dylan' ? 'manon' : 'dylan')
export const hasGift = (l: Letter) => l.gold > 0 || Object.keys(l.items).length > 0
export const giftWaiting = (l: Letter) => hasGift(l) && !l.claimed

export function sanitizeLetter(raw: unknown, now = Date.now()): Letter | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  if (typeof r.id !== 'string' || !WHOS.includes(r.from as Who) || !WHOS.includes(r.to as Who) || r.from === r.to) return null
  const items: Bag = {}
  if (r.items && typeof r.items === 'object') {
    for (const [k, v] of Object.entries(r.items as Record<string, unknown>).slice(0, MAX_ATTACH)) {
      const n = Math.floor(num(v, 0, 9999))
      if (ID_RE.test(k) && ITEMS[k] && n > 0) items[k] = n
    }
  }
  return {
    id: r.id.slice(0, 40),
    from: r.from as Who,
    to: r.to as Who,
    at: num(r.at, 0, now + 60000),
    text: typeof r.text === 'string' ? r.text.slice(0, MAX_LETTER) : '',
    items,
    gold: Math.floor(num(r.gold, 0, 9999999)),
    read: r.read === true,
    claimed: r.claimed === true,
  }
}

export function sanitizeMail(raw: unknown, now = Date.now()): Letter[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, MAX_MAIL * 2).flatMap(l => {
    const x = sanitizeLetter(l, now)
    return x ? [x] : []
  })
}

// Newest first; when the box is full the oldest letters without a waiting gift go first.
export function addToBox(box: Letter[], letter: Letter): Letter[] {
  const list = [letter, ...box.filter(l => l.id !== letter.id)]
  while (list.length > MAX_MAIL) {
    let i = list.length - 1
    while (i > 0 && giftWaiting(list[i])) i--
    list.splice(i, 1)
  }
  return list
}

export function newLetter(from: Who, text: string, items: Bag, gold: number): Letter {
  return {
    id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
    from, to: other(from), at: Date.now(),
    text: text.trim().slice(0, MAX_LETTER),
    items, gold: Math.max(0, Math.floor(gold)), read: false, claimed: false,
  }
}

// The sender's side: the gift leaves their bag and purse.
export function packGift(p: Pet, items: Bag, gold: number, text: string): Fail | { pet: Pet } {
  const kinds = Object.entries(items).filter(([, n]) => n > 0)
  if (!text.trim() && !kinds.length && gold <= 0) return '편지를 쓰거나 선물을 담아주세요.'
  if (kinds.length > MAX_ATTACH) return `물건은 ${MAX_ATTACH}종류까지 담을 수 있어요.`
  if (gold > p.gold) return '금화가 모자라요.'
  let inv = p.rpg.inv
  for (const [id, n] of kinds) {
    if (!ITEMS[id]) return '보낼 수 없는 물건이에요.'
    if ((inv[id] ?? 0) < n) return `${ITEMS[id].name}이(가) 모자라요.`
    inv = addBag(inv, id, -n)
  }
  return { pet: { ...p, gold: p.gold - gold, rpg: { ...p.rpg, inv } } }
}

// Puts a gift into a bag (the recipient claiming it, or a failed send coming back).
export function unpackGift(p: Pet, items: Bag, gold: number): { pet: Pet } {
  let inv = p.rpg.inv
  for (const [id, n] of Object.entries(items)) if (ITEMS[id] && n > 0) inv = addBag(inv, id, n)
  return { pet: { ...p, gold: p.gold + gold, rpg: { ...p.rpg, inv } } }
}
