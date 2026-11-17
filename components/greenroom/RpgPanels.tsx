'use client'

import { useState, useEffect } from 'react'
import { SLOTS, type Pet, type Gear, type Todo } from '@/lib/greenroom'
import {
  ITEMS, ZONES, MONSTERS, RECIPES, RARITY, STAT, SEEDS, SPOTS, TRIPS, DISHES, BREWS, GOODS, PERKS, MOVES, MOVE_ORDER, GROCERY, ELEMENTS, INTENTS,
  SLOT_NAME, MAIN_OF, MAX_LV, MAX_PLUS, MAX_GEAR, LUCK_BONUS,
  isFail, itemName, statsOf, xpNeed, gearMain, gearName, gearSlot, gearPrice, hasMats, monsterPower, battleCost,
  enhanceInfo, dismantleYield, plotCount, tripCost, jobLabel, dexBonus, dexProgress, fmtLeft, fmtDur,
  startBattle, battleMove, battlePotion, endBattle, monsterOf, nextIntent, patternOf, affinity, doGrocery,
  doCraft, doCook, doBrew, doBottle, doEnhance, doReroll, doEquip, doDismantle, doSellGear, doEat, doSell, doBuy, doBuyPerk, perkLv, perkCost,
  doPlant, doHarvest, doFish, doTrip, doClaim, doCancelJob, doHourglass,
  type Bag, type Fail, type Battle, type BattleReward, type EnhanceResult, type StatKey, type Stats, type Move, type LogTone, type MonsterDef, type Intent,
} from '@/lib/greenroomRpg'
import { SketchButton, Coins, Gold, GOLD, PINK, LOW } from './ui'
import MonsterArt from './MonsterArt'

export interface PanelProps {
  pet: Pet // already settled to "now"
  name: string
  accent: string
  // Runs a rule against the freshest pet, saves the result, and returns it (null when refused).
  apply: <T extends { pet: Pet }>(fn: (p: Pet) => Fail | T) => T | null
  notify: (text: string) => void
  celebrate: (text: string) => void
  onCoins?: () => void // starlight was just earned
  ready?: boolean // saving is possible right now (logged in and loaded)
  archive?: (month: string) => Promise<Todo[]> // finished to-dos archived from that month ('YYYY-MM')
}

const SERIF = "'Noto Serif KR', serif"
const SCRIPT = "'Gowun Batang', 'Noto Serif KR', serif"
const DISPLAY = "'Playfair Display', serif"
const MANA = '#7FAEE0'
const dim = (a: number) => `rgba(255,255,255,${a})`

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

// ── small pieces ──

export function Mini({ children, onClick, disabled, on, title, style }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; on?: boolean; title?: string; style?: React.CSSProperties
}) {
  return (
    <SketchButton onClick={onClick} disabled={disabled} on={on} title={title}
      style={{ padding: '5px 11px', fontSize: '0.74rem', fontFamily: SERIF, whiteSpace: 'nowrap', ...style }}>
      {children}
    </SketchButton>
  )
}

export function Label({ children }: { children: React.ReactNode }) {
  return <p className="label-caps" style={{ fontSize: '0.5rem', letterSpacing: '0.28em', color: dim(0.35), marginBottom: 6 }}>{children}</p>
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '0.7rem', fontFamily: SCRIPT, color: dim(0.4), lineHeight: 1.6 }}>{children}</p>
}

export function Bar({ value, max, color = '#fff', height = 7 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
  return (
    <div className="sketch-jitter-line" style={{ height, border: `1px solid ${dim(0.3)}`, filter: 'url(#sketchy)' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, opacity: 0.85, transition: 'width 0.25s ease-out' }} />
    </div>
  )
}

function Loot({ loot }: { loot: Bag }) {
  const entries = Object.entries(loot)
  if (!entries.length) return <span style={{ color: dim(0.4), fontSize: '0.78rem', fontFamily: SCRIPT }}>빈손이에요.</span>
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {entries.map(([id, n]) => (
        <span key={id} style={{ fontSize: '0.8rem', fontFamily: SERIF, color: dim(0.9) }}>
          {itemName(id)} <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.55) }}>×{n}</span>
        </span>
      ))}
    </span>
  )
}

function Mats({ mats, inv }: { mats: Bag; inv: Bag }) {
  return (
    <span className="flex flex-wrap gap-x-3" style={{ fontSize: '0.7rem', fontFamily: SERIF }}>
      {Object.entries(mats).map(([k, n]) => (
        <span key={k} style={{ color: (inv[k] ?? 0) >= n ? dim(0.6) : LOW }}>{itemName(k)} {inv[k] ?? 0}/{n}</span>
      ))}
    </span>
  )
}

export function Box({ children, tone = dim(0.18) }: { children: React.ReactNode; tone?: string }) {
  return (
    <div className="relative" style={{ padding: '12px 14px' }}>
      <span className="absolute inset-0 pointer-events-none sketch-jitter-line" style={{ border: `1px solid ${tone}`, background: dim(0.03), filter: 'url(#sketchy)' }} />
      <div className="relative">{children}</div>
    </div>
  )
}

function Row({ children, faded }: { children: React.ReactNode; faded?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2" style={{ borderBottom: `1px solid ${dim(0.06)}`, opacity: faded ? 0.4 : 1 }}>
      {children}
    </li>
  )
}

const fmtStat = (k: string, v: number) => `${STAT[k as StatKey]?.name ?? k} +${v}${STAT[k as StatKey]?.unit ?? ''}`
const mealText = (m: { stat: StatKey; pct?: number; add?: number; fights: number }) =>
  `결투 ${m.fights}회 ${STAT[m.stat].name} +${m.pct ?? m.add}${m.pct ? '%' : STAT[m.stat].unit}`
const foodText = (f?: { full?: number; mood?: number; energy?: number }) =>
  f ? [f.full && `포만 +${f.full}`, f.mood && `기분 +${f.mood}`, f.energy && `기력 +${f.energy}`].filter(Boolean).join(' · ') : ''

function GearCard({ gear, equipped, children }: { gear: Gear; equipped?: boolean; children?: React.ReactNode }) {
  const slot = gearSlot(gear)
  const rar = RARITY[gear.rarity] ?? RARITY[0]
  return (
    <div className="flex items-start justify-between gap-3 py-[9px]" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
      <div className="min-w-0">
        <div className="flex items-baseline flex-wrap gap-x-2">
          <span style={{ fontFamily: SERIF, fontSize: '0.9rem', color: rar.color }}>{gearName(gear)}</span>
          <span className="label-caps" style={{ fontSize: '0.48rem', letterSpacing: '0.2em', color: rar.color, opacity: 0.75 }}>{rar.name}</span>
          {equipped && <span className="label-caps" style={{ fontSize: '0.48rem', letterSpacing: '0.2em', color: PINK }}>착용 중</span>}
        </div>
        <div style={{ fontSize: '0.74rem', color: dim(0.75), fontFamily: SERIF, marginTop: 2 }}>
          {slot ? `${SLOT_NAME[slot]} · ${STAT[MAIN_OF[slot]].name} ${gearMain(gear)}` : '알 수 없는 장비'}
        </div>
        {gear.subs.length > 0 && (
          <div className="flex flex-wrap gap-x-3" style={{ fontSize: '0.7rem', color: dim(0.5), fontFamily: SERIF, marginTop: 2 }}>
            {gear.subs.map(s => <span key={s.k}>{fmtStat(s.k, s.v)}</span>)}
          </div>
        )}
      </div>
      {children && <div className="flex flex-col gap-[6px] shrink-0 items-stretch">{children}</div>}
    </div>
  )
}

// ═════════════════════════ 탐험 (turn-based duels) ═════════════════════════

const DANGER = [dim(0.5), dim(0.85), LOW]

function Tag({ children, color = dim(0.6), title }: { children: React.ReactNode; color?: string; title?: string }) {
  return (
    <span title={title} className="inline-flex items-center whitespace-nowrap" style={{
      border: `1px solid ${color}`, color, padding: '0 6px', fontSize: '0.64rem', fontFamily: SERIF, lineHeight: '17px',
    }}>{children}</span>
  )
}

function Affinity({ m, phase2 = false, known }: { m: MonsterDef; phase2?: boolean; known: boolean }) {
  if (!known) return <span style={{ fontSize: '0.66rem', fontFamily: SERIF, color: dim(0.3) }}>약점 ???</span>
  const aff = affinity(m, phase2)
  if (!aff.weak.length && !aff.resist.length) return <span style={{ fontSize: '0.66rem', fontFamily: SERIF, color: dim(0.35) }}>약점 없음</span>
  return (
    <span className="inline-flex flex-wrap gap-x-2" style={{ fontSize: '0.66rem', fontFamily: SERIF }}>
      {aff.weak.map(e => <span key={e} style={{ color: ELEMENTS[e].color }}>약점 {ELEMENTS[e].name}</span>)}
      {aff.resist.map(e => <span key={e} style={{ color: dim(0.4) }}>저항 {ELEMENTS[e].name}</span>)}
    </span>
  )
}

function Pattern({ list, at }: { list: Intent[]; at?: number }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-[3px]">
      {list.map((it, i) => (
        <span key={i} title={INTENTS[it].desc} style={{
          fontSize: '0.62rem', fontFamily: SERIF, padding: '0 4px', lineHeight: '16px',
          color: i === at ? '#000' : DANGER[INTENTS[it].danger], background: i === at ? dim(0.85) : 'transparent',
          border: `1px solid ${i === at ? dim(0.85) : dim(0.15)}`,
        }}>{INTENTS[it].name}</span>
      ))}
    </span>
  )
}

const TONE: Record<LogTone, string> = { p: dim(0.9), crit: PINK, m: dim(0.55), warn: LOW, sys: dim(0.4) }

export function HuntPanel({ pet, name, accent, apply, notify, celebrate }: PanelProps) {
  const [zone, setZone] = useState(() => Math.min(pet.rpg.stage, ZONES.length - 1))
  const [battle, setBattle] = useState<Battle | null>(null)
  const [st, setSt] = useState<Stats | null>(null)
  const [reward, setReward] = useState<BattleReward | null>(null)
  const live = statsOf(pet)

  const finish = (b: Battle) => {
    const r = apply(p => endBattle(p, b))
    setReward(r?.reward ?? null)
    if (r && b.over === 'win') celebrate(r.reward.leveled ? 'LEVEL UP!' : `+${r.reward.xp} EXP`)
  }
  const begin = (z: number, i: number) => {
    const r = apply(p => startBattle(p, z, i))
    if (!r) return
    setSt(r.stats)
    setReward(null)
    setBattle(r.battle)
  }
  const cast = (mv: Move) => {
    if (!battle || !st) return
    const nb = battleMove(battle, st, mv, pet.rpg.lv, name)
    if (isFail(nb)) { notify(nb); return }
    setBattle(nb)
    if (nb.over) finish(nb)
  }
  const drink = (id: string) => {
    if (!battle || !st) return
    const r = apply(p => battlePotion(p, battle, st, id, name))
    if (!r) return
    setBattle(r.battle)
    if (r.battle.over) finish(r.battle)
  }

  if (battle && st) {
    const m = monsterOf(battle)
    const known = (pet.rpg.dex.m[m.id] ?? 0) > 0
    const aff = affinity(m, battle.phase2)
    const intent = nextIntent(battle)
    const pat = patternOf(battle)
    const big = intent === 'smash' && battle.charging
    const last = battle.log[battle.log.length - 1]
    const struck = battle.log.slice(-3).some(l => l.tone === 'p' || l.tone === 'crit')
    const potions = Object.entries(pet.rpg.inv).filter(([id, n]) => n > 0 && ITEMS[id]?.battle)
    const meal = pet.rpg.meal ? ITEMS[pet.rpg.meal.id] : null
    const tags = (list: (false | [string, string])[]) => list.filter((x): x is [string, string] => !!x)
    const foeTags = tags([
      battle.phase2 && ['2막', LOW],
      battle.enraged && ['격노', LOW],
      battle.charging && ['힘 모음', LOW],
      battle.stunned && ['결박', MANA],
      battle.shell > 0 && [`껍질 ${battle.shell}`, dim(0.75)],
      battle.mirror && ['반사', LOW],
      battle.regen > 0 && [`재생 ${battle.regen}`, '#8FC7A0'],
      battle.howl > 0 && [`포효 ${battle.howl}`, LOW],
      battle.burn > 0 && [`연소 ${battle.burn}`, ELEMENTS.fire.color],
      battle.chill > 0 && [`냉기 ${battle.chill}`, ELEMENTS.frost.color],
    ])
    const myTags = tags([
      battle.poison > 0 && [`중독 ${battle.poison}`, '#8FC7A0'],
      battle.curse > 0 && [`저주 ${battle.curse}`, '#BF94E4'],
      battle.silence > 0 && [`침묵 ${battle.silence}`, LOW],
      battle.might > 0 && [`힘 ${battle.might}`, GOLD],
      battle.feather && !battle.revived && ['깃털', GOLD],
    ])

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div key={battle.turn} className={struck && !battle.over ? 'gr-shake' : ''}>
            <MonsterArt art={m.art} boss={m.boss} size={104} className={battle.over === 'win' ? 'gr-fade' : ''} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate" style={{ fontFamily: SERIF, fontSize: '0.95rem', color: m.boss ? '#FFD9E4' : '#fff' }}>{m.name}</span>
              <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.78rem', color: dim(0.6) }}>{battle.mHp} / {battle.mMax}</span>
            </div>
            <Bar value={battle.mHp} max={battle.mMax} />
            <div className="flex flex-wrap items-center gap-[4px] mt-[5px]" style={{ minHeight: 19 }}>
              <Affinity m={m} phase2={battle.phase2} known={known} />
              {foeTags.map(([t, c]) => <Tag key={t} color={c}>{t}</Tag>)}
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.95rem', color: accent }}>{name}</span>
              <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.78rem', color: dim(0.6) }}>{battle.pHp} / {battle.pMax}</span>
            </div>
            <Bar value={battle.pHp} max={battle.pMax} color={battle.pHp / battle.pMax < 0.3 ? LOW : accent} />
            <div className="flex items-center gap-2 mt-[5px]">
              <div className="flex-1"><Bar value={battle.mp} max={battle.mpMax} color={MANA} height={5} /></div>
              <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.7rem', color: MANA }}>마력 {battle.mp} / {battle.mpMax}</span>
            </div>
            {(myTags.length > 0 || meal) && (
              <div className="flex flex-wrap gap-[4px] mt-[5px]">
                {myTags.map(([t, c]) => <Tag key={t} color={c}>{t}</Tag>)}
                {meal && <Tag color={GOLD} title={meal.desc}>{meal.name}</Tag>}
              </div>
            )}
          </div>
        </div>

        {!battle.over && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1" style={{ fontSize: '0.78rem', fontFamily: SERIF }}>
            <span style={{ color: dim(0.45) }}>다음 행동</span>
            <span title={INTENTS[intent].desc} className={big ? 'gr-blink' : ''} style={{ color: big ? LOW : DANGER[INTENTS[intent].danger], fontSize: '0.88rem' }}>
              {battle.stunned ? '— (결박됨)' : big ? '강타 ×2.4' : INTENTS[intent].name}
            </span>
            {known && <Pattern list={pat} at={battle.step % pat.length} />}
          </div>
        )}

        <div aria-live="polite" style={{ minHeight: 112, fontSize: '0.78rem', fontFamily: SCRIPT, lineHeight: 1.75 }}>
          {battle.log.slice(-5).map((l, i, arr) => (
            <p key={battle.log.length - arr.length + i} style={{ color: TONE[l.tone], opacity: l === last ? 1 : 0.7 }}>{l.t}</p>
          ))}
        </div>

        {!battle.over ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              {MOVE_ORDER.map(mv => {
                const d = MOVES[mv]
                const locked = pet.rpg.lv < d.lv
                const hushed = battle.silence > 0 && d.mp > 0 && mv !== 'solvo'
                const fx = known && d.el ? (aff.weak.includes(d.el) ? '약점' : aff.resist.includes(d.el) ? '저항' : '') : ''
                return (
                  <SketchButton key={mv} disabled={locked || hushed || battle.mp < d.mp} onClick={() => cast(mv)} title={d.desc}
                    style={{ padding: '7px 4px', fontFamily: SERIF }}>
                    <span className="flex flex-col items-center leading-tight">
                      <span className="inline-flex items-center gap-[5px]" style={{ fontSize: '0.84rem' }}>
                        {d.el && <span style={{ width: 6, height: 6, borderRadius: 6, background: ELEMENTS[d.el].color }} />}
                        {d.name}
                        {fx && <span style={{ fontSize: '0.58rem', color: fx === '약점' && d.el ? ELEMENTS[d.el].color : dim(0.4) }}>{fx}</span>}
                      </span>
                      <span style={{ fontSize: '0.62rem', fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.45) }}>
                        {locked ? `Lv.${d.lv}` : d.latin}{!locked && d.mp > 0 && <span style={{ color: MANA }}> · {d.mp}</span>}
                      </span>
                    </span>
                  </SketchButton>
                )
              })}
            </div>
            {potions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {potions.map(([id, n]) => (
                  <Mini key={id} onClick={() => drink(id)} title={ITEMS[id].desc}>{itemName(id)} <span style={{ color: dim(0.5) }}>×{n}</span></Mini>
                ))}
              </div>
            )}
          </>
        ) : (
          <Box tone={battle.over === 'win' ? `${PINK}80` : dim(0.2)}>
            <p className="heading-display" style={{ fontSize: '1.15rem', fontStyle: 'italic', color: battle.over === 'win' ? PINK : dim(0.6) }}>
              {battle.over === 'win' ? 'Victory' : battle.over === 'fled' ? 'Escaped' : 'Defeated'}
            </p>
            {battle.over === 'win' && reward ? (
              <div className="flex flex-col gap-1 mt-1">
                <p style={{ fontSize: '0.78rem', fontFamily: SERIF, color: dim(0.7) }}>
                  경험치 +{reward.xp} · <Gold n={reward.gold} size="0.8rem" />
                  {reward.boon && <span style={{ color: GOLD }}> · 별의 가호 2배</span>}
                  {reward.leveled > 0 && <span style={{ color: PINK }}> · 레벨 업! Lv.{pet.rpg.lv}</span>}
                </p>
                <Loot loot={reward.loot} />
                {reward.firstKill && <p style={{ fontSize: '0.78rem', fontFamily: SCRIPT, color: GOLD }}>도감 등록 · 패턴과 약점 기록</p>}
                {reward.unlocked !== null && (
                  <p style={{ fontSize: '0.8rem', fontFamily: SCRIPT, color: PINK }}>새 구역 — {ZONES[reward.unlocked].name}</p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.78rem', fontFamily: SCRIPT, color: dim(0.55), marginTop: 2 }}>
                {battle.over === 'fled' ? '얻은 것 없음' : '기분 −8'}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <Mini onClick={() => begin(battle.zone, battle.index)}>한 번 더 · 기력 {battleCost(m, pet.rpg)}</Mini>
              <Mini onClick={() => { setZone(reward?.unlocked ?? battle.zone); setBattle(null) }}>목록으로</Mini>
            </div>
          </Box>
        )}
      </div>
    )
  }

  const z = ZONES[zone]
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {ZONES.map((zd, i) => {
          const open = i <= pet.rpg.stage
          return (
            <Mini key={zd.id} on={i === zone} disabled={!open} onClick={() => setZone(i)}
              title={open ? zd.desc : '앞 구역의 주인을 쓰러뜨리면 열려요.'}>
              {open ? zd.name : '???'}
            </Mini>
          )
        })}
      </div>
      <p style={{ fontSize: '0.76rem', fontFamily: SCRIPT, color: dim(0.45), lineHeight: 1.6 }}>
        <span className="block" style={{ color: dim(0.6) }}>
          전투력 {live.power} · 컨디션 ×{live.cond.toFixed(2)} · 기력 {Math.floor(pet.energy)}
          {pet.rpg.job && <span style={{ color: PINK }}> · {jobLabel(pet.rpg.job)}</span>}
        </span>
        {(pet.rpg.boon > 0 || (pet.rpg.inv.feather ?? 0) > 0 || pet.rpg.meal) && (
          <span className="block" style={{ color: GOLD }}>
            {[
              pet.rpg.meal && `${itemName(pet.rpg.meal.id)} ${pet.rpg.meal.left}회`,
              pet.rpg.boon > 0 && `별의 가호 ${pet.rpg.boon}회`,
              (pet.rpg.inv.feather ?? 0) > 0 && `불사조 깃털 ${pet.rpg.inv.feather}개`,
            ].filter(Boolean).join(' · ')}
          </span>
        )}
      </p>
      <ul>
        {z.monsters.map((m, i) => {
          const need = monsterPower(m)
          const ratio = live.power / need
          const known = (pet.rpg.dex.m[m.id] ?? 0) > 0
          return (
            <Row key={m.id}>
              <MonsterArt art={m.art} boss={m.boss} size={58} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: SERIF, fontSize: '0.9rem', color: m.boss ? '#FFD9E4' : dim(0.92) }}>{m.name}</span>
                  {m.boss && <span className="label-caps" style={{ fontSize: '0.46rem', letterSpacing: '0.22em', color: PINK }}>BOSS</span>}
                </div>
                <p style={{ fontSize: '0.7rem', fontFamily: SERIF, color: dim(0.5) }}>
                  체력 {m.hp} · 공격 {m.atk} · 방어 {m.def}
                  <span style={{ color: ratio >= 1 ? '#8FC7A0' : ratio >= 0.75 ? dim(0.6) : LOW }}> · 권장 전투력 {need}</span>
                </p>
                <p className="flex flex-wrap gap-x-2" style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.35) }}>
                  <Affinity m={m} known={known} />
                  {m.phase && known && <span style={{ color: LOW }}>2막 있음</span>}
                  <span className="truncate">{known ? m.drops.map(dr => itemName(dr.id)).join(' · ') : '전리품 ???'}</span>
                </p>
              </div>
              <Mini onClick={() => begin(zone, i)}>결투<span style={{ color: dim(0.5) }}> · {battleCost(m, pet.rpg)}</span></Mini>
            </Row>
          )
        })}
      </ul>
    </div>
  )
}

// ═════════════════════════ 생활 ═════════════════════════

export function LifePanel({ pet, name, accent, apply, celebrate }: PanelProps) {
  const now = useNow()
  const [seed, setSeed] = useState('turnip')
  const [tripZone, setTripZone] = useState(() => Math.min(pet.rpg.stage, ZONES.length - 1))
  const [result, setResult] = useState<{ title: string; loot: Bag; note?: string } | null>(null)
  const st = statsOf(pet)
  const job = pet.rpg.job
  const plots = Array.from({ length: plotCount(pet.rpg) }, (_, i) => pet.rpg.plots[i] ?? null)
  const anyRipe = plots.some(p => p && now >= p.readyAt)
  const speed = 1 - st.haste / 100
  const glasses = pet.rpg.inv.hourglass ?? 0

  const harvest = () => {
    const r = apply(p => doHarvest(p, Date.now()))
    if (r) { setResult({ title: '수확했어요', loot: r.loot }); celebrate('수확!') }
  }
  const claim = () => {
    const kind = job?.kind
    const r = apply(p => doClaim(p, Date.now()))
    if (!r) return
    setResult({
      title: kind === 'fish' ? '낚시에서 돌아왔어요' : '채집에서 돌아왔어요',
      loot: r.loot,
      note: r.xp ? `경험치 +${r.xp}${r.leveled ? ' · 레벨 업!' : ''}` : undefined,
    })
    celebrate(r.leveled ? 'LEVEL UP!' : '다녀왔어요')
  }

  return (
    <div className="flex flex-col gap-5">
      {result && (
        <Box tone={`${PINK}80`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p style={{ fontSize: '0.84rem', fontFamily: SERIF, color: PINK, marginBottom: 4 }}>{result.title}</p>
              <Loot loot={result.loot} />
              {result.note && <p style={{ fontSize: '0.74rem', fontFamily: SERIF, color: dim(0.6), marginTop: 4 }}>{result.note}</p>}
            </div>
            <Mini onClick={() => setResult(null)}>확인</Mini>
          </div>
        </Box>
      )}

      {job && (
        <Box>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '0.84rem', fontFamily: SERIF, color: accent }}>{name} · {jobLabel(job)}</p>
              <div className="mt-2"><Bar value={now - job.startedAt} max={job.endsAt - job.startedAt} color={accent} /></div>
              <p style={{ fontSize: '0.72rem', fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.55), marginTop: 4 }}>
                {now >= job.endsAt ? '돌아왔어요' : `${fmtLeft(job.endsAt - now)} 남음`}
              </p>
            </div>
            {now >= job.endsAt
              ? <Mini onClick={claim}>받기</Mini>
              : <Mini onClick={() => apply(p => doCancelJob(p))} title="지금 부르면 아무것도 못 얻어요.">불러오기</Mini>}
          </div>
        </Box>
      )}

      {glasses > 0 && (
        <div className="flex items-center justify-between gap-3">
          <Note>모래시계 ×{glasses}</Note>
          <Mini onClick={() => { if (apply(p => doHourglass(p, Date.now()))) celebrate('째깍') }}>돌리기</Mini>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between">
          <Label>약초 텃밭 · {plots.length}칸</Label>
          {anyRipe && <Mini onClick={harvest}>모두 수확</Mini>}
        </div>
        <div className="flex flex-wrap gap-2 mb-3" role="radiogroup" aria-label="심을 씨앗">
          {Object.entries(SEEDS).map(([id, s]) => {
            const locked = pet.rpg.lv < s.lv
            return (
              <button key={id} type="button" role="radio" aria-checked={seed === id} disabled={locked} onClick={() => setSeed(id)}
                className="cursor-pointer inline-flex items-center gap-[6px]"
                title={locked ? `Lv.${s.lv}부터` : `${fmtDur(s.ms * speed)} · ${s.yield[0]}~${s.yield[1]}개`}
                style={{
                  background: seed === id ? dim(0.08) : 'transparent',
                  border: `1px solid ${seed === id ? dim(0.45) : dim(0.12)}`,
                  color: seed === id ? '#fff' : dim(0.45), opacity: locked ? 0.3 : 1,
                  padding: '3px 9px', fontSize: '0.72rem', fontFamily: SERIF,
                }}>
                {itemName(s.crop)} <Gold n={s.cost} size="0.7rem" />
                <span style={{ color: dim(0.35) }}>{locked ? `Lv.${s.lv}` : fmtDur(s.ms * speed)}</span>
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {plots.map((pl, i) => {
            const ripe = !!pl && now >= pl.readyAt
            return (
              <SketchButton key={i} on={ripe}
                onClick={() => (pl ? (ripe ? harvest() : undefined) : apply(p => doPlant(p, i, seed, Date.now())))}
                style={{ padding: '10px 6px', minHeight: 66, fontFamily: SERIF }}>
                {pl ? (
                  <span className="flex flex-col items-center gap-1 w-full">
                    <span style={{ fontSize: '0.8rem', color: ripe ? PINK : dim(0.85) }}>{itemName(SEEDS[pl.seed]?.crop ?? pl.seed)}</span>
                    {ripe
                      ? <span style={{ fontSize: '0.7rem', color: PINK }}>수확하기</span>
                      : <>
                        <span className="w-full px-2"><Bar value={now - pl.plantedAt} max={pl.readyAt - pl.plantedAt} color={accent} height={5} /></span>
                        <span style={{ fontSize: '0.66rem', fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.5) }}>{fmtLeft(pl.readyAt - now)}</span>
                      </>}
                  </span>
                ) : (
                  <span className="flex flex-col items-center" style={{ color: dim(0.4) }}>
                    <span style={{ fontSize: '0.78rem' }}>빈 밭</span>
                    <span style={{ fontSize: '0.66rem' }}>{itemName(SEEDS[seed]?.crop ?? '')} 심기</span>
                  </span>
                )}
              </SketchButton>
            )
          })}
        </div>
      </section>

      <section>
        <Label>낚시</Label>
        <ul>
          {Object.entries(SPOTS).map(([id, s]) => {
            const locked = pet.rpg.lv < s.lv
            return (
              <Row key={id} faded={locked}>
                <div className="min-w-0">
                  <span style={{ fontFamily: SERIF, fontSize: '0.88rem', color: dim(0.9) }}>{s.name}</span>
                  <span style={{ fontFamily: SERIF, fontSize: '0.7rem', color: dim(0.45), marginLeft: 8 }}>
                    {fmtDur(s.ms * speed)} · {s.catches[0]}~{s.catches[1]}마리
                  </span>
                  <p className="truncate" style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.35) }}>
                    {s.table.map(([it]) => itemName(it)).join(' · ')}
                  </p>
                </div>
                <Mini disabled={locked || !!job} onClick={() => apply(p => doFish(p, id, Date.now()))}>
                  {locked ? `Lv.${s.lv}` : <>던지기 <Gold n={s.cost} size="0.7rem" /></>}
                </Mini>
              </Row>
            )
          })}
        </ul>
      </section>

      <section>
        <Label>채집 보내기</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {ZONES.map((zd, i) => i <= pet.rpg.stage && (
            <Mini key={zd.id} on={i === tripZone} onClick={() => setTripZone(i)}>{zd.name}</Mini>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TRIPS.map(t => (
            <SketchButton key={t.id} disabled={!!job} onClick={() => apply(p => doTrip(p, tripZone, t.id, Date.now()))}
              style={{ padding: '8px 4px', fontFamily: SERIF }}>
              <span className="flex flex-col items-center leading-tight">
                <span style={{ fontSize: '0.8rem' }}>{t.name}</span>
                <span style={{ fontSize: '0.68rem', color: dim(0.5) }}>{fmtDur(t.ms * speed)}</span>
                <Gold n={tripCost(tripZone, t.cost)} size="0.7rem" />
              </span>
            </SketchButton>
          ))}
        </div>
      </section>
    </div>
  )
}

// ═════════════════════════ 공방 ═════════════════════════

const RESULT_TEXT: Record<EnhanceResult, { text: string; color: string }> = {
  up: { text: '강화 성공!', color: PINK },
  stay: { text: '실패… 다행히 그대로예요.', color: dim(0.6) },
  down: { text: '실패… 강화 단계가 하나 내려갔어요.', color: LOW },
  saved: { text: '깨질 뻔했지만 수호 부적이 막아줬어요.', color: GOLD },
  break: { text: '장비가 산산조각 났어요.', color: LOW },
}

type ForgeMode = 'gear' | 'brew' | 'cook' | 'enhance'
const FORGE_MODES: [ForgeMode, string][] = [['gear', '장비'], ['brew', '물약'], ['cook', '요리'], ['enhance', '강화']]

export function ForgePanel({ pet, apply, celebrate }: PanelProps) {
  const now = useNow()
  const [mode, setMode] = useState<ForgeMode>('gear')
  const [made, setMade] = useState<Gear | null>(null)
  const [got, setGot] = useState<{ title: string; loot: Bag } | null>(null)
  const [pickId, setPickId] = useState<string | null>(null)
  const [useCharm, setUseCharm] = useState(true)
  const [useLuck, setUseLuck] = useState(false)
  const [useCatalyst, setUseCatalyst] = useState(false)
  const [outcome, setOutcome] = useState<{ result: EnhanceResult | 'reroll'; refund: number; n: number } | null>(null)
  const inv = pet.rpg.inv
  const equipped = new Set(SLOTS.map(s => pet.rpg.equip[s]).filter(Boolean))
  const speed = 1 - statsOf(pet).haste / 100
  const brew = pet.rpg.brew

  const craft = (id: string) => {
    const r = apply(p => doCraft(p, id, useCatalyst))
    if (!r) return
    setMade(r.gear)
    if (r.gear.rarity >= 2) celebrate(`${RARITY[r.gear.rarity].name}!`)
  }

  const picked = pet.rpg.gear.find(g => g.id === pickId) ?? null
  const info = picked && enhanceInfo(picked)
  const luckOn = useLuck && (inv.luck ?? 0) > 0
  const enhance = () => {
    if (!picked) return
    const r = apply(p => doEnhance(p, picked.id, { charm: useCharm, luck: useLuck }))
    if (!r) return
    setOutcome(o => ({ result: r.result, refund: r.refund, n: (o?.n ?? 0) + 1 }))
    if (r.result === 'up') celebrate(`+${r.gear.plus}`)
    if (r.result === 'break') setPickId(null)
  }
  const reroll = () => {
    if (!picked) return
    if (apply(p => doReroll(p, picked.id))) setOutcome(o => ({ result: 'reroll', refund: 0, n: (o?.n ?? 0) + 1 }))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {FORGE_MODES.map(([id, label]) => <Mini key={id} on={mode === id} onClick={() => setMode(id)}>{label}</Mini>)}
        <span className="ml-auto self-center" style={{ fontSize: '0.72rem', fontFamily: SERIF, color: dim(0.5) }}>
          룬석 {inv.stone ?? 0} · 부적 {inv.charm ?? 0}
        </span>
      </div>

      {mode === 'gear' && (
        <>
          {made && (
            <Box tone={RARITY[made.rarity].color}>
              <p className="label-caps" style={{ fontSize: '0.5rem', letterSpacing: '0.28em', color: dim(0.4) }}>NEW</p>
              <GearCard gear={made}>
                <Mini onClick={() => { apply(p => doEquip(p, made.id)); setMade(null) }}>장착</Mini>
                <Mini onClick={() => setMade(null)}>확인</Mini>
              </GearCard>
            </Box>
          )}
          <Note>일반 50% · 고급 30% · 희귀 14% · 영웅 5% · 전설 1%</Note>
          <label className="inline-flex items-center gap-2 cursor-pointer" style={{ fontSize: '0.76rem', fontFamily: SERIF, color: (inv.catalyst ?? 0) > 0 ? GOLD : dim(0.35) }}>
            <input type="checkbox" checked={useCatalyst && (inv.catalyst ?? 0) > 0} disabled={(inv.catalyst ?? 0) < 1} onChange={e => setUseCatalyst(e.target.checked)} />
            별의 촉매 넣기 — 희귀 70% · 영웅 25% · 전설 5% (보유 {inv.catalyst ?? 0})
          </label>
          {ZONES.map((zd, zi) => {
            const tier = zi + 1
            const open = zi <= pet.rpg.stage
            return (
              <section key={zd.id} style={{ opacity: open ? 1 : 0.35 }}>
                <Label>{tier}단계 · {open ? zd.name : '???'}{open ? '' : ' (잠김)'}</Label>
                <ul>
                  {Object.entries(RECIPES).filter(([, r]) => r.tier === tier).map(([id, r]) => (
                    <Row key={id}>
                      <div className="min-w-0">
                        <span style={{ fontFamily: SERIF, fontSize: '0.88rem', color: dim(0.9) }}>{open ? r.name : '???'}</span>
                        <span style={{ fontFamily: SERIF, fontSize: '0.7rem', color: dim(0.45), marginLeft: 8 }}>
                          {SLOT_NAME[r.slot]} · {STAT[MAIN_OF[r.slot]].name} {r.main[0]}~{r.main[1]}
                        </span>
                        {open && <Mats mats={r.mats} inv={inv} />}
                      </div>
                      <Mini disabled={!open} onClick={() => craft(id)}
                        style={{ opacity: hasMats(inv, r.mats) && pet.gold >= r.fee ? 1 : 0.45 }}>
                        제작 <Gold n={r.fee} size="0.7rem" />
                      </Mini>
                    </Row>
                  ))}
                </ul>
              </section>
            )
          })}
        </>
      )}

      {mode === 'brew' && (
        <>
          {got && (
            <Box tone={`${PINK}80`}>
              <div className="flex items-start justify-between gap-3">
                <div><p style={{ fontSize: '0.84rem', fontFamily: SERIF, color: PINK, marginBottom: 4 }}>{got.title}</p><Loot loot={got.loot} /></div>
                <Mini onClick={() => setGot(null)}>확인</Mini>
              </div>
            </Box>
          )}
          <Box>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: '0.84rem', fontFamily: SERIF, color: brew ? dim(0.9) : dim(0.4) }}>
                  가마솥 — {brew ? `${itemName(BREWS[brew.id]?.out ?? brew.id)} 끓이는 중` : '비어 있음'}
                </p>
                {brew && (
                  <>
                    <div className="mt-2"><Bar value={now - brew.startedAt} max={brew.readyAt - brew.startedAt} color={MANA} /></div>
                    <p style={{ fontSize: '0.72rem', fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.55), marginTop: 4 }}>
                      {now >= brew.readyAt ? '다 끓었어요' : `${fmtLeft(brew.readyAt - now)} 남음`}
                    </p>
                  </>
                )}
              </div>
              {brew && now >= brew.readyAt && (
                <Mini onClick={() => { const r = apply(p => doBottle(p, Date.now())); if (r) { setGot({ title: '물약을 병에 담았어요', loot: r.loot }); celebrate('보글보글') } }}>
                  병에 담기
                </Mini>
              )}
            </div>
          </Box>
          <ul>
            {Object.entries(BREWS).map(([id, b]) => {
              const locked = pet.rpg.lv < b.lv
              return (
                <Row key={id} faded={locked}>
                  <div className="min-w-0">
                    <span style={{ fontFamily: SERIF, fontSize: '0.88rem', color: dim(0.9) }}>{itemName(b.out)} ×{b.n}</span>
                    <span style={{ fontFamily: SERIF, fontSize: '0.7rem', color: dim(0.45), marginLeft: 8 }}>{fmtDur(b.ms * speed)}</span>
                    <p style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.4) }}>{ITEMS[b.out]?.desc}</p>
                    <Mats mats={b.mats} inv={inv} />
                  </div>
                  <Mini disabled={locked || !!brew} onClick={() => apply(p => doBrew(p, id, Date.now()))}
                    style={{ opacity: hasMats(inv, b.mats) && pet.gold >= b.fee ? 1 : 0.45 }}>
                    {locked ? `Lv.${b.lv}` : <>끓이기 <Gold n={b.fee} size="0.7rem" /></>}
                  </Mini>
                </Row>
              )
            })}
          </ul>
        </>
      )}

      {mode === 'cook' && (
        <>
          <ul>
            {Object.entries(DISHES).map(([id, dish]) => (
              <Row key={id}>
                <div className="min-w-0">
                  <span style={{ fontFamily: SERIF, fontSize: '0.88rem', color: dim(0.9) }}>{itemName(dish.out)}</span>
                  {dish.n > 1 && <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.74rem', color: dim(0.5) }}> ×{dish.n}</span>}
                  <span style={{ fontFamily: SERIF, fontSize: '0.7rem', color: dim(0.45), marginLeft: 8 }}>{foodText(ITEMS[dish.out]?.food)}</span>
                  {ITEMS[dish.out]?.meal && <span style={{ fontFamily: SERIF, fontSize: '0.7rem', color: GOLD, marginLeft: 8 }}>{mealText(ITEMS[dish.out].meal!)}</span>}
                  <Mats mats={dish.mats} inv={inv} />
                </div>
                <Mini onClick={() => { if (apply(p => doCook(p, id))) celebrate('완성!') }}
                  style={{ opacity: hasMats(inv, dish.mats) && pet.gold >= dish.fee ? 1 : 0.45 }}>
                  요리 <Gold n={dish.fee} size="0.7rem" />
                </Mini>
              </Row>
            ))}
          </ul>
          <section>
            <Label>식료품</Label>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              {Object.entries(GROCERY).map(([id, price]) => (
                <li key={id} className="flex items-center justify-between gap-2 py-[6px]" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                  <span style={{ fontSize: '0.82rem', fontFamily: SERIF, color: dim(0.85) }}>
                    {itemName(id)} <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.45) }}>×{inv[id] ?? 0}</span>
                  </span>
                  <span className="flex gap-[6px]">
                    <Mini onClick={() => apply(p => doGrocery(p, id, 1))}>+1 <Gold n={price} size="0.7rem" /></Mini>
                    <Mini onClick={() => apply(p => doGrocery(p, id, 5))}>+5</Mini>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {mode === 'enhance' && (
        picked ? (
          <Box tone={outcome?.result === 'up' ? `${PINK}80` : dim(0.18)}>
            <div key={outcome?.n ?? 0} className={outcome && outcome.result !== 'up' && outcome.result !== 'reroll' ? 'gr-shake' : ''}>
              <GearCard gear={picked} equipped={equipped.has(picked.id)} />
            </div>
            {info ? (
              <div className="mt-2 flex flex-col gap-1" style={{ fontSize: '0.76rem', fontFamily: SERIF, color: dim(0.7) }}>
                <p>
                  +{picked.plus} → <span style={{ color: PINK }}>+{picked.plus + 1}</span>
                  <span style={{ color: dim(0.45) }}> · 주 능력치 {gearMain(picked)} → {gearMain({ ...picked, plus: picked.plus + 1 })}</span>
                </p>
                <p>
                  성공 확률 <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: luckOn ? GOLD : '#fff' }}>
                    {Math.round(Math.min(1, info.rate + (luckOn ? LUCK_BONUS : 0)) * 100)}%
                  </span>
                  <span style={{ color: info.breakP ? LOW : dim(0.45) }}>
                    {' · '}{info.breakP
                      ? `실패 시 ${Math.round(info.breakP * 100)}% 확률로 파괴`
                      : info.down ? '실패 시 한 단계 하락' : '실패해도 그대로'}
                  </span>
                </p>
                <p>비용 <Gold n={info.gold} /> · 룬석 <span style={{ color: (inv.stone ?? 0) >= info.stones ? dim(0.8) : LOW }}>{inv.stone ?? 0}/{info.stones}</span></p>
                <label className="inline-flex items-center gap-2 cursor-pointer" style={{ color: (inv.luck ?? 0) > 0 ? GOLD : dim(0.35) }}>
                  <input type="checkbox" checked={luckOn} disabled={(inv.luck ?? 0) < 1} onChange={e => setUseLuck(e.target.checked)} />
                  행운의 가루 뿌리기 (보유 {inv.luck ?? 0})
                </label>
                {info.breakP > 0 && (
                  <label className="inline-flex items-center gap-2 cursor-pointer" style={{ color: (inv.charm ?? 0) > 0 ? GOLD : dim(0.35) }}>
                    <input type="checkbox" checked={useCharm && (inv.charm ?? 0) > 0} disabled={(inv.charm ?? 0) < 1}
                      onChange={e => setUseCharm(e.target.checked)} />
                    수호 부적으로 파괴 막기 (보유 {inv.charm ?? 0})
                  </label>
                )}
              </div>
            ) : (
              <p className="mt-2" style={{ fontSize: '0.76rem', fontFamily: SERIF, color: GOLD }}>최대 강화(+{MAX_PLUS})에 도달했어요.</p>
            )}
            {outcome && (
              <p aria-live="polite" className="mt-2" style={{ fontSize: '0.82rem', fontFamily: SCRIPT, color: outcome.result === 'reroll' ? GOLD : RESULT_TEXT[outcome.result].color }}>
                {outcome.result === 'reroll' ? '깃펜이 부옵션을 새로 썼어요.' : RESULT_TEXT[outcome.result].text}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {info && <Mini onClick={enhance}>강화하기</Mini>}
              <Mini onClick={reroll} disabled={(inv.quill ?? 0) < 1} title="재련의 깃펜 1개로 부옵션을 전부 다시 뽑습니다.">
                부옵션 재련 <span style={{ color: dim(0.5) }}>깃펜 {inv.quill ?? 0}</span>
              </Mini>
              <Mini onClick={() => { setPickId(null); setOutcome(null) }}>다른 장비</Mini>
            </div>
          </Box>
        ) : (
          <>
            {outcome?.result === 'break' && (
              <Box tone={LOW}>
                <p className="gr-shake" style={{ fontSize: '0.84rem', fontFamily: SCRIPT, color: LOW }}>
                  {RESULT_TEXT.break.text}{outcome.refund > 0 && ` 파편에서 룬석 ${outcome.refund}개를 건졌어요.`}
                </p>
              </Box>
            )}
            {pet.rpg.gear.length === 0 ? (
              <p className="py-6 text-center heading-condensed" style={{ fontStyle: 'italic', color: dim(0.4), fontSize: '0.9rem' }}>— 아직 장비가 없어요 —</p>
            ) : (
              <ul>
                {[...pet.rpg.gear].sort((a, b) => Number(equipped.has(b.id)) - Number(equipped.has(a.id))).map(g => (
                  <li key={g.id}>
                    <GearCard gear={g} equipped={equipped.has(g.id)}>
                      <Mini onClick={() => { setPickId(g.id); setOutcome(null) }}>선택</Mini>
                    </GearCard>
                  </li>
                ))}
              </ul>
            )}
          </>
        )
      )}
    </div>
  )
}

// ═════════════════════════ 가방 ═════════════════════════

const SHEET: StatKey[] = ['hp', 'mp', 'atk', 'def', 'crit', 'critd', 'drop', 'gold', 'coin', 'xp', 'haste', 'yield']
const KINDS = [['food', '음식'], ['potion', '물약'], ['special', '별빛 상점 물건'], ['mat', '재료'], ['junk', '잡동사니']] as const

export function BagPanel({ pet, name, accent, apply, celebrate }: PanelProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const st = statsOf(pet)
  const r = pet.rpg
  const equipped = new Set(SLOTS.map(s => r.equip[s]).filter(Boolean))
  const loose = r.gear.filter(g => !equipped.has(g.id))
  const items = Object.entries(r.inv).filter(([, n]) => n > 0)

  const guarded = (key: string, run: () => void) => {
    if (confirmId !== key) { setConfirmId(key); return }
    setConfirmId(null)
    run()
  }

  return (
    <div className="flex flex-col gap-5">
      <section>
        <div className="flex items-baseline justify-between">
          <span>
            <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.3rem', color: accent }}>Lv.{r.lv}</span>
            <span style={{ fontFamily: SERIF, fontSize: '0.78rem', color: dim(0.5), marginLeft: 8 }}>{name} · 전투력 {st.power}</span>
          </span>
          <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.76rem', color: dim(0.5) }}>
            {r.lv >= MAX_LV ? 'MAX' : `${r.xp} / ${xpNeed(r.lv)}`}
          </span>
        </div>
        <div className="mt-1"><Bar value={r.lv >= MAX_LV ? 1 : r.xp} max={r.lv >= MAX_LV ? 1 : xpNeed(r.lv)} color={accent} /></div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-[2px] mt-3" style={{ fontSize: '0.76rem', fontFamily: SERIF }}>
          {SHEET.map(k => (
            <div key={k} className="flex justify-between" style={{ color: dim(0.6) }}>
              <span>{STAT[k].name}</span>
              <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.9) }}>{Math.round(st[k])}{STAT[k].unit}</span>
            </div>
          ))}
          <div className="flex justify-between" style={{ color: dim(0.6) }}>
            <span>컨디션</span>
            <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: st.cond >= 1 ? '#8FC7A0' : LOW }}>×{st.cond.toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ color: dim(0.6) }}>
            <span>쓰러뜨린 수</span>
            <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.9) }}>{r.kills}</span>
          </div>
        </div>
      </section>

      <section>
        <Label>착용 중</Label>
        {SLOTS.map(slot => {
          const g = r.gear.find(x => x.id === r.equip[slot])
          return g ? (
            <GearCard key={slot} gear={g} equipped>
              <Mini onClick={() => apply(p => doEquip(p, g.id))}>해제</Mini>
            </GearCard>
          ) : (
            <div key={slot} className="py-[9px]" style={{ borderBottom: `1px solid ${dim(0.06)}`, fontSize: '0.8rem', fontFamily: SERIF, color: dim(0.3) }}>
              {SLOT_NAME[slot]} — 비어 있음
            </div>
          )
        })}
      </section>

      <section>
        <Label>장비 칸 · {r.gear.length}/{MAX_GEAR}</Label>
        {loose.length === 0 ? (
          <Note>없음</Note>
        ) : loose.map(g => (
          <GearCard key={g.id} gear={g}>
            <Mini onClick={() => apply(p => doEquip(p, g.id))}>장착</Mini>
            <Mini onClick={() => guarded(`s${g.id}`, () => apply(p => doSellGear(p, g.id)))}
              style={{ color: confirmId === `s${g.id}` ? LOW : undefined }}>
              {confirmId === `s${g.id}` ? '정말 판매' : <>판매 <Gold n={gearPrice(g)} size="0.7rem" /></>}
            </Mini>
            <Mini onClick={() => guarded(`d${g.id}`, () => apply(p => doDismantle(p, g.id)))}
              style={{ color: confirmId === `d${g.id}` ? LOW : undefined }} title={`분해하면 룬석 ${dismantleYield(g)}개`}>
              {confirmId === `d${g.id}` ? '정말 분해' : `분해 → 룬석 ${dismantleYield(g)}`}
            </Mini>
          </GearCard>
        ))}
      </section>

      {KINDS.map(([kind, title]) => {
        const list = items.filter(([id]) => (ITEMS[id]?.kind ?? 'junk') === kind)
        if (!list.length) return null
        return (
          <section key={kind}>
            <Label>{title}</Label>
            <ul>
              {list.map(([id, n]) => {
                const it = ITEMS[id]
                return (
                  <li key={id} className="flex items-center justify-between gap-2 py-[6px]" style={{ borderBottom: `1px solid ${dim(0.06)}` }} title={it?.desc}>
                    <span className="min-w-0 truncate" style={{ fontSize: '0.82rem', fontFamily: SERIF, color: dim(0.88) }}>
                      {itemName(id)} <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.5) }}>×{n}</span>
                      <span style={{ fontSize: '0.66rem', color: dim(0.4), marginLeft: 6 }}>{foodText(it?.food) || (it?.battle ? '결투용' : '')}</span>
                      {it?.meal && <span style={{ fontSize: '0.66rem', color: GOLD, marginLeft: 6 }}>{mealText(it.meal)}</span>}
                    </span>
                    <span className="flex gap-[6px] shrink-0">
                      {it?.food && <Mini onClick={() => { if (apply(p => doEat(p, id))) celebrate(it.kind === 'food' ? '냠' : '꿀꺽') }}>{it.kind === 'food' ? '먹이기' : '마시기'}</Mini>}
                      {(it?.sell ?? 0) > 0 && (
                        <>
                          <Mini onClick={() => apply(p => doSell(p, id, false))}>판매 <Gold n={it!.sell} size="0.7rem" /></Mini>
                          {n > 1 && (
                            <Mini onClick={() => guarded(`a${id}`, () => apply(p => doSell(p, id, true)))}
                              style={{ color: confirmId === `a${id}` ? LOW : undefined }}>
                              {confirmId === `a${id}` ? '정말?' : '전부'}
                            </Mini>
                          )}
                        </>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      {items.length === 0 && (
        <p className="text-center heading-condensed" style={{ fontStyle: 'italic', color: dim(0.4), fontSize: '0.9rem' }}>— 가방이 비어 있어요 —</p>
      )}
    </div>
  )
}

// ═════════════════════════ 별빛 상점 ═════════════════════════

export function ShopPanel({ pet, apply, celebrate }: PanelProps) {
  const [mode, setMode] = useState<'stars' | 'goods'>('stars')
  return (
    <div className="flex flex-col gap-3">
      <p style={{ fontSize: '0.78rem', fontFamily: SCRIPT, color: dim(0.55), lineHeight: 1.7 }}>
        <span className="block" style={{ color: dim(0.75) }}>보유 별빛 <Coins n={pet.coins} size="0.86rem" /> · 금화 <Gold n={pet.gold} size="0.86rem" /></span>
      </p>
      <div className="flex gap-2">
        <Mini on={mode === 'stars'} onClick={() => setMode('stars')}>별자리</Mini>
        <Mini on={mode === 'goods'} onClick={() => setMode('goods')}>물건</Mini>
      </div>

      {mode === 'stars' ? (
        <>
          <ul>
            {Object.entries(PERKS).map(([id, perk]) => {
              const lv = perkLv(pet.rpg, id)
              const maxed = lv >= perk.max
              const cost = perkCost(id, lv)
              return (
                <Row key={id}>
                  <div className="min-w-0">
                    <span style={{ fontFamily: SERIF, fontSize: '0.88rem', color: lv > 0 ? GOLD : dim(0.92) }}>{perk.name}</span>
                    <span className="ml-2" aria-label={`${lv}단계 / ${perk.max}단계`} style={{ letterSpacing: '0.12em', fontSize: '0.7rem', color: GOLD }}>
                      {'✦'.repeat(lv)}<span style={{ color: dim(0.18) }}>{'✦'.repeat(perk.max - lv)}</span>
                    </span>
                    <p style={{ fontSize: '0.7rem', fontFamily: SERIF, color: dim(0.45) }}>
                      단계마다 {perk.desc}{lv > 0 && <span style={{ color: dim(0.7) }}> · 지금 {lv}단계</span>}
                    </p>
                  </div>
                  <Mini disabled={maxed} onClick={() => { const r = apply(p => doBuyPerk(p, id)); if (r) celebrate(`${perk.name} ${r.lv}단계`) }}
                    style={{ opacity: maxed || pet.coins >= cost ? 1 : 0.45 }}>
                    {maxed ? '완성' : <>밝히기 <Coins n={cost} size="0.74rem" /></>}
                  </Mini>
                </Row>
              )
            })}
          </ul>
        </>
      ) : (
        <>
          <ul>
            {Object.entries(GOODS).map(([id, g]) => (
              <Row key={id}>
                <div className="min-w-0">
                  <span style={{ fontFamily: SERIF, fontSize: '0.88rem', color: dim(0.92) }}>{g.name}</span>
                  <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.72rem', color: dim(0.45), marginLeft: 8 }}>
                    {g.item ? `보유 ${pet.rpg.inv[g.item] ?? 0}` : g.boon ? `남은 횟수 ${pet.rpg.boon}` : ''}
                  </span>
                  <p style={{ fontSize: '0.7rem', fontFamily: SERIF, color: dim(0.45) }}>{g.desc}</p>
                </div>
                <Mini onClick={() => { if (apply(p => doBuy(p, id))) celebrate(g.name) }} style={{ opacity: pet.coins >= g.price ? 1 : 0.45 }}>
                  구입 <Coins n={g.price} size="0.74rem" />
                </Mini>
              </Row>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

// ═════════════════════════ 도감 ═════════════════════════

type DexMode = 'm' | 'i' | 'g'

export function CodexPanel({ pet }: PanelProps) {
  const [mode, setMode] = useState<DexMode>('m')
  const dex = pet.rpg.dex
  const pr = dexProgress(pet.rpg)
  const bonus = dexBonus(pet.rpg)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex items-baseline justify-between">
          <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.2rem', color: GOLD }}>{pr.pct}%</span>
          <span style={{ fontSize: '0.72rem', fontFamily: SERIF, color: dim(0.5) }}>
            생물 {pr.m}/{pr.mAll} · 물건 {pr.i}/{pr.iAll} · 장비 {pr.g}/{pr.gAll}
          </span>
        </div>
        <div className="mt-1"><Bar value={pr.pct} max={100} color={GOLD} /></div>
        <p style={{ fontSize: '0.7rem', fontFamily: SERIF, color: dim(0.5), marginTop: 6, lineHeight: 1.6 }}>
          보너스 — 체력 +{bonus.hp} · 주문 위력 +{bonus.atk} · 마력 +{bonus.mp}
        </p>
      </div>
      <div className="flex gap-2">
        <Mini on={mode === 'm'} onClick={() => setMode('m')}>마법 생물</Mini>
        <Mini on={mode === 'i'} onClick={() => setMode('i')}>물건</Mini>
        <Mini on={mode === 'g'} onClick={() => setMode('g')}>장비</Mini>
      </div>

      {mode === 'm' && ZONES.map((z, zi) => (
        <section key={z.id}>
          <Label>{zi <= pet.rpg.stage ? z.name : '???'}</Label>
          <ul>
            {z.monsters.map(m => {
              const kills = dex.m[m.id] ?? 0
              const known = kills > 0
              return (
                <li key={m.id} className="flex items-start gap-3 py-2" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                  {known ? <MonsterArt art={m.art} boss={m.boss} size={54} /> : (
                    <span className="shrink-0 flex items-center justify-center" style={{ width: 54, height: 54, border: `1px dashed ${dim(0.15)}`, fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.4rem', color: dim(0.2) }}>?</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline flex-wrap gap-x-2">
                      <span style={{ fontFamily: SERIF, fontSize: '0.88rem', color: known ? (m.boss ? '#FFD9E4' : dim(0.92)) : dim(0.3) }}>{known ? m.name : '???'}</span>
                      {known && <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.72rem', color: dim(0.45) }}>×{kills}</span>}
                      {kills >= 10 && <span className="label-caps" style={{ fontSize: '0.46rem', letterSpacing: '0.2em', color: GOLD }}>연구 완료</span>}
                    </div>
                    {known ? (
                      <>
                        <p style={{ fontSize: '0.72rem', fontFamily: SCRIPT, color: dim(0.55), lineHeight: 1.55 }}>{m.lore}</p>
                        <p style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.38) }}>
                          체력 {m.hp} · 공격 {m.atk} · 방어 {m.def} · {m.drops.map(dr => itemName(dr.id)).join(', ')}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Affinity m={m} known />
                          {m.enrage && <span style={{ fontSize: '0.66rem', fontFamily: SERIF, color: LOW }}>35% 이하 격노</span>}
                        </div>
                        <div className="mt-1"><Pattern list={m.pattern} /></div>
                        {m.phase && (
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span style={{ fontSize: '0.64rem', fontFamily: SERIF, color: LOW }}>2막 (50%)</span>
                            <Pattern list={m.phase.pattern} />
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {mode === 'i' && KINDS.map(([kind, title]) => (
        <section key={kind}>
          <Label>{title}</Label>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            {Object.entries(ITEMS).filter(([, it]) => it.kind === kind).map(([id, it]) => {
              const known = !!dex.i[id]
              return (
                <li key={id} className="py-[6px]" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                  <span style={{ fontFamily: SERIF, fontSize: '0.82rem', color: known ? dim(0.9) : dim(0.25) }}>{known ? it.name : '???'}</span>
                  {known && <p style={{ fontSize: '0.68rem', fontFamily: SCRIPT, color: dim(0.45), lineHeight: 1.5 }}>{it.desc}</p>}
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {mode === 'g' && ZONES.map((z, zi) => (
        <section key={z.id}>
          <Label>{zi + 1}단계</Label>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
            {Object.entries(RECIPES).filter(([, r]) => r.tier === zi + 1).map(([id, r]) => {
              const best = dex.g[id] ?? 0
              const rar = RARITY[best - 1]
              return (
                <li key={id} className="flex items-baseline justify-between gap-2 py-[6px]" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                  <span style={{ fontFamily: SERIF, fontSize: '0.82rem', color: rar ? rar.color : dim(0.25) }}>{rar ? r.name : '???'}</span>
                  <span style={{ fontSize: '0.66rem', fontFamily: SERIF, color: dim(0.4) }}>{rar ? `${SLOT_NAME[r.slot]} · 최고 ${rar.name}` : SLOT_NAME[r.slot]}</span>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
