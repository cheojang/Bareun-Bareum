---
name: db-guard
description: prisma.schema·코드가 참조하는 스키마/버킷/환경변수/크론이 프로덕션에 실제 존재하는지 대조. 배포 전 또는 "/db-guard"로 실행.
---

# DB 가드 — 스키마 드리프트 검사

배포 전에 아래 4가지를 검사하고, 드리프트가 있으면 적용용 SQL을 만들어 **승인을 받은 뒤에만** 실행한다.

## 검사 절차

1. **스키마 드리프트**
   - `prisma/schema.prisma`의 모델·컬럼 목록을 추출한다.
   - 프로덕션 `information_schema.tables/columns`를 조회(읽기 전용)해 대조한다.
   - 누락: 테이블·컬럼·유니크 인덱스. (타입 변경·삭제는 보고만 하고 SQL 자동 생성 금지)

2. **Storage 버킷**
   - 코드에서 `storage.from("...")`와 버킷 상수를 grep으로 수집한다.
   - `storage.buckets` 조회 결과와 대조한다.

3. **환경변수 (키만)**
   - `process.env.X` 사용처를 grep으로 수집하고 `.env.example`과 대조한다.
   - 프로덕션 값은 조회하지 않는다 — 키 존재 여부만 확인 가능한 범위에서.

4. **크론 등록**
   - `src/app/api/cron/*` 디렉터리와 `vercel.json`의 crons 항목을 대조한다.

## 출력 형식
```
✅/❌ DB 가드 — 드리프트 N건
· [스키마] ReviewBonus.rejectSeenAt 없음 → ALTER TABLE ... ADD COLUMN ...
· [버킷] "images" 미존재 → INSERT INTO storage.buckets ...
· [환경] PG_POOL_MAX 코드 참조 있으나 .env.example에 없음
```
드리프트가 있으면 마지막에 "적용할까요?"를 물어라. 승인 전 실행 금지.

## 금지
- DROP / ALTER ... DROP 계열 자동 생성 금지 (추가·NULL 완화만)
- 프로덕션 데이터 조회 금지 — 스키마 메타데이터만
