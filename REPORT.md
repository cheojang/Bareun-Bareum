# SORI (바른발음) 종합 감사 & 로드맵

**작성일:** 2026-04-23
**작성자:** Claude (Sonnet 4.6)
**범위:** UX/UI · 코드 효율성 · 보안

---

## 📊 요약

3개 영역을 병렬 감사 → 낮은 위험·높은 효과 항목은 **이번 세션에 반영 완료**, 나머지는 하단 로드맵.

| 영역 | 발견 | 반영 완료 | 로드맵 이관 |
|------|------|-----------|--------------|
| UX/UI | 12건 | 3건 | 9건 |
| 코드 효율성 | 15건 | 3건 | 12건 |
| 보안 | 8건 | 3건 | 5건 |

안정성 등급: **B+** (핵심 도메인 로직은 견고, 인프라/운영 측면 개선 필요)

---

## ✅ 이번 세션에 반영한 항목

### UX/UI
1. **반복연습 단계 전환 버그 수정** — 2200ms 인트로 오버레이가 버튼을 숨겨 "한 번 눌러서는 안 넘어감" 현상 해결
2. **로그인 페이지 체크박스 크기 통일** — `w-4 h-4` → `w-5 h-5` (터치 타겟)
3. **하단 네비게이션 키보드 포커스** — `focus-visible:ring-2` 추가, `aria-current`로 현재 페이지 명시

### 코드 효율성
1. **KST 날짜 유틸 통합** — `src/lib/kst-utils.ts` 신설 (중복 로직 3곳 → 1곳)
2. **LRU 캐시 도입** — `src/lib/lru-cache.ts` 신설 후 `guidance`·`comprehensive-analysis` 적용 → 메모리 무한 성장 방어 (guidance 상한 500, comprehensive 200)
3. **단계 전환 시 비동기 순서 버그** — `setStage`가 `await` 뒤에 있어 발생하던 race condition 제거

### 보안
1. **Gemini API 레이트 리밋** — 인메모리 토큰 버킷 (`src/lib/rate-limit.ts`)
   - `gemini-feedback`: 사용자당 분당 10건 / 버스트 5건
   - `comprehensive-analysis`: 사용자당 시간당 5건 / 버스트 2건
2. **센터 API 입력 검증 강화** — `homework`·`notes` 엔드포인트
   - 배열 타입/길이 제한 (targetWords 최대 50개, targetPhonemes 최대 30개)
   - 문자열 길이 제한 (단어 50자, 메모 2000자 등)
   - 날짜 형식 검증
3. **.env.local 누출 확인** — 감사 에이전트 경고와 달리 실제로는 `.gitignore`에 포함되어 있고 git 추적 안 됨. `.env.example`도 플레이스홀더만 포함. 안전.

---

## 🚧 로드맵 (우선순위 순)

### 🔴 최우선 (프로덕션 배포 전)

#### 1. Toss Payments 웹훅 서명 검증 강화
- **파일:** [src/app/api/billing/webhook/route.ts](src/app/api/billing/webhook/route.ts)
- **현황:** Basic Auth 문자열 비교만 수행. 시간차 공격(timing attack)에 취약.
- **조치:** HMAC-SHA256 서명 검증으로 교체 + `crypto.timingSafeEqual()` 사용 + 타임스탬프 검증으로 재생 공격 차단.
- **영향:** 결제 웹훅 위조 시 사용자 구독 상태 임의 조작 가능.

#### 2. 관리자 권한을 DB 기반으로 이전
- **파일:** [src/lib/admin-auth.ts](src/lib/admin-auth.ts), [src/app/api/announcements/admin/route.ts](src/app/api/announcements/admin/route.ts)
- **현황:** `ADMIN_EMAILS` 환경변수를 여러 곳에서 파싱. 이메일 스푸핑·공백 처리 등 우회 여지.
- **조치:** `User.role` enum (`USER | ADMIN`)으로 이전 → 단일 진실 공급원(single source of truth).
- **마이그레이션 비용:** 스키마 변경 + 기존 관리자 계정 수동 업데이트.

#### 3. 비용 폭발 2차 방어 — Gemini 일일 한도
- **현황:** 개인 RateLimit은 추가했으나, 전역 일일 한도 없음.
- **조치:** Redis 또는 DB 기반 일일 카운터 (오늘 사용량 집계). 예: 서비스 전체 5,000건/일 상한.
- **이유:** 개별 유저는 제한했지만 신규 유저 대량 생성 시 우회 가능.

### 🟠 높음 (3개월 내)

#### 4. N+1 쿼리 제거 — `progress/page.tsx`
- **파일:** [src/app/dashboard/progress/page.tsx:35-97](src/app/dashboard/progress/page.tsx#L35)
- **현황:** `wordRecord.findMany`로 최근 50개 가져와 JS에서 음소 집계.
- **조치:** `prisma.$queryRaw`로 DB 집계 or `groupBy` 활용. 데이터 증가 시 선형 악화.

#### 5. 비원자 트랜잭션 — `error-analysis`
- **파일:** [src/app/api/error-analysis/route.ts:139-152](src/app/api/error-analysis/route.ts#L139)
- **현황:** `Promise.allSettled([recalculateWeakPhonemes, reviewSchedule.create])`로 백그라운드 실행. 한쪽 실패 시 데이터 불일치.
- **조치:** `prisma.$transaction` 으로 래핑.

#### 6. IDOR 위험 — 치료사 API에서 childId 변조
- **파일:** [src/app/api/center/homework/route.ts](src/app/api/center/homework/route.ts), [src/app/api/center/notes/route.ts](src/app/api/center/notes/route.ts)
- **현황:** `canAccessChild()` 검증은 있으나 URL path 대신 body에서 `childId` 받음.
- **조치:** `/api/center/homework/[childId]` 형태로 path parameter로 이전. 방어적 화이트리스트 검증.

#### 7. 모바일 태블릿 (768-1024px) 레이아웃
- **파일:** [src/app/dashboard/layout.tsx:72](src/app/dashboard/layout.tsx#L72)
- **현황:** 사이드바가 `md:` (768px+)부터 표시 → 태블릿에서 콘텐츠가 좁음.
- **조치:** `lg:` (1024px+)로 조정 또는 태블릿 전용 반응형.

#### 8. 홈/치료일지 로딩 상태 개선
- **파일:** [src/app/dashboard/homework/page.tsx:139](src/app/dashboard/homework/page.tsx#L139), [src/app/dashboard/therapy-notes/page.tsx](src/app/dashboard/therapy-notes/page.tsx)
- **현황:** "불러오는 중..." 텍스트만 표시. `LoadingSpinner` 컴포넌트 미활용.
- **조치:** 스켈레톤 UI 또는 `LoadingSpinner`로 교체.

### 🟡 중간 (6개월 내)

#### 9. `findFirst` → `findUnique` + 수동 검증
- **다수 API 파일**에 복합 조건 `findFirst({ where: { id, userId } })` → 인덱스 활용 저하.
- **조치:** `findUnique({ where: { id } })` 후 `record.userId === session.user.id` 확인. 약 10% 성능 향상 기대.

#### 10. 전역 에러 로깅 체계
- **현황:** `console.error(err)`로 스택 트레이스 전체 출력 → 프로덕션 로그에 민감 정보 유출 위험.
- **조치:** `pino` 또는 `winston` 도입, 에러는 `err.message`만 기록, PII 마스킹 룰 적용.

#### 11. 색상 시스템 일관성
- **파일:** [homework/page.tsx:178](src/app/dashboard/homework/page.tsx#L178) (`text-red-500`), [therapy-notes/page.tsx:16-17](src/app/dashboard/therapy-notes/page.tsx#L16) (Tailwind 팔레트 색상)
- **현황:** 설계 시스템(peach/pink/mint/lavender) 밖의 색상 혼용.
- **조치:** 설계 토큰 통일 — `text-[#EF4444]` 등 프로젝트 HEX 팔레트로 교체.

#### 12. 접근성 (WCAG AA)
- **버튼 disabled 대비 부족** — `opacity-50`만으로는 4.5:1 미충족. `bg-[#E0D8D0]` 등 명시.
- **NotificationBell 드롭다운 포커스 트랩** — 키보드 사용자 접근 불가.
- **SoriMascot SVG** — `role="img"`와 `aria-label` 중복 → 하나만.

### 🟢 낮음 (유지보수 여유 시)

#### 13. 유틸 중앙화
- 빈 문자열/`"(없음)"` 음소 방어 코드 산재 → `isValidPhoneme()` 유틸로 통합.

#### 14. 번들/Import 최적화
- `@google/generative-ai`는 서버 사이드만 사용 (좋음 ✓)
- 대형 라이브러리 전체 import 없음 (좋음 ✓)
- 미사용 `import` 정리 필요 (`ChildPlayClient.tsx:7` 등)

#### 15. 데이터베이스 캐싱
- 자주 조회되는 정적 데이터 (`PhonemeTemplate` 등)는 Next.js `unstable_cache` 고려.

---

## 🔒 이미 안전한 항목 (참고용)

| 항목 | 상태 |
|------|------|
| SQL Injection | Prisma ORM만 사용, `$queryRaw` 0건 ✓ |
| XSS | `dangerouslySetInnerHTML` 0건 ✓ |
| CSRF | NextAuth 5 기본 보호 ✓ |
| `.env.local` 유출 | `.gitignore`에 포함, git 추적 안 됨 ✓ |
| 비밀번호 저장 | OAuth만 사용, 평문 비밀번호 필드 없음 ✓ |
| 시크릿 클라이언트 노출 | `NEXT_PUBLIC_*` prefix에 시크릿 없음 ✓ |

---

## 📅 권장 일정

**1주차 (즉시):**
- [ ] Toss 웹훅 HMAC 서명 (로드맵 #1)
- [ ] 관리자 권한 DB 이전 (#2)

**2-4주차:**
- [ ] Gemini 일일 전역 한도 (#3)
- [ ] N+1 쿼리 제거 (#4)
- [ ] 에러 분석 트랜잭션화 (#5)

**2-3개월:**
- [ ] IDOR 방어 강화 (#6)
- [ ] 태블릿 레이아웃 (#7)
- [ ] 로딩 UX (#8)

**분기별 정기:**
- [ ] 성능 프로파일링 (`findFirst`→`findUnique`)
- [ ] 접근성 감사 (WCAG 툴 사용)
- [ ] 색상/디자인 시스템 준수 스캔

---

## 📝 변경된 파일 (이번 세션)

```
신규:
  src/lib/kst-utils.ts          (KST 날짜 유틸)
  src/lib/lru-cache.ts          (LRU 캐시)
  src/lib/rate-limit.ts         (레이트 리미터)
  REPORT.md                     (이 문서)

수정:
  src/app/api/analysis/[id]/guidance/route.ts    (LRU 적용)
  src/app/api/comprehensive-analysis/route.ts    (LRU + 레이트 리밋)
  src/app/api/gemini-feedback/route.ts           (레이트 리밋)
  src/app/api/center/homework/route.ts           (입력 검증 강화)
  src/app/api/center/notes/route.ts              (입력 검증 강화)
  src/app/dashboard/practice/PracticeClient.tsx  (단계 전환 버그 수정)
  src/app/(auth)/login/page.tsx                  (체크박스 크기 통일)
  src/components/dashboard/DashboardNav.tsx      (키보드 포커스)
```

---

_최종 업데이트: 2026-04-23_
