// Greenroom RPG — static game data and the rules that act on a Pet.
// Everything here is pure except for Math.random(); the page commits the returned Pet.

import { SLOTS, ZONE_VERSION, type Pet, type Rpg, type Gear, type GearSub, type Slot, type Job } from './greenroom'

const rand = () => Math.random()
const randInt = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1))
const clamp100 = (n: number) => Math.max(0, Math.min(100, n))
const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
const MIN = 60000
const HOUR = 3600000

export type Bag = Record<string, number>
export type Fail = string // a message to show the player
export const isFail = (r: unknown): r is Fail => typeof r === 'string'

const NO_GOLD = '금화가 모자라요. 생물을 쓰러뜨리거나 물건을 팔아보세요.'
const NO_STAR = '별빛이 모자라요. 할 일을 끝내면 받을 수 있어요.'
const ASLEEP = '자고 있어요. 먼저 깨워주세요.'

// ───────────────────────── items ─────────────────────────

export interface ItemDef {
  name: string
  kind: 'mat' | 'food' | 'potion' | 'special' | 'junk'
  desc: string
  sell: number // gold; 0 = cannot be sold
  food?: { full?: number; mood?: number; energy?: number }
  battle?: { heal?: number; mana?: number; might?: number; cleanse?: boolean } // usable during a fight
  meal?: { stat: StatKey; pct?: number; add?: number; fights: number } // a dish's buff for the next few duels
}

const mat = (name: string, sell: number, desc: string): ItemDef => ({ name, kind: 'mat', sell, desc })

export const ITEMS: Record<string, ItemDef> = {
  // creature materials: two per region plus one from its master
  cobweb: mat('거미줄', 2, '지하 저장고 천장에서 걷어낸 것.'),
  whisker: mat('쥐 수염', 2, '초보 부적의 단골 재료.'),
  troll_tooth: mat('트롤 어금니', 14, '주먹만 하다. 지팡이 심으로 쓴다.'),
  pixie_dust: mat('픽시 날개 가루', 5, '손에 묻으면 한참 반짝인다.'),
  vine: mat('덩굴 줄기', 5, '잘라도 한동안 꿈틀거린다.'),
  mandrake_root: mat('맨드레이크 뿌리', 30, '귀마개 없이 뽑으면 안 된다.'),
  parchment: mat('낡은 양피지', 11, '글자가 스스로 자리를 바꾼다.'),
  ink: mat('마법 잉크', 11, '뚜껑을 열면 도망가려 한다.'),
  ghost_breath: mat('유령의 숨결', 65, '병 안에서 서리가 낀다.'),
  ember: mat('도깨비불 불씨', 24, '뜨겁지 않고 차갑다.'),
  silk: mat('거미 비단', 24, '달빛 아래에서만 보인다.'),
  wolf_fang: mat('늑대 송곳니', 140, '보름달이 뜨면 미세하게 떤다.'),
  waterweed: mat('검은 물풀', 50, '호수 밑바닥에서 자란다.'),
  kelpie_mane: mat('켈피 갈기', 50, '마르지 않는다.'),
  serpent_scale: mat('물뱀 비늘', 300, '손바닥만 한 비늘.'),
  gargoyle_stone: mat('가고일 돌조각', 95, '가끔 눈을 뜬다.'),
  star_shard: mat('별똥 조각', 95, '아직 따뜻하다.'),
  dragon_scale: mat('용의 비늘', 700, '어떤 불에도 타지 않는다.'),
  // pasture: hides, wool and meat
  wool: mat('양털', 6, '검은 숫양에게서 깎았다. 아주 따뜻하다.'),
  hide: mat('질긴 가죽', 6, '목초지 짐승의 가죽.'),
  horn: mat('황소 뿔', 40, '미궁의 황소가 떨어뜨렸다.'),
  beef: mat('소고기', 14, '뿔소에게서 얻었다. 마블링이 곱다.'),
  pork: mat('돼지고기', 10, '멧돼지 고기. 꼬치에 꿰면 좋다.'),
  mutton: mat('양고기', 12, '셰퍼드 파이의 핵심.'),
  chicken: mat('닭고기', 8, '코카트리스지만 맛은 닭이다.'),
  mushroom: mat('숲 버섯', 6, '포자를 털어내면 먹을 수 있다.'),
  // later zones
  mirror_shard: mat('거울 조각', 140, '들여다보면 내가 반 박자 늦게 움직인다.'),
  quicksilver: mat('수은', 140, '손바닥 위에서 굴러다닌다.'),
  queen_tear: mat('여왕의 눈물', 900, '굳으면 작은 거울이 된다.'),
  puppet_string: mat('꼭두각시 실', 210, '끊어져도 여전히 무언가를 당긴다.'),
  mask_shard: mat('가면 조각', 210, '조각마다 다른 표정이다.'),
  final_script: mat('마지막 대본', 1500, '결말 부분이 비어 있다.'),
  // grocery (bought with gold)
  flour: mat('밀가루', 2, '빵, 파이, 반죽의 기본.'),
  sugar: mat('설탕', 1, '달다.'),
  butter: mat('버터', 3, '고소하다.'),
  milk: mat('우유', 2, '뿔소에게서도 얻을 수 있다.'),
  egg: mat('달걀', 2, '코카트리스 알이지만 문제없다.'),
  chocolate: mat('초콜릿', 5, '쿠키에 넣을 만큼 잘게 부순다.'),
  coffee: mat('커피 원두', 4, '깔루아의 재료.'),
  // shared
  stone: mat('룬석', 6, '장비 강화에 쓴다.'),
  stardust: mat('별가루', 40, '귀한 제작 재료.'),
  pearl: mat('진주', 30, '낚시로만 얻을 수 있다.'),
  // fishing
  minnow: { name: '피라미', kind: 'food', sell: 3, desc: '작지만 먹을 만하다.', food: { full: 10 } },
  carp: { name: '붕어', kind: 'food', sell: 7, desc: '든든한 한 끼.', food: { full: 22 } },
  sweetfish: { name: '은어', kind: 'food', sell: 12, desc: '수박 향이 난다.', food: { full: 15, mood: 10 } },
  mooncarp: { name: '달잉어', kind: 'food', sell: 35, desc: '달빛 호수에서만 잡힌다.', food: { full: 35, mood: 15, energy: 10 } },
  boot: { name: '낡은 장화', kind: 'junk', sell: 1, desc: '누가 버렸을까.' },
  // herbology
  turnip: { name: '순무', kind: 'food', sell: 2, desc: '금방 자란다.', food: { full: 12 } },
  berry: { name: '딸기', kind: 'food', sell: 4, desc: '새콤달콤.', food: { full: 8, mood: 8 } },
  pumpkin: { name: '호박', kind: 'food', sell: 4, desc: '온실의 자랑.', food: { full: 18 } },
  tomato: { name: '토마토', kind: 'food', sell: 3, desc: '햇볕을 많이 받아 새빨갛다.', food: { full: 8, mood: 4 } },
  potato: mat('감자', 3, '삶아서 으깨면 무엇이든 덮을 수 있다.'),
  wormwood: mat('약쑥', 3, '쓰다. 물약의 기본 재료.'),
  moonflower: { name: '달맞이꽃', kind: 'food', sell: 18, desc: '밤에만 핀다. 재료로도 쓴다.', food: { mood: 20 } },
  starfruit: { name: '별열매', kind: 'food', sell: 40, desc: '기력이 솟는다.', food: { full: 10, energy: 35 } },
  // cooking
  stew: { name: '순무 스튜', kind: 'food', sell: 10, desc: '연회장의 기본 메뉴.', food: { full: 40 } },
  tart: { name: '딸기 타르트', kind: 'food', sell: 14, desc: '한 조각이면 기분이 풀린다.', food: { full: 20, mood: 25 } },
  pie: { name: '호박 파이', kind: 'food', sell: 16, desc: '갓 구운 냄새.', food: { full: 50, mood: 10 } },
  fishpie: { name: '생선 파이', kind: 'food', sell: 22, desc: '속이 꽉 찼다.', food: { full: 60, energy: 10 } },
  feast: { name: '달빛 만찬', kind: 'food', sell: 80, desc: '연회에서나 나오는 한 상.', food: { full: 80, mood: 30, energy: 25 } },
  tomato_pasta: { name: '토마토 파스타', kind: 'food', sell: 18, desc: '토마토를 듬뿍 졸였다.', food: { full: 45, mood: 15 } },
  shepherd_pie: { name: '셰퍼드 파이', kind: 'food', sell: 45, desc: '양고기 위에 으깬 감자를 덮어 구웠다.', food: { full: 70, mood: 10 }, meal: { stat: 'hp', pct: 15, fights: 3 } },
  cookie: { name: '초코칩 쿠키', kind: 'food', sell: 6, desc: '한 판에 세 개씩 나온다.', food: { full: 6, mood: 15 } },
  strawberry_cake: { name: '딸기 케이크', kind: 'food', sell: 40, desc: '생크림 사이에 딸기를 빼곡히.', food: { full: 30, mood: 45 }, meal: { stat: 'mp', pct: 25, fights: 3 } },
  wellington: { name: '비프 웰링턴', kind: 'food', sell: 90, desc: '소고기와 버섯을 반죽으로 감싸 구웠다.', food: { full: 90, mood: 25, energy: 15 }, meal: { stat: 'atk', pct: 15, fights: 3 } },
  kahlua_milk: { name: '깔루아 밀크', kind: 'food', sell: 20, desc: '커피 술에 우유를 부었다. 어른의 맛.', food: { mood: 35, energy: 20 }, meal: { stat: 'crit', add: 10, fights: 3 } },
  skewer: { name: '돼지고기 꼬치구이', kind: 'food', sell: 16, desc: '불 맛이 난다.', food: { full: 35, energy: 5 } },
  roast_chicken: { name: '로스트 치킨', kind: 'food', sell: 30, desc: '감자를 깔고 통째로 구웠다.', food: { full: 55, mood: 10 }, meal: { stat: 'def', pct: 15, fights: 3 } },
  // potions
  heal_potion: { name: '치유 물약', kind: 'potion', sell: 8, desc: '전투 중 체력을 45% 회복한다.', battle: { heal: 0.45 } },
  mana_potion: { name: '마력 물약', kind: 'potion', sell: 10, desc: '전투 중 마력을 60% 회복한다.', battle: { mana: 0.6 } },
  might_potion: { name: '힘의 물약', kind: 'potion', sell: 20, desc: '전투 중 다음 세 번의 주문이 1.4배 강해진다.', battle: { might: 3 } },
  antidote: { name: '해독 물약', kind: 'potion', sell: 6, desc: '전투 중 중독·저주·침묵을 풀어준다.', battle: { cleanse: true } },
  calm_draught: { name: '진정 물약', kind: 'potion', sell: 15, desc: '마시면 기분이 크게 나아진다.', food: { mood: 40 } },
  // bought with starlight only
  tonic: { name: '기력 물약', kind: 'special', sell: 0, desc: '기력을 60 회복한다.', food: { energy: 60 } },
  charm: { name: '수호 부적', kind: 'special', sell: 0, desc: '강화 실패로 장비가 깨질 때 한 번 막아준다.' },
  luck: { name: '행운의 가루', kind: 'special', sell: 0, desc: '강화 한 번의 성공 확률을 15%p 올린다.' },
  quill: { name: '재련의 깃펜', kind: 'special', sell: 0, desc: '장비의 부옵션을 전부 다시 쓴다.' },
  hourglass: { name: '모래시계', kind: 'special', sell: 0, desc: '텃밭·낚시·채집·가마솥의 남은 시간을 한 번에 돌린다.' },
  catalyst: { name: '별의 촉매', kind: 'special', sell: 0, desc: '장비를 만들 때 넣으면 희귀 등급 이상이 보장된다.' },
  feather: { name: '불사조 깃털', kind: 'special', sell: 0, desc: '결투에서 쓰러질 때 체력 절반으로 한 번 되살아난다.' },
}

export const itemName = (id: string) => ITEMS[id]?.name ?? id

// Attach the Korean particle that agrees with the last sound: josa('켈피', '이', '가') → '켈피가'
export function josa(word: string, withFinal: string, without: string): string {
  const ch = word.trim().slice(-1)
  const code = ch.charCodeAt(0)
  const closed = code >= 0xac00 && code <= 0xd7a3
    ? (code - 0xac00) % 28 !== 0
    : /[bcdfgjklmnpqrstvxz]/i.test(ch) // a Latin name ending in a consonant reads as a closed syllable
  return word + (closed ? withFinal : without)
}

export function addBag(bag: Bag, id: string, n: number): Bag {
  const next = { ...bag }
  const v = (next[id] ?? 0) + n
  if (v > 0) next[id] = v
  else delete next[id]
  return next
}
const mergeBag = (bag: Bag, loot: Bag) => Object.entries(loot).reduce((b, [k, n]) => addBag(b, k, n), bag)
const lootAdd = (loot: Bag, id: string, n: number) => { loot[id] = (loot[id] ?? 0) + n }
export const hasMats = (inv: Bag, mats: Bag) => Object.entries(mats).every(([k, n]) => (inv[k] ?? 0) >= n)
const takeMats = (inv: Bag, mats: Bag) => Object.entries(mats).reduce((b, [k, n]) => addBag(b, k, -n), inv)

// Bring a save in line with the current data: forget unknown things, record what has been held.
export function tidy(p: Pet): Pet {
  const r = p.rpg
  const inv: Bag = {}
  const seen = { ...r.dex.i }
  let changed = false
  for (const [k, n] of Object.entries(r.inv)) {
    if (!ITEMS[k]) { changed = true; continue }
    inv[k] = n
    if (!seen[k]) { seen[k] = 1; changed = true }
  }
  let stage = Math.min(r.stage, ZONES.length - 1)
  if (r.zv < 2 && stage >= 1) stage += 1
  if (stage !== r.stage || r.zv !== ZONE_VERSION) changed = true
  let meal = r.meal
  if (meal && !ITEMS[meal.id]?.meal) { meal = null; changed = true }
  const gear = r.gear.filter(g => RECIPES[g.base])
  if (gear.length !== r.gear.length) changed = true
  const equip: Rpg['equip'] = {}
  for (const s of SLOTS) {
    const id = r.equip[s]
    if (id && gear.some(g => g.id === id && RECIPES[g.base].slot === s)) equip[s] = id
    else if (id) changed = true
  }
  if (!changed) return p
  return { ...p, rpg: { ...r, inv, gear, equip, stage, meal, zv: ZONE_VERSION, dex: { ...r.dex, i: seen } } }
}

// ───────────────────────── stats ─────────────────────────

export const RARITY = [
  { name: '일반', color: 'rgba(255,255,255,0.78)', weight: 50, mult: 1, subs: 1 },
  { name: '고급', color: '#8FC7A0', weight: 30, mult: 1.15, subs: 2 },
  { name: '희귀', color: '#7FAEE0', weight: 14, mult: 1.3, subs: 3 },
  { name: '영웅', color: '#BF94E4', weight: 5, mult: 1.5, subs: 4 },
  { name: '전설', color: '#E8C46A', weight: 1, mult: 1.8, subs: 4 },
]

export type StatKey = 'hp' | 'mp' | 'atk' | 'def' | 'crit' | 'critd' | 'drop' | 'gold' | 'coin' | 'xp' | 'haste' | 'yield'

export const STAT: Record<StatKey, { name: string; unit: '' | '%' }> = {
  hp: { name: '체력', unit: '' },
  mp: { name: '마력', unit: '' },
  atk: { name: '주문 위력', unit: '' },
  def: { name: '방어력', unit: '' },
  crit: { name: '치명타 확률', unit: '%' },
  critd: { name: '치명타 피해', unit: '%' },
  drop: { name: '드롭률', unit: '%' },
  gold: { name: '금화 획득', unit: '%' },
  coin: { name: '할 일 별빛', unit: '%' },
  xp: { name: '경험치', unit: '%' },
  haste: { name: '생활 속도', unit: '%' },
  yield: { name: '수확량', unit: '%' },
}

// Random sub-option pool: value = roll(min..max) × (1 + perTier × (tier − 1))
const SUB_POOL: { k: StatKey; min: number; max: number; perTier: number }[] = [
  { k: 'atk', min: 1, max: 3, perTier: 1 },
  { k: 'hp', min: 6, max: 14, perTier: 1 },
  { k: 'mp', min: 3, max: 6, perTier: 0.6 },
  { k: 'def', min: 1, max: 2, perTier: 1 },
  { k: 'crit', min: 2, max: 5, perTier: 0.25 },
  { k: 'critd', min: 6, max: 14, perTier: 0.3 },
  { k: 'drop', min: 3, max: 8, perTier: 0.25 },
  { k: 'gold', min: 3, max: 8, perTier: 0.25 },
  { k: 'coin', min: 2, max: 5, perTier: 0.25 },
  { k: 'xp', min: 3, max: 8, perTier: 0.25 },
  { k: 'haste', min: 2, max: 5, perTier: 0.25 },
  { k: 'yield', min: 4, max: 10, perTier: 0.25 },
]

export const MAIN_OF: Record<Slot, StatKey> = { wand: 'atk', robe: 'hp', hat: 'mp', amulet: 'def' }
export const SLOT_NAME: Record<Slot, string> = { wand: '지팡이', robe: '로브', hat: '모자', amulet: '부적' }

export interface Stats extends Record<StatKey, number> {
  cond: number // condition multiplier on spell power, from fullness / cleanliness / mood
  power: number
}

export const MAX_LV = 50
export const xpNeed = (lv: number) => 20 + 8 * lv * lv
export const gearMain = (g: Gear) => Math.round(g.main * (1 + 0.1 * g.plus))
export const powerOf = (hp: number, atk: number, def: number) => Math.round(atk * 4 + hp * 0.5 + def * 3)

// Permanent bonuses from the bestiary
export function dexBonus(r: Rpg) {
  const known = MONSTERS.filter(m => (r.dex.m[m.id] ?? 0) > 0).length
  const studied = MONSTERS.filter(m => (r.dex.m[m.id] ?? 0) >= 10).length
  const crafted = Object.keys(RECIPES).filter(k => r.dex.g[k]).length
  return { known, studied, crafted, hp: known * 4, atk: studied, mp: crafted }
}

export function statsOf(p: Pet): Stats {
  const r = p.rpg
  const b = dexBonus(r)
  const s: Record<StatKey, number> = {
    hp: 60 + 12 * r.lv + b.hp, mp: 20 + 3 * r.lv + b.mp, atk: 8 + 2 * r.lv + b.atk, def: 3 + r.lv,
    crit: 5, critd: 50, drop: 0, gold: 0, coin: 0, xp: 0, haste: 0, yield: 0,
  }
  for (const [id, perk] of Object.entries(PERKS)) {
    if (perk.stat) s[perk.stat] += perk.per * perkLv(r, id)
  }
  for (const slot of SLOTS) {
    const g = r.gear.find(x => x.id === r.equip[slot])
    const rec = g && RECIPES[g.base]
    if (!g || !rec) continue
    s[MAIN_OF[rec.slot]] += gearMain(g)
    for (const sub of g.subs) if (sub.k in s) s[sub.k as StatKey] += sub.v
  }
  const meal = r.meal && ITEMS[r.meal.id]?.meal
  if (meal) {
    if (meal.pct) s[meal.stat] = Math.round(s[meal.stat] * (1 + meal.pct / 100))
    if (meal.add) s[meal.stat] += meal.add
  }
  s.haste = Math.min(50, s.haste)
  s.crit = Math.min(75, s.crit)
  const cond = 0.75 + 0.35 * ((p.full + p.clean + p.mood) / 300)
  return { ...s, cond, power: powerOf(s.hp, s.atk * cond, s.def) }
}

function gainXp(r: Rpg, amount: number): { rpg: Rpg; leveled: number } {
  let { lv, xp } = r
  let leveled = 0
  xp += Math.max(0, Math.round(amount))
  while (lv < MAX_LV && xp >= xpNeed(lv)) { xp -= xpNeed(lv); lv++; leveled++ }
  if (lv >= MAX_LV) xp = 0
  return { rpg: { ...r, lv, xp }, leveled }
}

// ───────────────────────── creatures ─────────────────────────

export type Element = 'light' | 'storm' | 'fire' | 'frost'
export const ELEMENTS: Record<Element, { name: string; color: string }> = {
  light: { name: '빛', color: '#F2E3A6' },
  storm: { name: '번개', color: '#9CC3F2' },
  fire: { name: '불', color: '#F09A6A' },
  frost: { name: '얼음', color: '#A6E1EA' },
}

// What a creature does on its turn. Every creature repeats a fixed pattern of these, one per turn,
// and the next one is always shown to the player: winning is about reading the pattern.
export type Intent = 'hit' | 'charge' | 'smash' | 'flurry' | 'drain' | 'poison' | 'curse' | 'hush' | 'shell' | 'mirror' | 'regen' | 'howl' | 'rest'
export const INTENTS: Record<Intent, { name: string; desc: string; danger: 0 | 1 | 2 }> = {
  hit: { name: '공격', desc: '보통 공격', danger: 1 },
  charge: { name: '힘 모으기', desc: '다음 강타가 2.4배가 된다', danger: 1 },
  smash: { name: '강타', desc: '힘을 모았다면 2.4배', danger: 2 },
  flurry: { name: '연타', desc: '약한 공격 3번', danger: 1 },
  drain: { name: '흡수', desc: '준 피해만큼 회복하고 마력 6을 빼앗는다', danger: 1 },
  poison: { name: '독', desc: '약한 공격, 3턴 중독', danger: 1 },
  curse: { name: '저주', desc: '2턴 동안 회복 절반, 마력 재생 없음', danger: 1 },
  hush: { name: '침묵', desc: '2턴 동안 마력 주문 봉인 (해주는 가능)', danger: 1 },
  shell: { name: '껍질', desc: '2턴 동안 받는 피해 75% 감소. 번개에 깨진다', danger: 0 },
  mirror: { name: '반사', desc: '다음 피해 주문을 60% 되돌린다', danger: 0 },
  regen: { name: '재생', desc: '2턴 동안 체력 8%씩 회복. 연소 중엔 막힌다', danger: 0 },
  howl: { name: '포효', desc: '2턴 동안 공격력 30% 증가', danger: 0 },
  rest: { name: '휴식', desc: '아무것도 하지 않는다', danger: 0 },
}

export interface Drop { id: string; p: number; n: [number, number] }
export interface MonsterDef {
  id: string
  name: string
  art: string
  lore: string
  hp: number
  atk: number
  def: number
  xp: number
  boss?: boolean
  pattern: Intent[]
  weak?: Element[]
  resist?: Element[]
  enrage?: boolean // below 35% health it hits 40% harder
  phase?: { pattern: Intent[]; say: string; weak?: Element[]; resist?: Element[] } // from 50% health
  drops: Drop[]
}
export interface ZoneDef {
  id: string
  name: string
  desc: string
  mats: [string, string]
  forage?: [string, number][] // extra finds on gathering trips
  monsters: MonsterDef[]
}

const d = (id: string, p: number, min = 1, max = min): Drop => ({ id, p, n: [min, max] })

// An ordinary creature of each zone: [health, attack, defence, experience]. Others are multiples of it.
const BASE: [number, number, number, number][] = [
  [30, 15, 1, 7], [60, 29, 2, 13], [95, 46, 5, 21], [170, 79, 11, 42], [320, 136, 19, 90],
  [640, 216, 32, 200], [1200, 330, 50, 420], [1900, 451, 68, 700], [2900, 594, 88, 1100],
]
const S = (z: number, hp = 1, atk = 1, def = 1, xp = 1) => {
  const b = BASE[z]
  return { hp: Math.round(b[0] * hp), atk: Math.round(b[1] * atk), def: Math.round(b[2] * def), xp: Math.round(b[3] * xp) }
}

export const ZONES: ZoneDef[] = [
  {
    id: 'cellar', name: '지하 저장고', desc: '물약 통 사이로 작은 발소리가 지나간다.', mats: ['cobweb', 'whisker'],
    monsters: [
      { id: 'dustling', name: '먼지 도깨비', art: 'dust', lore: '청소 주문을 피해 백 년쯤 굴러다닌 먼지. 재채기를 유발한다.', ...S(0, 0.85, 0.85, 0, 0.85),
        pattern: ['hit', 'hit', 'rest'], weak: ['fire'], drops: [d('cobweb', 0.8, 1, 2), d('whisker', 0.25), d('stone', 0.08)] },
      { id: 'rat', name: '좀도둑 쥐', art: 'rat', lore: '물약 재료만 골라 훔친다. 가면은 어디서 났는지 아무도 모른다.', ...S(0, 1.25, 1.25, 1, 1.3),
        pattern: ['hit', 'drain', 'hit'], weak: ['light'], drops: [d('whisker', 0.7, 1, 2), d('cobweb', 0.4), d('stone', 0.1)] },
      { id: 'bat', name: '저장고 박쥐', art: 'bat', lore: '거꾸로 매달려 물약 냄새를 맡는다. 날갯짓이 쉴 새 없다.', ...S(0, 1.1, 1.1, 1, 1.2),
        pattern: ['flurry', 'hit', 'rest'], weak: ['storm'], drops: [d('whisker', 0.6, 1, 2), d('cobweb', 0.5), d('stone', 0.1)] },
      { id: 'slime', name: '술통 점액', art: 'slime', lore: '엎질러진 묘약이 굳어 생겼다. 스스로 상처를 메운다.', ...S(0, 1.6, 0.9, 1, 1.4),
        pattern: ['hit', 'regen', 'hit', 'hit'], weak: ['fire'], resist: ['frost'], drops: [d('cobweb', 0.6, 1, 2), d('whisker', 0.3), d('stone', 0.12)] },
      { id: 'troll', name: '지하 트롤', art: 'troll', boss: true, lore: '길을 잃고 저장고에 눌러앉았다. 느리지만 한 방이 무겁다.', ...S(0, 3.7, 1.85, 3, 5.5),
        pattern: ['hit', 'charge', 'smash', 'rest'], enrage: true, weak: ['fire'],
        drops: [d('cobweb', 1, 2, 4), d('whisker', 1, 2, 4), d('troll_tooth', 1, 1, 2), d('stone', 1, 1, 2)] },
    ],
  },
  {
    id: 'pasture', name: '목초지', desc: '울타리 너머에서 무언가 콧김을 뿜는다.', mats: ['wool', 'hide'],
    forage: [['pork', 14], ['beef', 10], ['mutton', 12], ['chicken', 14], ['milk', 8], ['egg', 10]],
    monsters: [
      { id: 'boar', name: '성난 멧돼지', art: 'boar', lore: '울타리를 들이받는 게 취미다. 돌진하기 전에 땅을 긁는다.', ...S(1, 1, 1.1, 1, 1),
        pattern: ['charge', 'smash', 'hit', 'rest'], weak: ['frost'], drops: [d('pork', 0.85, 1, 2), d('hide', 0.5), d('stone', 0.1)] },
      { id: 'cockatrice', name: '코카트리스', art: 'cockatrice', lore: '닭과 도마뱀 사이 어딘가. 부리에 독이 있다.', ...S(1, 0.9, 0.9, 0.8, 1),
        pattern: ['hit', 'poison', 'hit', 'rest'], weak: ['storm'], drops: [d('chicken', 0.85, 1, 2), d('egg', 0.5, 1, 2), d('hide', 0.25), d('stone', 0.1)] },
      { id: 'ram', name: '검은 숫양', art: 'ram', lore: '뿔을 부딪쳐 기세를 올린 뒤 달려든다.', ...S(1, 1.1, 1, 1.2, 1.1),
        pattern: ['howl', 'hit', 'charge', 'smash'], weak: ['fire'], drops: [d('mutton', 0.85, 1, 2), d('wool', 0.7, 1, 2), d('stone', 0.1)] },
      { id: 'ox', name: '뿔소', art: 'ox', lore: '가죽이 두꺼워 웬만한 빛은 튕겨낸다.', ...S(1, 1.5, 0.9, 2, 1.3),
        pattern: ['hit', 'hit', 'charge', 'smash'], weak: ['storm'], resist: ['light'], drops: [d('beef', 0.85, 1, 2), d('milk', 0.5), d('hide', 0.5), d('stone', 0.12)] },
      { id: 'bull', name: '미궁의 황소', art: 'bull', boss: true, lore: '목초지 끝 돌담 미로의 주인. 쉴 때가 유일한 틈이다.', ...S(1, 3.8, 1.6, 1.4, 5.5),
        pattern: ['howl', 'charge', 'smash', 'flurry', 'rest'], enrage: true, weak: ['frost'], resist: ['fire'],
        drops: [d('beef', 1, 2, 4), d('hide', 1, 2, 4), d('wool', 1, 2, 3), d('horn', 1, 1, 2), d('stone', 1, 2, 3)] },
    ],
  },
  {
    id: 'greenhouse', name: '온실', desc: '유리 너머로 무언가 화분을 흔든다.', mats: ['pixie_dust', 'vine'],
    monsters: [
      { id: 'pixie', name: '장난꾸러기 픽시', art: 'pixie', lore: '머리카락을 묶어 놓고 달아난다. 떼로 다니면 골치 아프다.', ...S(2, 0.75, 0.85, 0.8, 0.8),
        pattern: ['flurry', 'hush', 'hit'], weak: ['frost'], drops: [d('pixie_dust', 0.8, 1, 2), d('vine', 0.2), d('stone', 0.1)] },
      { id: 'vine', name: '조르는 덩굴', art: 'vine', lore: '햇빛을 싫어하고 따뜻한 것을 감싸 안는 버릇이 있다.', ...S(2, 0.95, 1.05, 1.2, 1.05),
        pattern: ['hit', 'regen', 'hit', 'hit'], weak: ['fire'], resist: ['storm'], drops: [d('vine', 0.7, 1, 2), d('pixie_dust', 0.35), d('stone', 0.12)] },
      { id: 'spore', name: '포자 버섯', art: 'mushroom', lore: '건드리면 보라색 포자를 뿜는다. 갓은 요리에 쓴다.', ...S(2, 1, 0.9, 1, 1),
        pattern: ['poison', 'hit', 'poison', 'rest'], weak: ['fire'], drops: [d('mushroom', 0.8, 1, 2), d('vine', 0.3), d('stone', 0.1)] },
      { id: 'bees', name: '유리벌 떼', art: 'bees', lore: '온실 유리로 집을 짓는다. 쉬는 동안만 조용하다.', ...S(2, 0.85, 0.8, 0.6, 1),
        pattern: ['flurry', 'flurry', 'rest'], weak: ['frost'], resist: ['light'], drops: [d('pixie_dust', 0.6, 1, 2), d('berry', 0.4, 1, 2), d('stone', 0.1)] },
      { id: 'mandrake', name: '울부짖는 맨드레이크', art: 'mandrake', boss: true, lore: '다 자란 개체의 비명은 사람을 기절시킨다. 화분에서 스스로 걸어 나왔다.', ...S(2, 2.9, 1.5, 1.6, 4.3),
        pattern: ['hit', 'hush', 'charge', 'smash'], weak: ['fire'],
        phase: { pattern: ['flurry', 'curse', 'charge', 'smash'], say: '비명이 날카로워진다!' },
        drops: [d('pixie_dust', 1, 3, 5), d('vine', 1, 3, 5), d('mandrake_root', 1, 1, 2), d('mushroom', 1, 1, 2), d('stone', 1, 2, 3), d('stardust', 0.35)] },
    ],
  },
  {
    id: 'stacks', name: '금서 서고', desc: '책장이 저절로 넘어가는 소리가 난다.', mats: ['parchment', 'ink'],
    monsters: [
      { id: 'book', name: '이빨 고서', art: 'book', lore: '읽으려는 사람을 문다. 등을 쓰다듬으면 얌전해진다는 소문이 있다.', ...S(3, 0.9, 0.95, 1.1, 0.9),
        pattern: ['hit', 'shell', 'hit', 'hit'], weak: ['fire'], drops: [d('parchment', 0.8, 1, 2), d('ink', 0.2), d('stone', 0.12)] },
      { id: 'inkblot', name: '잉크 얼룩', art: 'ink', lore: '쏟아진 마법 잉크가 스스로 생각하기 시작했다.', ...S(3, 1.05, 1.1, 0.9, 1.15),
        pattern: ['curse', 'hit', 'drain'], weak: ['light'], resist: ['frost'], drops: [d('ink', 0.75, 1, 2), d('parchment', 0.3), d('stone', 0.14)] },
      { id: 'quill', name: '날뛰는 깃펜', art: 'quill', lore: '숙제를 대신 써주다 미쳐버렸다. 획이 날카롭다.', ...S(3, 0.8, 1, 0.8, 1),
        pattern: ['flurry', 'hit', 'flurry', 'rest'], weak: ['storm'], drops: [d('ink', 0.7, 1, 2), d('parchment', 0.3), d('stone', 0.12)] },
      { id: 'mimic', name: '책상 미믹', art: 'mimic', lore: '졸고 있는 척한다. 깨어나기 전에 끝내야 한다.', ...S(3, 1.3, 1.3, 1.6, 1.4),
        pattern: ['rest', 'rest', 'charge', 'smash'], weak: ['fire'], resist: ['light'], drops: [d('parchment', 0.7, 1, 2), d('ink', 0.4), d('stone', 0.2), d('stardust', 0.05)] },
      { id: 'librarian', name: '서고의 유령', art: 'ghost', boss: true, lore: '연체된 책을 삼백 년째 기다리는 사서. 속삭임에도 화를 낸다.', ...S(3, 3, 1.45, 1.45, 4.8),
        pattern: ['hush', 'hit', 'mirror', 'hit', 'charge', 'smash'], weak: ['fire'], resist: ['light'],
        phase: { pattern: ['mirror', 'curse', 'flurry', 'charge', 'smash'], say: '책장이 일제히 넘어간다!' },
        drops: [d('parchment', 1, 3, 5), d('ink', 1, 3, 5), d('ghost_breath', 1, 1, 2), d('stone', 1, 2, 4), d('stardust', 0.5, 1, 2)] },
    ],
  },
  {
    id: 'forest', name: '속삭이는 숲', desc: '나무들이 이름을 부른다.', mats: ['ember', 'silk'],
    monsters: [
      { id: 'wisp', name: '도깨비불', art: 'wisp', lore: '길 잃은 이를 늪으로 이끈다. 따라가면 안 된다.', ...S(4, 0.95, 0.95, 1, 0.95),
        pattern: ['hit', 'mirror', 'hit'], weak: ['frost'], resist: ['fire'], drops: [d('ember', 0.8, 1, 2), d('silk', 0.2), d('stone', 0.15), d('stardust', 0.04)] },
      { id: 'spider', name: '숲 거미', art: 'spider', lore: '사람 머리만 한 거미. 말을 알아듣는다는 기록이 있다.', ...S(4, 1.1, 1.1, 0.95, 1.1),
        pattern: ['poison', 'hit', 'flurry'], weak: ['fire'], drops: [d('silk', 0.75, 1, 2), d('ember', 0.3), d('stone', 0.15), d('stardust', 0.04)] },
      { id: 'treant', name: '늙은 나무정령', art: 'treant', lore: '나이테가 천 겹. 껍질을 벗기지 못하면 상처가 금세 아문다.', ...S(4, 1.5, 0.9, 1.4, 1.3),
        pattern: ['shell', 'hit', 'regen', 'hit'], weak: ['fire'], resist: ['storm'], drops: [d('mushroom', 0.5, 1, 2), d('ember', 0.3), d('silk', 0.3), d('stone', 0.15)] },
      { id: 'stag', name: '흰 사슴', art: 'stag', lore: '숲의 길을 지키는 사슴. 뿔을 세우면 물러서라.', ...S(4, 1.05, 1.1, 1, 1.1),
        pattern: ['howl', 'charge', 'smash', 'hit'], weak: ['storm'], resist: ['frost'], drops: [d('silk', 0.5), d('ember', 0.5), d('stone', 0.15), d('stardust', 0.04)] },
      { id: 'wolf', name: '달그림자 늑대', art: 'wolf', boss: true, lore: '보름달이 뜬 밤에만 모습을 드러낸다. 그림자가 먼저 달려든다.', ...S(4, 2.9, 1.3, 1.35, 4.7),
        pattern: ['howl', 'flurry', 'charge', 'smash', 'hit'], enrage: true, weak: ['light'], resist: ['frost'],
        phase: { pattern: ['mirror', 'flurry', 'charge', 'smash'], say: '그림자가 따로 움직이기 시작한다!' },
        drops: [d('ember', 1, 3, 6), d('silk', 1, 3, 6), d('wolf_fang', 1, 1, 2), d('stone', 1, 3, 5), d('stardust', 0.7, 1, 2)] },
    ],
  },
  {
    id: 'lake', name: '검은 호수', desc: '수면 아래에서 누군가 올려다본다.', mats: ['waterweed', 'kelpie_mane'],
    monsters: [
      { id: 'drowner', name: '물귀신', art: 'hand', lore: '발목을 잡아끄는 창백한 손. 손가락이 약하다.', ...S(5, 0.95, 0.97, 1.05, 0.95),
        pattern: ['drain', 'hit', 'curse'], weak: ['light'], drops: [d('waterweed', 0.8, 1, 2), d('kelpie_mane', 0.15), d('stone', 0.18), d('stardust', 0.06)] },
      { id: 'kelpie', name: '켈피', art: 'kelpie', lore: '아름다운 말의 모습으로 등에 태운 뒤 물속으로 끌고 간다.', ...S(5, 1.1, 1.07, 0.95, 1.1),
        pattern: ['charge', 'smash', 'hit', 'hit'], weak: ['storm'], resist: ['frost'], drops: [d('kelpie_mane', 0.75, 1, 2), d('waterweed', 0.3), d('stone', 0.18), d('stardust', 0.06)] },
      { id: 'eel', name: '번개 뱀장어', art: 'eel', lore: '몸에 번개를 두르고 있다. 번개 주문은 먹이일 뿐이다.', ...S(5, 0.9, 1, 0.9, 1),
        pattern: ['hit', 'hush', 'flurry'], weak: ['frost'], resist: ['storm'], drops: [d('waterweed', 0.6, 1, 2), d('kelpie_mane', 0.3), d('pearl', 0.1), d('stone', 0.18)] },
      { id: 'crab', name: '바위게', art: 'crab', lore: '등딱지를 두 번 세운다. 번개가 아니면 흠집도 안 난다.', ...S(5, 1.3, 1, 1.6, 1.25),
        pattern: ['shell', 'hit', 'shell', 'charge', 'smash'], weak: ['storm'], resist: ['fire'], drops: [d('waterweed', 0.5, 1, 2), d('pearl', 0.2), d('stone', 0.2), d('stardust', 0.06)] },
      { id: 'serpent', name: '늙은 물뱀', art: 'snake', boss: true, lore: '호수가 생기기 전부터 살았다고 한다. 비늘 하나가 방패만 하다.', ...S(5, 2.7, 1.15, 1.25, 5),
        pattern: ['regen', 'hit', 'charge', 'smash', 'flurry'], weak: ['storm'], resist: ['fire'],
        phase: { pattern: ['shell', 'drain', 'charge', 'smash'], say: '비늘이 단단하게 곤두선다!' },
        drops: [d('waterweed', 1, 4, 7), d('kelpie_mane', 1, 3, 6), d('serpent_scale', 1, 1, 2), d('stone', 1, 4, 6), d('stardust', 1, 1, 2)] },
    ],
  },
  {
    id: 'tower', name: '천문탑', desc: '계단이 끝나지 않는다.', mats: ['gargoyle_stone', 'star_shard'],
    monsters: [
      { id: 'gargoyle', name: '가고일', art: 'gargoyle', lore: '낮에는 석상, 밤에는 문지기. 암호를 틀리면 덤벼든다.', ...S(6, 0.95, 1, 1.05, 0.95),
        pattern: ['shell', 'hit', 'hit', 'rest'], weak: ['storm'], resist: ['light'], drops: [d('gargoyle_stone', 0.8, 1, 2), d('star_shard', 0.15), d('stone', 0.2), d('stardust', 0.08)] },
      { id: 'starsprite', name: '별똥 정령', art: 'starsprite', lore: '떨어진 별이 탑 꼭대기에 걸려 심술이 났다.', ...S(6, 1.05, 1.1, 0.9, 1.1),
        pattern: ['mirror', 'flurry', 'hit'], weak: ['frost'], resist: ['light'], drops: [d('star_shard', 0.75, 1, 2), d('gargoyle_stone', 0.3), d('stone', 0.2), d('stardust', 0.1)] },
      { id: 'clock', name: '태엽 시계병', art: 'clock', lore: '다섯 박자마다 종을 친다. 박자를 세라.', ...S(6, 1.2, 1.05, 1.3, 1.15),
        pattern: ['hit', 'hit', 'hit', 'charge', 'smash'], weak: ['storm'], resist: ['frost'], drops: [d('gargoyle_stone', 0.5, 1, 2), d('star_shard', 0.3), d('stone', 0.2), d('stardust', 0.08)] },
      { id: 'owl', name: '천문 부엉이', art: 'owl', lore: '별자리를 외우지 못한 학생을 노려본다.', ...S(6, 0.95, 1, 0.9, 1.05),
        pattern: ['hush', 'hit', 'curse', 'hit'], weak: ['fire'], drops: [d('star_shard', 0.6, 1, 2), d('gargoyle_stone', 0.3), d('stone', 0.2), d('stardust', 0.1)] },
      { id: 'dragon', name: '탑의 수호룡', art: 'dragon', boss: true, lore: '탑 꼭대기에서 별을 세며 잠든다. 깨운 대가는 크다.', ...S(6, 2.2, 0.95, 1.24, 5.7),
        pattern: ['howl', 'charge', 'smash', 'flurry', 'regen'], enrage: true, weak: ['frost'], resist: ['fire'],
        phase: { pattern: ['mirror', 'charge', 'smash', 'flurry', 'shell'], say: '비늘 사이로 별빛이 새어 나온다!' },
        drops: [d('gargoyle_stone', 1, 4, 8), d('star_shard', 1, 4, 8), d('dragon_scale', 1, 1, 3), d('stone', 1, 5, 8), d('stardust', 1, 2, 4)] },
    ],
  },
  {
    id: 'mirror', name: '거울 회랑', desc: '비친 내가 먼저 움직인다.', mats: ['mirror_shard', 'quicksilver'],
    monsters: [
      { id: 'knight', name: '거울 기사', art: 'knight', lore: '방패에 비친 것은 무엇이든 되돌려 보낸다.', ...S(7, 1, 1, 1.1, 1),
        pattern: ['mirror', 'hit', 'mirror', 'hit'], weak: ['storm'], resist: ['light'], drops: [d('mirror_shard', 0.8, 1, 2), d('quicksilver', 0.2), d('stone', 0.2)] },
      { id: 'twins', name: '쌍둥이 그림자', art: 'twins', lore: '한 명을 때리면 다른 한 명이 웃는다.', ...S(7, 0.9, 1, 0.9, 1),
        pattern: ['flurry', 'flurry', 'curse'], weak: ['light'], drops: [d('quicksilver', 0.6, 1, 2), d('mirror_shard', 0.3), d('stone', 0.2)] },
      { id: 'golem', name: '유리 골렘', art: 'golem', lore: '깨진 거울 조각을 이어 붙인 거인.', ...S(7, 1.4, 1.05, 1.5, 1.3),
        pattern: ['shell', 'charge', 'smash'], weak: ['storm'], resist: ['fire'], drops: [d('mirror_shard', 0.6, 1, 2), d('quicksilver', 0.3), d('stone', 0.25), d('stardust', 0.1)] },
      { id: 'moth', name: '거울나방', art: 'moth', lore: '날개 가루가 닿으면 거울 속이 보인다.', ...S(7, 0.9, 1, 0.85, 1),
        pattern: ['poison', 'mirror', 'flurry'], weak: ['fire'], resist: ['frost'], drops: [d('quicksilver', 0.6, 1, 2), d('mirror_shard', 0.3), d('stone', 0.2)] },
      { id: 'queen', name: '거울 여왕', art: 'queen', boss: true, lore: '회랑의 모든 거울은 그녀의 눈이다.', ...S(7, 3, 1.25, 1.3, 5.5),
        pattern: ['mirror', 'hush', 'charge', 'smash', 'shell'], weak: ['storm'], resist: ['light'],
        phase: { pattern: ['mirror', 'mirror', 'flurry', 'curse', 'charge', 'smash'], say: '거울이 갈라지며 웃음소리가 겹친다!' },
        drops: [d('mirror_shard', 1, 3, 6), d('quicksilver', 1, 3, 6), d('queen_tear', 1, 1, 2), d('stone', 1, 5, 8), d('stardust', 1, 2, 3)] },
    ],
  },
  {
    id: 'finale', name: '막이 내린 무대', desc: '객석은 비었는데 박수 소리가 들린다.', mats: ['puppet_string', 'mask_shard'],
    monsters: [
      { id: 'puppet', name: '줄 끊긴 꼭두각시', art: 'puppet', lore: '줄이 끊겼는데도 춤을 멈추지 않는다.', ...S(8, 0.95, 1, 0.95, 1),
        pattern: ['flurry', 'hit', 'hush', 'flurry'], weak: ['fire'], drops: [d('puppet_string', 0.8, 1, 2), d('mask_shard', 0.2), d('stone', 0.25)] },
      { id: 'mask', name: '웃는 가면', art: 'mask', lore: '표정이 바뀔 때마다 무언가를 빼앗아 간다.', ...S(8, 0.95, 1, 1, 1),
        pattern: ['curse', 'mirror', 'drain'], weak: ['light'], drops: [d('mask_shard', 0.7, 1, 2), d('puppet_string', 0.3), d('stone', 0.25)] },
      { id: 'curtain', name: '커튼 망령', art: 'curtain', lore: '막이 내려도 무대를 떠나지 못한 커튼.', ...S(8, 1.35, 1, 1.3, 1.25),
        pattern: ['shell', 'regen', 'hit', 'charge', 'smash'], weak: ['fire'], resist: ['storm'], drops: [d('puppet_string', 0.5), d('mask_shard', 0.5), d('stone', 0.3), d('stardust', 0.1)] },
      { id: 'choir', name: '그림자 합창단', art: 'choir', lore: '노래가 끝날 때까지 아무 주문도 외울 수 없다.', ...S(8, 1, 1, 0.9, 1.1),
        pattern: ['hush', 'flurry', 'flurry', 'rest'], weak: ['storm'], drops: [d('mask_shard', 0.6, 1, 2), d('puppet_string', 0.4), d('stone', 0.25), d('stardust', 0.1)] },
      { id: 'director', name: '막후의 연출가', art: 'director', boss: true, lore: '이 극장의 모든 막을 올리고 내린 사람.', ...S(8, 3.0, 1.15, 1.3, 6),
        pattern: ['howl', 'mirror', 'charge', 'smash', 'curse', 'flurry'], enrage: true, weak: ['frost'],
        phase: { pattern: ['hush', 'mirror', 'charge', 'smash', 'regen', 'charge', 'smash'], say: '"이제 진짜 공연을 시작하지."' },
        drops: [d('puppet_string', 1, 4, 8), d('mask_shard', 1, 4, 8), d('final_script', 1, 1, 1), d('stone', 1, 6, 10), d('stardust', 1, 3, 5)] },
    ],
  },
]

export const MONSTERS: MonsterDef[] = ZONES.flatMap(z => z.monsters)
export const battleCost = (m: MonsterDef, r?: Rpg) => (m.boss ? 12 : 6) - (r ? perkLv(r, 'vigor') : 0)
export const monsterPower = (m: MonsterDef) => powerOf(m.hp, m.atk, m.def)

// ───────────────────────── battle (turn by turn) ─────────────────────────

export type Move = 'strike' | 'blast' | 'ignis' | 'glacies' | 'bind' | 'solvo' | 'guard' | 'heal' | 'flee'

export const MOVES: Record<Move, { name: string; latin: string; mp: number; lv: number; desc: string; el?: Element; mult?: number }> = {
  strike: { name: '섬광', latin: 'Fulgor', mp: 0, lv: 1, el: 'light', mult: 1, desc: '빛 · 1배' },
  blast: { name: '벽력', latin: 'Tonitrus', mp: 8, lv: 2, el: 'storm', mult: 1.7, desc: '번개 · 1.7배 · 껍질을 깬다' },
  ignis: { name: '화염', latin: 'Ignis', mp: 9, lv: 4, el: 'fire', mult: 1.3, desc: '불 · 1.3배 · 3턴 연소 (재생을 막는다)' },
  bind: { name: '결박', latin: 'Vinculum', mp: 10, lv: 5, mult: 0.5, desc: '0.5배 · 상대의 다음 행동을 막는다 (보스 60%)' },
  glacies: { name: '빙결', latin: 'Glacies', mp: 10, lv: 6, el: 'frost', mult: 1.2, desc: '얼음 · 1.2배 · 2턴 동안 상대 공격력 −30%' },
  solvo: { name: '해주', latin: 'Solvo', mp: 6, lv: 8, desc: '상대의 껍질·반사·재생·포효와 내 중독·저주·침묵을 걷어낸다' },
  guard: { name: '방패', latin: 'Aegis', mp: 0, lv: 1, desc: '이번 턴 받는 피해 −70% · 마력 +4' },
  heal: { name: '치유', latin: 'Sanare', mp: 12, lv: 3, desc: '체력 30% 회복' },
  flee: { name: '도주', latin: 'Fuga', mp: 0, lv: 1, desc: '달아난다 (보스는 35%)' },
}
export const MOVE_ORDER: Move[] = ['strike', 'blast', 'ignis', 'glacies', 'bind', 'solvo', 'guard', 'heal', 'flee']

export type LogTone = 'p' | 'crit' | 'm' | 'warn' | 'sys'
export interface Battle {
  zone: number
  index: number
  pHp: number
  pMax: number
  mp: number
  mpMax: number
  mHp: number
  mMax: number
  step: number // position in the creature's pattern
  phase2: boolean
  charging: boolean // the next smash lands at full force
  stunned: boolean
  // on the creature (turns left)
  shell: number
  mirror: boolean
  regen: number
  howl: number
  burn: number
  chill: number
  enraged: boolean
  // on the player (turns left)
  poison: number
  curse: number
  silence: number
  might: number // empowered casts left
  feather: boolean // a phoenix feather is in the bag
  revived: boolean
  turn: number
  log: { t: string; tone: LogTone }[]
  over: null | 'win' | 'lose' | 'fled'
}

export const monsterOf = (b: Battle) => ZONES[b.zone].monsters[b.index]
export const patternOf = (b: Battle) => { const m = monsterOf(b); return b.phase2 && m.phase ? m.phase.pattern : m.pattern }
export const nextIntent = (b: Battle): Intent => { const p = patternOf(b); return p[b.step % p.length] }
export function affinity(m: MonsterDef, phase2: boolean) {
  return {
    weak: (phase2 && m.phase?.weak) || m.weak || [],
    resist: (phase2 && m.phase?.resist) || m.resist || [],
  }
}

const say = (b: Battle, t: string, tone: LogTone) => { b.log = [...b.log, { t, tone }].slice(-40) }

export function startBattle(p: Pet, zone: number, index: number): Fail | { pet: Pet; battle: Battle; stats: Stats } {
  const m = ZONES[zone]?.monsters[index]
  if (!m || zone > p.rpg.stage) return '아직 갈 수 없는 곳이에요.'
  if (p.asleep) return ASLEEP
  if (p.rpg.job) return '지금은 자리를 비웠어요. 돌아온 뒤에 싸울 수 있어요.'
  const cost = battleCost(m, p.rpg)
  if (p.energy < cost) return `기력이 모자라요. (필요 ${cost})`
  const stats = statsOf(p) // a meal's buff counts for this duel even if it is the last one
  const meal = p.rpg.meal && p.rpg.meal.left > 1 ? { ...p.rpg.meal, left: p.rpg.meal.left - 1 } : null
  const battle: Battle = {
    zone, index, pHp: stats.hp, pMax: stats.hp, mp: stats.mp, mpMax: stats.mp, mHp: m.hp, mMax: m.hp,
    step: 0, phase2: false, charging: false, stunned: false,
    shell: 0, mirror: false, regen: 0, howl: 0, burn: 0, chill: 0, enraged: false,
    poison: 0, curse: 0, silence: 0, might: 0,
    feather: (p.rpg.inv.feather ?? 0) > 0, revived: false, turn: 1,
    log: [{ t: `${josa(m.name, '이', '가')} 나타났다.${m.boss ? ' 이 구역의 주인이다.' : ''}`, tone: 'sys' }],
    over: null,
  }
  return { pet: { ...p, energy: clamp100(p.energy - cost), clean: clamp100(p.clean - 2), rpg: { ...p.rpg, meal } }, battle, stats }
}

function hurtPlayer(b: Battle, dmg: number) {
  b.pHp = Math.max(0, b.pHp - dmg)
  if (b.pHp > 0) return
  if (b.feather && !b.revived) {
    b.revived = true
    b.pHp = Math.round(b.pMax * 0.5)
    say(b, '불사조 깃털이 타오르며 다시 일으켜 세웠다!', 'crit')
  } else {
    b.over = 'lose'
  }
}

// Phase change and rage are checked right after damage, so the next intent shown is always the real one.
function thresholds(b: Battle) {
  const m = monsterOf(b)
  if (b.over) return
  if (m.phase && !b.phase2 && b.mHp <= b.mMax * 0.5) {
    b.phase2 = true
    b.step = 0
    b.charging = false
    say(b, m.phase.say, 'warn')
  }
  if (m.enrage && !b.enraged && b.mHp <= b.mMax * 0.35) {
    b.enraged = true
    say(b, `${josa(m.name, '이', '가')} 격노했다!`, 'warn')
  }
}

function enemyTurn(b: Battle, st: Stats, guarding: boolean) {
  const m = monsterOf(b)
  const name = m.name
  const hit = (mult: number) => {
    let dmg = m.atk * (0.85 + rand() * 0.3) * mult * (b.howl > 0 ? 1.3 : 1) * (b.enraged ? 1.4 : 1) * (b.chill > 0 ? 0.7 : 1) - st.def * 0.5
    if (guarding) dmg *= 0.3
    dmg = Math.max(1, Math.round(dmg))
    hurtPlayer(b, dmg)
    return dmg
  }
  const shield = guarding ? ' (방패)' : ''

  if (b.regen > 0) {
    if (b.burn > 0) say(b, '불길이 재생을 막았다.', 'sys')
    else {
      const h = Math.round(b.mMax * 0.08)
      b.mHp = Math.min(b.mMax, b.mHp + h)
      say(b, `${name} 재생 +${h}`, 'm')
    }
  }

  if (b.stunned) {
    b.stunned = false
    b.step++
    say(b, `${josa(name, '은', '는')} 묶여서 움직이지 못한다.`, 'sys')
  } else {
    const intent = nextIntent(b)
    b.step++
    switch (intent) {
      case 'hit': say(b, `${name}의 공격${shield} → ${hit(1)}`, 'm'); break
      case 'charge':
        b.charging = true
        say(b, `${josa(name, '이', '가')} 힘을 모은다…!`, 'warn')
        break
      case 'smash':
        if (b.charging) {
          b.charging = false
          const dmg = hit(2.4)
          say(b, `${name}의 강타!${shield} → ${dmg}`, guarding ? 'm' : 'warn')
        } else say(b, `${name}의 공격${shield} → ${hit(1)}`, 'm')
        break
      case 'flurry': {
        const hits: number[] = []
        for (let i = 0; i < 3 && !b.over; i++) hits.push(hit(0.45))
        say(b, `${name}의 연타${shield} → ${hits.join(' · ')}`, 'm')
        break
      }
      case 'drain': {
        const dmg = hit(0.8)
        const stolen = Math.min(b.mp, 6)
        b.mp -= stolen
        b.mHp = Math.min(b.mMax, b.mHp + dmg)
        say(b, `${name}의 흡수${shield} → ${dmg}${stolen ? ` · 마력 −${stolen}` : ''}`, 'm')
        break
      }
      case 'poison':
        b.poison = 3
        say(b, `${name}의 독${shield} → ${hit(0.5)} · 중독`, 'warn')
        break
      case 'curse':
        b.curse = 3
        say(b, `${josa(name, '이', '가')} 저주를 걸었다.`, 'warn')
        break
      case 'hush':
        b.silence = 3
        say(b, `${josa(name, '이', '가')} 입을 막았다. 마력 주문 봉인.`, 'warn')
        break
      case 'shell':
        b.shell = 3
        say(b, `${josa(name, '이', '가')} 껍질을 둘렀다.`, 'sys')
        break
      case 'mirror':
        b.mirror = true
        say(b, `${josa(name, '이', '가')} 거울을 세웠다.`, 'warn')
        break
      case 'regen':
        b.regen = 3
        say(b, `${josa(name, '이', '가')} 상처를 메우기 시작한다.`, 'sys')
        break
      case 'howl':
        b.howl = 3
        say(b, `${josa(name, '이', '가')} 포효한다!`, 'warn')
        break
      case 'rest':
        say(b, `${josa(name, '은', '는')} 숨을 고른다.`, 'sys')
        break
    }
  }
  if (b.over) return

  if (b.burn > 0) {
    const aff = affinity(m, b.phase2)
    const dmg = Math.max(1, Math.round(st.atk * 0.3 * (aff.weak.includes('fire') ? 1.6 : aff.resist.includes('fire') ? 0.5 : 1)))
    b.mHp = Math.max(0, b.mHp - dmg)
    say(b, `연소 → ${dmg}`, 'p')
    if (b.mHp <= 0) { b.over = 'win'; return }
    thresholds(b)
  }
  if (b.poison > 0) {
    const dmg = Math.max(1, Math.round(b.pMax * 0.05))
    say(b, `중독 → ${dmg}`, 'm')
    hurtPlayer(b, dmg)
    if (b.over) return
  }
  for (const k of ['shell', 'regen', 'howl', 'burn', 'chill', 'poison', 'curse', 'silence'] as const) if (b[k] > 0) b[k]--
  if (b.curse === 0) b.mp = Math.min(b.mpMax, b.mp + 2)
  b.turn++
}

export function battleMove(prev: Battle, st: Stats, move: Move, lv: number, who: string): Fail | Battle {
  if (prev.over) return '이미 끝난 싸움이에요.'
  const def = MOVES[move]
  if (lv < def.lv) return `${def.name} 주문은 Lv.${def.lv}부터 쓸 수 있어요.`
  if (prev.silence > 0 && def.mp > 0 && move !== 'solvo') return '침묵 중이에요. 마력 주문은 해주만 쓸 수 있어요.'
  if (prev.mp < def.mp) return '마력이 모자라요.'
  const b: Battle = { ...prev, mp: prev.mp - def.mp, log: [...prev.log] }
  const m = monsterOf(b)
  let guarding = false

  // Returns whether the spell reached the creature (a mirror sends it back instead).
  const cast = (): boolean => {
    const aff = affinity(m, b.phase2)
    let dmg = st.atk * st.cond * (0.85 + rand() * 0.3) * (def.mult ?? 1) * (b.might > 0 ? 1.4 : 1)
    let tag = ''
    if (def.el && aff.weak.includes(def.el)) { dmg *= 1.6; tag = ' 약점!' }
    else if (def.el && aff.resist.includes(def.el)) { dmg *= 0.5; tag = ' 저항' }
    const crit = rand() * 100 < st.crit
    if (crit) dmg *= 1 + st.critd / 100
    if (b.might > 0) b.might--
    dmg = Math.max(1, Math.round(dmg - m.def * 0.5))
    const label = `${who}의 ${def.name}(${def.latin})`
    if (b.mirror) {
      b.mirror = false
      const back = Math.max(1, Math.round(dmg * 0.6))
      say(b, `거울이 ${def.name}을 되돌렸다 → ${back}`, 'warn')
      hurtPlayer(b, back)
      return false
    }
    if (b.shell > 0) {
      if (def.el === 'storm') { b.shell = 0; say(b, '껍질이 깨졌다!', 'crit') }
      else { dmg = Math.max(1, Math.round(dmg * 0.25)); tag += ' (껍질)' }
    }
    b.mHp = Math.max(0, b.mHp - dmg)
    say(b, `${label}${crit ? ' 치명타!' : ''}${tag} → ${dmg}`, crit || tag === ' 약점!' ? 'crit' : 'p')
    if (b.mHp <= 0) b.over = 'win'
    else thresholds(b)
    return true
  }

  switch (move) {
    case 'strike':
    case 'blast':
      cast()
      break
    case 'ignis':
      if (cast() && !b.over) b.burn = 3
      break
    case 'glacies':
      if (cast() && !b.over) b.chill = 2
      break
    case 'bind':
      if (cast() && !b.over) {
        if (!m.boss || rand() < 0.6) {
          b.stunned = true
          if (b.charging) { b.charging = false; say(b, '모으던 힘이 흩어졌다.', 'sys') }
        } else say(b, `${josa(m.name, '이', '가')} 결박을 뿌리쳤다.`, 'sys')
      }
      break
    case 'solvo': {
      const gone: string[] = []
      if (b.shell) gone.push('껍질')
      if (b.mirror) gone.push('반사')
      if (b.regen) gone.push('재생')
      if (b.howl) gone.push('포효')
      if (b.poison) gone.push('중독')
      if (b.curse) gone.push('저주')
      if (b.silence) gone.push('침묵')
      b.shell = 0; b.mirror = false; b.regen = 0; b.howl = 0; b.poison = 0; b.curse = 0; b.silence = 0
      say(b, gone.length ? `해주(Solvo) → ${gone.join('·')} 해제` : '해주(Solvo) → 걷어낼 것이 없다.', gone.length ? 'p' : 'sys')
      break
    }
    case 'guard':
      guarding = true
      b.mp = Math.min(b.mpMax, b.mp + 4)
      say(b, `${josa(who, '이', '가')} 방패(Aegis)를 펼쳤다.`, 'p')
      break
    case 'heal': {
      const amount = Math.round(b.pMax * 0.3 * (b.curse > 0 ? 0.5 : 1))
      b.pHp = Math.min(b.pMax, b.pHp + amount)
      say(b, `치유(Sanare) → 체력 +${amount}${b.curse > 0 ? ' (저주)' : ''}`, 'p')
      break
    }
    case 'flee':
      if (rand() < (m.boss ? 0.35 : 0.65)) {
        b.over = 'fled'
        say(b, `${josa(who, '은', '는')} 무사히 달아났다.`, 'sys')
      } else say(b, '달아나지 못했다!', 'warn')
      break
  }
  b.mirror = false // a mirror only lasts for the turn right after it was raised
  if (!b.over) enemyTurn(b, st, guarding)
  return b
}

export function battlePotion(p: Pet, prev: Battle, st: Stats, itemId: string, who: string): Fail | { pet: Pet; battle: Battle } {
  const fx = ITEMS[itemId]?.battle
  if (prev.over || !fx) return '지금은 쓸 수 없어요.'
  if ((p.rpg.inv[itemId] ?? 0) < 1) return '가방에 없어요.'
  const b: Battle = { ...prev, log: [...prev.log] }
  if (fx.heal) b.pHp = Math.min(b.pMax, b.pHp + Math.round(b.pMax * fx.heal * (b.curse > 0 ? 0.5 : 1)))
  if (fx.mana) b.mp = Math.min(b.mpMax, b.mp + Math.round(b.mpMax * fx.mana))
  if (fx.might) b.might = fx.might
  if (fx.cleanse) { b.poison = 0; b.curse = 0; b.silence = 0 }
  say(b, `${josa(who, '이', '가')} ${josa(itemName(itemId), '을', '를')} 마셨다.`, 'p')
  b.mirror = false
  enemyTurn(b, st, false)
  return { pet: { ...p, rpg: { ...p.rpg, inv: addBag(p.rpg.inv, itemId, -1) } }, battle: b }
}

export interface BattleReward { xp: number; gold: number; loot: Bag; leveled: number; unlocked: number | null; firstKill: boolean; boon: boolean }

export function endBattle(p: Pet, b: Battle): { pet: Pet; reward: BattleReward } {
  const m = monsterOf(b)
  const reward: BattleReward = { xp: 0, gold: 0, loot: {}, leveled: 0, unlocked: null, firstKill: false, boon: false }
  if (b.revived) p = { ...p, rpg: { ...p.rpg, inv: addBag(p.rpg.inv, 'feather', -1) } }
  if (b.over !== 'win') {
    return { pet: b.over === 'lose' ? { ...p, mood: clamp100(p.mood - 8) } : p, reward }
  }
  const st = statsOf(p)
  reward.boon = p.rpg.boon > 0
  const twice = reward.boon ? 2 : 1
  reward.xp = Math.round(m.xp * (1 + st.xp / 100)) * twice
  reward.gold = Math.round(m.xp * (m.boss ? 1.5 : 1) * (0.8 + rand() * 0.4) * (1 + st.gold / 100)) * twice
  for (const dr of m.drops) {
    if (rand() < Math.min(1, dr.p * (1 + st.drop / 100))) lootAdd(reward.loot, dr.id, randInt(dr.n[0], dr.n[1]))
  }
  const g = gainXp(p.rpg, reward.xp)
  reward.leveled = g.leveled
  reward.firstKill = !(p.rpg.dex.m[m.id] > 0)
  let rpg: Rpg = {
    ...g.rpg,
    inv: mergeBag(g.rpg.inv, reward.loot),
    kills: g.rpg.kills + 1,
    boon: Math.max(0, g.rpg.boon - 1),
    dex: { ...g.rpg.dex, m: { ...g.rpg.dex.m, [m.id]: (g.rpg.dex.m[m.id] ?? 0) + 1 } },
  }
  if (m.boss && b.zone === rpg.stage && b.zone < ZONES.length - 1) {
    rpg = { ...rpg, stage: b.zone + 1 }
    reward.unlocked = b.zone + 1
  }
  return { pet: { ...p, rpg, gold: p.gold + reward.gold, mood: clamp100(p.mood + 1) }, reward }
}

// ───────────────────────── crafting: gear ─────────────────────────

export interface RecipeDef {
  name: string
  slot: Slot
  tier: number
  main: [number, number]
  mats: Bag
  fee: number
}

// One tier per zone; a recipe needs its zone opened.
const MAIN_RANGE: Record<Slot, [number, number][]> = {
  wand: [[5, 8], [8, 12], [12, 17], [20, 28], [32, 44], [50, 68], [78, 104], [110, 140], [150, 190]],
  robe: [[20, 32], [32, 48], [50, 70], [85, 115], [140, 190], [230, 310], [350, 460], [500, 640], [680, 860]],
  hat: [[6, 10], [9, 14], [13, 19], [20, 28], [30, 42], [45, 60], [66, 86], [90, 115], [120, 150]],
  amulet: [[2, 4], [3, 6], [6, 9], [10, 15], [17, 24], [28, 38], [42, 56], [60, 78], [82, 104]],
}
const FEES = [20, 35, 60, 110, 200, 340, 520, 760, 1050]
const rec = (name: string, slot: Slot, tier: number, mats: Bag): RecipeDef =>
  ({ name, slot, tier, mats, main: MAIN_RANGE[slot][tier - 1], fee: FEES[tier - 1] })

export const RECIPES: Record<string, RecipeDef> = {
  wand1: rec('버드나무 지팡이', 'wand', 1, { cobweb: 3, whisker: 3 }),
  robe1: rec('견습생 로브', 'robe', 1, { cobweb: 4, whisker: 2 }),
  hat1: rec('뾰족모자', 'hat', 1, { whisker: 4, cobweb: 2 }),
  amulet1: rec('쥐수염 부적', 'amulet', 1, { whisker: 3, cobweb: 3 }),

  wandp: rec('목동의 지팡이', 'wand', 2, { hide: 3, wool: 2, troll_tooth: 1 }),
  robep: rec('양털 망토', 'robe', 2, { wool: 5, hide: 2 }),
  hatp: rec('밀짚모자', 'hat', 2, { wool: 3, hide: 2 }),
  amuletp: rec('황소뿔 부적', 'amulet', 2, { hide: 3, horn: 1 }),

  wand2: rec('산사나무 지팡이', 'wand', 3, { vine: 4, pixie_dust: 3, horn: 1 }),
  robe2: rec('온실 작업복', 'robe', 3, { vine: 5, pixie_dust: 2 }),
  hat2: rec('약초꾼 모자', 'hat', 3, { pixie_dust: 4, vine: 2 }),
  amulet2: rec('네잎 브로치', 'amulet', 3, { vine: 3, pixie_dust: 3, pearl: 1 }),

  wand3: rec('주목 지팡이', 'wand', 4, { parchment: 3, ink: 4, mandrake_root: 1 }),
  robe3: rec('사서의 로브', 'robe', 4, { parchment: 5, ink: 2 }),
  hat3: rec('깃펜 모자', 'hat', 4, { ink: 4, parchment: 3 }),
  amulet3: rec('봉인된 책갈피', 'amulet', 4, { parchment: 4, ink: 3, pearl: 1 }),

  wand4: rec('흑단 지팡이', 'wand', 5, { silk: 4, ember: 4, ghost_breath: 1 }),
  robe4: rec('숲지기 망토', 'robe', 5, { silk: 6, ember: 2 }),
  hat4: rec('도깨비불 고깔', 'hat', 5, { ember: 5, silk: 2, stardust: 1 }),
  amulet4: rec('달맞이 로켓', 'amulet', 5, { silk: 3, ember: 3, moonflower: 1 }),

  wand5: rec('물푸레 지팡이', 'wand', 6, { waterweed: 4, kelpie_mane: 4, wolf_fang: 1 }),
  robe5: rec('검은 호수 로브', 'robe', 6, { waterweed: 6, kelpie_mane: 3 }),
  hat5: rec('진주 관', 'hat', 6, { kelpie_mane: 3, waterweed: 3, pearl: 2 }),
  amulet5: rec('켈피 고삐', 'amulet', 6, { kelpie_mane: 5, waterweed: 3, stardust: 1 }),

  wand6: rec('별참나무 지팡이', 'wand', 7, { star_shard: 5, gargoyle_stone: 4, serpent_scale: 1 }),
  robe6: rec('용비늘 로브', 'robe', 7, { star_shard: 4, gargoyle_stone: 4, dragon_scale: 2 }),
  hat6: rec('별자리 모자', 'hat', 7, { star_shard: 6, stardust: 3, dragon_scale: 1 }),
  amulet6: rec('가고일 인장', 'amulet', 7, { gargoyle_stone: 6, star_shard: 3, stardust: 2 }),

  wand7: rec('수은 지팡이', 'wand', 8, { quicksilver: 5, mirror_shard: 4, dragon_scale: 1 }),
  robe7: rec('거울비늘 로브', 'robe', 8, { mirror_shard: 6, quicksilver: 3 }),
  hat7: rec('은빛 베일', 'hat', 8, { quicksilver: 5, mirror_shard: 3, stardust: 2 }),
  amulet7: rec('여왕의 브로치', 'amulet', 8, { mirror_shard: 4, quicksilver: 3, queen_tear: 1 }),

  wand8: rec('연출가의 지휘봉', 'wand', 9, { puppet_string: 5, mask_shard: 4, queen_tear: 1 }),
  robe8: rec('막 내린 커튼 로브', 'robe', 9, { puppet_string: 6, mask_shard: 3 }),
  hat8: rec('가면무도회 모자', 'hat', 9, { mask_shard: 5, puppet_string: 3, stardust: 2 }),
  amulet8: rec('마지막 대본', 'amulet', 9, { mask_shard: 4, puppet_string: 3, final_script: 1 }),
}

export const MAX_GEAR = 40
export const gearName = (g: Gear) => `${RECIPES[g.base]?.name ?? '알 수 없는 장비'}${g.plus > 0 ? ` +${g.plus}` : ''}`
export const gearSlot = (g: Gear): Slot | null => RECIPES[g.base]?.slot ?? null

function rollRarity(): number {
  const total = RARITY.reduce((a, r) => a + r.weight, 0)
  let roll = rand() * total
  for (let i = 0; i < RARITY.length; i++) {
    roll -= RARITY[i].weight
    if (roll < 0) return i
  }
  return 0
}

function rollSubs(tier: number, rarity: number): GearSub[] {
  const pool = [...SUB_POOL]
  const subs: GearSub[] = []
  for (let i = 0; i < RARITY[rarity].subs && pool.length; i++) {
    const def = pool.splice(Math.floor(rand() * pool.length), 1)[0]
    const base = def.min + rand() * (def.max - def.min)
    const v = base * (1 + def.perTier * (tier - 1)) * (rarity === 4 ? 1.3 : 1)
    subs.push({ k: def.k, v: Math.max(1, Math.round(v)) })
  }
  return subs
}

export function doCraft(p: Pet, recipeId: string, catalyst = false): Fail | { pet: Pet; gear: Gear } {
  const r = RECIPES[recipeId]
  if (!r || r.tier - 1 > p.rpg.stage) return '아직 만들 수 없는 장비예요.'
  if (p.rpg.gear.length >= MAX_GEAR) return '장비 칸이 가득 찼어요. 팔거나 분해해서 자리를 만들어주세요.'
  if (!hasMats(p.rpg.inv, r.mats)) return '재료가 모자라요.'
  if (p.gold < r.fee) return NO_GOLD

  const boosted = catalyst && (p.rpg.inv.catalyst ?? 0) > 0
  let rarity = rollRarity()
  // A catalyst rerolls among the top three grades at their usual proportions (14 : 5 : 1).
  if (boosted) { const x = rand() * 20; rarity = x < 14 ? 2 : x < 19 ? 3 : 4 }
  const gear: Gear = {
    id: newId(), base: recipeId, rarity, plus: 0,
    main: Math.round(randInt(r.main[0], r.main[1]) * RARITY[rarity].mult),
    subs: rollSubs(r.tier, rarity),
  }
  const dex = { ...p.rpg.dex, g: { ...p.rpg.dex.g, [recipeId]: Math.max(p.rpg.dex.g[recipeId] ?? 0, rarity + 1) } }
  return {
    pet: { ...p, gold: p.gold - r.fee, rpg: { ...p.rpg, dex, inv: takeMats(boosted ? addBag(p.rpg.inv, 'catalyst', -1) : p.rpg.inv, r.mats), gear: [...p.rpg.gear, gear] } },
    gear,
  }
}

// ───────────────────────── crafting: cooking & potions ─────────────────────────

export interface DishDef { out: string; n: number; mats: Bag; fee: number }

export const DISHES: Record<string, DishDef> = {
  stew: { out: 'stew', n: 1, mats: { turnip: 2, minnow: 1 }, fee: 3 },
  tart: { out: 'tart', n: 1, mats: { berry: 3 }, fee: 3 },
  pie: { out: 'pie', n: 1, mats: { pumpkin: 2, berry: 1 }, fee: 5 },
  fishpie: { out: 'fishpie', n: 1, mats: { carp: 2, turnip: 1 }, fee: 6 },
  tomato_pasta: { out: 'tomato_pasta', n: 1, mats: { tomato: 3, flour: 1 }, fee: 4 },
  skewer: { out: 'skewer', n: 1, mats: { pork: 2, tomato: 1 }, fee: 3 },
  cookie: { out: 'cookie', n: 3, mats: { flour: 1, butter: 1, sugar: 1, chocolate: 1 }, fee: 3 },
  kahlua_milk: { out: 'kahlua_milk', n: 1, mats: { coffee: 2, sugar: 1, milk: 1 }, fee: 5 },
  roast_chicken: { out: 'roast_chicken', n: 1, mats: { chicken: 2, potato: 1, butter: 1 }, fee: 6 },
  shepherd_pie: { out: 'shepherd_pie', n: 1, mats: { mutton: 2, potato: 2, butter: 1 }, fee: 8 },
  strawberry_cake: { out: 'strawberry_cake', n: 1, mats: { berry: 3, flour: 1, egg: 2, milk: 1, sugar: 1 }, fee: 8 },
  wellington: { out: 'wellington', n: 1, mats: { beef: 2, mushroom: 2, flour: 1, butter: 1, egg: 1 }, fee: 15 },
  feast: { out: 'feast', n: 1, mats: { mooncarp: 1, pumpkin: 1, moonflower: 1 }, fee: 15 },
}

// Staples sold for gold.
export const GROCERY: Record<string, number> = { flour: 4, sugar: 3, butter: 6, milk: 5, egg: 4, chocolate: 10, coffee: 8 }

export function doGrocery(p: Pet, id: string, n = 1): Fail | { pet: Pet } {
  const price = GROCERY[id]
  if (!price) return '팔지 않는 물건이에요.'
  if (p.gold < price * n) return NO_GOLD
  return { pet: { ...p, gold: p.gold - price * n, rpg: { ...p.rpg, inv: addBag(p.rpg.inv, id, n) } } }
}

export function doCook(p: Pet, id: string): Fail | { pet: Pet; made: string } {
  const dish = DISHES[id]
  if (!dish) return '만들 수 없는 요리예요.'
  if (!hasMats(p.rpg.inv, dish.mats)) return '재료가 모자라요.'
  if (p.gold < dish.fee) return NO_GOLD
  return {
    pet: { ...p, gold: p.gold - dish.fee, rpg: { ...p.rpg, inv: addBag(takeMats(p.rpg.inv, dish.mats), dish.out, dish.n) } },
    made: dish.out,
  }
}

export interface BrewDef { out: string; n: number; mats: Bag; fee: number; ms: number; lv: number }

export const BREWS: Record<string, BrewDef> = {
  heal_potion: { out: 'heal_potion', n: 2, mats: { wormwood: 2, cobweb: 2 }, fee: 8, ms: 10 * MIN, lv: 1 },
  antidote: { out: 'antidote', n: 2, mats: { wormwood: 2, berry: 1 }, fee: 6, ms: 10 * MIN, lv: 2 },
  mana_potion: { out: 'mana_potion', n: 2, mats: { berry: 2, pixie_dust: 2 }, fee: 10, ms: 15 * MIN, lv: 3 },
  calm_draught: { out: 'calm_draught', n: 1, mats: { moonflower: 1, wormwood: 2 }, fee: 15, ms: 30 * MIN, lv: 4 },
  might_potion: { out: 'might_potion', n: 1, mats: { pumpkin: 1, ink: 2, wormwood: 1 }, fee: 20, ms: 30 * MIN, lv: 6 },
}

export function doBrew(p: Pet, id: string, now: number): Fail | { pet: Pet } {
  const brew = BREWS[id]
  if (!brew) return '끓일 수 없는 물약이에요.'
  if (p.rpg.brew) return '가마솥이 이미 끓고 있어요.'
  if (p.rpg.lv < brew.lv) return `Lv.${brew.lv}부터 끓일 수 있어요.`
  if (!hasMats(p.rpg.inv, brew.mats)) return '재료가 모자라요.'
  if (p.gold < brew.fee) return NO_GOLD
  const ms = Math.round(brew.ms * (1 - statsOf(p).haste / 100))
  return {
    pet: {
      ...p, gold: p.gold - brew.fee,
      rpg: { ...p.rpg, inv: takeMats(p.rpg.inv, brew.mats), brew: { id, startedAt: now, readyAt: now + ms } },
    },
  }
}

export function doBottle(p: Pet, now: number): Fail | { pet: Pet; loot: Bag } {
  const cur = p.rpg.brew
  const brew = cur && BREWS[cur.id]
  if (!cur) return '가마솥이 비어 있어요.'
  if (now < cur.readyAt) return '아직 덜 끓었어요.'
  const loot: Bag = brew ? { [brew.out]: brew.n } : {}
  return { pet: { ...p, rpg: { ...p.rpg, brew: null, inv: mergeBag(p.rpg.inv, loot) } }, loot }
}

// ───────────────────────── enhancing ─────────────────────────

export const MAX_PLUS = 12
const RATES = [1, 0.95, 0.9, 0.85, 0.75, 0.65, 0.55, 0.45, 0.38, 0.3, 0.22, 0.15]
export const LUCK_BONUS = 0.15

export interface EnhanceInfo { rate: number; gold: number; stones: number; breakP: number; down: boolean }

export function enhanceInfo(g: Gear): EnhanceInfo | null {
  const r = RECIPES[g.base]
  if (!r || g.plus >= MAX_PLUS) return null
  return {
    rate: RATES[g.plus],
    gold: r.tier * (6 + 3 * g.plus),
    stones: 1 + Math.floor(g.plus / 4),
    breakP: g.plus >= 7 ? 0.2 + 0.04 * (g.plus - 7) : 0, // chance to shatter, given a failure
    down: g.plus >= 5 && g.plus < 7, // +7 and above never slips back: it either holds or shatters
  }
}

export type EnhanceResult = 'up' | 'stay' | 'down' | 'break' | 'saved'

export function doEnhance(p: Pet, gearId: string, opts: { charm: boolean; luck: boolean }):
  Fail | { pet: Pet; result: EnhanceResult; gear: Gear; refund: number } {
  const g = p.rpg.gear.find(x => x.id === gearId)
  const info = g && enhanceInfo(g)
  if (!g || !info) return '더 강화할 수 없어요.'
  if ((p.rpg.inv.stone ?? 0) < info.stones) return `룬석이 모자라요. (필요 ${info.stones})`
  if (p.gold < info.gold) return NO_GOLD

  let inv = addBag(p.rpg.inv, 'stone', -info.stones)
  let rate = info.rate
  if (opts.luck && (inv.luck ?? 0) > 0) {
    inv = addBag(inv, 'luck', -1)
    rate = Math.min(1, rate + LUCK_BONUS)
  }
  let gear = p.rpg.gear
  let equip = p.rpg.equip
  let result: EnhanceResult
  let after = g
  let refund = 0

  if (rand() < rate) {
    result = 'up'
    after = { ...g, plus: g.plus + 1 }
  } else if (info.breakP > 0 && rand() < info.breakP) {
    if (opts.charm && (inv.charm ?? 0) > 0) {
      result = 'saved'
      inv = addBag(inv, 'charm', -1)
    } else {
      result = 'break'
      refund = Math.floor(g.plus / 2)
      inv = addBag(inv, 'stone', refund)
    }
  } else if (info.down) {
    result = 'down'
    after = { ...g, plus: g.plus - 1 }
  } else {
    result = 'stay'
  }

  if (result === 'break') {
    gear = gear.filter(x => x.id !== g.id)
    equip = { ...equip }
    for (const s of SLOTS) if (equip[s] === g.id) delete equip[s]
  } else {
    gear = gear.map(x => (x.id === g.id ? after : x))
  }
  return { pet: { ...p, gold: p.gold - info.gold, rpg: { ...p.rpg, inv, gear, equip } }, result, gear: after, refund }
}

export function doReroll(p: Pet, gearId: string): Fail | { pet: Pet; gear: Gear } {
  const g = p.rpg.gear.find(x => x.id === gearId)
  const r = g && RECIPES[g.base]
  if (!g || !r) return '다시 쓸 수 없는 장비예요.'
  if ((p.rpg.inv.quill ?? 0) < 1) return '재련의 깃펜이 없어요. 별빛 상점에서 살 수 있어요.'
  const after = { ...g, subs: rollSubs(r.tier, g.rarity) }
  return {
    pet: { ...p, rpg: { ...p.rpg, inv: addBag(p.rpg.inv, 'quill', -1), gear: p.rpg.gear.map(x => (x.id === g.id ? after : x)) } },
    gear: after,
  }
}

export function doEquip(p: Pet, gearId: string): Fail | { pet: Pet } {
  const g = p.rpg.gear.find(x => x.id === gearId)
  const slot = g && gearSlot(g)
  if (!g || !slot) return '장착할 수 없어요.'
  const equip = { ...p.rpg.equip }
  if (equip[slot] === g.id) delete equip[slot]
  else equip[slot] = g.id
  return { pet: { ...p, rpg: { ...p.rpg, equip } } }
}

export const dismantleYield = (g: Gear) => 1 + g.rarity + Math.floor(g.plus / 3)
export const gearPrice = (g: Gear) => Math.round((RECIPES[g.base]?.fee ?? 0) * 0.6 * (1 + g.rarity * 0.5) * (1 + g.plus * 0.15))

function removeGear(p: Pet, gearId: string): { rpg: Rpg; gear: Gear } | null {
  const g = p.rpg.gear.find(x => x.id === gearId)
  if (!g) return null
  const equip = { ...p.rpg.equip }
  for (const s of SLOTS) if (equip[s] === g.id) delete equip[s]
  return { rpg: { ...p.rpg, equip, gear: p.rpg.gear.filter(x => x.id !== g.id) }, gear: g }
}

export function doDismantle(p: Pet, gearId: string): Fail | { pet: Pet } {
  const r = removeGear(p, gearId)
  if (!r) return '이미 없는 장비예요.'
  return { pet: { ...p, rpg: { ...r.rpg, inv: addBag(r.rpg.inv, 'stone', dismantleYield(r.gear)) } } }
}

export function doSellGear(p: Pet, gearId: string): Fail | { pet: Pet } {
  const r = removeGear(p, gearId)
  if (!r) return '이미 없는 장비예요.'
  return { pet: { ...p, gold: p.gold + gearPrice(r.gear), rpg: r.rpg } }
}

// ───────────────────────── items in the bag ─────────────────────────

export function doEat(p: Pet, id: string): Fail | { pet: Pet } {
  const food = ITEMS[id]?.food
  if (!food || (p.rpg.inv[id] ?? 0) < 1) return '먹을 수 있는 게 아니에요.'
  if (p.asleep) return ASLEEP
  if (food.full && !food.mood && !food.energy && p.full >= 98) return '배가 불러서 더는 못 먹어요.'
  if (!food.full && !food.mood && food.energy && p.energy >= 98) return '기력이 이미 가득해요.'
  return {
    pet: {
      ...p,
      full: clamp100(p.full + (food.full ?? 0)),
      mood: clamp100(p.mood + (food.mood ?? 0)),
      energy: clamp100(p.energy + (food.energy ?? 0)),
      rpg: {
        ...p.rpg,
        inv: addBag(p.rpg.inv, id, -1),
        meal: ITEMS[id].meal ? { id, left: ITEMS[id].meal!.fights } : p.rpg.meal,
      },
    },
  }
}

export function doSell(p: Pet, id: string, all: boolean): Fail | { pet: Pet; gold: number } {
  const have = p.rpg.inv[id] ?? 0
  const price = ITEMS[id]?.sell ?? 0
  if (have < 1) return '이미 없어요.'
  if (price < 1) return '팔 수 없는 물건이에요.'
  const n = all ? have : 1
  return { pet: { ...p, gold: p.gold + price * n, rpg: { ...p.rpg, inv: addBag(p.rpg.inv, id, -n) } }, gold: price * n }
}

// ───────────────────────── starlight shop ─────────────────────────

export interface GoodDef { name: string; desc: string; price: number; item?: string; gold?: number; boon?: number }

export const GOODS: Record<string, GoodDef> = {
  pouch: { name: '금화 주머니', desc: '금화 80닢.', price: 10, gold: 80 },
  tonic: { name: '기력 물약', desc: ITEMS.tonic.desc, price: 15, item: 'tonic' },
  hourglass: { name: '모래시계', desc: ITEMS.hourglass.desc, price: 20, item: 'hourglass' },
  boon: { name: '별의 가호', desc: '다음 결투 5번의 경험치와 금화가 두 배가 된다.', price: 25, boon: 5 },
  feather: { name: '불사조 깃털', desc: ITEMS.feather.desc, price: 25, item: 'feather' },
  luck: { name: '행운의 가루', desc: ITEMS.luck.desc, price: 20, item: 'luck' },
  quill: { name: '재련의 깃펜', desc: ITEMS.quill.desc, price: 30, item: 'quill' },
  catalyst: { name: '별의 촉매', desc: ITEMS.catalyst.desc, price: 35, item: 'catalyst' },
  charm: { name: '수호 부적', desc: ITEMS.charm.desc, price: 40, item: 'charm' },
}

export function doBuy(p: Pet, id: string): Fail | { pet: Pet } {
  const g = GOODS[id]
  if (!g) return '팔지 않는 물건이에요.'
  if (p.coins < g.price) return NO_STAR
  let rpg = p.rpg
  if (g.item) rpg = { ...rpg, inv: addBag(rpg.inv, g.item, 1) }
  if (g.boon) rpg = { ...rpg, boon: rpg.boon + g.boon }
  return { pet: { ...p, coins: p.coins - g.price, gold: p.gold + (g.gold ?? 0), rpg } }
}

// Constellations: permanent upgrades that only starlight can buy. Each level costs base × (level + 1).
export interface PerkDef { name: string; desc: string; max: number; base: number; stat?: StatKey; per: number }

export const PERKS: Record<string, PerkDef> = {
  shine: { name: '성실의 별', desc: '할 일로 받는 별빛 +5%', max: 5, base: 40, stat: 'coin', per: 5 },
  wealth: { name: '금화의 별', desc: '금화 획득 +10%', max: 5, base: 30, stat: 'gold', per: 10 },
  wisdom: { name: '지혜의 별', desc: '경험치 +10%', max: 5, base: 30, stat: 'xp', per: 10 },
  fortune: { name: '행운의 별', desc: '드롭률 +6%', max: 5, base: 30, stat: 'drop', per: 6 },
  swift: { name: '바람의 별', desc: '생활 속도 +5%', max: 4, base: 35, stat: 'haste', per: 5 },
  garden: { name: '텃밭의 별', desc: '텃밭 +1칸', max: 2, base: 60, per: 1 },
  vigor: { name: '활력의 별', desc: '결투에 드는 기력 −1', max: 2, base: 50, per: 1 },
}

export const perkLv = (r: Rpg, id: string) => Math.min(PERKS[id]?.max ?? 0, r.perks[id] ?? 0)
export const perkCost = (id: string, lv: number) => (PERKS[id]?.base ?? 0) * (lv + 1)

export function doBuyPerk(p: Pet, id: string): Fail | { pet: Pet; lv: number } {
  const perk = PERKS[id]
  if (!perk) return '없는 별자리예요.'
  const lv = perkLv(p.rpg, id)
  if (lv >= perk.max) return '이미 끝까지 밝혔어요.'
  const cost = perkCost(id, lv)
  if (p.coins < cost) return NO_STAR
  return { pet: { ...p, coins: p.coins - cost, rpg: { ...p.rpg, perks: { ...p.rpg.perks, [id]: lv + 1 } } }, lv: lv + 1 }
}

// ───────────────────────── herbology ─────────────────────────

export interface SeedDef { crop: string; cost: number; ms: number; yield: [number, number]; lv: number }

export const SEEDS: Record<string, SeedDef> = {
  turnip: { crop: 'turnip', cost: 4, ms: 20 * MIN, yield: [2, 3], lv: 1 },
  wormwood: { crop: 'wormwood', cost: 5, ms: 40 * MIN, yield: [2, 3], lv: 1 },
  tomato: { crop: 'tomato', cost: 6, ms: 40 * MIN, yield: [2, 4], lv: 1 },
  berry: { crop: 'berry', cost: 8, ms: HOUR, yield: [2, 4], lv: 1 },
  potato: { crop: 'potato', cost: 6, ms: 90 * MIN, yield: [2, 4], lv: 2 },
  pumpkin: { crop: 'pumpkin', cost: 8, ms: 2 * HOUR, yield: [2, 4], lv: 2 },
  moonflower: { crop: 'moonflower', cost: 20, ms: 6 * HOUR, yield: [1, 2], lv: 4 },
  starfruit: { crop: 'starfruit', cost: 45, ms: 12 * HOUR, yield: [1, 2], lv: 8 },
}

export const plotCount = (r: Rpg) => 3 + (r.lv >= 5 ? 1 : 0) + (r.lv >= 10 ? 1 : 0) + (r.lv >= 15 ? 1 : 0) + perkLv(r, 'garden')
const hasten = (ms: number, st: Stats) => Math.round(ms * (1 - st.haste / 100))
const bonus = (st: Stats) => (rand() * 100 < st.yield ? 1 : 0)

function plotsOf(r: Rpg) {
  const n = plotCount(r)
  return Array.from({ length: n }, (_, i) => r.plots[i] ?? null)
}

export function doPlant(p: Pet, index: number, seedId: string, now: number): Fail | { pet: Pet } {
  const seed = SEEDS[seedId]
  const plots = plotsOf(p.rpg)
  if (!seed || index < 0 || index >= plots.length) return '심을 수 없어요.'
  if (plots[index]) return '이미 무언가 자라고 있어요.'
  if (p.rpg.lv < seed.lv) return `Lv.${seed.lv}부터 심을 수 있어요.`
  if (p.gold < seed.cost) return NO_GOLD
  plots[index] = { seed: seedId, plantedAt: now, readyAt: now + hasten(seed.ms, statsOf(p)) }
  return { pet: { ...p, gold: p.gold - seed.cost, rpg: { ...p.rpg, plots } } }
}

export function doHarvest(p: Pet, now: number): Fail | { pet: Pet; loot: Bag } {
  const st = statsOf(p)
  const loot: Bag = {}
  const plots = plotsOf(p.rpg).map(pl => {
    const seed = pl && SEEDS[pl.seed]
    if (!pl || now < pl.readyAt) return pl
    if (seed) lootAdd(loot, seed.crop, randInt(seed.yield[0], seed.yield[1]) + bonus(st))
    return null
  })
  if (!Object.keys(loot).length) return '아직 다 자란 게 없어요.'
  return { pet: { ...p, rpg: { ...p.rpg, plots, inv: mergeBag(p.rpg.inv, loot) } }, loot }
}

// ───────────────────────── fishing & gathering trips ─────────────────────────

export interface SpotDef { name: string; desc: string; cost: number; ms: number; catches: [number, number]; lv: number; table: [string, number][] }

export const SPOTS: Record<string, SpotDef> = {
  fountain: {
    name: '안뜰 분수', desc: '동전이 가라앉아 있다.', cost: 3, ms: 15 * MIN, catches: [1, 2], lv: 1,
    table: [['minnow', 55], ['carp', 25], ['boot', 15], ['pearl', 3], ['stardust', 2]],
  },
  canal: {
    name: '숲 개울', desc: '숲 가장자리를 따라 흐른다.', cost: 6, ms: 45 * MIN, catches: [2, 3], lv: 3,
    table: [['minnow', 30], ['carp', 30], ['sweetfish', 22], ['boot', 8], ['pearl', 7], ['stardust', 3]],
  },
  lake: {
    name: '달빛 호수', desc: '밤에만 길이 열린다.', cost: 12, ms: 3 * HOUR, catches: [3, 4], lv: 8,
    table: [['carp', 25], ['sweetfish', 30], ['mooncarp', 22], ['pearl', 14], ['stardust', 9]],
  },
}

export const TRIPS = [
  { id: 'short', name: '잠깐', ms: 30 * MIN, cost: 5, rolls: 3 },
  { id: 'half', name: '반나절', ms: 2 * HOUR, cost: 12, rolls: 9 },
  { id: 'long', name: '밤샘', ms: 8 * HOUR, cost: 30, rolls: 28 },
]
export const tripCost = (zone: number, base: number) => base * (zone + 1)

function pick(table: [string, number][]): string {
  const total = table.reduce((a, [, w]) => a + w, 0)
  let roll = rand() * total
  for (const [id, w] of table) {
    roll -= w
    if (roll < 0) return id
  }
  return table[0][0]
}

function tripTable(zone: number): [string, number][] {
  const z = ZONES[zone]
  const t: [string, number][] = [['', 26], [z.mats[0], 30], [z.mats[1], 30], ['stone', 10]]
  if (zone >= 2) t.push(['stardust', 3])
  if (z.forage) t.push(...z.forage)
  return t
}

function canLeave(p: Pet): Fail | null {
  if (p.asleep) return ASLEEP
  if (p.rpg.job) return '이미 자리를 비웠어요.'
  return null
}

export function doFish(p: Pet, spotId: string, now: number): Fail | { pet: Pet } {
  const spot = SPOTS[spotId]
  if (!spot) return '갈 수 없는 곳이에요.'
  const no = canLeave(p)
  if (no) return no
  if (p.rpg.lv < spot.lv) return `Lv.${spot.lv}부터 갈 수 있어요.`
  if (p.gold < spot.cost) return NO_GOLD
  const job: Job = {
    kind: 'fish', where: spotId, startedAt: now, endsAt: now + hasten(spot.ms, statsOf(p)),
    rolls: randInt(spot.catches[0], spot.catches[1]),
  }
  return { pet: { ...p, gold: p.gold - spot.cost, rpg: { ...p.rpg, job } } }
}

export function doTrip(p: Pet, zone: number, tripId: string, now: number): Fail | { pet: Pet } {
  const trip = TRIPS.find(t => t.id === tripId)
  if (!trip || !ZONES[zone] || zone > p.rpg.stage) return '갈 수 없는 곳이에요.'
  const no = canLeave(p)
  if (no) return no
  const cost = tripCost(zone, trip.cost)
  if (p.gold < cost) return NO_GOLD
  const job: Job = { kind: 'trip', where: ZONES[zone].id, startedAt: now, endsAt: now + hasten(trip.ms, statsOf(p)), rolls: trip.rolls }
  return { pet: { ...p, gold: p.gold - cost, rpg: { ...p.rpg, job } } }
}

export function jobLabel(job: Job): string {
  if (job.kind === 'fish') return `${SPOTS[job.where]?.name ?? '어딘가'}에서 낚시 중`
  return `${ZONES.find(z => z.id === job.where)?.name ?? '어딘가'} 채집 중`
}

export function doClaim(p: Pet, now: number): Fail | { pet: Pet; loot: Bag; xp: number; leveled: number } {
  const job = p.rpg.job
  if (!job) return '받을 게 없어요.'
  if (now < job.endsAt) return '아직 돌아오지 않았어요.'
  const st = statsOf(p)
  const loot: Bag = {}
  let xp = 0

  if (job.kind === 'fish') {
    const spot = SPOTS[job.where]
    for (let i = 0; spot && i < job.rolls + bonus(st); i++) lootAdd(loot, pick(spot.table), 1)
  } else {
    const zone = ZONES.findIndex(z => z.id === job.where)
    if (zone >= 0) {
      const table = tripTable(zone)
      for (let i = 0; i < job.rolls; i++) {
        const id = pick(table)
        if (id) lootAdd(loot, id, 1 + bonus(st))
      }
      const avg = ZONES[zone].monsters.slice(0, 2).reduce((a, m) => a + m.xp, 0) / 2
      xp = Math.round(avg * 0.4 * job.rolls * (1 + st.xp / 100))
    }
  }

  const g = gainXp({ ...p.rpg, job: null, inv: mergeBag(p.rpg.inv, loot) }, xp)
  return { pet: { ...p, rpg: g.rpg }, loot, xp, leveled: g.leveled }
}

export function doCancelJob(p: Pet): Fail | { pet: Pet } {
  if (!p.rpg.job) return '불러올 사람이 없어요.'
  return { pet: { ...p, rpg: { ...p.rpg, job: null } } }
}

// Hourglass: everything on a timer finishes now.
export function doHourglass(p: Pet, now: number): Fail | { pet: Pet } {
  if ((p.rpg.inv.hourglass ?? 0) < 1) return '모래시계가 없어요. 별빛 상점에서 살 수 있어요.'
  const r = p.rpg
  const waiting =
    (r.job && r.job.endsAt > now) || (r.brew && r.brew.readyAt > now) || r.plots.some(pl => pl && pl.readyAt > now)
  if (!waiting) return '지금은 돌릴 시간이 없어요.'
  return {
    pet: {
      ...p,
      rpg: {
        ...r,
        inv: addBag(r.inv, 'hourglass', -1),
        job: r.job && { ...r.job, endsAt: Math.min(r.job.endsAt, now) },
        brew: r.brew && { ...r.brew, readyAt: Math.min(r.brew.readyAt, now) },
        plots: r.plots.map(pl => pl && { ...pl, readyAt: Math.min(pl.readyAt, now) }),
      },
    },
  }
}

// ───────────────────────── bestiary ─────────────────────────

export function dexProgress(r: Rpg) {
  const items = Object.keys(ITEMS)
  const recipes = Object.keys(RECIPES)
  const m = MONSTERS.filter(x => (r.dex.m[x.id] ?? 0) > 0).length
  const i = items.filter(k => r.dex.i[k]).length
  const g = recipes.filter(k => r.dex.g[k]).length
  const total = MONSTERS.length + items.length + recipes.length
  return { m, i, g, mAll: MONSTERS.length, iAll: items.length, gAll: recipes.length, pct: Math.floor(((m + i + g) / total) * 100) }
}

export function fmtLeft(ms: number): string {
  if (ms <= 0) return '완료'
  const s = Math.ceil(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}시간 ${m}분`
  if (m > 0) return `${m}분 ${String(sec).padStart(2, '0')}초`
  return `${sec}초`
}

export function fmtDur(ms: number): string {
  const m = Math.round(ms / MIN)
  if (m < 60) return `${m}분`
  return m % 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m / 60}시간`
}
