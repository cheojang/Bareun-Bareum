# 빌드 진행 로그

**프로젝트:** 바른발음 (Bareun-Bareum) — AI 기반 아동 조음 홈케어 SaaS
**GitHub:** cheojang/SORI
**브랜치:** claude/speech-therapy-saas-design-Jns4A

---

## ✅ Phase 1 — 기초 (2026-04-12)

**Prisma 데이터 모델**
- [x] User, Child, ErrorRecord, LocalAnalysis, GeminiFeedback, WeakPhoneme, SavedWord
- 파일: `prisma/schema.prisma`

**로컬 자모 분해 엔진**
- [x] 한글 유니코드 분해 (초성/중성/종성)
- [x] 음운변동 20개 패턴 분류 (대치/탈락/첨가/동화)
- [x] parentHint, description, errorCategory 필드 추가
- 파일: `src/lib/jamo-analysis.ts`

**Gemini Flash API 연동**
- [x] 언어재활사 시스템 프롬프트 (15년 경력 페르소나)
- [x] 4단계 훈련법 (조음감각/소리느끼기/연결하기/일상적용)
- [x] 부모님께 응원 메시지 (parentMessage)
- 파일: `src/lib/gemini-client.ts`

**API 엔드포인트 전체**
- [x] POST `/api/error-analysis` — 오답 분석 + WeakPhoneme 자동 집계
- [x] GET `/api/weak-phonemes` — 누적 약점 음소
- [x] POST `/api/saved-words` / GET — 복습 단어 저장/조회
- [x] POST `/api/practice-sentences` — Gemini 문장 생성 (3단계)
- [x] GET `/api/recommendations` — 단어 추천
- [x] 결제 관련: `/api/billing/*`

---

## ✅ Phase 2 — 화면 개발 (2026-04-13)

대시보드, 오답노트, 아이연습 3단계, 복습목록, 성장기록, 설정, 랜딩, 구독 — 총 25개 페이지.
빌드 검증 성공. 단어 DB 311개로 확장.

---

## ✅ Phase 3 — 사용성/안정성 강화 (2026-04 ~ 2026-05)

### 학습 흐름 재정비
- [x] 분석 → 연습 → 복습 통합 루프
- [x] SM-2 망각곡선 기반 복습 일정 (`/api/review`)
- [x] 오늘의 복습 단어 자동 선별 + 음소 다양성 균형
- [x] 반복 연습 단계 전환 즉시 반응
- [x] 발음분석·저장단어 전체 초기화 버튼

### B2B 상담소 기능 (Phase 1-2 통합)
- [x] Center 모델 + Therapist 내부 역할 (owner/staff)
- [x] `/center/*` URL 공간 통합
- [x] 추후 활성화 위해 현재 비활성 (2단계 예정)

### 결제·구독·요금
- [x] AI 분석 월간 제한 (무료/프리미엄 분기)
- [x] 가격 정책 적용

### 인증·계정
- [x] 이메일 회원가입/로그인 (OTP 인증)
- [x] 회원 탈퇴
- [x] 비회원 체험 모드 (기록 저장 없이 분석)
- [x] 랜딩페이지 리디자인

### AI 분석 강화
- [x] Gemini 모델 폴백 체계 (2.5-flash → flash-lite → pro)
- [x] AI 처방전 NDJSON 스트리밍 (원인→1단계→... 순차 노출)
- [x] AI 종합 분석 속도 개선
- [x] WordPairCache (글로벌 단어쌍 캐시) — Gemini 중복 호출 방지

### 마스코트·UI 게이미피케이션
- [x] 자동차 트랙 진행바 (출발→결승) + 도트 단위 전진
- [x] 활동 캘린더 (홈화면)
- [x] 마스코트 레벨 시각화
- [x] 아이 사진 등록 (Supabase Storage URL)

### SLP 기반 학습 효과 기능 3종
- [x] 반복 카운터 (음소당 50회 목표 — 운동학습 원리)
- [x] 청각 폭격 (단어들 연속 노출 후 본 연습 진입)
- [x] 부모 코칭 카드 (완료 화면에 실생활 적용 팁)

### 종합 감사 기반 개선
- [x] 보안·중복·성능 전수감사 후 11개 영역 개선
- [x] Flutter 모바일 앱 확장 로드맵 문서화
- [x] 런칭 마케팅 계획서 추가

---

## ✅ Phase 4 — TTS + 관리자 + UX 마무리 (2026-05-21 ~ 2026-05-25)

### 🎵 Google Cloud TTS 도입 (자연스러운 한국어 음성)
- [x] `src/lib/google-tts.ts` — Google Cloud TTS API 클라이언트
  - 기본 음성: `ko-KR-Neural2-A` (여성, 따뜻한 톤)
  - 속도 0.7, 단어 간격 1초 (아동 청취용 튜닝)
- [x] `src/app/api/tts/route.ts` — TTS 엔드포인트 + Supabase Storage 캐싱
  - 캐시 히트 시 Google API 호출 0회 → 비용 영구 무료
  - `tts-cache` 버킷 사용 (Public)
- [x] `src/lib/useTTS.ts` — 클라이언트 훅 (브라우저 폴백 포함)

### 🔊 단어 자동재생 + 다시 듣기 버튼
- [x] 분석단어 훈련 (`/dashboard/practice`) 단어 자동재생
- [x] 복습하기 (`/dashboard/practice/review`) 단어 자동재생
- [x] 🔊 다시 듣기 버튼 양쪽 화면에 추가
- [x] 3단계 문장은 TTS 제거 → "📖 부모님이 읽어주세요" 안내
- [x] 청각폭격 화면 ▶️ 듣기 시작 버튼 (자동재생 차단 우회)
- [x] 첫 단어 재생 버그 수정 (phase 가드 추가, React strict mode 대응)

### 🤖 문장 생성 무결성 강화
- [x] 프롬프트 강화 — 완전한 주어+조사+서술어 요구
- [x] 검증 함수 `isValidSentence` — 길이/서술어/조사/단어포함 체크
- [x] 모델 폴백 갱신 (gemini-2.0-flash deprecated → 2.5 시리즈만 사용)

### 📊 관리자 통계 대시보드
- [x] `/admin` 페이지 신설
  - KPI: 총 회원, 프리미엄 구독, 활성 아이(7일), 무료 회원
  - AI 분석 현황: 오답 입력, Gemini 호출, 캐시 히트율
  - 신규 가입 스파크라인, 아이 연령대 분포
  - 시간대별/요일별 사용량
  - Top 10 — 오류 카테고리, 오류 유형, 약점 음소, 캐시 단어쌍
  - 시딩 진행 + 원클릭 실행
- [x] 아이 성별 필드 추가 (Child.gender) + 성별 분포 카드
- [x] 설정 페이지에 🛡️ 관리자 대시보드 바로가기 (관리자만 노출)

### 🎯 복습 중복 제거
- [x] 복습목록 "최근 발음 분석" — 같은 단어 1회만 (가장 최근)
- [x] 복습하기 화면 — `smartFilterReviews`에 targetWord 중복 제거

### 🎨 진행바·버튼 UX 개선
- [x] 자동차 트랙 라벨 추가 ("🏁 오늘의 진도" + %)
- [x] 반복 카운터 라벨 명확화 ("🔁 발음 연습 횟수")
- [x] 부연 설명 추가 — "같은 음소가 들어간 단어들이 모두 누적돼요"
- [x] 모든 액션 버튼 BubbleButton size="lg"로 일관성 통일
  - peach = 메인 행동, gray = 보조 행동
- [x] Practice 탭 sticky 위치 조정 (헤더와 겹침 해소)

### 🐛 인프라/배포 이슈 해결
- [x] Supabase 프로젝트 일시중지(pause) 깨우기
- [x] DB 마이그레이션 충돌 정리 — `migrate resolve --applied`
- [x] @supabase/supabase-js 패키지 설치
- [x] Prisma 클라이언트 재생성
- [x] Child.gender DB 동기화 (`prisma db push`)
- [x] `ALLOW_DEV_LOGIN=1` 설정 (dev 로그인 활성화)
- [x] `ADMIN_EMAILS=dev@test.com` 설정

---

## 🔴 다음 세션에서 할 일

### 우선순위 1 — 배포
- [ ] Vercel 배포 (DB는 Supabase 그대로)
- [ ] 프로덕션 환경변수 설정
- [ ] `ALLOW_DEV_LOGIN` 반드시 0 (또는 미설정)

### 우선순위 2 — PWA 설정
- [ ] `next-pwa` 패키지 설치
- [ ] `manifest.json` 작성
- [ ] 스플래시 화면 / 홈스크린 아이콘
- [ ] iOS Safari "홈 화면에 추가" + Android Chrome 설치 배너 확인
- [ ] Service Worker (오프라인 캐시)

### 우선순위 3 — 반응형 디자인 개선
- [ ] PC (1200px+): 사이드바 + 2단 레이아웃
- [ ] 태블릿 (768px): 상단 탭 + 2컬럼 카드
- [ ] 모바일: 현재 유지

### 우선순위 4 — 단어 데이터베이스 확장
- [ ] 현재 311개 → 600개 → 1000개 → 2000개 목표
- 파일: `src/lib/word-database.ts`

### 우선순위 5 — 콘텐츠/기능 다듬기
- [ ] 문장 다양성 추가
- [ ] 단어 그림 카드
- [ ] 알림/리마인더

---

## 기술 이슈 & 해결 이력

| 이슈 | 해결 방법 |
|------|-----------|
| @google/generative-ai 미설치 | `npm install @google/generative-ai` |
| Prisma 클라이언트 미생성 | `npx prisma generate` |
| 자모 분석 ㅇ 초성 오판정 | `child.choseong === 'ㅇ'` 특수처리 |
| 아이 발음 자동 판정 불가 | 부모가 "잘 됐어요 ✓" 버튼으로 판정 |
| Supabase 프로젝트 일시중지 | Dashboard → Resume project |
| 마이그레이션 충돌 (`Center already exists`) | `migrate resolve --applied`로 적용 인식 |
| @supabase/supabase-js 미설치 | `npm install @supabase/supabase-js` |
| gemini-2.0-flash 404 | 2.5 시리즈로 폴백 갱신 |
| 자동재생 차단 (Chrome) | ▶️ 시작 버튼으로 사용자 클릭 요구 |
| 첫 단어 자동재생 안 됨 | useEffect phase 가드 추가 |
| 헤더-탭 겹침 | sticky `top-[68px] md:top-[60px]` |
| Child.gender 컬럼 누락 | `prisma db push` |
| dev 로그인 안 됨 | `ALLOW_DEV_LOGIN=1` 추가 |
| 관리자 페이지 접근 안 됨 | `ADMIN_EMAILS` + 설정 페이지 링크 |

---

## 파일 구조 핵심

```
src/
├── app/
│   ├── page.tsx                    ← 랜딩
│   ├── (auth)/
│   │   ├── login/                  ← 로그인 + dev + 비회원
│   │   ├── signup/                 ← 이메일 회원가입 (OTP)
│   │   └── onboarding/             ← 아이 정보 (이름·나이·성별)
│   ├── dashboard/
│   │   ├── page.tsx                ← 홈 (활동 캘린더)
│   │   ├── answer-note/            ← 오답노트
│   │   ├── practice/               ← 분석단어 훈련 + 복습하기
│   │   │   ├── PracticeClient.tsx     ⭐ 청각폭격 + 3단계
│   │   │   ├── review/                ⭐ SM-2 복습
│   │   │   └── minimal-pairs/         ⭐ 최소대립쌍
│   │   ├── bookmarks/              ← 복습 목록
│   │   ├── progress/               ← 성장 기록
│   │   └── settings/               ← 설정 (+ 관리자 링크)
│   ├── admin/                      ⭐ 관리자 대시보드
│   ├── center/                     ← 상담소 (B2B, 비활성)
│   ├── subscribe/                  ← 구독 + TossPayments
│   └── api/
│       ├── error-analysis/         ⭐ 핵심 분석 API
│       ├── tts/                    ⭐ Google TTS + 캐싱 (NEW)
│       ├── practice-sentences/     ← Gemini 문장 + 무결성 검증
│       ├── review/                 ← SM-2 복습 일정
│       ├── saved-words/            ← 복습 단어 저장
│       ├── admin/                  ← 통계, 시딩, 센터 관리
│       ├── auth/                   ← NextAuth + OTP + 회원탈퇴
│       └── billing/                ← TossPayments
├── lib/
│   ├── jamo-analysis.ts            ⭐ 한글 자모 분석 엔진
│   ├── gemini-client.ts            ⭐ Gemini AI 클라이언트
│   ├── google-tts.ts               ⭐ Google Cloud TTS (NEW)
│   ├── useTTS.ts                   ⭐ 클라이언트 TTS 훅 (NEW)
│   ├── supabase-admin.ts           ← Supabase Storage 클라이언트
│   ├── admin-auth.ts               ← isAdmin 판별
│   ├── word-database.ts            ← 단어 DB (311개)
│   └── prisma.ts                   ← DB 연결
└── components/
    ├── ui/                         ← BubbleCard, BubbleButton, PastelBadge
    ├── child/                      ← MascotCharacter, ConfettiEffect
    ├── dashboard/                  ← Sidebar, BottomNav, NotificationBell
    └── settings/                   ← ChildImageUpload, ChildDeleteButton
```

---

## 환경변수 체크리스트 (`.env.local`)

| 변수 | 용도 | 필수 |
|------|------|------|
| `DATABASE_URL` | Supabase PostgreSQL | ✅ |
| `AUTH_SECRET` | NextAuth 시크릿 | ✅ |
| `NEXTAUTH_URL` | http://localhost:3000 | ✅ |
| `ALLOW_DEV_LOGIN` | 1 (로컬만, 운영 시 0) | 로컬 |
| `ADMIN_EMAILS` | 관리자 이메일 (쉼표 구분) | 선택 |
| `GEMINI_API_KEY` | Gemini AI | ✅ |
| `GOOGLE_TTS_API_KEY` | Google Cloud TTS | ✅ |
| `SUPABASE_URL` | Supabase 프로젝트 URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Storage 업로드용 | ✅ |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth | 운영 |
| `KAKAO_CLIENT_ID/SECRET` | Kakao OAuth | 운영 |
| `TOSS_*` | 결제 | 운영 |
| `RESEND_API_KEY` | 이메일 OTP | 운영 |

---

**최종 업데이트:** 2026-05-25 | 상태: Phase 4 완료 ✓ | 다음: 배포 준비
