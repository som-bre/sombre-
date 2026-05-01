import { NextResponse, NextRequest } from 'next/server'
import { kv } from '@/lib/db'

export const dynamic = 'force-dynamic'

const CHAT_KEY = 'chat_v1'
const MAX_MESSAGES = 200

export interface ChatMessage {
  id: string
  sender: 'manon' | 'dylan'
  content: string
  imageUrl?: string
  timestamp: number
}

export interface ChatData {
  messages: ChatMessage[]
}

const defaultData: ChatData = { messages: [] }

export async function GET() {
  try {
    const data = await kv.get(CHAT_KEY)
    return NextResponse.json(data || defaultData)
  } catch {
    return NextResponse.json(defaultData)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sender, content, imageUrl } = await request.json()
    if (!sender || (!content?.trim() && !imageUrl)) {
      return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })
    }

    const existing: ChatData = (await kv.get(CHAT_KEY)) || defaultData
    const newMessage: ChatMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      sender,
      content: content?.trim() || '',
      ...(imageUrl ? { imageUrl } : {}),
      timestamp: Date.now(),
    }

    const messages = [...existing.messages, newMessage].slice(-MAX_MESSAGES)
    await kv.set(CHAT_KEY, { messages })
    return NextResponse.json({ success: true, message: newMessage })
  } catch {
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, content, sender, imageUrl } = await request.json()
    if (!id) return NextResponse.json({ error: '잘못된 요청' }, { status: 400 })

    const existing: ChatData = (await kv.get(CHAT_KEY)) || defaultData
    const messages = existing.messages.map(msg => {
      if (msg.id !== id) return msg
      return {
        ...msg,
        ...(content !== undefined ? { content } : {}),
        ...(sender !== undefined ? { sender } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
      }
    })
    await kv.set(CHAT_KEY, { messages })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '수정 실패' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (id) {
      const existing: ChatData = (await kv.get(CHAT_KEY)) || defaultData
      const messages = existing.messages.filter(msg => msg.id !== id)
      await kv.set(CHAT_KEY, { messages })
    } else {
      await kv.set(CHAT_KEY, defaultData)
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '삭제 실패' }, { status: 500 })
  }
}
