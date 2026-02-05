import { createClient } from '@vercel/kv'

// same1_ 이 붙은 변수를 사용해서 DB 연결을 수동으로 설정합니다.
export const kv = createClient({
  url: process.env.same1_KV_REST_API_URL!,
  token: process.env.same1_KV_REST_API_TOKEN!,
})