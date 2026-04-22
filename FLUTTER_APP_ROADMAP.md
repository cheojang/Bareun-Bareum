# SORI 모바일 앱 개발 로드맵 (Flutter)

**작성일:** 2026-04-23
**목적:** 현재 Next.js 웹 서비스(SORI, 바른발음)를 iOS/Android 네이티브 앱으로 확장
**전략:** 백엔드(Next.js API) **재사용** + Flutter로 **모바일 앱 신규 개발**

---

## 📌 프로젝트 개요

### 현재 자산 (재사용)
- **백엔드:** Next.js 16 API Routes (35개 엔드포인트)
- **DB:** PostgreSQL + Prisma ORM
- **AI:** Gemini API (NDJSON 스트리밍)
- **도메인 로직:** 한글 자모 분해, SM-2 알고리즘, 조음 오류 20패턴

### 신규 개발 (Flutter 앱)
- **타겟:** iOS 14+ / Android 8+ (API 26+)
- **UI/UX:** 현재 웹의 디자인 시스템(peach/mint/pastel) 포팅
- **배포:** Apple App Store + Google Play

### 아키텍처 원칙
```
┌────────────────────┐      ┌─────────────────────┐
│   Flutter App      │      │   Next.js 웹        │
│ (iOS / Android)    │      │ (부모 대시보드)     │
└─────────┬──────────┘      └──────────┬──────────┘
          │                            │
          │      REST / NDJSON         │
          └────────────┬───────────────┘
                       │
                ┌──────▼──────┐
                │  Next.js    │
                │  API Routes │
                │  (공통)     │
                └──────┬──────┘
                       │
                ┌──────▼──────┐
                │ PostgreSQL  │
                │ + Gemini    │
                └─────────────┘
```

**핵심:** API는 단일, UI만 플랫폼별로 존재 → 로직 분산·버전 관리 리스크 최소화.

---

## 🎯 단계별 로드맵

### Phase 0: 백엔드 선행 정비 (2주)
모바일 앱을 붙이기 전에 API 쪽에 먼저 해둘 일.

- [ ] **모바일용 인증 엔드포인트 추가** — NextAuth는 웹 쿠키 기반이라 모바일에는 부적합
  - `POST /api/mobile/auth/google` — Google ID 토큰 검증 → JWT 발급
  - `POST /api/mobile/auth/kakao` — Kakao access token 검증 → JWT 발급
  - `POST /api/mobile/auth/apple` — Apple Sign-In (iOS 심사 필수)
  - `POST /api/mobile/auth/refresh` — refresh token으로 access token 갱신
- [ ] **JWT 미들웨어** — 기존 `auth()` 함수를 JWT Bearer 토큰도 받도록 확장 (`src/lib/auth.ts`)
- [ ] **FCM 토큰 저장 스키마** — `User.fcmTokens String[]` 추가, 다중 디바이스 대응
- [ ] **API 버전 관리** — `/api/v1/` prefix 도입 (향후 breaking change 대비)
- [ ] **Rate limit 분산화** — 현재 인메모리 → Upstash Redis (모바일에서 다수 요청 대응)
- [ ] **OpenAPI / TypeScript 타입 export** — Flutter 쪽 모델 자동 생성용

### Phase 1: Flutter 프로젝트 스캐폴딩 (1주)

**프로젝트 구조 (권장):**
```
sori_app/
├── pubspec.yaml
├── lib/
│   ├── main.dart
│   ├── app.dart                    # MaterialApp + router
│   ├── core/
│   │   ├── theme/                  # 색상·폰트·BubbleCard 포팅
│   │   ├── network/                # Dio 클라이언트 + 인터셉터
│   │   ├── auth/                   # 토큰 저장·갱신
│   │   └── utils/                  # KST 유틸, 한글 자모 등
│   ├── features/
│   │   ├── login/
│   │   ├── onboarding/
│   │   ├── dashboard/              # 홈
│   │   ├── answer_note/            # 발음 분석
│   │   ├── practice/               # 반복 연습 (5-dot + 자동차)
│   │   ├── bookmarks/              # 복습 목록
│   │   ├── progress/               # 진도
│   │   ├── settings/
│   │   └── center/                 # 치료사 전용
│   ├── models/                     # API 응답 모델 (json_serializable)
│   └── widgets/                    # 공용 위젯 (BubbleCard, PastelBadge...)
├── assets/
│   ├── images/
│   └── fonts/
├── ios/
└── android/
```

**핵심 패키지:**
| 용도 | 패키지 | 이유 |
|------|--------|------|
| 상태관리 | `flutter_riverpod` | 간결·테스트 용이, BLoC보다 학습 곡선 낮음 |
| 네트워킹 | `dio` | 인터셉터·스트리밍 지원, NDJSON 파싱 용이 |
| 라우팅 | `go_router` | 딥링크 대응, Next.js router와 사고방식 유사 |
| 보안 저장 | `flutter_secure_storage` | JWT 토큰 저장 (Keychain/Keystore) |
| 일반 저장 | `shared_preferences` | 설정·캐시 |
| 모델 직렬화 | `freezed` + `json_serializable` | 불변 모델 + 자동 생성 |
| SVG | `flutter_svg` | 마스코트, 아이콘 |
| 애니메이션 | (기본 제공) + `rive` (선택) | 자동차·마스코트 애니 |
| 차트 | `fl_chart` | 진도 그래프 |
| 소셜 로그인 | `google_sign_in`, `kakao_flutter_sdk`, `sign_in_with_apple` | |
| 푸시 | `firebase_messaging` | FCM |
| 인앱결제 | `in_app_purchase` | iOS/Android 스토어 결제 |

### Phase 2: 인증 플로우 (1-2주)

**웹과 다른 점:**
- 웹: NextAuth 쿠키 기반 세션
- 모바일: SDK로 토큰 획득 → 백엔드에 전송 → JWT 수령 → Secure Storage 저장

**구현:**
```dart
// features/login/auth_service.dart
class AuthService {
  Future<String> signInWithGoogle() async {
    final googleUser = await GoogleSignIn().signIn();
    final auth = await googleUser!.authentication;
    // 백엔드에 ID 토큰 보내고 우리 JWT 받기
    final res = await dio.post('/api/mobile/auth/google',
        data: {'idToken': auth.idToken});
    final jwt = res.data['accessToken'];
    await secureStorage.write(key: 'jwt', value: jwt);
    return jwt;
  }
}
```

**iOS 심사 대응:**
- 소셜 로그인(Google/Kakao)이 있으면 **Apple Sign-In 필수** (앱스토어 가이드라인 4.8)
- `sign_in_with_apple` 패키지로 구현

### Phase 3: 디자인 시스템 포팅 (2주)

**색상 팔레트 (Dart 상수화):**
```dart
class SoriColors {
  static const peach = Color(0xFFFFB38A);       // 주 강조
  static const mint = Color(0xFF7EDFD0);        // 성공·복습
  static const lavender = Color(0xFFB5A6E3);    // 분석
  static const pink = Color(0xFFFCA5A5);        // 오류·경고
  static const yellow = Color(0xFFFDE68A);      // 중간
  static const brown = Color(0xFF3D3530);       // 텍스트
  static const bgCream = Color(0xFFFFF5EE);
}
```

**공용 위젯 포팅:**
- `BubbleCard` → Flutter `Container(decoration: BoxDecoration(borderRadius, boxShadow...))`
- `BubbleButton` → `ElevatedButton` + 커스텀 테마
- `PastelBadge` → `Container` 래퍼
- `MascotCharacter` → `SvgPicture.asset`
- `ConfettiEffect` → `confetti` 패키지 또는 `CustomPainter`
- `LoadingSpinner` → `CircularProgressIndicator` 래퍼

**타이포그래피:**
- 한글 폰트 번들 (예: Pretendard, Gmarket Sans) → `assets/fonts/`
- `TextTheme`에 등록

### Phase 4: 핵심 화면 구현 (4-6주)

우선순위 순:

#### 4-1. 홈 대시보드 (1주)
- 마스코트 + 통계 (단어/연속일)
- 오늘의 미션 3카드 (복습/약점/도전)
- 약점 음소 분석 카드
- **API:** `GET /api/daily-missions`, `GET /api/weak-phonemes`

#### 4-2. 발음 분석 (1주)
- 목표 단어 / 아이 발음 입력 폼
- 한글 자모 실시간 검증 (`core/utils/korean.dart`에 포팅)
- 분석 결과 + Gemini 스트리밍 표시 (**중요**)
- 기록 리스트 + 전체 초기화

**Gemini NDJSON 스트리밍 (Flutter):**
```dart
final response = await dio.post(
  '/api/gemini-feedback',
  data: {'errorRecordId': id},
  options: Options(responseType: ResponseType.stream),
);

final stream = (response.data as ResponseBody).stream;
await for (final chunk in stream.transform(utf8.decoder)) {
  for (final line in chunk.split('\n').where((l) => l.isNotEmpty)) {
    try {
      final msg = jsonDecode(line);
      if (msg['type'] == 'field') {
        // 원인, 훈련 1~4단계 점진적 업데이트
        ref.read(geminiStateProvider.notifier).update(msg['field'], msg['value']);
      }
    } catch (_) {}
  }
}
```

#### 4-3. 반복 연습 (2주, 가장 복잡)
- 복습(SM-2) → 1단계 → 2단계 → 3단계 4-phase 플로우
- 5-dot 평가 시스템
- **자동차 애니메이션** — `AnimatedPositioned` + Tween 사용
- 단계 인디케이터
- 완료 시 confetti

**자동차 애니메이션 (Flutter):**
```dart
AnimatedPositioned(
  duration: const Duration(milliseconds: 700),
  curve: Curves.easeOut,
  left: progress * (trackWidth - carSize),
  child: Transform(
    alignment: Alignment.center,
    transform: Matrix4.identity()..scale(-1.0, 1.0), // 좌우 반전
    child: const Text('🚗', style: TextStyle(fontSize: 28)),
  ),
)
```

#### 4-4. 복습 목록 (1주)
- 발음 분석 기록 행 (하나의 카드 안 행 구조)
- 저장한 단어 (날짜별 그룹)
- 초기화 버튼

#### 4-5. 진도 (1주)
- `fl_chart` — 주간/월간 그래프
- 약점 음소 차트
- **API:** `GET /api/progress`

#### 4-6. 설정 (3일)
- 아이 프로필 관리
- 로그아웃
- 약관·개인정보

### Phase 5: 치료사 / 센터 기능 (2주)
- 치료사 전용 앱 or 동일 앱 내 역할 분기 (권장: **단일 앱, 역할 분기**)
- 담당 아이 목록
- 숙제 발행 / 치료 일지
- **API:** `/api/center/*` 재사용

### Phase 6: 푸시 알림 (1주)
- Firebase 설정 (iOS APNs 인증서, Android google-services.json)
- FCM 토큰 등록 → 백엔드 저장
- 시나리오:
  - 치료사 숙제 발행 → 부모에게 알림
  - 복습 리마인더 (매일 저녁)
  - 새 분석 결과 준비됨

### Phase 7: 결제 (2주)
**중요 결정사항:** Toss Payments 웹뷰 vs 네이티브 인앱결제(IAP)
- **웹뷰 방식:** 구현 쉬움, 수수료 낮음, **BUT Apple은 디지털 재화에 IAP 강제** → 심사 거부 위험
- **IAP 방식:** 30% 수수료, **BUT 공식 권장**, 사용자 경험 일관

**권장:**
- iOS: `in_app_purchase` 패키지로 IAP (30% 수수료 감수)
- Android: IAP 또는 Toss 웹뷰 (Play Store도 점차 IAP 요구 강화 중)

### Phase 8: 테스트 & 배포 (3주)
- [ ] **단위 테스트:** 핵심 로직 (한글 자모, SM-2 동기화) — Dart `test` 프레임워크
- [ ] **위젯 테스트:** 주요 화면 렌더링 검증
- [ ] **통합 테스트:** `integration_test` 패키지로 플로우 검증
- [ ] **내부 테스트 배포:**
  - Android: Google Play 내부 테스트 트랙
  - iOS: TestFlight
- [ ] **심사 준비:**
  - 프라이버시 정책 URL
  - 앱 스크린샷 (iPhone 6.7"/6.5"/5.5", iPad, Android)
  - 앱 설명 (한국어)
  - 개인정보 처리 항목 선언 (iOS App Privacy)
  - 4+/12+ 연령 등급
- [ ] **출시**

---

## 🗺 화면 대조표

| 웹 경로 | Flutter Route | 우선도 |
|---------|---------------|--------|
| `/login` | `/login` | 🔴 필수 |
| `/onboarding` | `/onboarding` | 🔴 필수 |
| `/dashboard` | `/home` | 🔴 필수 |
| `/dashboard/answer-note` | `/analysis` | 🔴 필수 |
| `/dashboard/answer-note/comprehensive` | `/analysis/comprehensive` | 🟠 |
| `/dashboard/practice` | `/practice` | 🔴 필수 |
| `/dashboard/bookmarks` | `/bookmarks` | 🟠 |
| `/dashboard/progress` | `/progress` | 🟡 |
| `/dashboard/settings` | `/settings` | 🔴 필수 |
| `/dashboard/session/*` | (미구현 or 후순위) | 🟢 |
| `/dashboard/homework` | `/homework` (치료사) | 🟠 |
| `/dashboard/therapy-notes` | `/notes` (치료사) | 🟠 |
| `/dashboard/child` | `/kids-mode` | 🟡 |

---

## ⚠️ 주요 리스크 & 대응

### 🔴 High

**1. Gemini NDJSON 스트리밍 호환성**
- Flutter `dio`의 ResponseBody 스트림 파싱 로직 필요
- 부분 JSON 버퍼링, 네트워크 끊김 복구 코드 작성
- 대응: 초반 프로토타입에서 먼저 검증 (Phase 0 말)

**2. OAuth 모바일 플로우 재설계**
- NextAuth는 웹 전용 → 모바일 토큰 검증 엔드포인트 신규 필수
- Kakao SDK 네이티브 플러그인 설정 (Info.plist / AndroidManifest.xml)
- 대응: Phase 0에서 백엔드 먼저 구현

**3. Apple App Store 심사**
- 소셜 로그인 있으면 Apple Sign-In 필수
- 아동 앱이면 COPPA 대응 (미국) — 개인정보 수집 최소화
- IAP 강제 이슈 (구독 결제 시)
- 대응: 심사 가이드라인 체크리스트화, 1차 심사 실패 가정하고 2주 버퍼 확보

### 🟠 Medium

**4. 디자인 시스템 일관성**
- Tailwind 유틸 클래스 → Flutter 위젯 변환 시 세부 여백·그림자 틀어지기 쉬움
- 대응: Figma에 모바일 디자인 먼저 정리 → 개발자가 참조

**5. 오프라인 대응**
- 현재 웹은 항상 온라인 전제
- 모바일은 지하철·엘리베이터 등 연결 불안정 상황 고려
- 대응: `connectivity_plus` + 오프라인 큐 (로컬 저장 후 재전송)

### 🟡 Low

**6. 한글 폰트 번들 용량**
- `Pretendard` full 번들 시 앱 용량 +5MB
- 대응: 필요 weight만 포함 (Regular, Bold, Black)

**7. 애니메이션 성능**
- 60fps 유지 위해 `repaint` 최소화 필요
- 대응: Flutter DevTools 성능 프로파일러로 검증

---

## 💰 기간 & 비용 추정

| Phase | 기간 | 인력 |
|-------|------|------|
| 0. 백엔드 정비 | 2주 | Backend 1명 |
| 1. 프로젝트 스캐폴딩 | 1주 | Flutter 1명 |
| 2. 인증 플로우 | 1-2주 | Flutter 1명 + Backend 지원 |
| 3. 디자인 시스템 | 2주 | Flutter 1명 + Designer 협업 |
| 4. 핵심 화면 | 4-6주 | Flutter 1-2명 |
| 5. 치료사 기능 | 2주 | Flutter 1명 |
| 6. 푸시 알림 | 1주 | Flutter 1명 + Backend |
| 7. 결제 | 2주 | Flutter 1명 + Backend |
| 8. 테스트·배포 | 3주 | 전원 + QA |
| **합계** | **18-22주 (약 5개월)** | Flutter 1-2명 + Backend 0.5명 |

**1인 개발 시:** 8-10개월 예상 (병렬 작업 불가)

**스토어 비용:**
- Apple Developer Program: $99/년
- Google Play Console: $25 (1회)
- Firebase (FCM): Spark 플랜 무료 (충분)
- CodeMagic/Bitrise CI: $0-50/월

---

## 🛠 개발자가 꼭 알아야 할 것

### 현재 프로젝트 도메인 핵심 파일 (반드시 읽기)
- [src/lib/jamo-analysis.ts](src/lib/jamo-analysis.ts) — 한글 자모 분해 (Dart로 포팅 필요)
- [src/lib/sm2.ts](src/lib/sm2.ts) — 망각 곡선 알고리즘 (Dart 포팅)
- [src/lib/articulation-analysis.ts](src/lib/articulation-analysis.ts) — 20개 오류 패턴
- [AI-LOGIC.md](AI-LOGIC.md) — 조음 오류 패턴 문서
- [prisma/schema.prisma](prisma/schema.prisma) — 데이터 모델

### Flutter 진입점 학습 자료
- **Flutter 공식 Codelab:** https://docs.flutter.dev/codelabs
- **Riverpod 공식 가이드:** https://riverpod.dev
- **FlutterFire (Firebase):** https://firebase.flutter.dev
- **Kakao Flutter SDK:** https://developers.kakao.com/docs/latest/ko/kakaologin/flutter

### 팀 합의가 필요한 결정
1. **단일 앱 (부모+치료사 역할 분기) vs 두 개 앱** — 단일 권장
2. **IAP vs 웹뷰 결제** — iOS는 IAP 필수, Android는 선택
3. **오프라인 범위** — 읽기 전용만 vs 오프라인 연습까지
4. **최소 지원 OS 버전** — iOS 14 / Android 8 권장
5. **앱 이름·아이콘** — "바른발음" / "SORI" 중 택1, 아이콘 신규 디자인

---

## 📋 Phase 0 즉시 착수 체크리스트

백엔드 정비를 다음 1-2주 안에 마치면 Flutter 개발자 투입 가능:

- [ ] `prisma/schema.prisma` — `User.fcmTokens`, `mobileRefreshTokens` 추가
- [ ] `src/app/api/mobile/auth/google/route.ts` 신규
- [ ] `src/app/api/mobile/auth/kakao/route.ts` 신규
- [ ] `src/app/api/mobile/auth/apple/route.ts` 신규
- [ ] `src/app/api/mobile/auth/refresh/route.ts` 신규
- [ ] `src/lib/jwt.ts` — JWT 발급·검증 유틸 (`jose` 라이브러리)
- [ ] `src/lib/auth.ts` — JWT Bearer 토큰도 인식하도록 확장
- [ ] `/api/v1/` prefix 도입 및 기존 엔드포인트 alias 유지
- [ ] OpenAPI 스펙 문서 생성 (`zod-to-openapi` or 수기)
- [ ] Postman / Insomnia 컬렉션 export (Flutter 개발자가 쓰도록)
- [ ] Upstash Redis 연결 — rate-limit 분산화

---

## 📝 참고: 기존 파일 구조 → Flutter 매핑

### 재사용 가능 (수정 최소)
- `src/app/api/**` — 전체 API (인증 방식만 확장)
- `prisma/schema.prisma` — DB 스키마 (FCM, refresh token 몇 개 추가)
- `src/lib/jamo-analysis.ts` — Dart로 1:1 포팅
- `src/lib/sm2.ts` — Dart로 1:1 포팅
- `src/lib/articulation-analysis.ts` — Dart로 1:1 포팅 (공통 로직 유지)

### 재작성 필요
- `src/app/dashboard/**` — 모든 UI → Flutter 위젯으로 신규
- `src/components/**` — React 컴포넌트 → Flutter 위젯으로 신규
- `tailwind.config.ts` → Flutter Theme 데이터로 변환

### 참고만
- `src/lib/auth.ts` — NextAuth는 유지 (웹용), 모바일은 별도 JWT 경로

---

_문서 버전: 1.0_
_다음 업데이트 시: Phase 0 완료 시점에 Flutter 프로젝트 리포지토리 링크 추가_
