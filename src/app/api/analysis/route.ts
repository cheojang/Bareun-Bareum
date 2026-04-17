import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compareWords } from "@/lib/korean-phonetics";
import { buildArticulationGuides } from "@/lib/articulation-analysis";
import { generateGuidance } from "@/lib/gemini-ai";
import { validateKoreanWord } from "@/lib/korean-input-validation";

// 🌍 KST(한국 시간) 기준 자정 타임스탬프 구하기
function getKSTMidnight(date: Date | string | number) {
  const d = new Date(date);
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const kst = new Date(utc + 9 * 60 * 60 * 1000);
  kst.setUTCHours(0, 0, 0, 0);
  return kst.getTime();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetWord, heardWord, childId, sessionId } = await req.json();

  if (!targetWord || !heardWord || !childId || !sessionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const heardErr = validateKoreanWord(heardWord);
  if (heardErr) return NextResponse.json({ error: heardErr }, { status: 400 });

  // Verify session belongs to user + fetch child in one query
  const practiceSession = await prisma.practiceSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
    include: { child: true },
  });
  if (!practiceSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const child = practiceSession.child;
  const newTotalWords = child.totalWords + 1;

  // Korean phoneme analysis
  const errors = compareWords(targetWord.trim(), heardWord.trim());
  const isCorrect = errors.length === 0;

  // Build articulation guides for each error phoneme
  const articulationGuides = buildArticulationGuides(errors);

  // Generate AI guidance via Gemini Flash
  const guidanceText = await generateGuidance(targetWord, heardWord, errors);

  // 🧠 메모리 계산: 연속 학습일 (KST 기준)
  const now = new Date();
  const lastPractice = child.lastPractice;
  let newStreakDays = child.streakDays;

  if (!lastPractice) {
    newStreakDays = 1;
  } else {
    const nowMidnight = getKSTMidnight(now);
    const lastPracticeMidnight = getKSTMidnight(lastPractice);
    const daysDiff = Math.floor((nowMidnight - lastPracticeMidnight) / 86400000);

    if (daysDiff === 0) {
      // Same day: no change
      newStreakDays = child.streakDays;
    } else if (daysDiff === 1) {
      // Consecutive day: increment
      newStreakDays = child.streakDays + 1;
    } else {
      // Gap or future: reset to 1
      newStreakDays = 1;
    }
  }

  // 🎮 메모리 계산: 마스코트 레벨
  let newMascotLevel = 1;
  if (newTotalWords >= 100) newMascotLevel = 5;
  else if (newTotalWords >= 50) newMascotLevel = 4;
  else if (newTotalWords >= 20) newMascotLevel = 3;
  else if (newTotalWords >= 5) newMascotLevel = 2;

  // 원자적 트랜잭션: 단 2개 쿼리로 압축 (1번 트랜잭션 내부)
  const [wordRecord] = await prisma.$transaction([
    prisma.wordRecord.create({
      data: {
        sessionId,
        targetWord: targetWord.trim(),
        heardWord: heardWord.trim(),
        errorPhonemes: JSON.parse(JSON.stringify(errors)),
        guidanceText: JSON.stringify(guidanceText),
        isCorrect,
      },
    }),
    prisma.child.update({
      where: { id: childId },
      data: {
        totalWords: newTotalWords,
        lastPractice: now,
        streakDays: newStreakDays,
        mascotLevel: newMascotLevel,
      },
    }),
  ]);

  return NextResponse.json({
    wordRecordId: wordRecord.id,
    targetWord,
    heardWord,
    isCorrect,
    errors,
    guidanceText,
    articulationGuides,
    newMascotLevel, // 클라이언트 UI 애니메이션용
  });
}
