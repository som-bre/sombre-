import { NextRequest, NextResponse } from 'next/server'
import { encrypt, verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
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
    
    // JWT 토큰 생성
    const token = await encrypt({ isAdmin: true })
    
    // 쿠키 설정
    cookies().set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24시간
    })
    
    return NextResponse.json({ success: true })
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
