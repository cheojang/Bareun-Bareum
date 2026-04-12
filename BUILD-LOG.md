# 빌드 진행 로그

**프로젝트:** 바른발음 (Bareun-Bareum)  
**GitHub:** (예정)  
**이슈 추적:** (예정)

---

## Phase 1: 오답 분석 엔진

### ✅ 완료 (2026-04-12)

**Prisma 데이터 모델**
- [x] User, Child (기존 유지)
- [x] ErrorRecord, LocalAnalysis, GeminiFeedback, WeakPhoneme, SavedWord 추가
- 파일: `prisma/schema.prisma`

**로컬 자모 분해 엔진**
- [x] 한글 유니코드 분해 (초성/중성/종성)
- [x] 조음 오류 판정 (대치/탈락/첨가/동화 위임)
- [x] 테스트 5/5 PASS
- 파일: `src/lib/jamo-analysis.ts`
- 테스트: `scripts/test-jamo.mjs`

**Gemini Flash API 연동**
- [x] @google/generative-ai 공식 패키지 사용
- [x] getGeminiFeedback() — 원인 설명 + 4단계 훈련법 + 추천 단어
- [x] generateWeakPhonemeReport() — 부모용 요약 리포트
- 파일: `src/lib/gemini-client.ts`

**ErrorRecord 저장 API**
- [x] POST `/api/error-analysis` 엔드포인트
- [x] 로컬 분석 → DB 저장 → Gemini 위임 흐름
- 파일: `src/app/api/error-analysis/route.ts`

**Answer Note UI**
- [x] 입력 폼 (목표 단어, 아이 발음)
- [x] AI 분석 결과 카드 (오류 유형, 원인, 4단계 훈련법, 추천 단어)
- [x] 로딩/에러/초기화 처리
- 파일: `src/app/dashboard/answer-note/page.tsx`, `AnswerNoteClient.tsx`

**내비게이션 업데이트**
- [x] 홈 / 오답노트 / 아이연습 / 저장 / 설정
- 파일: `src/app/dashboard/layout.tsx`

**빌드 검증**
- [x] TypeScript 컴파일 통과
- [x] Next.js 빌드 성공 (`npm run build`)
- [x] 25개 페이지 정상 생성

---

### 📋 대기 — Phase 2

**Phase 2: 누적 약점 분석**
- [ ] WeakPhoneme 자동 계산 로직 (오답 기록 → 오류율 집계)
- [ ] Dashboard 홈 (총 연습 횟수, 약점 음소 카드 등)
- [ ] 약점 음소 시각화 (바 차트 등)
- [ ] GET `/api/weak-phonemes` 엔드포인트

**Phase 3: 아이 연습 모드**
- [ ] Child Practice 페이지 (게임 모드)
- [ ] 5단계 반복 연습 UI + 5도트 진행 표시
- [ ] 완료 시 Confetti 애니메이션
- [ ] Saved, Settings 페이지 완성

---

## 기술 이슈 & 해결

| 이슈 | 해결 방법 |
|------|-----------|
| @google/genai 패키지 미지원 API | @google/generative-ai 공식 패키지로 교체 |
| Prisma 빌드 타임 DATABASE_URL 오류 | PrismaClient를 핸들러 내부에서 초기화 |
| 자모 분석 ㅇ 초성 오판정 | child.choseong === 'ㅇ' → 초성탈락 특수처리 |
| 종성 변화 오판정 | 종성 변화 → requiresGemini: true 로 동화 위임 |

---

## 배포 전략

**선택:** 웹 배포 (PWA) + 향후 Expo/React Native 검토  
**이유:** 현재 기능은 웹 100% 지원 / 빠른 출시 / 유저 피드백 후 네이티브 결정

1. Phase 3 완성 후 Vercel 배포
2. 도메인 연결 (예: bareunbaleum.com)
3. PWA 설정 (모바일 홈스크린 설치 가능)

---

**마지막 수정:** 2026-04-12 | BUILDER — Phase 1 완료
