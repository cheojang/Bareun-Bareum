# ARCHITECT-BRIEF.md — 바른발음 구현 계획서

> 작성일: 2026-04-12  
> 작성자: ARCHITECT  
> 상태: 작성 완료 (BUILDER로 이동 준비)

---

## 1. 프로젝트 개요

**앱명:** 바른발음 — 아동 조음 홈케어 SaaS  
**목표:** 부모가 아이의 발음 오류를 입력하면, AI가 원인을 진단하고 4단계 훈련법을 제시하는 앱  
**사용자:** 만 3세~8세 아이를 둔 부모  
**핵심 가치:** 
- 언어치료사 수준의 진단 (20개 조음 오류 패턴)
- 게임화된 연습 (아이용 5단계 반복 연습)
- 누적 분석 (300개 오답 기준 약점 추적)

---

## 2. 기술 스택

| 계층 | 기술 | 버전 |
|------|------|------|
| Frontend | Next.js | 16.2.3 |
| Language | TypeScript | 5.x |
| Runtime | React | 19.2.4 |
| Styling | Tailwind CSS | 4 |
| Animation | Framer Motion | 12.38.0 |
| ORM | Prisma | 7.7.0 |
| Database | PostgreSQL | 14+ |
| Auth | NextAuth | 5.0.0-beta.30 |
| AI | Google Gemini Flash | (API) |
| Icons | Lucide React | 1.8.0 |
| Confetti | canvas-confetti | 1.9.4 |

**배포:** 미정 (Vercel 권장)

---

## 3. 데이터 모델

### 3.1 Prisma 스키마

```prisma
// User: 부모(로그인 사용자)
model User {
  id String @id @default(cuid())
  email String @unique
  name String
  provider String // "google" | "kakao"
  providerId String
  children Child[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Child: 발음 교정 대상 아이
model Child {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  name String
  birthDate DateTime?
  errorRecords ErrorRecord[]
  practiceAttempts PracticeAttempt[]
  weakPhonemes WeakPhoneme[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ErrorRecord: 한 번의 오답 기록
model ErrorRecord {
  id String @id @default(cuid())
  childId String
  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)
  targetWord String // 목표 단어 (예: "사과")
  childPronunciation String // 아이 발음 (예: "따과")
  audioUrl String? // 향후 음성 저장용
  errorType String // "경음화" | "기음화" | ... (20개 패턴)
  errorCategory String // "대치" | "동화" | "탈락" | "첨가"
  errorPattern String // 구체적 패턴명
  localAnalysis LocalAnalysis?
  geminiFeedback GeminiFeedback?
  createdAt DateTime @default(now())
}

// LocalAnalysis: 로컬 자모 분해 분석 결과
model LocalAnalysis {
  id String @id @default(cuid())
  errorRecordId String @unique
  errorRecord ErrorRecord @relation(fields: [errorRecordId], references: [id], onDelete: Cascade)
  detectedPattern String // 탐지된 패턴명
  jamoBreakdown String // JSON: {"target": ["ㅅ","ㅏ","ㄱ","ㅘ"], "child": ["ㄷ","ㅏ","ㄱ","ㅘ"]}
  confidence Int // 신뢰도 (0-100)
  requiresGemini Boolean // Gemini 필요 여부 (동화 오류 등)
  createdAt DateTime @default(now())
}

// GeminiFeedback: Gemini API 응답 결과
model GeminiFeedback {
  id String @id @default(cuid())
  errorRecordId String @unique
  errorRecord ErrorRecord @relation(fields: [errorRecordId], references: [id], onDelete: Cascade)
  rootCause String // 원인 설명 (부모가 이해할 수 있는 말)
  trainingStep1 String // 1단계: 제목 + 방법
  trainingStep2 String // 2단계
  trainingStep3 String // 3단계
  trainingStep4 String // 4단계
  recommendedWords String @db.Text // JSON array: ["수박", "소보", "소기", ...]
  createdAt DateTime @default(now())
}

// WeakPhoneme: 누적 약점 분석 (300개 오답 기준)
model WeakPhoneme {
  id String @id @default(cuid())
  childId String
  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)
  phoneme String // "ㅅ" | "ㄹ" | "ㅂ" etc (자음)
  totalAttempts Int // 최근 300개 오답 중 해당 음소 시도 횟수
  errorCount Int // 오류 횟수
  errorRate Float // errorCount / totalAttempts * 100
  weaknessLevel String // "집중교정필요" | "꾸준한연습필요" | "관찰중" | "정상범위"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// PracticeAttempt: 아이용 연습 기록
model PracticeAttempt {
  id String @id @default(cuid())
  childId String
  child Child @relation(fields: [childId], references: [id], onDelete: Cascade)
  targetWord String
  attemptNumber Int // 1-5 중 몇 번째 시도인지
  completed Boolean // 완료 여부
  recordedAt DateTime // 연습한 시간
  createdAt DateTime @default(now())
}

// SavedWord: 저장된 단어 (즐겨찾기)
model SavedWord {
  id String @id @default(cuid())
  childId String
  word String
  targetPhoneme String // 이 단어로 교정하려는 음소
  difficulty String // "easy" | "medium" | "hard"
  savedAt DateTime @default(now())
}
```

---

## 4. API 엔드포인트

### 4.1 오답 분석 (핵심)

#### POST `/api/error-analysis`
**목적:** 오답 입력 → 로컬 분석 → 필요시 Gemini 호출

**요청:**
```json
{
  "childId": "child_123",
  "targetWord": "사과",
  "childPronunciation": "따과"
}
```

**응답 (성공):**
```json
{
  "errorRecordId": "error_456",
  "errorCategory": "대치",
  "errorPattern": "경음화",
  "localAnalysis": {
    "detectedPattern": "경음화",
    "jamoBreakdown": {"target": ["ㅅ","ㅏ","ㄱ","ㅘ"], "child": ["ㄷ","ㅏ","ㄱ","ㅘ"]},
    "confidence": 98,
    "requiresGemini": false
  },
  "geminiFeedback": {
    "rootCause": "ㅅ 소리를 ㄷ으로 잘못 발음하는 경향이 있습니다.",
    "trainingStep1": "소리 감지: 큰 소리로 '쌩-' 소리 내기",
    "trainingStep2": "혀 위치: 상단 이앗니 뒤에 닿게 하기",
    "trainingStep3": "단어 연습: '사과, 수박, 소보' 반복",
    "trainingStep4": "문장 연습: '사람이 산다' 읽어주기",
    "recommendedWords": ["수박", "소보", "소금", "사탕", "싸우다"]
  }
}
```

**에러:**
- 400: childId 또는 targetWord 누락
- 404: 해당 Child 없음
- 500: Gemini API 에러 (로컬 분석 결과만 반환 후 나중에 재시도)

---

#### GET `/api/analysis-history?childId=...&limit=300`
**목적:** 최근 N개 오답 기록 조회

**응답:**
```json
{
  "childName": "정훈이",
  "totalRecords": 245,
  "dataWindow": "약 4개월",
  "recentAnalyses": [
    {
      "id": "error_456",
      "targetWord": "사과",
      "childPronunciation": "따과",
      "errorPattern": "경음화",
      "createdAt": "2026-04-12T15:30:00Z"
    }
    // ...
  ]
}
```

---

### 4.2 약점 분석

#### GET `/api/weak-phonemes?childId=...`
**목적:** 누적 약점 음소 분석 (최근 300개 기준)

**응답:**
```json
{
  "childName": "정훈이",
  "dataQuality": {
    "recordCount": 245,
    "message": "아직 데이터가 부족해요. 좀 더 연습하면 더 정확한 분석을 드릴 수 있어요!",
    "confidence": "low"
  },
  "weakPhonemes": [
    {
      "phoneme": "ㅅ",
      "totalAttempts": 45,
      "errorCount": 18,
      "errorRate": 40,
      "weaknessLevel": "꾸준한연습필요"
    },
    {
      "phoneme": "ㄹ",
      "totalAttempts": 32,
      "errorCount": 8,
      "errorRate": 25,
      "weaknessLevel": "관찰중"
    }
  ]
}
```

---

### 4.3 대시보드 통계

#### GET `/api/dashboard?childId=...`
**목적:** 홈 화면 4개 스탯 카드 데이터

**응답:**
```json
{
  "childName": "정훈이",
  "stats": {
    "learnedWords": 87,
    "practiceMinutes": 234,
    "consecutiveAttendance": 12,
    "accuracy": 68
  },
  "recentPractice": [
    {"word": "사과", "date": "2026-04-12", "attempts": 5},
    {"word": "수박", "date": "2026-04-11", "attempts": 3}
  ]
}
```

---

### 4.4 연습 기록

#### POST `/api/practice-attempt`
**목적:** 아이가 연습한 회차 기록

**요청:**
```json
{
  "childId": "child_123",
  "targetWord": "사과",
  "attemptNumber": 3,
  "completed": true
}
```

**응답:**
```json
{
  "success": true,
  "message": "3번째 연습 완료!",
  "progress": {
    "total": 5,
    "completed": 3
  }
}
```

---

## 5. 구현 범위

### ✅ 포함 (MUST HAVE)

#### Phase 1: 핵심 기능
- [x] User/Child DB 모델
- [x] NextAuth 회원가입/로그인 (구글, 카카오)
- [ ] 오답 입력 폼 (Answer Note 페이지)
- [ ] 로컬 자모 분해 엔진 (조음 오류 자동 탐지)
- [ ] ErrorRecord, LocalAnalysis 저장
- [ ] Gemini Flash API 호출 (동화 오류 & 훈련법 생성)
- [ ] GeminiFeedback 저장 및 표시
- [ ] 오답 조회 API

#### Phase 2: 누적 분석
- [ ] WeakPhoneme 테이블 자동 집계 (매 오답 기록 후)
- [ ] 약점 조회 API
- [ ] 약점 시각화 (% 바 차트)
- [ ] "데이터 부족" vs "신뢰도 높음" 메시지 표시

#### Phase 3: 아이 연습 & 완성
- [ ] Child Practice 페이지 (게임 모드)
- [ ] 5단계 반복 연습 (5개 닷)
- [ ] Confetti 애니메이션
- [ ] PracticeAttempt 기록
- [ ] Saved 페이지 (SavedWord)
- [ ] Settings 페이지 (아이 정보 수정, 구독 관리)

### ❌ 제외 (OUT OF SCOPE)

- 음성 녹음 및 음성 AI 분석 (향후 V2)
- 실시간 비디오 발음 교정
- 부모-언어치료사 연동
- iOS/Android 네이티브 앱 (웹만)
- 결제/구독 시스템 (설계만 포함, 구현 X)
- 통계 대시보드 (간단한 4개 카드만)
- 다국어 지원

---

## 6. 개발 우선순위 (3 Phase)

### Phase 1: 오답 분석 엔진 (1주)
**목표:** "부모 → 오답 입력 → AI 진단" 완성

```
Tasks:
1. Prisma 마이그레이션 (User, Child, ErrorRecord, LocalAnalysis, GeminiFeedback)
2. NextAuth 설정 (구글 로그인 기본, 카카오는 옵션)
3. 로컬 자모 분해 함수 작성 (유니코드 분해)
4. ErrorRecord 저장 API
5. 오답 입력 폼 (Answer Note) UI
6. Gemini Flash API 프롬프트 및 호출
7. 오답 조회 API (최근 기록 보기)
8. 테스트 (5개 샘플 케이스)
```

**성공 기준:**
- 사용자가 "사과→따과" 입력 후 "경음화" 진단 받음
- 4단계 훈련법이 화면에 표시됨
- Gemini 응답이 저장됨

---

### Phase 2: 누적 분석 & 약점 추적 (1주)
**목표:** "300개 오답 기준 약점 음소 분석" 완성

```
Tasks:
1. WeakPhoneme 모델 생성
2. ErrorRecord 저장 시 WeakPhoneme 자동 집계 로직
3. 약점 조회 API
4. Dashboard Home 4개 스탯 카드 (learnedWords, practiceMinutes, consecutive, accuracy)
5. 약점 시각화 (% 바, 색상: green/yellow/pink)
6. "데이터 부족" 경고 & "신뢰도 높음" 메시지
7. 테스트 (300개 가상 오답 생성, 약점 계산 확인)
```

**성공 기준:**
- 300개 오답 입력 후 ㅅ 음소 45% 약점 표시
- 100개일 때 "데이터 부족" 경고 표시
- 500개일 때 "최근 5개월 신뢰도 높은 분석" 메시지

---

### Phase 3: 아이 연습 & 완성 (1주)
**목표:** 게임화된 아이 연습 페이지 + 모든 UI 완성

```
Tasks:
1. Child Practice 페이지 레이아웃 (게임 모드)
2. 5단계 닷 반복 연습 UI (진행률)
3. Confetti 애니메이션 (4~5개 완료 시)
4. PracticeAttempt 저장 API
5. Saved 페이지 (저장 단어 관리)
6. SavedWord API (CRUD)
7. Settings 페이지 (아이 정보, 로그아웃)
8. Bottom Navigation (5개 탭)
9. 전체 통합 테스트 + UI 폴리시
```

**성공 기준:**
- 아이가 "사과" 5회 연습 후 Confetti 터짐
- 연습 기록이 저장됨
- 저장 단어가 Saved 페이지에 표시됨

---

## 7. 작업 흐름

### 각 Phase 완료 후
1. BUILDER가 코드 구현 완료
2. `REVIEW-REQUEST.md` 제출 (변경사항 설명)
3. REVIEWER가 검토 → `REVIEW-FEEDBACK.md` 작성
4. ARCHITECT가 승인 후 다음 Phase 시작

---

## 8. 데이터 흐름 다이어그램

```
부모 입력 (오답노트)
    ↓
ErrorRecord 저장
    ↓
[로컬 자모 분해 엔진] → LocalAnalysis 저장
    ↓
동화 오류? → Yes → [Gemini Flash API] → GeminiFeedback 저장
    ↓ No
화면 표시
    ↓
매 오답 저장 시마다 WeakPhoneme 재계산
    ↓
아이 약점 음소 추적 (최근 300개 기준)
    ↓
대시보드 & 약점 리포트 표시
```

---

## 9. 환경 변수 (.env 확인 사항)

```bash
# 필수
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# 구글 OAuth
GOOGLE_ID=...
GOOGLE_SECRET=...

# 카카오 OAuth (선택)
KAKAO_ID=...
KAKAO_SECRET=...

# Gemini API
GOOGLE_GENAI_API_KEY=...  # Google AI Studio에서 발급
```

---

## 10. 성공 기준 (Definition of Done)

각 Phase 완료 = 아래 조건 모두 만족

### Phase 1
- [ ] 로컬 자모 분해 엔진 > 90% 정확도 (5가지 대체 오류 테스트)
- [ ] Gemini API 응답 < 1초
- [ ] DB에 오답 기록 저장 확인
- [ ] 오답 조회 API 동작 확인

### Phase 2
- [ ] WeakPhoneme 자동 집계 확인 (100개 입력 후 검증)
- [ ] 약점 API 응답 정확도 확인
- [ ] Dashboard 4개 스탯 카드 표시 확인

### Phase 3
- [ ] 아이 5회 연습 시뮬레이션 완료
- [ ] Confetti 애니메이션 정상 작동
- [ ] Saved 페이지 저장/삭제 기능 확인
- [ ] 모바일 반응형 확인 (max-width 512px)

---

## 11. 리스크 & 대응

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| Gemini API 비용 초과 | 낮음 | 중간 | 로컬 엔진으로 70% 커버 → API 호출 최소화 |
| PostgreSQL 성능 저하 | 낮음 | 높음 | 인덱스: (userId, createdAt), (childId, createdAt) |
| NextAuth 버전 호환 | 중간 | 낮음 | 공식 문서 참고, v5 베타 안정성 모니터링 |
| 한글 자모 분해 오류 | 낮음 | 중간 | 테스트 케이스 20개 이상 (각 오류 패턴별 2~3개) |

---

## 12. 다음 스텝

1. **BUILDER** → `ARCHITECT-BRIEF.md` 읽고 코드 작성 시작 (Phase 1)
2. **REVIEWER** → 코드 리뷰 체크리스트 준비
3. **ARCHITECT** → 매 Phase별 수락/반려 준비

