'use client'

import { useState, useEffect, useRef } from 'react'
import type { ChatMessage } from '@/app/api/chat/route'

const MANON_COLOR = '#D9809A'
const DYLAN_COLOR = '#C8C8C8'

const SENDER_COLORS = { manon: MANON_COLOR, dylan: DYLAN_COLOR }

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPopup() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sender, setSender] = useState<'manon' | 'dylan'>('manon')
  const [sending, setSending] = useState(false)
  const [lastId, setLastId] = useState<string | null>(null)
  const [hasNew, setHasNew] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = async (silent = false) => {
    try {
      const res = await fetch('/api/chat')
      const data = await res.json()
      const msgs: ChatMessage[] = data.messages || []
      setMessages(msgs)
      if (!silent && msgs.length > 0) {
        const newest = msgs[msgs.length - 1]
        if (lastId && newest.id !== lastId && !open) setHasNew(true)
        setLastId(newest.id)
      }
    } catch {}
  }

  useEffect(() => {
    fetchMessages(true)
    pollRef.current = setInterval(() => fetchMessages(), 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [open])

  useEffect(() => {
    if (open) {
      setHasNew(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, messages.length])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, content: input.trim() }),
      })
      setInput('')
      await fetchMessages(true)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    } catch {}
    setSending(false)
  }

  const accentColor = SENDER_COLORS[sender]

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed z-[500] flex items-center justify-center transition-all duration-300"
        style={{
          bottom: 'clamp(20px, 3vh, 32px)',
          right: 'clamp(20px, 3vw, 36px)',
          width: '42px', height: '42px',
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${open ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}`,
          backdropFilter: 'blur(8px)',
        }}
        title="채팅"
      >
        {/* Chat icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2.5h12a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H9l-3 3v-3H2a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5z"
            stroke="rgba(255,255,255,0.6)" strokeWidth="1" fill="none" />
        </svg>
        {/* New message dot */}
        {hasNew && !open && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: MANON_COLOR }} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-[499] flex flex-col"
          style={{
            bottom: 'clamp(68px, 9vh, 84px)',
            right: 'clamp(20px, 3vw, 36px)',
            width: 'clamp(280px, 28vw, 360px)',
            height: 'clamp(340px, 45vh, 480px)',
            background: 'rgba(4,4,4,0.96)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div className="flex items-center gap-2">
              <span className="label-caps" style={{
                fontSize: '0.45rem', letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.35)',
              }}>LIVE CHAT</span>
              {/* Live dot */}
              <span className="inline-block w-1 h-1 rounded-full animate-pulse" style={{ background: MANON_COLOR }} />
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/30 hover:text-white/70 transition-colors"
              style={{ fontSize: '0.75rem', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          {/* Sender toggle */}
          <div className="flex px-3 pt-2.5 pb-1.5 gap-2">
            {(['manon', 'dylan'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSender(s)}
                className="transition-all"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.5rem',
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  letterSpacing: '0.08em',
                  color: sender === s ? SENDER_COLORS[s] : 'rgba(255,255,255,0.25)',
                  border: `1px solid ${sender === s ? SENDER_COLORS[s] + '60' : 'rgba(255,255,255,0.08)'}`,
                  background: sender === s ? `${SENDER_COLORS[s]}10` : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {s === 'manon' ? 'Manon' : 'Dylan'}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="heading-condensed text-white/20" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                  No messages yet.
                </p>
              </div>
            ) : (
              messages.map(msg => {
                const isManon = msg.sender === 'manon'
                const color = SENDER_COLORS[msg.sender]
                return (
                  <div key={msg.id} className={`flex flex-col ${isManon ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: 'italic',
                        fontSize: '0.58rem',
                        color,
                        letterSpacing: '0.04em',
                      }}>
                        {isManon ? 'Manon' : 'Dylan'}
                      </span>
                      <span style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div style={{
                      maxWidth: '88%',
                      padding: '7px 11px',
                      background: isManon ? `${MANON_COLOR}12` : `${DYLAN_COLOR}0C`,
                      border: `1px solid ${color}25`,
                      color: 'rgba(255,255,255,0.82)',
                      fontSize: '0.8rem',
                      fontFamily: "'Noto Serif KR', serif",
                      lineHeight: 1.65,
                      wordBreak: 'break-word',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} className="flex gap-0" style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`${sender === 'manon' ? 'Manon' : 'Dylan'} says...`}
              disabled={sending}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '10px 14px',
                color: 'rgba(255,255,255,0.82)',
                fontSize: '0.8rem',
                fontFamily: "'Noto Serif KR', serif",
                caretColor: accentColor,
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              style={{
                padding: '10px 14px',
                background: 'transparent',
                border: 'none',
                cursor: input.trim() && !sending ? 'pointer' : 'default',
                color: input.trim() && !sending ? accentColor : 'rgba(255,255,255,0.18)',
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                fontFamily: "'Pretendard Variable', sans-serif",
                transition: 'color 0.2s',
              }}
            >
              {sending ? '…' : '↵'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}
