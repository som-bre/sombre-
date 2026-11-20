'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Pet } from '@/lib/greenroom'
import { ITEMS, itemName, type Bag } from '@/lib/greenroomRpg'
import { MAX_LETTER, MAX_ATTACH, hasGift, giftWaiting, type Letter } from '@/lib/greenroomMail'
import { SketchButton, Gold, GOLD, PINK, LOW } from './ui'
import { Mini, Label, Note, Box, type PanelProps } from './RpgPanels'

const SERIF = "'Noto Serif KR', serif"
const SCRIPT = "'Gowun Batang', 'Noto Serif KR', serif"
const DISPLAY = "'Playfair Display', serif"
const dim = (a: number) => `rgba(255,255,255,${a})`

export interface MailApi {
  me: string // the selected character's name
  them: string // the other character's name
  themAccent: string
  inbox: Letter[]
  sent: Letter[]
  unread: number
  busy: boolean
  compose: (item?: string) => void
  claim: (id: string) => void
  read: (id: string) => void
  remove: (id: string) => void
  refresh: () => void
}

const when = (t: number) => {
  const d = new Date(t)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function Gift({ items, gold, faded }: { items: Bag; gold: number; faded?: boolean }) {
  return (
    <span className="inline-flex flex-wrap gap-x-3 gap-y-1" style={{ fontSize: '0.76rem', fontFamily: SERIF, opacity: faded ? 0.45 : 1 }}>
      {Object.entries(items).map(([id, n]) => (
        <span key={id} style={{ color: dim(0.88) }}>{itemName(id)} <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.5) }}>×{n}</span></span>
      ))}
      {gold > 0 && <Gold n={gold} size="0.78rem" />}
    </span>
  )
}

// ═════════════════════════ compose (portal popup) ═════════════════════════

export function GiftModal({ pet, from, to, toAccent, start, onSend, onClose }: {
  pet: Pet; from: string; to: string; toAccent: string; start?: string
  onSend: (text: string, items: Bag, gold: number) => Promise<boolean>
  onClose: () => void
}) {
  const [text, setText] = useState('')
  const [items, setItems] = useState<Bag>(() => (start && (pet.rpg.inv[start] ?? 0) > 0 ? { [start]: 1 } : {}))
  const [gold, setGold] = useState(0)
  const [adding, setAdding] = useState('')
  const [sending, setSending] = useState(false)
  const inv = pet.rpg.inv
  const owned = Object.entries(inv).filter(([id, n]) => n > 0 && ITEMS[id] && !(id in items))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !sending) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, sending])

  const setQty = (id: string, n: number) => setItems(cur => {
    const next = { ...cur }
    const v = Math.max(0, Math.min(inv[id] ?? 0, Math.floor(n)))
    if (v > 0) next[id] = v
    else delete next[id]
    return next
  })
  const empty = !text.trim() && !Object.keys(items).length && gold <= 0

  const send = async () => {
    if (empty || sending) return
    setSending(true)
    const ok = await onSend(text, items, gold)
    setSending(false)
    if (ok) onClose()
  }

  const input: React.CSSProperties = { background: 'transparent', color: '#fff', fontFamily: SERIF, colorScheme: 'dark', outline: 'none' }

  return createPortal(
    <div className="gr-modal fixed inset-0 z-[600] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(3px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget && !sending) onClose() }}>
      <div role="dialog" aria-modal="true" aria-label={`${to}에게 편지`} className="relative w-full max-w-md flex flex-col gap-3"
        style={{ background: '#050505', padding: '22px 22px 18px', maxHeight: '90vh', overflowY: 'auto' }}>
        <span className="absolute inset-0 pointer-events-none sketch-jitter-line" style={{ border: `1px solid ${dim(0.25)}`, filter: 'url(#sketchy)' }} />
        <span className="absolute inset-1 pointer-events-none" style={{ border: `1px solid ${dim(0.06)}` }} />

        <div className="relative flex items-baseline justify-between">
          <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '1.2rem', color: '#fff' }}>
            To. <span style={{ color: toAccent }}>{to}</span>
          </span>
          <button onClick={onClose} disabled={sending} aria-label="닫기" className="cursor-pointer" style={{ background: 'none', color: dim(0.5), fontSize: '1.1rem' }}>×</button>
        </div>

        <textarea value={text} onChange={e => setText(e.target.value)} maxLength={MAX_LETTER} rows={6} autoFocus
          placeholder={`${to}에게`} aria-label="편지"
          className="gr-input relative w-full resize-none" style={{ ...input, border: `1px solid ${dim(0.15)}`, padding: '10px 12px', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: SCRIPT }} />
        <span className="relative text-right" style={{ fontSize: '0.62rem', fontFamily: DISPLAY, fontStyle: 'italic', color: dim(0.35), marginTop: -8 }}>
          {text.length} / {MAX_LETTER}
        </span>

        <div className="relative">
          <Label>선물</Label>
          {Object.keys(items).length === 0 && <Note>없음</Note>}
          <ul>
            {Object.entries(items).map(([id, n]) => (
              <li key={id} className="flex items-center justify-between gap-2 py-[6px]" style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                <span style={{ fontSize: '0.84rem', fontFamily: SERIF, color: dim(0.9) }}>
                  {itemName(id)} <span style={{ fontSize: '0.68rem', color: dim(0.4) }}>/ {inv[id] ?? 0}</span>
                </span>
                <span className="flex items-center gap-[6px]">
                  <Mini onClick={() => setQty(id, n - 1)}>−</Mini>
                  <input type="number" value={n} min={1} max={inv[id] ?? 0} aria-label={`${itemName(id)} 개수`}
                    onChange={e => setQty(id, Number(e.target.value))}
                    className="text-center" style={{ ...input, width: 46, borderBottom: `1px solid ${dim(0.25)}`, fontSize: '0.84rem' }} />
                  <Mini onClick={() => setQty(id, n + 1)}>+</Mini>
                  <Mini onClick={() => setQty(id, inv[id] ?? 0)}>전부</Mini>
                  <Mini onClick={() => setQty(id, 0)}>빼기</Mini>
                </span>
              </li>
            ))}
          </ul>
          {owned.length > 0 && Object.keys(items).length < MAX_ATTACH && (
            <div className="flex items-center gap-2 mt-2">
              <select value={adding} onChange={e => setAdding(e.target.value)} aria-label="담을 물건"
                className="flex-1 min-w-0" style={{ ...input, background: '#0b0b0b', border: `1px solid ${dim(0.15)}`, padding: '5px 6px', fontSize: '0.8rem' }}>
                <option value="">물건 고르기</option>
                {owned.map(([id, n]) => <option key={id} value={id}>{itemName(id)} ({n})</option>)}
              </select>
              <Mini disabled={!adding} onClick={() => { setQty(adding, 1); setAdding('') }}>담기</Mini>
            </div>
          )}
          <div className="flex items-center gap-2 mt-3" style={{ fontSize: '0.8rem', fontFamily: SERIF, color: dim(0.6) }}>
            <span style={{ color: GOLD }}>금화</span>
            <input type="number" value={gold || ''} min={0} max={pet.gold} placeholder="0" aria-label="보낼 금화"
              onChange={e => setGold(Math.max(0, Math.min(pet.gold, Math.floor(Number(e.target.value) || 0))))}
              style={{ ...input, width: 90, borderBottom: `1px solid ${dim(0.25)}`, fontSize: '0.84rem' }} />
            <span style={{ fontSize: '0.7rem', color: dim(0.4) }}>/ {pet.gold}</span>
          </div>
        </div>

        <div className="relative flex items-center justify-between gap-3 mt-1">
          <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.86rem', color: dim(0.5) }}>From. {from}</span>
          <SketchButton onClick={send} disabled={empty || sending}
            style={{ padding: '8px 22px', fontSize: '0.74rem', letterSpacing: '0.2em', fontFamily: "'Pretendard Variable', sans-serif" }}>
            {sending ? '…' : '보내기'}
          </SketchButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ═════════════════════════ mailbox tab ═════════════════════════

export function MailPanel({ mail }: PanelProps & { mail: MailApi }) {
  const [box, setBox] = useState<'in' | 'out'>('in')
  const [openId, setOpenId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const list = box === 'in' ? mail.inbox : mail.sent

  useEffect(() => { mail.refresh() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const open = (l: Letter) => {
    setOpenId(openId === l.id ? null : l.id)
    setConfirmId(null)
    if (box === 'in' && !l.read) mail.read(l.id)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Mini on={box === 'in'} onClick={() => { setBox('in'); setOpenId(null) }}>
          받은 편지{mail.unread > 0 && <span style={{ color: PINK }}> {mail.unread}</span>}
        </Mini>
        <Mini on={box === 'out'} onClick={() => { setBox('out'); setOpenId(null) }}>보낸 편지</Mini>
        <span className="ml-auto" />
        <Mini onClick={() => mail.compose()} style={{ color: mail.themAccent }}>{mail.them}에게 쓰기</Mini>
      </div>

      {list.length === 0 ? (
        <p className="py-8 text-center heading-condensed" style={{ fontStyle: 'italic', color: dim(0.35), fontSize: '0.9rem' }}>— 비어 있음 —</p>
      ) : (
        <ul>
          {list.map(l => {
            const isOpen = openId === l.id
            const unread = box === 'in' && !l.read
            const waiting = giftWaiting(l)
            const firstLine = l.text.split('\n')[0]
            return (
              <li key={l.id} style={{ borderBottom: `1px solid ${dim(0.06)}` }}>
                <button onClick={() => open(l)} aria-expanded={isOpen} className="w-full text-left cursor-pointer flex items-start gap-3 py-[10px]" style={{ background: 'none' }}>
                  <span className="shrink-0 mt-[7px]" style={{ width: 6, height: 6, borderRadius: 6, background: unread ? PINK : 'transparent', border: unread ? 'none' : `1px solid ${dim(0.15)}` }} />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline justify-between gap-2">
                      <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.9rem', color: unread ? '#fff' : dim(0.7) }}>
                        {box === 'in' ? `From. ${mail.them}` : `To. ${mail.them}`}
                      </span>
                      <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: '0.68rem', color: dim(0.35) }}>{when(l.at)}</span>
                    </span>
                    {!isOpen && (
                      <span className="block truncate" style={{ fontSize: '0.78rem', fontFamily: SCRIPT, color: dim(unread ? 0.75 : 0.45) }}>
                        {firstLine || (hasGift(l) ? '' : '(빈 편지)')}
                      </span>
                    )}
                    {hasGift(l) && !isOpen && (
                      <span className="block mt-[2px]" style={{ fontSize: '0.68rem', fontFamily: SERIF, color: waiting ? GOLD : dim(0.35) }}>
                        {waiting ? (box === 'in' ? '선물 도착' : '아직 안 받음') : '선물 받음'}
                      </span>
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-3 pl-[18px] flex flex-col gap-3">
                    {l.text && (
                      <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.88rem', lineHeight: 1.8, fontFamily: SCRIPT, color: dim(0.88) }}>{l.text}</p>
                    )}
                    {hasGift(l) && (
                      <Box tone={waiting ? `${GOLD}90` : dim(0.15)}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Gift items={l.items} gold={l.gold} faded={!waiting} />
                          {box === 'in' && waiting && <Mini onClick={() => mail.claim(l.id)} disabled={mail.busy} style={{ color: GOLD }}>받기</Mini>}
                          {!waiting && <span style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.35) }}>받음</span>}
                          {box === 'out' && waiting && <span style={{ fontSize: '0.68rem', fontFamily: SERIF, color: dim(0.4) }}>대기 중</span>}
                        </div>
                      </Box>
                    )}
                    {box === 'in' && (
                      <div className="flex gap-2">
                        <Mini onClick={() => mail.compose()}>답장</Mini>
                        {!waiting && (
                          <Mini onClick={() => { if (confirmId !== l.id) return setConfirmId(l.id); setConfirmId(null); setOpenId(null); mail.remove(l.id) }}
                            style={{ color: confirmId === l.id ? LOW : undefined }}>{confirmId === l.id ? '정말 삭제' : '삭제'}</Mini>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
