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

- [ ] Gemini API 패키지 버전 확인 & 구현
- [ ] Answer Note 폼 UI 개발
- [ ] /api/error-analysis 테스트 (5개 샘플)
- [ ] ErrorRecord/LocalAnalysis DB 저장 확인
- [ ] REVIEW-REQUEST.md 작성

## 핵심 설정

```bash
# .env.local 필수
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
NEXTAUTH_URL=http://localhost:3000
```

**최종 업데이트:** 2026-04-12 | 상태: Phase 1 기초 완성 ✓
