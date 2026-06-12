# 바른발음 (Bareun-Bareum)

AI 기반 아동 조음 홈케어 SaaS. 부모가 발음 오류를 입력 → AI 분석 → 4단계 훈련법 제공.

**📋 진행 상황은 [BUILD-LOG.md](BUILD-LOG.md)를 참고하세요.**

## 기술 스택

| 항목 | 기술 |
|------|------|
| Frontend | Next.js 16.2.3 + React 19.2.4 + TypeScript |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth 5 |
| AI | Gemini Flash (선택적 30%) |
| Styling | Tailwind CSS + Framer Motion |

## 핵심 파일

- `ARCHITECT-BRIEF.md` - 구현 계획서
- `DESIGN.md` - UI/UX 스펙
- `AI-LOGIC.md` - 조음 오류 20개 패턴
- `src/lib/jamo-analysis.ts` - 한글 자모 분해 엔진 ⭐
- `src/app/api/error-analysis/route.ts` - 오답 분석 API ⭐
- `prisma/schema.prisma` - DB 모델

## 로컬-우선 아키텍처

**로컬 엔진 (70%):** 대치, 탈락, 첨가 → API 비용 없음

**Gemini (30%):** 동화 오류, 4단계 훈련법 → 저비용

## 다음 담당자 체크리스트

- [x] ~~**🔥 최우선: `npx prisma db push`**~~ — ✅ 2026-06-12 완료. ① UserConsent 테이블 ② User.trialEndsAt 컬럼 생성됨. (모바일 환경이라 일회용 마이그레이션 API로 프로덕션 DB에 직접 DDL 실행 후 엔드포인트 삭제). 신규 가입자에게 자동 7일 체험 부여 활성. ⚠️ 로컬/다른 환경에서 스키마 추가 변경 시엔 정식으로 `npx prisma db push` 실행 필요
- [ ] **🔥 푸시 알림 활성화 3단계** (PR 머지 후): ① Vercel 환경변수 4개 설정 — `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` (값은 `.env.local` 참고) ② 재배포 후 `/api/run-migration?token=…` 1회 호출 → PushSubscription 테이블 생성 ③ 마이그레이션 엔드포인트(`src/app/api/run-migration/route.ts`) 삭제
- [ ] Supabase DB 비밀번호 교체 안내 (git 이력 노출 — 사용자 직접)
- [ ] 단어 이미지 생성: `npm run generate:word-images` (754개, GEMINI_API_KEY 필요, ~$29)
- [ ] /subscribe 환불·청약철회 정책 고지 확인 (결제 오픈 전)

## 핵심 설정

```bash
# .env.local 필수
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
NEXTAUTH_URL=http://localhost:3000
```

**최종 업데이트:** 2026-04-12 | 상태: Phase 1 기초 완성 ✓
