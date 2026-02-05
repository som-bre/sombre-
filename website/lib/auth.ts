import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const secretKey = process.env.JWT_SECRET || 'fallback-secret-key'
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function decrypt(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    return null
  }
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) return false
  return bcrypt.compare(password, hash)
}

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  return await decrypt(token)
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.isAdmin === true
}

// 비밀번호 해시 생성 헬퍼 (초기 설정용)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}
