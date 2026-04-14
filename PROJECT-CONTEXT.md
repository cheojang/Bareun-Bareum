# 바른발음 — AI 기반 아동 조음 홈케어 SaaS
## 프로젝트 컨텍스트 문서 (다른 AI 인계용)

> **이 문서의 목적:** 새로운 AI(Gemini, ChatGPT 등)가 이 프로젝트를 인계받아 바로 작업을 이어갈 수 있도록 작성한 전체 컨텍스트 문서입니다.
>
> **GitHub:** cheojang/SORI | **브랜치:** claude/speech-therapy-saas-design-Jns4A
> **마지막 업데이트:** 2026-04-14

---

## 1. 프로젝트 개요

### 서비스 정의
**바른발음**은 언어 발달이 느린 아이를 둔 부모를 위한 AI 기반 발음 교정 홈케어 SaaS입니다.

**핵심 가치:**
- 부모가 아이의 오답 발음을 입력 → AI가 원인 분석 → 4단계 훈련법 제공
- 언어재활사 방문 없이 집에서 부모가 직접 지도 가능
- 망각 곡선(SM-2) 기반 반복 학습으로 발음 개선 극대화

**중요 법적 고지:**
- 의료기기·의료 서비스가 **아닙니다**
- 언어재활 치료를 대체할 수 **없습니다**
- 발음에 우려가 있으면 반드시 전문 언어재활사 상담 권장

### 비즈니스 모델
- 무료 플랜: 기본 오답 분석 5회/월
- 프리미엄: 월 9,900원 (TossPayments 자동결제)
- 주요 타겟: 3~8세 아이를 둔 부모

---

## 2. 기술 스택

| 항목 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js | 16.2.3 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | - |
| Database | PostgreSQL + Prisma ORM | Prisma v7.7.0 |
| Auth | NextAuth v5 | - |
| AI (30%) | Google Gemini Flash | @google/generative-ai |
| Styling | Tailwind CSS + Framer Motion | - |
| Payment | TossPayments | - |
| Deployment | Vercel (예정) + Supabase DB (예정) | - |

### 환경변수 (.env.local 필수)
```bash
DATABASE_URL=postgresql://...          # PostgreSQL 연결 문자열
GEMINI_API_KEY=...                     # Google AI Studio에서 발급
NEXTAUTH_URL=http://localhost:3000     # 로컬 개발 시
AUTH_SECRET=...                        # NextAuth 시크릿 (랜덤 문자열)
KAKAO_CLIENT_ID=...                    # 카카오 소셜 로그인
KAKAO_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...                   # 구글 소셜 로그인
GOOGLE_CLIENT_SECRET=...
TOSS_CLIENT_KEY=...                    # TossPayments
TOSS_SECRET_KEY=...
```

---

## 3. 핵심 아키텍처

### 로컬-우선 + Gemini 하이브리드
```
부모가 오답 입력 (목표 단어 + 아이 발음)
        ↓
[로컬 자모 분석 엔진] — 70% 케이스 처리 (API 비용 없음)
  ㄱ 대치, ㅅ 탈락, ㄹ 첨가 등 20개 패턴 분류
        ↓
  동화 오류 / 복합 오류 / 미인식 패턴?
        ↓ Yes (30%)
[Gemini Flash API] — 언어재활사 페르소나 (15년 경력)
  원인 분석 + 4단계 훈련법 + 부모 응원 메시지
        ↓
결과 저장 (DB) + ReviewSchedule 자동 생성 (망각 곡선)
```

### SM-2 망각 곡선 복습 시스템
```
오답 입력 → 오늘 첫 복습 예약
        ↓
복습 목록에서 평가:
  "잘 했어요 ✅" (quality=5) → 간격 확장 (1→3→7→18→30일)
  "아직 어려워요 💪" (quality=1) → 1일 후 리셋
        ↓
5회 연속 성공 → 🎓 졸업 (isLearned=true)
```

---

## 4. 데이터베이스 모델 (전체)

```prisma
// 사용자
model User { id, name, email, ... }

// 아이 프로필
model Child {
  id, userId, name, birthDate
  mascotLevel (1~5)  // 🥚→🐣→🐥→🐤→🐦
  totalWords, totalMinutes, streakDays
}

// 연습 세션
model PracticeSession { id, userId, childId, startedAt, endedAt, durationMin }
model WordRecord { id, sessionId, targetWord, heardWord, errorPhonemes, isCorrect, isBookmarked }

// 오답 분석
model ErrorRecord {
  id, childId, targetWord, childPronunciation
  errorType, errorCategory, errorPattern
  // errorCategory: "대치" | "동화" | "탈락" | "첨가" | "개별습관"
}

// 로컬 자모 분석 결과
model LocalAnalysis {
  id, errorRecordId
  detectedPattern, jamoBreakdown (JSON)
  confidence (0-100), requiresGemini
}

// Gemini AI 분석 결과
model GeminiFeedback {
  id, errorRecordId
  rootCause (원인 설명)
  trainingStep1~4 (4단계 훈련법)
  recommendedWords (JSON 배열)
  parentMessage (부모님께 응원)
}

// 약점 음소 집계 (최근 300개 오답 기준)
model WeakPhoneme {
  id, childId, phoneme (ㅅ/ㄹ/ㅈ 등)
  totalAttempts, errorCount, errorRate
  weaknessLevel: "집중교정필요" | "꾸준한연습필요" | "관찰중" | "정상범위"
}

// 망각 곡선 복습 스케줄 (SM-2 알고리즘)
model ReviewSchedule {
  id, childId, errorRecordId
  targetWord, childPronunciation, phoneme, errorPattern
  nextReviewAt, reviewCount, interval, easeFactor (2.5 기본)
  lastReviewedAt, lastQuality, isLearned
}

// 아이연습에서 저장한 단어
model SavedWord { id, childId, word, targetPhoneme, difficulty }

// 구독 정보
model Subscription { id, userId, plan, tossCustomerKey, tossBillingKey, status, currentPeriodEnd }
```

---

## 5. API 엔드포인트 전체 목록

| 메서드 | 경로 | 기능 |
|--------|------|------|
| POST | `/api/error-analysis` | ⭐ 핵심: 오답 입력 → 로컬+Gemini 분석 → DB 저장 + WeakPhoneme 집계 + ReviewSchedule 생성 |
| GET | `/api/weak-phonemes` | 약점 음소 조회 |
| GET/POST | `/api/saved-words` | 복습 단어 저장/조회 |
| POST | `/api/practice-sentences` | Gemini로 연습 문장 생성 |
| GET | `/api/recommendations` | 단어 추천 |
| GET | `/api/review?childId=xxx` | 오늘 복습 목록 조회 |
| POST | `/api/review` | 복습 결과 제출 (SM-2 계산) |
| GET/POST | `/api/children` | 아이 등록/조회 |
| GET/POST | `/api/sessions` | 연습 세션 |
| GET/POST | `/api/bookmarks` | 북마크 |
| GET | `/api/briefing` | 일일 브리핑 |
| GET | `/api/progress` | 성장 통계 |
| POST | `/api/billing/confirm` | 결제 확인 (TossPayments) |
| POST | `/api/billing/webhook` | 결제 웹훅 |

---

## 6. 화면 구조 (전체 32개 페이지)

```
/                         ← 랜딩 페이지 (마스코트, 기능 소개, 가격)
/login                    ← 로그인 (카카오/구글, 약관 동의 모달)
/onboarding               ← 아이 정보 등록

/dashboard                ← 대시보드 홈
  ├── /answer-note        ← 오답노트 (핵심: 부모 입력 → AI 분석)
  ├── /practice           ← 아이연습 3단계
  ├── /bookmarks          ← 복습 목록 + SM-2 오늘 복습 섹션
  ├── /progress           ← 성장 기록
  ├── /settings           ← 설정
  ├── /child              ← 아이 전용 놀이 화면
  ├── /session/new        ← 새 연습 세션
  └── /session/[id]       ← 세션 상세 + 최소대립쌍 변별 훈련

/subscribe                ← 구독 플랜 선택 + TossPayments
/subscribe/success        ← 결제 성공
/terms                    ← 이용약관
/privacy                  ← 개인정보 처리방침
```

---

## 7. 핵심 파일 상세 설명

### `src/lib/jamo-analysis.ts` ⭐
한글 유니코드 분해 엔진. 목표 단어와 아이 발음을 비교해 20개 음운변동 패턴 분류.

```typescript
analyzeError("사과", "따과")
// 반환: {
//   errorType: "경음화",
//   errorCategory: "대치",
//   errorPattern: "ㅅ→ㄸ 대치",
//   confidence: 95,
//   requiresGemini: false,
//   parentHint: "바람이 숨어버렸어요!",
//   targetJamo: "ㅅ"
// }
```

분류하는 20개 패턴:
- **대치:** 경음화, 기음화, 연음화, 마찰음화, 파열음화, 유음화, 비음화, 단순대치
- **탈락:** 초성탈락, 종성탈락, 음절탈락
- **첨가:** 초성첨가, 종성첨가
- **동화:** 순행동화, 역행동화, 상호동화 (→ Gemini 필요)
- **기타:** 복합오류, 패턴미인식, 개별습관

### `src/lib/gemini-client.ts` ⭐
Gemini Flash API 클라이언트. 언어재활사(15년 경력) 시스템 프롬프트 적용.

반환 구조:
```typescript
{
  rootCause: string,       // 원인 설명 (부모 이해 수준)
  trainingStep1: string,   // 조음 감각 깨우기
  trainingStep2: string,   // 소리 느끼기
  trainingStep3: string,   // 음절/단어 연결
  trainingStep4: string,   // 문장과 일상 적용
  recommendedWords: string[], // 유사 패턴 연습 단어
  parentMessage: string,   // 부모님께 응원 메시지
  isIndividualHabit: boolean  // 개별 습관 여부
}
```

### `src/lib/sm2.ts`
SM-2 알고리즘. quality 0~5 입력 → 다음 복습 날짜 계산.

```typescript
calculateNextReview({ reviewCount: 2, interval: 3, easeFactor: 2.5, quality: 5 })
// → { newInterval: 7, nextReviewAt: Date(7일 후), isLearned: false, ... }
```

### `src/lib/word-database.ts` ⭐
681개 단어 DB (2026-04-14 기준). 초등학교 이하 아이 일상 단어 위주.
- 자음별 조직화: ㄹ, ㅅ, ㅈ, ㅊ, ㄱ, ㄴ, ㄷ, ㅂ, ㅁ, ㅎ, ㅌ, ㅍ, 경음, 생활어
- 목표: 2000개까지 확장 예정

---

## 8. UI 디자인 시스템

### 색상 팔레트
```css
--peach:    #FFB38A   /* 메인 브랜드 (버튼, 강조) */
--mint:     #7EDFD0   /* 성공, 완료 */
--lavender: #C4B5FD   /* AI 분석, 원인 설명 */
--yellow:   #FDE68A   /* 부모님께 메시지 */
--text:     #3D3530   /* 기본 텍스트 */
--muted:    #8B7E74   /* 보조 텍스트 */
--bg:       #FFF5EE   /* 배경 */
```

### 공통 컴포넌트
- `BubbleCard` — 둥근 카드 컨테이너 (color: peach/mint/lavender/yellow)
- `BubbleButton` — 버튼 (variant: peach/mint/lavender/white/ghost/gray)
- `PastelBadge` — 작은 레이블 배지 (color: pink/yellow/mint/lavender)
- `SoriMascot` — 마스코트 이미지 컴포넌트
- `LoadingSpinner` — 로딩 스피너

### 폰트
```css
font-family: "Pretendard", sans-serif;
```

---

## 9. 오답노트 → 연습 전체 흐름 (핵심 UX)

```
1. 부모: /dashboard/answer-note 접속
   → 목표 단어 입력 (예: "사과")
   → 아이 발음 입력 (예: "따과")
   → "AI 분석하기" 클릭

2. 분석 결과 표시:
   → 오류 유형: "대치 / ㅅ→ㄸ"
   → parentHint: "사 소리가 따 소리로 나왔어요!"
   → 신뢰도: 95%
   → [Gemini] 원인 + 4단계 훈련법 + 추천 단어 + 부모님께

3. DB 저장:
   → ErrorRecord 생성
   → LocalAnalysis 저장
   → GeminiFeedback 저장 (Gemini 호출 시)
   → WeakPhoneme 자동 집계 (최근 300개 기준)
   → ReviewSchedule 생성 (오늘 첫 복습 예약)

4. 아이연습 (/dashboard/practice):
   → 1단계: 오답 단어 ("사과" 발음 연습, 부모 판정)
   → 2단계: AI 추천 유사 단어 (ㅅ 포함 단어들)
   → 3단계: Gemini 생성 문장 ("사과가 빨개요")
   → ☆ 버튼 → SavedWord 저장

5. 복습 (/dashboard/bookmarks):
   → 오늘 복습할 단어 섹션 (SM-2 스케줄)
   → "잘 했어요 ✅" / "아직 어려워요 💪"
   → 5회 성공 → 🎓 졸업
```

---

## 10. 현재 상태 (2026-04-14)

### 빌드 상태
- `npm run build` ✅ 성공
- 총 32개 페이지 생성
- TypeScript 오류 없음

### 완료된 기능
- [x] 전체 DB 모델 설계
- [x] 한글 자모 분석 엔진 (20개 패턴)
- [x] Gemini Flash API 연동 (4단계 훈련법)
- [x] 모든 API 엔드포인트 (15개)
- [x] 전체 UI 화면 (32개 페이지)
- [x] 망각 곡선 SM-2 복습 시스템
- [x] 가입 시 약관 동의 모달
- [x] TossPayments 구독 결제
- [x] 단어 데이터베이스 681개
- [x] 최소대립쌍 변별 훈련 UI
- [x] 이용약관 + 개인정보보호정책 페이지

### 아직 안 된 것 (우선순위 순)
1. **DB 마이그레이션** — `DATABASE_URL` 설정 + `npx prisma migrate dev --name add_review_schedule`
2. **실제 테스트** — DB 연결 후 전체 흐름 테스트
3. **단어 DB 확장** — 681개 → 2000개 목표
4. **Vercel 배포** — Supabase DB + 환경변수
5. **PWA 설정** — 홈스크린 설치, 오프라인 캐시
6. **반응형 개선** — 태블릿/PC 레이아웃

---

## 11. 개발 시 주의사항

### 코딩 컨벤션
- 서버 컴포넌트 기본, 인터랙션 필요 시 `"use client"` 추가
- API Route는 항상 `auth()` 세션 검증 + 소유권 확인
- Prisma 작업은 `src/lib/prisma.ts`의 공유 인스턴스 사용 (`new PrismaClient()` 직접 사용 금지)

### DB 마이그레이션 규칙
- 스키마 변경 후 반드시 `npx prisma generate`
- 실제 DB 있을 때: `npx prisma migrate dev --name 변경내용`
- 현재 미적용된 마이그레이션: `ReviewSchedule` 모델 (2026-04-14 추가)

### AI 호출 규칙
- 동화 오류, 복합 오류, 패턴 미인식만 Gemini 호출 (비용 절감)
- `requiresGemini: true`인 경우만 Gemini 호출
- Gemini 실패 시 → 개별습관으로 분류, 로컬 분석 결과만 반환

### 보안
- 모든 API: 로그인 확인 + 본인 소유 데이터 확인
- 아이 데이터는 반드시 `child.userId === session.user.id` 검증

---

## 12. 로컬 개발 시작 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 편집: DATABASE_URL, GEMINI_API_KEY 등 입력

# 3. DB 세팅 (PostgreSQL 연결 후)
npx prisma migrate dev --name init
npx prisma generate

# 4. 개발 서버
npm run dev
# → http://localhost:3000

# 5. 빌드 확인
npm run build
```

---

## 13. 앞으로의 방향 (중장기)

### 단기 (다음 1~2개월)
- DB 연결 + 실제 테스트
- Vercel 배포
- PWA 설정

### 중기 (3~6개월)
- 단어 DB 2000개 달성
- 반응형 개선 (태블릿/PC)
- 발음 녹음 기능 (마이크 → Gemini 음성 분석)

### 장기 (6개월+)
- Expo (React Native)로 iOS/Android 앱 이식
  - 백엔드 API 그대로 재사용
  - 복습 알림 푸시 알림
  - 마이크 발음 녹음
- 언어재활사 B2B 플랜 (다수 아이 관리)
