import { createClient, VercelKV } from '@vercel/kv'

// Vercel KV 환경 변수 사용
const kvUrl = process.env.KV_REST_API_URL || process.env.same1_KV_REST_API_URL
const kvToken = process.env.KV_REST_API_TOKEN || process.env.same1_KV_REST_API_TOKEN

// 더미 KV 클라이언트 (환경 변수 없을 때 빌드 통과용)
const dummyKv = {
  get: async <T = unknown>(): Promise<T | null> => null,
  set: async (): Promise<'OK'> => 'OK',
  del: async (): Promise<number> => 0,
} as unknown as VercelKV

export const kv: VercelKV = (kvUrl && kvToken)
  ? createClient({ url: kvUrl, token: kvToken })
  : dummyKv