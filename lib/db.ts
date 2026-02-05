import { createClient } from '@vercel/kv'

// Vercel KV 환경 변수 사용 (없으면 더미값으로 빌드 통과)
const kvUrl = process.env.KV_REST_API_URL || process.env.same1_KV_REST_API_URL || ''
const kvToken = process.env.KV_REST_API_TOKEN || process.env.same1_KV_REST_API_TOKEN || ''

export const kv = kvUrl && kvToken 
  ? createClient({ url: kvUrl, token: kvToken })
  : {
      // 더미 KV (환경 변수 없을 때 빌드 통과용)
      get: async () => null,
      set: async () => null,
      del: async () => null,
    } as any