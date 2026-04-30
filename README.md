# SAME Website

사드함 눈 × 메디아 아우렐리우스 커플 웹사이트

## 🚀 Vercel 배포 가이드

### 1. GitHub에 업로드

```bash
# 새 레포지토리 생성 후
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/same-website.git
git push -u origin main
```

### 2. Vercel 연결

1. [vercel.com](https://vercel.com) 로그인
2. "Add New Project" 클릭
3. GitHub 레포지토리 선택
4. "Deploy" 클릭

### 3. Vercel KV 설정 (데이터 저장용)

1. Vercel Dashboard → 프로젝트 선택
2. "Storage" 탭 클릭
3. "Create Database" → "KV" 선택
4. 이름 입력 후 생성
5. 자동으로 환경 변수가 연결됨

### 4. 어드민 비밀번호 설정

1. 터미널에서 비밀번호 해시 생성:

```bash
# Node.js 환경에서
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 10).then(console.log)"
```

2. Vercel Dashboard → Settings → Environment Variables:
   - `ADMIN_PASSWORD_HASH`: 위에서 생성한 해시값
   - `JWT_SECRET`: 랜덤 문자열 (예: `your-super-secret-key-12345`)

3. 재배포 (Deployments → 최신 배포 → Redeploy)

### 5. 사용법

**일반 사용자:**
- `/` - Introduction
- `/character` - 캐릭터 프로필 (메디아/사드함 눈)
- `/record` - 대화 기록 (말풍선)
- `/timeline` - 타임라인

**어드민:**
- `/admin` - 어드민 페이지
  - 비밀번호 로그인
  - txt 파일 업로드 → 대화 파싱
  - 말풍선 드래그앤드롭 순서 변경
  - 내용 직접 편집
  - 저장/삭제

## 📁 txt 파일 형식

```
0차
[첫 만남]
사드함
대사 내용

메디아
대사 내용

[다른 대화]
메디아
대사 내용

1차
[새로운 시작]
사드함
대사 내용
```

- `n차` : 시기 구분 (0차, 1차, 2차 등)
- `[제목]` : 대화 섹션 구분
- 이름 (한 줄) + 대사 (다음 줄)
- 빈 줄로 대사 구분

## 🛠 로컬 개발

```bash
npm install
npm run dev
```

`.env.local` 파일 생성:
```
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_token
KV_REST_API_READ_ONLY_TOKEN=your_readonly_token
ADMIN_PASSWORD_HASH=your_bcrypt_hash
JWT_SECRET=your_secret
```

## 📝 기술 스택

- Next.js 14 (App Router)
- Vercel KV (데이터 저장)
- Tailwind CSS
- @dnd-kit (드래그앤드롭)
- jose + bcryptjs (인증)
