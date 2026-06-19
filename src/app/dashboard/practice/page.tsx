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
import { computeAdaptiveDifficulty } from "@/lib/adaptive-difficulty";
import { PracticeClient } from "./PracticeClient";

export const dynamic = "force-dynamic";

// 사이클 타입 — PracticeClient와 공유
export interface PracticeCycle {
  mainWord: {
    word: string;
    errorPattern?: string;
    trainingTip?: string;
    childPronunciation?: string;
  } | null;
  similarWords: Array<{ word: string; sourceWord?: string }>;
  sentence: string | null;
}

// 음소 추출: ReviewSchedule.phoneme 우선, 없으면 errorPattern 첫 자음
function pickPhoneme(reviewPhoneme: string | null | undefined, errorPattern: string | null | undefined): string {
  if (reviewPhoneme && reviewPhoneme !== "미분류") return reviewPhoneme;
  const m = errorPattern?.match(/^[ㄱ-ㅎ]/);
  return m ? m[0] : "전체";
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ errorRecordId?: string; routine?: string }>;
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
  // 루틴 모드: 세션 상한 축소 (아동 집중력 — 5~7분 안에 끝나는 분량)
  const routineMode = params.routine === "1";

  // 적응형 난이도: 최근 연습 결과(오래된→최신)로 결정 — 3연속 성공 ↑, 2연속 실패 ↓
  const recentResults = await prisma.wordRecord.findMany({
    where: { session: { childId: child.id } },
    orderBy: { practicedAt: "desc" },
    take: 30,
    select: { isCorrect: true },
  });
  const difficulty = computeAdaptiveDifficulty(
    recentResults.map((r) => r.isCorrect).reverse(),
  );

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
      stage2Words = getSimilarPatternWords(ph, pos, difficulty)
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

    // 루틴 모드: 분석단어 3개 + 유사패턴 5개로 축소 (전체 루틴 5~7분 유지)
    const MAX_TOTAL = routineMode ? 3 : 5;
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

    // 유사패턴 단어: 분석단어마다 "자기 몫"을 따로 확보 (Gemini 대체)
    // ⚠️ 단어별 상한을 둬야 첫 단어가 전부 가져가서 2번째 단어 유사어가 0개가 되는 걸 막음
    const SIMILAR_PER_WORD = 3;
    const stage2Seen = new Set<string>(stage1Seen);
    for (const sel of stage1Selected) {
      let added = 0;
      for (const w of getSimilarPatternWords(sel.phoneme, sel.position, difficulty)) {
        if (added >= SIMILAR_PER_WORD) break;
        if (stage2Seen.has(w.word)) continue;
        stage2Seen.add(w.word);
        stage2Words.push({ word: w.word, sourceWord: sel.word });
        added++;
      }
    }

    errorPattern = stage1Words[0]?.errorPattern;
  }

  // ── 3사이클 구성 ─────────────────────────────────────────────────────────────
  // 각 사이클: 오답단어 1개 → 그 단어와 연관된 유사단어 2개 → 문장 1개
  // 오답단어가 모자라면(또는 처음부터 없으면) 남은 유사단어로 사이클을 채움.
  const NUM_CYCLES = 3;
  const SIMILAR_PER_CYCLE = 2;
  const cycles: PracticeCycle[] = [];

  // sourceWord별로 유사단어 그룹핑 (해당 오답단어와 연관된 유사어만 뽑기 위함)
  const similarBySource = new Map<string, Array<{ word: string; sourceWord: string }>>();
  for (const sw of stage2Words) {
    if (!similarBySource.has(sw.sourceWord)) similarBySource.set(sw.sourceWord, []);
    similarBySource.get(sw.sourceWord)!.push(sw);
  }

  // 이미 쓴 유사단어 추적 → 사이클 간 중복 방지
  const usedSimilar = new Set<string>();
  const leftoverSimilars = () => stage2Words.filter((s) => !usedSimilar.has(s.word));
  // 특정 오답단어와 연관된 유사어를 n개 가져오고, 부족하면 남은 유사어로 보충
  const takeSimilars = (sourceWord: string, n: number) => {
    const out: Array<{ word: string; sourceWord: string }> = [];
    for (const s of similarBySource.get(sourceWord) ?? []) {
      if (out.length >= n) break;
      if (usedSimilar.has(s.word)) continue;
      usedSimilar.add(s.word);
      out.push(s);
    }
    if (out.length < n) {
      for (const s of leftoverSimilars()) {
        if (out.length >= n) break;
        usedSimilar.add(s.word);
        out.push(s);
      }
    }
    return out;
  };

  let s1i = 0;
  for (let ci = 0; ci < NUM_CYCLES; ci++) {
    let mainWord: PracticeCycle["mainWord"] = null;
    let assignedSimilars: Array<{ word: string; sourceWord: string }> = [];

    if (s1i < stage1Words.length) {
      const w = stage1Words[s1i++];
      mainWord = { word: w.word, errorPattern: w.errorPattern, trainingTip: w.trainingTip, childPronunciation: w.childPronunciation };
      assignedSimilars = takeSimilars(w.word, SIMILAR_PER_CYCLE);
    } else {
      // 오답단어 소진/없음 → 남은 유사단어로 main + 유사어 구성
      const left = leftoverSimilars();
      if (left.length === 0) break; // 더 만들 게 없으면 종료
      const first = left[0];
      usedSimilar.add(first.word);
      mainWord = { word: first.word };
      assignedSimilars = takeSimilars(first.sourceWord, SIMILAR_PER_CYCLE);
    }

    // 문장: main이 DB에 있으면 그 예문, 없으면(부모 임의입력) 유사단어 예문으로 폴백
    let sentence: string | null = null;
    for (const cand of [mainWord?.word, ...assignedSimilars.map((s) => s.word)].filter(Boolean) as string[]) {
      const s = getWordByText(cand)?.sampleSentence;
      if (s) { sentence = s; break; }
    }

    const similars = assignedSimilars.map((s) => ({ word: s.word, sourceWord: s.sourceWord }));
    if (mainWord || similars.length > 0) cycles.push({ mainWord, similarWords: similars, sentence });
  }

  // 카드 이미지용: 사이클에서 참조하는 모든 단어 → imageSlug 매핑
  const allCycleWords = cycles.flatMap((c) => [
    c.mainWord?.word,
    ...c.similarWords.map((s) => s.word),
  ]).filter(Boolean) as string[];

  const wordInfos: Record<string, { imageSlug?: string; difficulty?: string; ageGroup?: string }> = {};
  for (const word of [...new Set([...allCycleWords, ...stage1Words.map(w => w.word), ...stage2Words.map(w => w.word)])]) {
    if (wordInfos[word]) continue;
    const info = getWordByText(word);
    if (info) {
      wordInfos[word] = { imageSlug: info.imageSlug, difficulty: info.difficulty, ageGroup: info.ageGroup };
    }
  }

  // 이미 저장된 단어 — 저장 버튼 초기 채움 상태용
  const savedRows = await prisma.savedWord.findMany({
    where: { childId: child.id },
    select: { word: true },
  });
  const initialSavedWords = savedRows.map((r) => r.word);

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
      routineMode={routineMode}
      difficulty={difficulty}
      cycles={cycles}
      initialSavedWords={initialSavedWords}
    />
  );
}
