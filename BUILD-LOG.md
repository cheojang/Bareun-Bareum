# 빌드 진행 로그

**프로젝트:** 바른발음 (SORI) — AI 기반 아동 조음 홈케어 SaaS
**GitHub:** cheojang/SORI
**브랜치:** claude/speech-therapy-saas-design-Jns4A
**최종 점검:** 2026-05-25 (전수 감사 후 재작성)

---

## 📊 현재 규모 (실측)

| 항목 | 수치 |
|------|------|
| **단어 DB** | **679개** (ㄹ 162, ㅅ 99, ㅈ 61 등 음소별 분포) |
| **최소대립쌍** | **31쌍** (조음 위치/방법/평음·경음·격음 대조) |
| **DB 모델** | **26개** (User, Child, Center, Therapist, Homework 등) |
| **페이지 + API** | **73개** 라우트 |
| **유틸 라이브러리** | **22개** (jamo, gemini, tts, sm2, kst 등) |
| **마이그레이션** | **5개** 적용 완료 + `gender` 필드 db push |

---

## ✅ Phase 1 — 기초 (2026-04-12)

- Prisma 데이터 모델 (User, Child, ErrorRecord, LocalAnalysis, GeminiFeedback, WeakPhoneme, SavedWord)
- 한글 자모 분해 엔진 (`jamo-analysis.ts`) — 초성/중성/종성 분해, 음운변동 20개 패턴
- Gemini Flash 연동 (`gemini-client.ts`) — 언어재활사 페르소나, 4단계 훈련법, parentMessage
- 핵심 API: `/api/error-analysis`, `/api/weak-phonemes`, `/api/saved-words`, `/api/practice-sentences`, `/api/recommendations`, `/api/billing/*`

## ✅ Phase 2 — 화면 (2026-04-13)

- 대시보드, 오답노트, 아이연습 3단계, 복습목록, 성장기록, 설정
- 랜딩 페이지, 구독/결제 (TossPayments)
- 빌드 성공: 25개 페이지 생성

## ✅ Phase 3 — 기능 확장 (2026-04-13 ~ 2026-05-10)

**학습 효과 (SLP 기반)**
- 반복 카운터 (음소당 50회 목표 — 운동학습 원리)
- 청각 폭격 (마운트 직후 단어 일괄 노출)
- 부모 코칭 카드 (`/api/coaching-cards`)
- 최소대립쌍 훈련 (`/dashboard/practice/minimal-pairs`) — 31쌍
- SM-2 망각곡선 복습 (`sm2.ts`, ReviewSchedule 모델)
- PhonemeTemplate 시딩 (4단계 훈련법 DB)
- 글로벌 WordPairCache (Gemini 호출 80%+ 절감)
- 종합 분석 (`/dashboard/answer-note/comprehensive`) — 약점 음소 AI 가이드

**홈/대시보드**
- 활동 캘린더 (홈화면)
- 미션 카드 제거 → 더 깔끔한 UX
- 활동 통계 카드

**회원/계정**
- 이메일 회원가입/로그인 + 이메일 인증(OTP) (`/api/auth/send-verification`)
- 비회원 체험 모드 (GuestUsage 모델, 월 2회)
- 회원 탈퇴 (`/api/auth/delete-account`)
- 아이 사진 등록 (Base64 → Supabase Storage URL로 전환)
- 아이 성별 필드 (남아/여아 토글)

**결제/구독**
- AI 분석 월간 제한 (free 10회, guest 2회 — `usage-limit.ts`)
- 가격 변경 정책 적용
- TossPayments 정식 연동 (`/api/billing/confirm`, `/api/billing/webhook`)

## ✅ Phase 4 — B2B 센터 시스템 (2026-04-21~)

언어치료센터-부모-아이 연결 구조 추가

**DB 모델 추가:** Center, Therapist, CenterChild, TherapistChild, Homework, TherapyNote, Message

**언어치료센터 화면 (`/center`)**
- `/center` 메인
- `/center/children` — 담당 아이 목록
- `/center/homework` — 숙제 발행/관리
- `/center/notes` — 치료 노트

**부모 측 화면 (`/dashboard`)**
- `/dashboard/homework` — 받은 숙제
- `/dashboard/therapy-notes` — 치료 노트 열람
- `/dashboard/child` — 아이 상세

**API**
- `/api/center/*` — 5개 라우트
- `/api/parent/*` — 3개 라우트 (children, homework, notes)
- `/api/therapist/join` — 치료사 가입

> ⚠️ 상태: **현재 비활성화** (UI 진입 경로 없음) — 2단계 정식 출시 예정

## ✅ Phase 5 — 관리자 시스템 (2026-05-14)

**`/admin` 대시보드**
- KPI 카드: 총 회원, 프리미엄 구독, 활성 아이(7일), 무료 회원
- AI 분석 현황: 총 오답, Gemini 호출수, 캐시 히트율
- 신규 가입 스파크라인 (30일)
- 아이 연령대/성별 분포
- 시간대별 / 요일별 사용량 차트
- Top 10: 오류 카테고리, 오류 유형, 약점 음소, 캐시 단어쌍
- 시딩 진행 상태 + 원클릭 실행 버튼
- 공지사항 관리 (`/admin/announcements`)
- 센터 관리 (`/admin/centers`)

**권한:** `ADMIN_EMAILS` 환경변수에 등록된 이메일만

**API**
- `/api/admin/stats` — 통계 집계 (병렬 쿼리, KST)
- `/api/admin/seed-templates` — PhonemeTemplate 시딩
- `/api/admin/seed-word-pairs` — WordPairCache 시딩 (120+)
- `/api/admin/bulk-seed` — 대량 시딩 통합

## ✅ Phase 6 — Google TTS + UX 대개선 (2026-05-25)

### 🎙️ Google Cloud TTS 도입
- `src/lib/google-tts.ts` — Neural2-A 한국어 여성 (속도 0.7, 단어 간 1초)
- `src/app/api/tts/route.ts` — `/api/tts?word=X` + Supabase Storage 캐싱
- `src/lib/useTTS.ts` — 클라이언트 훅 (Google 우선, speechSynthesis 폴백)
- 캐시 버킷: `tts-cache` (Public) — 같은 단어 영구 무료
- 월 100만 자 무료 한도 → 일반 사용량의 1% 미만 사용

### 🔊 음성 통합
- 분석단어 훈련/복습하기: 단어 자동재생 + 🔊 다시 듣기
- 청각 폭격: ▶️ 듣기 시작 버튼 (자동재생 차단 우회)
- 3단계 문장: TTS 제거 + "📖 부모님이 읽어주세요" 안내

### 🛠️ 주요 버그 수정
- 첫 단어 소리 안 남: `useEffect deps`에 `phase` 추가
- React strict mode 이중 마운트: `lastPlayedRef` → `cancelled` 플래그
- Chrome autoplay 차단: 명시적 시작 버튼
- `gemini-2.0-flash` deprecated: 2.5 시리즈로 폴백 갱신

### 📝 문장 생성 강화
- 프롬프트 개선: 좋은/나쁜 예시, 조사/서술어 필수
- `isValidSentence`: 길이/서술어/조사/단어포함 검증
- 검증 실패 시 폴백 템플릿 보충

### 🎨 UX 통일
- 진행바 UX: 🏁 진도 + 🔁 음소 누적 (의미 명확화)
- 복습 중복 제거: 같은 단어 한 번만
- 헤더-탭 sticky 겹침 해소 (`top-[68px] md:top-[60px]`)
- 모든 액션 버튼 `BubbleButton size="lg"` 통일
- 색만 다르게: 주황=메인, 회색=보조

### 🛡️ 관리자 접근성
- 설정 페이지에 "🛡️ 관리자 대시보드" 카드 (관리자에게만 노출)

---

## 📁 핵심 파일 구조

```
src/
├── app/
│   ├── (auth)/                  ← 로그인/회원가입/온보딩
│   ├── page.tsx                 ← 랜딩
│   ├── admin/                   ← 관리자 대시보드 ⭐
│   │   ├── page.tsx             ← KPI/차트/Top 10
│   │   ├── announcements/       ← 공지 관리
│   │   └── centers/             ← 센터 관리
│   ├── dashboard/
│   │   ├── page.tsx             ← 홈 (활동 캘린더)
│   │   ├── answer-note/         ← 오답노트 (발음 분석)
│   │   │   └── comprehensive/   ← 종합 분석 (AI 가이드)
│   │   ├── practice/            ← 분석단어 훈련 ⭐
│   │   │   ├── PracticeClient.tsx  ← 청각폭격 + 메인 (TTS 통합)
│   │   │   ├── review/          ← 복습하기 (SM-2 망각곡선)
│   │   │   └── minimal-pairs/   ← 최소대립쌍
│   │   ├── bookmarks/           ← 복습 목록
│   │   ├── progress/            ← 성장 기록
│   │   ├── settings/            ← 설정 (관리자 카드 포함)
│   │   ├── session/[id]/        ← 세션 상세
│   │   ├── homework/            ← B2B 숙제 (현재 비활성)
│   │   ├── therapy-notes/       ← B2B 치료 노트 (현재 비활성)
│   │   └── child/               ← 아이 상세
│   ├── center/                  ← B2B 센터 측 화면 (비활성)
│   ├── therapist/join/          ← 치료사 가입
│   ├── api/                     ← 50+ API 라우트
│   ├── subscribe/               ← 구독 + 결제 성공
│   ├── privacy/                 ← 개인정보처리방침
│   └── terms/                   ← 이용약관
├── lib/                         ← 22개 유틸 라이브러리
│   ├── jamo-analysis.ts         ← 한글 자모 분석 ⭐
│   ├── word-database.ts         ← 단어 DB 679개 ⭐
│   ├── google-tts.ts            ← Google TTS ⭐ NEW
│   ├── useTTS.ts                ← 클라이언트 음성 훅 ⭐ NEW
│   ├── gemini-client.ts         ← Gemini 클라이언트 + 폴백
│   ├── sm2.ts                   ← SM-2 망각곡선
│   ├── recommendations.ts       ← 단어 추천 (인덱싱)
│   ├── usage-limit.ts           ← 월간 한도 (free/guest)
│   ├── supabase-admin.ts        ← Storage (사진 + 음성)
│   ├── articulation-analysis.ts ← 조음 분석 코어
│   ├── korean-phonetics.ts      ← 한국어 음성학
│   ├── kst-utils.ts             ← KST 시간 유틸
│   ├── lru-cache.ts             ← LRU 캐시
│   ├── rate-limit.ts            ← 요청 속도 제한
│   ├── email.ts                 ← 이메일 발송 (Resend)
│   ├── auth.ts, api-auth.ts, admin-auth.ts, therapist-auth.ts
│   ├── toss-payments.ts         ← TossPayments
│   └── prisma.ts                ← DB 연결
└── components/
    ├── auth/, billing/, child/, dashboard/, progress/, settings/
    └── ui/                      ← BubbleCard, BubbleButton, PastelBadge
```

---

## 🗂️ DB 모델 (26개) — 영역별

**핵심 학습**
- User, Child, PracticeSession, WordRecord
- ErrorRecord, LocalAnalysis, GeminiFeedback
- WeakPhoneme, ReviewSchedule
- SavedWord, PhonemeTemplate
- WordPairCache (글로벌 캐시)

**인증/계정**
- Account, Session, VerificationToken
- GuestUsage (비회원 사용량)

**결제**
- Subscription

**B2B 센터** (현재 UI 비활성)
- Center, Therapist, CenterChild, TherapistChild
- Homework, TherapyNote, Message

**공지**
- Announcement, AnnouncementRead

---

## 🌱 단어 DB 음소별 분포

| 음소 | 단어 수 | 발달 시기 |
|------|--------|----------|
| **ㄹ** | 162개 | 5-6세 (가장 늦게 완성) |
| **ㅅ** | 99개 | 4-5세 |
| **ㅈ** | 61개 | 4-5세 |
| 기타 (ㄱ, ㄴ, ㄷ, ㅂ, ㅁ, ㅎ 등) | 357개 | 2-4세 |
| **합계** | **679개** | |

**최소대립쌍:** 31쌍 (평음↔경음, 평음↔격음, 조음위치, 받침 대조)

---

## ✅ Phase 3 — 대량 시딩 시스템 (2026-04 ~ 05)

**단어쌍 + 발음교정 DB 대량 시딩**
- [x] Python 음운규칙 기반 무비용 시딩 파이프라인 구축
- [x] `scripts/generate_seed_v2.py` — Supabase Management API로 직접 적재
- [x] `scripts/phoneme-combinations.json` — **297개** 음소 오류 패턴 정의
- [x] `scripts/training_templates.py` — SLP 수준 4단계 훈련 템플릿
- 적재 결과: **PhonemeTemplate 297개 + WordPairCache 5,842개**

**음운 패턴 추가**
- [x] ㅅ→ㄸ 경음파열음화 (사과 → 따과)
- [x] ㅊ→ㅌ 기음파열음화 (김치 → 김티)

**단어 DB**
- [x] 311개 → **681개**로 확장

---

## ✅ Phase 4 — 보안·효율성·데이터 정합성 전면 개선 (2026-05)

**보안 강화**
- [x] AUTH_SECRET 플레이스홀더 → 실제 시크릿 교체
- [x] TTS API 인증 + 레이트리밋 (회원 30/분, 게스트 IP 기반)
- [x] 이메일 인증 throttle (IP 3/분, 이메일 5/시간) + 이메일 열거 공격 방지
- [x] 게스트 세션 고유 UUID 격리 (`guest:${uuid}`) — 데이터 혼선 방지
- [x] Supabase RLS 9개 테이블 적용 (`auth.uid()` 기반 행 단위 보안)

**효율성**
- [x] `recalculateWeakPhonemes` 직렬 upsert → `$transaction` 병렬화
- [x] fire-and-forget → `after()` 백그라운드 보장 실행 (서버리스 대응)
- [x] 죽은 쿼리/함수 제거, `deleteMany+create` → `upsert` 전환
- [x] `recommendations.ts` 모듈 로드 시 Map 인덱스 (O(n)→O(1))
- [x] `callWithFallback<T>` 헬퍼로 Gemini 503 폴백 로직 6곳 통합

**데이터 정합성**
- [x] 🚨 jamo-analysis 중성(JUNGSEONG) 치명 버그 수정 — ㅛ/ㅜ/ㅠ/ㅡ/ㅣ 누락 (우유·기린·다리 등 오분해)
- [x] jamo 테이블을 단일 소스로 통합 (korean-phonetics 중복 제거)
- [x] phoneme-combinations 플레이스홀더 데이터 8건 수정 (target==child 오류)
- [x] 테스트용 임시 파일 6개 정리

---

## 🔴 다음 세션에서 할 일

### ✅ 완료 — 단어 데이터베이스 확장
- [x] 681개 → 1000개 → 2000개 달성
- [x] 25+ 카테고리 추가 (한국 전통문화, 음식, 동물, 스포츠, 기술, 우주, 공룡 등)

### ⚠️ 사용자 직접 처리 필요 — DB 비밀번호 로테이션
- [ ] Supabase 대시보드에서 DB 비밀번호 교체 (기존 값이 git 이력에 노출됨)
- [ ] 교체 후 `.env.local`의 `DATABASE_URL` 갱신

### 우선순위 1 — 실제 사용자 테스트
- [ ] 부모-아이 시나리오 5분 시연
- [ ] 음성 품질, 속도 만족도
- [ ] 문장 생성 품질 (10개 표본 평가)

### 우선순위 2 — Vercel 배포
- [ ] 환경변수 Vercel에 등록 (DATABASE_URL, AUTH_SECRET, GEMINI_API_KEY, SUPABASE_*, GOOGLE_TTS_API_KEY, ADMIN_EMAILS, GOOGLE_*, KAKAO_*)
- [ ] NEXTAUTH_URL 프로덕션 도메인으로
- [ ] OAuth 콜백 URL 등록
- [ ] 도메인 연결

### 우선순위 3 — PWA
- [ ] `next-pwa` 설치
- [ ] manifest.json (이름, 아이콘, 테마 색)
- [ ] 스플래시/홈스크린 아이콘
- [ ] iOS Safari 홈 추가 + Android 설치 배너
- [ ] Service Worker 오프라인 캐시

### 우선순위 4 — 반응형 디자인 마무리
- [ ] PC (1200px+) 사이드바 + 콘텐츠 2단 (일부 구현됨)
- [ ] 태블릿 (768px) 2컬럼

### 우선순위 5 — 단어 DB 확장 (저우선)
- [ ] 679 → 1000 (음소별 균형 보완)
- [ ] 또는 Gemini 자동 생성 + 검수 파이프라인

### 우선순위 6 — B2B 센터 기능 활성화
- [ ] DB/API/페이지는 다 만들어져 있음
- [ ] 진입 경로 노출 + 흐름 검증

---

## 🔧 기술 이슈 & 해결 이력

| 이슈 | 해결 방법 |
|------|-----------|
| @google/generative-ai 미설치 | `npm install @google/generative-ai` |
| @supabase/supabase-js 미설치 | `npm install @supabase/supabase-js` |
| Prisma 클라이언트 미생성 | `npx prisma generate` |
| Prisma P3018 (기존 테이블 충돌) | `prisma migrate resolve --applied <name>` |
| Supabase 무료 일시중지 | 대시보드에서 Resume |
| Supabase 신형 sb_secret_ 키 | supabase-js v2.105+ 자연 호환 |
| Chrome autoplay 차단 | ▶️ 시작 버튼 + setTimeout 250ms |
| React strict mode 이중 마운트 | `cancelled` 플래그 패턴, ref dedupe 제거 |
| 청각폭격→메인 첫 단어 안 들림 | `useEffect deps`에 `phase` 추가 |
| gemini-2.0-flash 404 | 2.5 시리즈로 폴백 갱신 |
| 헤더와 sticky 탭 겹침 | `top-[68px] md:top-[60px]` 오프셋 |
| 복습 목록 같은 단어 중복 | `targetWord` 기준 Set dedupe |
| 문장 조사/서술어 누락 | `isValidSentence` 검증 + 프롬프트 강화 |
| ADMIN_EMAILS 미설정 | `.env.local` 추가 + 설정 카드 노출 |
| 자모 분석 ㅇ 초성 오판정 | `choseong === 'ㅇ'` → 초성탈락 특수처리 |
| 아이 발음 자동 판정 불가 | 부모가 "잘 됐어요 ✓" 버튼으로 직접 판정 |

---

## ⚙️ 핵심 환경변수 (.env.local)

```bash
# 필수
DATABASE_URL=                    # Supabase PostgreSQL
AUTH_SECRET=                     # NextAuth 비밀키
NEXTAUTH_URL=http://localhost:3000

# AI / 음성
GEMINI_API_KEY=                  # Gemini API
GOOGLE_TTS_API_KEY=              # Google Cloud TTS

# Storage
SUPABASE_URL=                    # Supabase 프로젝트 URL
SUPABASE_SERVICE_ROLE_KEY=       # Storage용 service_role

# OAuth (선택)
GOOGLE_CLIENT_ID= / GOOGLE_CLIENT_SECRET=
KAKAO_CLIENT_ID= / KAKAO_CLIENT_SECRET=

# 결제 (선택)
TOSS_SECRET_KEY=
NEXT_PUBLIC_TOSS_CLIENT_KEY=

# 이메일 (선택, OTP용)
RESEND_API_KEY=
RESEND_FROM=

# 관리자
ADMIN_EMAILS=dev@test.com        # 콤마 구분

# 개발 전용
ALLOW_DEV_LOGIN=1                # 개발자 로그인 활성화
```

---

**마지막 수정:** 2026-06-08 | 단어 2000개 | 음소 패턴 297개 | 하단 내비 줄바꿈 수정 | DB 쿼리 병렬화 | loading.tsx 스켈레톤 추가 ✓
