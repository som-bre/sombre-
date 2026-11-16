// Greenroom RPG — static game data and the rules that act on a Pet.
// Everything here is pure except for Math.random(); the page commits the returned Pet.

import { SLOTS, type Pet, type Rpg, type Gear, type GearSub, type Slot, type Job } from './greenroom'

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
  battle?: { heal?: number; mana?: number; might?: number } // usable during a fight
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
  wormwood: mat('약쑥', 3, '쓰다. 물약의 기본 재료.'),
  moonflower: { name: '달맞이꽃', kind: 'food', sell: 18, desc: '밤에만 핀다. 재료로도 쓴다.', food: { mood: 20 } },
  starfruit: { name: '별열매', kind: 'food', sell: 40, desc: '기력이 솟는다.', food: { full: 10, energy: 35 } },
  // cooking
  stew: { name: '순무 스튜', kind: 'food', sell: 10, desc: '연회장의 기본 메뉴.', food: { full: 40 } },
  tart: { name: '딸기 타르트', kind: 'food', sell: 14, desc: '한 조각이면 기분이 풀린다.', food: { full: 20, mood: 25 } },
  pie: { name: '호박 파이', kind: 'food', sell: 16, desc: '갓 구운 냄새.', food: { full: 50, mood: 10 } },
  fishpie: { name: '생선 파이', kind: 'food', sell: 22, desc: '속이 꽉 찼다.', food: { full: 60, energy: 10 } },
  feast: { name: '달빛 만찬', kind: 'food', sell: 80, desc: '연회에서나 나오는 한 상.', food: { full: 80, mood: 30, energy: 25 } },
  // potions
  heal_potion: { name: '치유 물약', kind: 'potion', sell: 8, desc: '전투 중 체력을 45% 회복한다.', battle: { heal: 0.45 } },
  mana_potion: { name: '마력 물약', kind: 'potion', sell: 10, desc: '전투 중 마력을 60% 회복한다.', battle: { mana: 0.6 } },
  might_potion: { name: '힘의 물약', kind: 'potion', sell: 20, desc: '전투 중 다음 세 번의 주문이 1.4배 강해진다.', battle: { might: 3 } },
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
  const gear = r.gear.filter(g => RECIPES[g.base])
  if (gear.length !== r.gear.length) changed = true
  const equip: Rpg['equip'] = {}
  for (const s of SLOTS) {
    const id = r.equip[s]
    if (id && gear.some(g => g.id === id && RECIPES[g.base].slot === s)) equip[s] = id
    else if (id) changed = true
  }
  if (!changed) return p
  return { ...p, rpg: { ...r, inv, gear, equip, dex: { ...r.dex, i: seen } } }
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

export const MAX_LV = 40
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
  drops: Drop[]
}
export interface ZoneDef { id: string; name: string; desc: string; mats: [string, string]; monsters: MonsterDef[] }

const d = (id: string, p: number, min = 1, max = min): Drop => ({ id, p, n: [min, max] })

export const ZONES: ZoneDef[] = [
  {
    id: 'cellar', name: '지하 저장고', desc: '물약 통 사이로 작은 발소리가 지나간다.', mats: ['cobweb', 'whisker'],
    monsters: [
      { id: 'dustling', name: '먼지 도깨비', art: 'dust', lore: '청소 주문을 피해 백 년쯤 굴러다닌 먼지. 재채기를 유발한다.', hp: 26, atk: 6, def: 0, xp: 6, drops: [d('cobweb', 0.8, 1, 2), d('whisker', 0.25), d('stone', 0.08)] },
      { id: 'rat', name: '좀도둑 쥐', art: 'rat', lore: '물약 재료만 골라 훔친다. 가면은 어디서 났는지 아무도 모른다.', hp: 38, atk: 9, def: 1, xp: 9, drops: [d('whisker', 0.7, 1, 2), d('cobweb', 0.4), d('stone', 0.1)] },
      { id: 'troll', name: '지하 트롤', art: 'troll', boss: true, lore: '길을 잃고 저장고에 눌러앉았다. 느리지만 한 방이 무겁다.', hp: 110, atk: 13, def: 3, xp: 40, drops: [d('cobweb', 1, 2, 4), d('whisker', 1, 2, 4), d('troll_tooth', 1, 1, 2), d('stone', 1, 1, 2)] },
    ],
  },
  {
    id: 'greenhouse', name: '온실', desc: '유리 너머로 무언가 화분을 흔든다.', mats: ['pixie_dust', 'vine'],
    monsters: [
      { id: 'pixie', name: '장난꾸러기 픽시', art: 'pixie', lore: '머리카락을 묶어 놓고 달아난다. 떼로 다니면 골치 아프다.', hp: 70, atk: 18, def: 4, xp: 16, drops: [d('pixie_dust', 0.8, 1, 2), d('vine', 0.2), d('stone', 0.1)] },
      { id: 'vine', name: '조르는 덩굴', art: 'vine', lore: '햇빛을 싫어하고 따뜻한 것을 감싸 안는 버릇이 있다.', hp: 90, atk: 22, def: 6, xp: 22, drops: [d('vine', 0.7, 1, 2), d('pixie_dust', 0.35), d('stone', 0.12)] },
      { id: 'mandrake', name: '울부짖는 맨드레이크', art: 'mandrake', boss: true, lore: '다 자란 개체의 비명은 사람을 기절시킨다. 화분에서 스스로 걸어 나왔다.', hp: 240, atk: 28, def: 8, xp: 90, drops: [d('pixie_dust', 1, 3, 5), d('vine', 1, 3, 5), d('mandrake_root', 1, 1, 2), d('stone', 1, 2, 3), d('stardust', 0.35)] },
    ],
  },
  {
    id: 'stacks', name: '금서 서고', desc: '책장이 저절로 넘어가는 소리가 난다.', mats: ['parchment', 'ink'],
    monsters: [
      { id: 'book', name: '이빨 고서', art: 'book', lore: '읽으려는 사람을 문다. 등을 쓰다듬으면 얌전해진다는 소문이 있다.', hp: 150, atk: 34, def: 12, xp: 38, drops: [d('parchment', 0.8, 1, 2), d('ink', 0.2), d('stone', 0.12)] },
      { id: 'inkblot', name: '잉크 얼룩', art: 'ink', lore: '쏟아진 마법 잉크가 스스로 생각하기 시작했다.', hp: 180, atk: 40, def: 10, xp: 48, drops: [d('ink', 0.75, 1, 2), d('parchment', 0.3), d('stone', 0.14)] },
      { id: 'librarian', name: '서고의 유령', art: 'ghost', boss: true, lore: '연체된 책을 삼백 년째 기다리는 사서. 속삭임에도 화를 낸다.', hp: 520, atk: 52, def: 16, xp: 200, drops: [d('parchment', 1, 3, 5), d('ink', 1, 3, 5), d('ghost_breath', 1, 1, 2), d('stone', 1, 2, 4), d('stardust', 0.5, 1, 2)] },
    ],
  },
  {
    id: 'forest', name: '속삭이는 숲', desc: '나무들이 이름을 부른다.', mats: ['ember', 'silk'],
    monsters: [
      { id: 'wisp', name: '도깨비불', art: 'wisp', lore: '길 잃은 이를 늪으로 이끈다. 따라가면 안 된다.', hp: 300, atk: 60, def: 20, xp: 85, drops: [d('ember', 0.8, 1, 2), d('silk', 0.2), d('stone', 0.15), d('stardust', 0.04)] },
      { id: 'spider', name: '숲 거미', art: 'spider', lore: '사람 머리만 한 거미. 말을 알아듣는다는 기록이 있다.', hp: 350, atk: 68, def: 18, xp: 100, drops: [d('silk', 0.75, 1, 2), d('ember', 0.3), d('stone', 0.15), d('stardust', 0.04)] },
      { id: 'wolf', name: '달그림자 늑대', art: 'wolf', boss: true, lore: '보름달이 뜬 밤에만 모습을 드러낸다. 그림자가 먼저 달려든다.', hp: 900, atk: 78, def: 26, xp: 420, drops: [d('ember', 1, 3, 6), d('silk', 1, 3, 6), d('wolf_fang', 1, 1, 2), d('stone', 1, 3, 5), d('stardust', 0.7, 1, 2)] },
    ],
  },
  {
    id: 'lake', name: '검은 호수', desc: '수면 아래에서 누군가 올려다본다.', mats: ['waterweed', 'kelpie_mane'],
    monsters: [
      { id: 'drowner', name: '물귀신', art: 'hand', lore: '발목을 잡아끄는 창백한 손. 손가락이 약하다.', hp: 600, atk: 95, def: 34, xp: 190, drops: [d('waterweed', 0.8, 1, 2), d('kelpie_mane', 0.15), d('stone', 0.18), d('stardust', 0.06)] },
      { id: 'kelpie', name: '켈피', art: 'kelpie', lore: '아름다운 말의 모습으로 등에 태운 뒤 물속으로 끌고 간다.', hp: 700, atk: 105, def: 30, xp: 220, drops: [d('kelpie_mane', 0.75, 1, 2), d('waterweed', 0.3), d('stone', 0.18), d('stardust', 0.06)] },
      { id: 'serpent', name: '늙은 물뱀', art: 'snake', boss: true, lore: '호수가 생기기 전부터 살았다고 한다. 비늘 하나가 방패만 하다.', hp: 1700, atk: 112, def: 40, xp: 1000, drops: [d('waterweed', 1, 4, 7), d('kelpie_mane', 1, 3, 6), d('serpent_scale', 1, 1, 2), d('stone', 1, 4, 6), d('stardust', 1, 1, 2)] },
    ],
  },
  {
    id: 'tower', name: '천문탑', desc: '계단이 끝나지 않는다.', mats: ['gargoyle_stone', 'star_shard'],
    monsters: [
      { id: 'gargoyle', name: '가고일', art: 'gargoyle', lore: '낮에는 석상, 밤에는 문지기. 암호를 틀리면 덤벼든다.', hp: 1150, atk: 150, def: 52, xp: 400, drops: [d('gargoyle_stone', 0.8, 1, 2), d('star_shard', 0.15), d('stone', 0.2), d('stardust', 0.08)] },
      { id: 'starsprite', name: '별똥 정령', art: 'starsprite', lore: '떨어진 별이 탑 꼭대기에 걸려 심술이 났다.', hp: 1300, atk: 165, def: 46, xp: 460, drops: [d('star_shard', 0.75, 1, 2), d('gargoyle_stone', 0.3), d('stone', 0.2), d('stardust', 0.1)] },
      { id: 'dragon', name: '탑의 수호룡', art: 'dragon', boss: true, lore: '탑 꼭대기에서 별을 세며 잠든다. 깨운 대가는 크다.', hp: 3400, atk: 185, def: 62, xp: 2400, drops: [d('gargoyle_stone', 1, 4, 8), d('star_shard', 1, 4, 8), d('dragon_scale', 1, 1, 3), d('stone', 1, 5, 8), d('stardust', 1, 2, 4)] },
    ],
  },
]

export const MONSTERS: MonsterDef[] = ZONES.flatMap(z => z.monsters)
export const battleCost = (m: MonsterDef, r?: Rpg) => (m.boss ? 12 : 6) - (r ? perkLv(r, 'vigor') : 0)
export const monsterPower = (m: MonsterDef) => powerOf(m.hp, m.atk, m.def)

// ───────────────────────── battle (turn by turn) ─────────────────────────

export type Move = 'strike' | 'blast' | 'guard' | 'bind' | 'heal' | 'flee'

export const MOVES: Record<Move, { name: string; latin: string; mp: number; lv: number; desc: string }> = {
  strike: { name: '섬광', latin: 'Fulgor', mp: 0, lv: 1, desc: '기본 공격 주문. 마력을 쓰지 않는다.' },
  blast: { name: '벽력', latin: 'Tonitrus', mp: 8, lv: 2, desc: '1.8배의 피해를 준다.' },
  guard: { name: '방패', latin: 'Aegis', mp: 0, lv: 1, desc: '이번 턴 받는 피해를 70% 줄이고 마력을 6 회복한다.' },
  heal: { name: '치유', latin: 'Sanare', mp: 12, lv: 3, desc: '체력을 35% 회복한다.' },
  bind: { name: '결박', latin: 'Vinculum', mp: 10, lv: 5, desc: '절반의 피해를 주고 상대의 다음 행동을 막는다. 모으던 힘도 흩어진다.' },
  flee: { name: '도주', latin: 'Fuga', mp: 0, lv: 1, desc: '달아난다. 실패하면 한 대 맞는다.' },
}
export const MOVE_ORDER: Move[] = ['strike', 'blast', 'guard', 'heal', 'bind', 'flee']

export type LogTone = 'p' | 'crit' | 'm' | 'warn' | 'sys'
export interface Battle {
  zone: number
  index: number
  pHp: number
  pMax: number
  mp: number
  mpMax: number
  mHp: number
  charging: boolean // the creature is gathering strength for a heavy blow
  stunned: boolean
  might: number // remaining empowered casts
  feather: boolean // a phoenix feather is in the bag
  revived: boolean
  turn: number
  log: { t: string; tone: LogTone }[]
  over: null | 'win' | 'lose' | 'fled'
}

const monsterOf = (b: Battle) => ZONES[b.zone].monsters[b.index]
const say = (b: Battle, t: string, tone: LogTone) => { b.log = [...b.log, { t, tone }] }

export function startBattle(p: Pet, zone: number, index: number): Fail | { pet: Pet; battle: Battle } {
  const m = ZONES[zone]?.monsters[index]
  if (!m || zone > p.rpg.stage) return '아직 갈 수 없는 곳이에요.'
  if (p.asleep) return ASLEEP
  if (p.rpg.job) return '지금은 자리를 비웠어요. 돌아온 뒤에 싸울 수 있어요.'
  const cost = battleCost(m, p.rpg)
  if (p.energy < cost) return `기력이 모자라요. (필요 ${cost}) 재우거나 기력 물약을 먹여주세요.`
  const st = statsOf(p)
  const battle: Battle = {
    zone, index, pHp: st.hp, pMax: st.hp, mp: st.mp, mpMax: st.mp, mHp: m.hp,
    charging: false, stunned: false, might: 0, turn: 1,
    feather: (p.rpg.inv.feather ?? 0) > 0, revived: false,
    log: [{ t: `${josa(m.name, '이', '가')} 나타났다.${m.boss ? ' 이 구역의 주인이다.' : ''}`, tone: 'sys' }],
    over: null,
  }
  return { pet: { ...p, energy: clamp100(p.energy - cost), clean: clamp100(p.clean - 2) }, battle }
}

function castDamage(b: Battle, st: Stats, mult: number): { dmg: number; crit: boolean } {
  const m = monsterOf(b)
  const crit = rand() * 100 < st.crit
  let dmg = st.atk * st.cond * (0.85 + rand() * 0.3) * mult * (b.might > 0 ? 1.4 : 1) - m.def * 0.5
  if (crit) dmg *= 1 + st.critd / 100
  if (b.might > 0) b.might--
  return { dmg: Math.max(1, Math.round(dmg)), crit }
}

function enemyTurn(b: Battle, st: Stats, guarding: boolean) {
  const m = monsterOf(b)
  if (b.stunned) {
    b.stunned = false
    say(b, `${josa(m.name, '은', '는')} 묶여서 움직이지 못한다.`, 'sys')
    return
  }
  let mult = 1
  if (b.charging) {
    b.charging = false
    mult = 2.2
  } else if (rand() < (m.boss ? 0.3 : 0.18)) {
    b.charging = true
    say(b, `${josa(m.name, '이', '가')} 힘을 모은다…!`, 'warn')
    return
  }
  let dmg = m.atk * (0.85 + rand() * 0.3) * mult - st.def * 0.5
  if (guarding) dmg *= 0.3
  dmg = Math.max(1, Math.round(dmg))
  b.pHp = Math.max(0, b.pHp - dmg)
  say(b, `${m.name}의 ${mult > 1 ? '강타' : '공격'}${guarding ? ' — 방패가 막아냈다' : ''} → ${dmg}`, mult > 1 && !guarding ? 'warn' : 'm')
  if (b.pHp <= 0) {
    if (b.feather && !b.revived) {
      b.revived = true
      b.pHp = Math.round(b.pMax * 0.5)
      say(b, '불사조 깃털이 타오르며 다시 일으켜 세웠다!', 'crit')
    } else {
      b.over = 'lose'
    }
  }
}

function endOfTurn(b: Battle, st: Stats, guarding: boolean): Battle {
  if (!b.over) enemyTurn(b, st, guarding)
  if (!b.over) {
    b.mp = Math.min(b.mpMax, b.mp + 2)
    b.turn++
  }
  return b
}

export function battleMove(prev: Battle, st: Stats, move: Move, lv: number, who: string): Fail | Battle {
  if (prev.over) return '이미 끝난 싸움이에요.'
  const def = MOVES[move]
  if (lv < def.lv) return `${def.name} 주문은 Lv.${def.lv}부터 쓸 수 있어요.`
  if (prev.mp < def.mp) return '마력이 모자라요. 방패 주문으로 숨을 고르세요.'
  const b: Battle = { ...prev, mp: prev.mp - def.mp }
  const m = monsterOf(b)
  let guarding = false

  const hit = (mult: number) => {
    const { dmg, crit } = castDamage(b, st, mult)
    b.mHp = Math.max(0, b.mHp - dmg)
    say(b, `${who}의 ${def.name}(${def.latin})${crit ? ' — 치명타!' : ''} → ${dmg}`, crit ? 'crit' : 'p')
    if (b.mHp <= 0) b.over = 'win'
  }

  switch (move) {
    case 'strike': hit(1); break
    case 'blast': hit(1.8); break
    case 'bind':
      hit(0.5)
      if (!b.over) {
        if (!m.boss || rand() < 0.6) {
          b.stunned = true
          if (b.charging) { b.charging = false; say(b, `${josa(m.name, '이', '가')} 모으던 힘이 흩어졌다.`, 'sys') }
        } else {
          say(b, `${josa(m.name, '이', '가')} 결박을 뿌리쳤다.`, 'sys')
        }
      }
      break
    case 'guard':
      guarding = true
      b.mp = Math.min(b.mpMax, b.mp + 6)
      say(b, `${josa(who, '이', '가')} ${def.name}(${def.latin})를 펼쳤다.`, 'p')
      break
    case 'heal': {
      const amount = Math.round(b.pMax * 0.35)
      b.pHp = Math.min(b.pMax, b.pHp + amount)
      say(b, `${who}의 ${def.name}(${def.latin}) → 체력 +${amount}`, 'p')
      break
    }
    case 'flee':
      if (rand() < (m.boss ? 0.35 : 0.65)) {
        b.over = 'fled'
        say(b, `${josa(who, '은', '는')} 무사히 달아났다.`, 'sys')
      } else {
        say(b, '달아나지 못했다!', 'warn')
      }
      break
  }
  return endOfTurn(b, st, guarding)
}

export function battlePotion(p: Pet, prev: Battle, st: Stats, itemId: string, who: string): Fail | { pet: Pet; battle: Battle } {
  const fx = ITEMS[itemId]?.battle
  if (prev.over || !fx) return '지금은 쓸 수 없어요.'
  if ((p.rpg.inv[itemId] ?? 0) < 1) return '가방에 없어요.'
  const b: Battle = { ...prev }
  if (fx.heal) b.pHp = Math.min(b.pMax, b.pHp + Math.round(b.pMax * fx.heal))
  if (fx.mana) b.mp = Math.min(b.mpMax, b.mp + Math.round(b.mpMax * fx.mana))
  if (fx.might) b.might = fx.might
  say(b, `${josa(who, '이', '가')} ${josa(itemName(itemId), '을', '를')} 마셨다.`, 'p')
  return { pet: { ...p, rpg: { ...p.rpg, inv: addBag(p.rpg.inv, itemId, -1) } }, battle: endOfTurn(b, st, false) }
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

const MAIN_RANGE: Record<Slot, [number, number][]> = {
  wand: [[5, 8], [11, 16], [20, 28], [32, 44], [50, 68], [78, 104]],
  robe: [[20, 32], [45, 65], [85, 115], [140, 190], [230, 310], [350, 460]],
  hat: [[6, 10], [12, 18], [20, 28], [30, 42], [45, 60], [66, 86]],
  amulet: [[2, 4], [5, 8], [10, 15], [17, 24], [28, 38], [42, 56]],
}
const FEES = [20, 50, 110, 200, 340, 520]
const rec = (name: string, slot: Slot, tier: number, mats: Bag): RecipeDef =>
  ({ name, slot, tier, mats, main: MAIN_RANGE[slot][tier - 1], fee: FEES[tier - 1] })

export const RECIPES: Record<string, RecipeDef> = {
  wand1: rec('버드나무 지팡이', 'wand', 1, { cobweb: 3, whisker: 3 }),
  robe1: rec('견습생 로브', 'robe', 1, { cobweb: 4, whisker: 2 }),
  hat1: rec('뾰족모자', 'hat', 1, { whisker: 4, cobweb: 2 }),
  amulet1: rec('쥐수염 부적', 'amulet', 1, { whisker: 3, cobweb: 3 }),

  wand2: rec('산사나무 지팡이', 'wand', 2, { vine: 4, pixie_dust: 3, troll_tooth: 1 }),
  robe2: rec('온실 작업복', 'robe', 2, { vine: 5, pixie_dust: 2 }),
  hat2: rec('약초꾼 모자', 'hat', 2, { pixie_dust: 4, vine: 2 }),
  amulet2: rec('네잎 브로치', 'amulet', 2, { vine: 3, pixie_dust: 3, pearl: 1 }),

  wand3: rec('주목 지팡이', 'wand', 3, { parchment: 3, ink: 4, mandrake_root: 1 }),
  robe3: rec('사서의 로브', 'robe', 3, { parchment: 5, ink: 2 }),
  hat3: rec('깃펜 모자', 'hat', 3, { ink: 4, parchment: 3 }),
  amulet3: rec('봉인된 책갈피', 'amulet', 3, { parchment: 4, ink: 3, pearl: 1 }),

  wand4: rec('흑단 지팡이', 'wand', 4, { silk: 4, ember: 4, ghost_breath: 1 }),
  robe4: rec('숲지기 망토', 'robe', 4, { silk: 6, ember: 2 }),
  hat4: rec('도깨비불 고깔', 'hat', 4, { ember: 5, silk: 2, stardust: 1 }),
  amulet4: rec('달맞이 로켓', 'amulet', 4, { silk: 3, ember: 3, moonflower: 1 }),

  wand5: rec('물푸레 지팡이', 'wand', 5, { waterweed: 4, kelpie_mane: 4, wolf_fang: 1 }),
  robe5: rec('검은 호수 로브', 'robe', 5, { waterweed: 6, kelpie_mane: 3 }),
  hat5: rec('진주 관', 'hat', 5, { kelpie_mane: 3, waterweed: 3, pearl: 2 }),
  amulet5: rec('켈피 고삐', 'amulet', 5, { kelpie_mane: 5, waterweed: 3, stardust: 1 }),

  wand6: rec('별참나무 지팡이', 'wand', 6, { star_shard: 5, gargoyle_stone: 4, serpent_scale: 1 }),
  amulet6: rec('가고일 인장', 'amulet', 6, { gargoyle_stone: 6, star_shard: 3, stardust: 2 }),
  robe6: rec('용비늘 로브', 'robe', 6, { star_shard: 4, gargoyle_stone: 4, dragon_scale: 2 }),
  hat6: rec('별자리 모자', 'hat', 6, { star_shard: 6, stardust: 3, dragon_scale: 1 }),
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
  feast: { out: 'feast', n: 1, mats: { mooncarp: 1, pumpkin: 1, moonflower: 1 }, fee: 15 },
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
      rpg: { ...p.rpg, inv: addBag(p.rpg.inv, id, -1) },
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
  berry: { crop: 'berry', cost: 8, ms: HOUR, yield: [2, 4], lv: 1 },
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
  if (zone >= 1) t.push(['stardust', 3])
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
