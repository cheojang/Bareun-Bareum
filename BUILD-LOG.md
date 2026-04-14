# 빌드 진행 로그

**프로젝트:** 소리 (SORI) — AI 기반 아동 조음 홈케어 SaaS  
**GitHub:** cheojang/SORI  
**브랜치:** claude/speech-therapy-saas-design-Jns4A

---

## ✅ Phase 1 완료 (2026-04-12)

**Prisma 데이터 모델**
- [x] User, Child, ErrorRecord, LocalAnalysis, GeminiFeedback, WeakPhoneme, SavedWord
- 파일: `prisma/schema.prisma`

**로컬 자모 분해 엔진**
- [x] 한글 유니코드 분해 (초성/중성/종성)
- [x] 음운변동 20개 패턴 분류 (대치/탈락/첨가/동화)
- [x] parentHint, description, errorCategory 필드 추가
- 파일: `src/lib/jamo-analysis.ts`

**Gemini Flash API 연동**
- [x] 언어재활사 시스템 프롬프트 적용 (15년 경력 페르소나)
- [x] 4단계 훈련법 (조음감각/소리느끼기/연결하기/일상적용)
- [x] 부모님께 응원 메시지 (parentMessage) 생성
- 파일: `src/lib/gemini-client.ts`

**API 엔드포인트 전체**
- [x] POST `/api/error-analysis` — 오답 분석 + WeakPhoneme 자동 집계
- [x] GET `/api/weak-phonemes` — 누적 약점 음소 조회
- [x] POST `/api/saved-words` / GET — 복습 단어 저장/조회
- [x] POST `/api/practice-sentences` — Gemini 문장 생성 (3단계용)
- [x] GET `/api/recommendations` — 단어 추천
- [x] 결제 관련: `/api/billing/*`

---

## ✅ Phase 2 완료 (2026-04-13)

**대시보드 홈 (`/dashboard`)**
- [x] 마스코트 레벨 표시
- [x] 약점 음소 시각화 (진행 바 + 색상 레벨)
- [x] 이번 주 연습 현황
- [x] 형제자매 비교 카드 (다자녀 지원)
- 파일: `src/app/dashboard/page.tsx`

**오답노트 (`/dashboard/answer-note`)**
- [x] 목표 단어 / 아이 발음 입력 폼
- [x] AI 분석 결과 카드 (오류 유형, 원인, 4단계 훈련법)
- [x] 부모님 힌트 (parentHint) 표시
- [x] 추천 단어 + "부모님께" 응원 카드
- [x] "아이연습 시작하기" 버튼 → `/dashboard/practice`
- 파일: `src/app/dashboard/answer-note/AnswerNoteClient.tsx`

**아이연습 3단계 (`/dashboard/practice`)**
- [x] 1단계: 오답 단어 (부모가 "잘 됐어요 ✓" 판정)
- [x] 2단계: AI 추천 유사 패턴 단어
- [x] 3단계: 연습한 단어 포함 문장 (Gemini 생성)
- [x] ☆ 버튼 → 복습 목록에 저장 (SavedWord)
- [x] 단계 전환 인트로 배너, 진행 바, ✓ 완료 도트
- 파일: `src/app/dashboard/practice/PracticeClient.tsx`

**복습 목록 (`/dashboard/bookmarks`)**
- [x] SavedWord 목록 (저장한 복습 단어)
- [x] 최근 오답 5개 빠른 참고
- 파일: `src/app/dashboard/bookmarks/page.tsx`

**성장 기록 (`/dashboard/progress`)**
- [x] WeakPhoneme 레벨별 시각화 (집중교정/꾸준히/관찰중/정상)
- [x] 통계 4개 (총 오답, 약점 음소, 저장 단어, 연습 일수)
- 파일: `src/app/dashboard/progress/page.tsx`

**설정 (`/dashboard/settings`)**
- [x] 프로필, 구독 상태, 아이 목록, 로그아웃
- 파일: `src/app/dashboard/settings/page.tsx`

**구독 (`/subscribe`)**
- [x] 무료/프리미엄 플랜 카드
- [x] TossPayments 버튼 연동
- [x] 결제 성공 페이지 (`/subscribe/success`)
- 파일: `src/app/subscribe/page.tsx`

**랜딩 페이지 (`/`)**
- [x] 마스코트 애니메이션
- [x] 기능 소개 (3개 카드)
- [x] 가격 (월 9,900원)
- 파일: `src/app/page.tsx`

**빌드 검증 (2026-04-13)**
- [x] `@google/generative-ai` 패키지 설치
- [x] `npx prisma generate` 실행 (클라이언트 생성)
- [x] TypeScript 컴파일 오류 전체 해결
- [x] `npm run build` 성공 — **25개 페이지 전부 생성**

---

## ✅ 단어 데이터베이스 확장 (2026-04-13)

**`src/lib/word-database.ts`**
- [x] 57개 → **311개**로 확장 (약 5.5배)
- [x] 초등학교 이하 아이 일상 단어 위주
- [x] 자음별 조직화: ㄹ(50), ㅅ(30), ㅈ(25), ㅊ(17), ㄱ(23), ㄴ(18), ㄷ(17), ㅂ(18), ㅁ(18), ㅎ(15), ㅌ(13), ㅍ(13), 경음(17), 생활어(38)
- [x] MINIMAL_PAIRS 8쌍 → 16쌍 확장
- [x] 각 단어: 이모지, 예시 문장, 의성어/의태어 포함

---

## 🔴 다음 세션에서 할 일

### 우선순위 1 — 단어 데이터베이스 계속 확장
- [ ] 311개 → 600개 (ㄹ/ㅅ/ㅈ 계열 심화)
- [ ] 600개 → 1000개
- [ ] 1000개 → 2000개 (목표)
- 방법: `src/lib/word-database.ts` 배열에 계속 추가

### 우선순위 2 — DB 마이그레이션 (로컬 환경에서 실행)
- [ ] `.env.local` 파일에 `DATABASE_URL` 설정
- [ ] `npx prisma migrate dev --name add_practice_improvements`
- [ ] 변경 내용: `SavedWord.@@unique([childId, word])`, `GeminiFeedback.parentMessage`
- DB 옵션: 로컬 PostgreSQL 또는 Supabase 무료 플랜

### 우선순위 3 — 실제 테스트
- [ ] DB 연결 후 오답 입력 → 분석 → 저장 전체 흐름 테스트
- [ ] Gemini API 키 설정 후 AI 분석 테스트
- [ ] 아이연습 3단계 실제 동작 확인

### 우선순위 4 — 배포 준비
- [ ] Vercel 배포 (DB는 Supabase 권장)
- [ ] 환경변수 설정 (DATABASE_URL, GEMINI_API_KEY, AUTH_SECRET 등)

### 우선순위 5 — PWA 설정 (모바일 앱처럼 설치 가능하게)
- [ ] `next-pwa` 패키지 설치 및 설정
- [ ] `manifest.json` 작성 (앱 이름, 아이콘, 테마 색상)
- [ ] 스플래시 화면 / 홈스크린 아이콘 이미지 준비
- [ ] iOS Safari "홈 화면에 추가" + Android Chrome 설치 배너 동작 확인
- [ ] 오프라인 캐시 전략 설정 (Service Worker)
- 목적: App Store 없이 스마트폰에 앱처럼 설치, 빠른 로딩, 향후 Expo 전환 전 단계

### 우선순위 6 — 반응형 디자인 개선 (태블릿 / PC 대응)
- [ ] 현재 `max-w-lg` 고정 레이아웃 → 브레이크포인트별 대응
- [ ] PC (1200px+): 사이드바 + 메인 콘텐츠 2단 레이아웃
- [ ] 태블릿 (768px): 상단 탭 + 2컬럼 카드 레이아웃
- [ ] 모바일: 현재 레이아웃 유지
- 목적: 스마트폰 외 태블릿·노트북·PC에서도 자연스러운 UI 제공

---

## 기술 이슈 & 해결 이력

| 이슈 | 해결 방법 |
|------|-----------|
| @google/generative-ai 미설치 | `npm install @google/generative-ai` |
| Prisma 클라이언트 미생성 | `npx prisma generate` |
| PrismaClient 직접 import 타입 오류 | 공유 `prisma` 인스턴스 (`@/lib/prisma`) 사용으로 교체 |
| implicit any TypeScript 오류 (다수) | 콜백 매개변수에 명시적 타입 추가 |
| 자모 분석 ㅇ 초성 오판정 | child.choseong === 'ㅇ' → 초성탈락 특수처리 |
| 아이 발음 자동 판정 불가 | 부모가 직접 "잘 됐어요 ✓" 버튼으로 판정하는 방식으로 변경 |

---

## 파일 구조 핵심

```
src/
├── app/
│   ├── page.tsx                    ← 랜딩 페이지
│   ├── dashboard/
│   │   ├── page.tsx                ← 대시보드 홈
│   │   ├── answer-note/            ← 오답노트
│   │   ├── practice/               ← 아이연습 3단계
│   │   ├── bookmarks/              ← 복습 목록
│   │   ├── progress/               ← 성장 기록
│   │   └── settings/               ← 설정
│   ├── api/
│   │   ├── error-analysis/         ← 핵심 분석 API
│   │   ├── saved-words/            ← 복습 단어 저장
│   │   ├── practice-sentences/     ← 문장 생성 (Gemini)
│   │   └── weak-phonemes/          ← 약점 음소
│   └── subscribe/                  ← 구독 + TossPayments
├── lib/
│   ├── jamo-analysis.ts            ← 한글 자모 분석 엔진 ⭐
│   ├── gemini-client.ts            ← Gemini AI 클라이언트 ⭐
│   ├── word-database.ts            ← 단어 DB (311개) ⭐
│   └── prisma.ts                   ← DB 연결
└── components/
    └── ui/                         ← BubbleCard, PastelBadge 등
```

---

**마지막 수정:** 2026-04-13 | 빌드 성공 ✓ | 단어 311개 | 25개 페이지 생성 완료
