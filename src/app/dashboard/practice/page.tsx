import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getSelectedChildId } from "@/lib/child-cookie";
import {
  getSimilarPatternWords,
  getWordByText,
  phonemePositionFromError,
  type PhonemePosition,
} from "@/lib/word-database";
import { PracticeClient } from "./PracticeClient";

export const dynamic = "force-dynamic";

// 음소 추출: ReviewSchedule.phoneme 우선, 없으면 errorPattern 첫 자음
function pickPhoneme(reviewPhoneme: string | null | undefined, errorPattern: string | null | undefined): string {
  if (reviewPhoneme && reviewPhoneme !== "미분류") return reviewPhoneme;
  const m = errorPattern?.match(/^[ㄱ-ㅎ]/);
  return m ? m[0] : "전체";
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ errorRecordId?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id!;

  // 아이 목록 + 선택 ID 병렬 조회, select로 불필요 컬럼 제외
  const [children, savedId] = await Promise.all([
    prisma.child.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, image: true, mascotLevel: true },
    }),
    getSelectedChildId(),
  ]);

  if (children.length === 0) redirect("/onboarding");

  const child = children.find((c) => c.id === savedId) ?? children[0];

  const params = await searchParams;
  const errorRecordId = params.errorRecordId;

  // ── 1단계·2단계 단어 로딩 ────────────────────────────────────────────────
  // trainingTip을 단어별로 매칭하기 위해 stage1Words에 함께 저장
  // stage2Words는 sourceWord(원본 분석 단어)도 함께 저장
  let stage1Words: { word: string; errorPattern: string; trainingTip?: string; childPronunciation?: string }[] = [];
  let stage2Words: { word: string; sourceWord: string }[] = [];
  let errorPattern: string | undefined;

  if (errorRecordId) {
    // 분석 직후 연결: 해당 오류 기록 + 추천 단어
    const record = await prisma.errorRecord.findUnique({
      where: { id: errorRecordId },
      include: {
        geminiFeedback: { select: { trainingStep2: true } },
        reviewSchedule: { select: { phoneme: true } },
      },
    });
    if (record && record.childId === child.id) {
      stage1Words = [{
        word: record.targetWord,
        errorPattern: record.errorPattern,
        trainingTip: record.geminiFeedback?.trainingStep2 ?? undefined,
        childPronunciation: record.childPronunciation,
      }];
      errorPattern = record.errorPattern;
      // 유사패턴 단어: 같은 음소를 가진 "이미지 있는" DB 단어에서 선택 (Gemini 자유생성 대체)
      // 음소 위치(초성/종성)까지 맞춰 선택 — 예) 노트북(받침 ㄱ 탈락)엔 받침 ㄱ 단어만
      const ph = pickPhoneme(record.reviewSchedule?.phoneme, record.errorPattern);
      const pos = phonemePositionFromError(record.errorPattern, record.errorType);
      stage2Words = getSimilarPatternWords(ph, pos)
        .filter((w) => w.word !== record.targetWord)
        .slice(0, 8)
        .map((w) => ({ word: w.word, sourceWord: record.targetWord }));
    }
  } else {
    // 일반 진입: 최근 오류 기록 중 ① 마스터 안 된 + ② 음소 다양성을 갖춘 5개 선정
    const errorRecords = await prisma.errorRecord.findMany({
      where: { childId: child.id },
      orderBy: { createdAt: "desc" },
      take: 30, // 다양성 확보용 풀
      include: {
        geminiFeedback: { select: { trainingStep2: true } },
        reviewSchedule: { select: { phoneme: true, isLearned: true } },
      },
    });

    // 음소 추출: ReviewSchedule.phoneme 우선, 없으면 errorPattern 첫 자음 사용
    const getPhoneme = (rec: typeof errorRecords[number]): string =>
      pickPhoneme(rec.reviewSchedule?.phoneme, rec.errorPattern);

    // ① 마스터 완료(isLearned=true) 제외
    const notMastered = errorRecords.filter((r) => !r.reviewSchedule?.isLearned);

    const MAX_TOTAL = 5;
    const MAX_PER_PHONEME = 2;
    const stage1Seen = new Set<string>();
    const phonemeCount: Record<string, number> = {};
    // 선정된 stage1 단어의 음소 + 위치 (stage2 유사패턴 선택에 사용)
    const stage1Selected: { word: string; phoneme: string; position: PhonemePosition }[] = [];

    const pushWord = (rec: typeof errorRecords[number]) => {
      stage1Seen.add(rec.targetWord);
      stage1Selected.push({
        word: rec.targetWord,
        phoneme: getPhoneme(rec),
        position: phonemePositionFromError(rec.errorPattern, rec.errorType),
      });
      stage1Words.push({
        word: rec.targetWord,
        errorPattern: rec.errorPattern,
        trainingTip: rec.geminiFeedback?.trainingStep2 ?? undefined,
        childPronunciation: rec.childPronunciation,
      });
    };

    // ② 1차 패스: 음소 다양성 우선 (음소당 최대 2개)
    for (const rec of notMastered) {
      if (stage1Words.length >= MAX_TOTAL) break;
      if (stage1Seen.has(rec.targetWord)) continue;
      const ph = getPhoneme(rec);
      if ((phonemeCount[ph] ?? 0) >= MAX_PER_PHONEME) continue;
      phonemeCount[ph] = (phonemeCount[ph] ?? 0) + 1;
      pushWord(rec);
    }

    // ③ 2차 패스: 다양성으로 부족하면 음소 제한 풀고 채움
    if (stage1Words.length < MAX_TOTAL) {
      for (const rec of notMastered) {
        if (stage1Words.length >= MAX_TOTAL) break;
        if (stage1Seen.has(rec.targetWord)) continue;
        pushWord(rec);
      }
    }

    // 유사패턴 단어: 아이 오류 음소별로 "이미지 있는" DB 단어를 모음 (Gemini 대체)
    const stage2Seen = new Set<string>(stage1Seen);
    for (const sel of stage1Selected) {
      if (stage2Words.length >= 8) break;
      for (const w of getSimilarPatternWords(sel.phoneme, sel.position)) {
        if (stage2Words.length >= 8) break;
        if (stage2Seen.has(w.word)) continue;
        stage2Seen.add(w.word);
        stage2Words.push({ word: w.word, sourceWord: sel.word });
      }
    }

    errorPattern = stage1Words[0]?.errorPattern;
  }

  // 카드 이미지용: stage1+stage2 단어 → imageSlug 매핑 (서버에서 조회, 번들 영향 없음)
  const wordInfos: Record<string, { imageSlug?: string }> = {};
  for (const w of [...stage1Words, ...stage2Words]) {
    if (wordInfos[w.word]) continue;
    const slug = getWordByText(w.word)?.imageSlug;
    if (slug) wordInfos[w.word] = { imageSlug: slug };
  }

  return (
    <PracticeClient
      childId={child.id}
      childName={child.name}
      childImage={child.image}
      mascotLevel={child.mascotLevel}
      stage1Words={stage1Words}
      stage2Words={stage2Words}
      wordInfos={wordInfos}
      errorPattern={errorPattern}
    />
  );
}
