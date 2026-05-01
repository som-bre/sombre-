import { NextRequest, NextResponse } from 'next/server'
import { encrypt, verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

const VALID_USERNAMES = ['manon', 'dylan']

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !VALID_USERNAMES.includes(username.toLowerCase())) {
      return NextResponse.json(
        { error: '유효하지 않은 사용자입니다.' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const isValid = await verifyPassword(password)

    if (!isValid) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    const token = await encrypt({ isAdmin: true, username: username.toLowerCase() })

    cookies().set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    })

    return NextResponse.json({ success: true, username: username.toLowerCase() })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  cookies().delete('session')
  return NextResponse.json({ success: true })
}
