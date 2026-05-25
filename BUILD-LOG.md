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

## ✅ Phase 3+ 완료 (2026-04-13 ~ 2026-05-25)

이후 점진적으로 추가된 주요 기능들:

**기능 확장**
- [x] 홈화면 활동 캘린더 (미션 카드 제거)
- [x] 반복 카운터, 청각 폭격, 부모 코칭 (SLP 기반 3종)
- [x] 최소대립쌍 훈련 진입 경로
- [x] AI 분석 월간 제한 + 가격 정책 적용
- [x] 아이 사진 등록 (Base64 → Supabase Storage URL 전환)
- [x] 비회원 체험 모드
- [x] 이메일 회원가입/로그인 + 이메일 인증(OTP) + 회원 탈퇴
- [x] 글로벌 WordPairCache (Gemini 중복 호출 방지)
- [x] PhonemeTemplate 기반 시딩 어드민 엔드포인트
- [x] **관리자 통계 대시보드** (KPI/차트/Top 10, `/admin`)
- [x] **아이 성별 필드** + 어드민 성별 분포

**런칭 준비**
- [x] Vercel 배포 준비 (prisma schema url, vercel.json, .env.example)
- [x] 바른발음 런칭 마케팅 계획서
- [x] Flutter 모바일 앱 확장 로드맵 문서화

---

## ✅ Phase 4 — Google TTS + UX 대대적 개선 (2026-05-25)

### 🎙️ Google Cloud TTS 도입
- [x] `src/lib/google-tts.ts` — Google Cloud TTS API 호출 (Neural2-A 한국어 여성)
- [x] `src/app/api/tts/route.ts` — `/api/tts?word=X` 엔드포인트 + Supabase Storage 캐싱
- [x] `src/lib/useTTS.ts` — 클라이언트 훅 (Google 우선, speechSynthesis 폴백)
- [x] 같은 단어는 영구 캐시 → 매번 무료 재생 (월 100만 자 무료 한도)
- [x] 속도 0.7, 단어 간 간격 1000ms (아이 학습 최적화)
- [x] 음성 캐시 버킷: `tts-cache` (Public, 50MB+ 충분)

### 🔊 음성 재생 통합
- [x] **분석단어 훈련** — 단어 자동재생 + 🔊 다시 듣기 버튼
- [x] **복습하기** — 단어 자동재생 + 🔊 다시 듣기 버튼
- [x] **청각 폭격** — "▶️ 듣기 시작" 버튼 (자동재생 차단 우회)
- [x] **3단계 문장** — TTS 제거 + "📖 부모님이 읽어주세요" 안내

### 🛠️ 버그 수정
- [x] 분석단어 훈련 첫 단어 소리 안 나는 버그 (phase deps 누락)
- [x] 청각 폭격 자동재생 차단 (Chrome autoplay policy)
- [x] React 개발모드 이중 마운트로 인한 첫 재생 차단 (lastPlayedRef 제거)
- [x] gemini-2.0-flash deprecated 대응 → 2.5 시리즈로 폴백 갱신

### 📝 문장 생성 강화
- [x] 프롬프트 개선: 좋은/나쁜 예시 명시, 조사/서술어 필수
- [x] `isValidSentence` 검증 함수 — 길이/서술어/조사/단어 포함 체크
- [x] 검증 실패 문장은 폴백 템플릿으로 보충

### 🎨 UX 개선
- [x] 진행바 UX: 🏁 "오늘의 진도" + 🔁 "발음 연습 횟수" (부연 설명 포함)
- [x] 자동차 트랙에 진행률 % 표시
- [x] 복습 중복 제거: 같은 단어 한 번만 (bookmarks, review 모두)
- [x] 연습 화면 sticky 탭 위치 조정 (헤더와 겹침 해소)
- [x] 모든 액션 버튼 `BubbleButton size="lg"` 로 일관성 통일
- [x] 청각 폭격: ▶️ 듣기 시작 / 건너뛰기 / 🔊 다시 듣기 / 연습 시작하기 — 색만 다르게 (주황=메인, 회색=보조)

### 🛡️ 관리자 접근성
- [x] 설정 페이지에 "🛡️ 관리자 대시보드" 카드 추가 (관리자 이메일만 노출)
- [x] `.env.local`에 `ADMIN_EMAILS="dev@test.com"` 설정

---

## 🔴 다음 세션에서 할 일

### 우선순위 1 — 단어 데이터베이스 계속 확장
- [ ] 311개 → 600개 (ㄹ/ㅅ/ㅈ 계열 심화)
- [ ] 600개 → 1000개
- [ ] 1000개 → 2000개 (목표)

### 우선순위 2 — 다른 화면에도 TTS 적용 검토
- [ ] 오답노트 분석 결과 카드 단어
- [ ] 복습목록의 저장한 단어들
- [ ] 최소대립쌍 훈련 단어

### 우선순위 3 — 실제 사용자 테스트
- [ ] 부모-아이 실사용 (5분 시연)
- [ ] 음성 품질, 속도 만족도 체크
- [ ] 문장 생성 품질 평가 (10개 표본)

### 우선순위 4 — Vercel 배포
- [ ] 환경변수 전부 Vercel 대시보드에 등록
  - DATABASE_URL, AUTH_SECRET, GEMINI_API_KEY
  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  - GOOGLE_TTS_API_KEY, ADMIN_EMAILS
  - GOOGLE_CLIENT_ID/SECRET, KAKAO_CLIENT_ID/SECRET
- [ ] NEXTAUTH_URL을 프로덕션 도메인으로 변경
- [ ] OAuth 콜백 URL 등록 (Google, Kakao)
- [ ] 도메인 연결

### 우선순위 5 — PWA 설정
- [ ] `next-pwa` 패키지 설치
- [ ] `manifest.json` (앱 이름, 아이콘, 테마 색)
- [ ] 스플래시 / 홈스크린 아이콘
- [ ] iOS Safari "홈 화면에 추가" + Android Chrome 설치 배너
- [ ] Service Worker 오프라인 캐시

### 우선순위 6 — 반응형 디자인 개선
- [ ] PC (1200px+): 사이드바 + 콘텐츠 2단 (현재 일부 구현됨)
- [ ] 태블릿 (768px): 상단 탭 + 2컬럼 카드
- [ ] 모바일: 현재 유지

---

## 기술 이슈 & 해결 이력

| 이슈 | 해결 방법 |
|------|-----------|
| @google/generative-ai 미설치 | `npm install @google/generative-ai` |
| @supabase/supabase-js 미설치 | `npm install @supabase/supabase-js` |
| Prisma 클라이언트 미생성 | `npx prisma generate` |
| Prisma 마이그레이션 P3018 (기존 테이블 충돌) | `prisma migrate resolve --applied <name>` 로 표시 후 `migrate deploy` |
| Supabase 무료 플랜 자동 일시중지 | 대시보드에서 "Resume project" 클릭 |
| Supabase 신형 sb_secret_ 키 (legacy service_role 대체) | supabase-js v2.105+ 에서 자연 호환 |
| Google TTS 자동재생 차단 (Chrome autoplay policy) | "▶️ 듣기 시작" 명시적 클릭 + setTimeout 250ms 단축 |
| React strict mode 이중 마운트로 첫 재생 차단 | `lastPlayedRef` 제거 + `cancelled` 플래그 패턴 |
| 청각폭격 → 메인 연습 첫 단어 안 들림 | `useEffect deps`에 `phase` 추가 |
| gemini-2.0-flash 404 deprecated | MODEL_FALLBACK을 2.5 시리즈로 갱신 |
| 헤더와 sticky 탭 겹침 | top-[68px] md:top-[60px] 오프셋 |
| 복습 목록 같은 단어 중복 | targetWord 기준 dedupe (Set 활용) |
| 문장 조사/서술어 누락 | `isValidSentence` 검증 함수 + 프롬프트 강화 |
| ADMIN_EMAILS 미설정으로 /admin 접근 불가 | `.env.local`에 추가 + 설정 페이지에 진입 카드 노출 |
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
│   │   ├── page.tsx                ← 대시보드 홈 (활동 캘린더)
│   │   ├── answer-note/            ← 오답노트 (발음 분석)
│   │   ├── practice/               ← 분석단어 훈련 (3단계)
│   │   │   ├── layout.tsx          ← 탭 (분석단어/복습하기)
│   │   │   ├── PracticeClient.tsx  ← 청각폭격 + 메인 연습 ⭐
│   │   │   ├── review/             ← 복습하기 (망각곡선)
│   │   │   └── minimal-pairs/      ← 최소대립쌍 훈련
│   │   ├── bookmarks/              ← 복습 목록 (저장 단어)
│   │   ├── progress/               ← 성장 기록
│   │   └── settings/               ← 설정 (관리자 카드 포함)
│   ├── admin/                      ← 관리자 통계 대시보드 ⭐
│   ├── api/
│   │   ├── error-analysis/         ← 핵심 분석 API
│   │   ├── tts/                    ← Google TTS 캐싱 ⭐ NEW
│   │   ├── saved-words/            ← 복습 단어 저장
│   │   ├── practice-sentences/     ← 문장 생성 (Gemini + 검증)
│   │   ├── gemini-feedback/        ← AI 피드백 + WordPairCache
│   │   ├── weak-phonemes/          ← 약점 음소
│   │   └── admin/                  ← 통계, 시딩, 센터 관리
│   └── subscribe/                  ← 구독 + TossPayments
├── lib/
│   ├── jamo-analysis.ts            ← 한글 자모 분석 엔진 ⭐
│   ├── gemini-client.ts            ← Gemini AI 클라이언트 ⭐
│   ├── google-tts.ts               ← Google Cloud TTS ⭐ NEW
│   ├── useTTS.ts                   ← 클라이언트 음성 훅 ⭐ NEW
│   ├── supabase-admin.ts           ← Supabase Storage (사진+음성)
│   ├── word-database.ts            ← 단어 DB (311개)
│   ├── admin-auth.ts               ← 관리자 권한 체크
│   └── prisma.ts                   ← DB 연결
└── components/
    └── ui/                         ← BubbleCard, BubbleButton, PastelBadge
```

---

**마지막 수정:** 2026-05-25 | TTS 도입 완료 ✓ | 관리자 진입 경로 추가 ✓ | 모든 변경 푸시 완료 (커밋 `73a257b`)
