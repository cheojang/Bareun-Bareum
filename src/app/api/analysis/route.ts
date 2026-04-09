import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compareWords } from "@/lib/korean-phonetics";
import { buildArticulationGuides } from "@/lib/articulation-analysis";
import { generateGuidance } from "@/lib/gemini-ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetWord, heardWord, childId, sessionId } = await req.json();

  if (!targetWord || !heardWord || !childId || !sessionId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify session belongs to user
  const practiceSession = await prisma.practiceSession.findFirst({
    where: { id: sessionId, userId: session.user.id },
  });
  if (!practiceSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Korean phoneme analysis
  const errors = compareWords(targetWord.trim(), heardWord.trim());
  const isCorrect = errors.length === 0;

  // Build articulation guides for each error phoneme
  const articulationGuides = buildArticulationGuides(errors);

  // Generate AI guidance via Gemini Flash
  const guidanceText = await generateGuidance(targetWord, heardWord, errors);

  // Save word record
  const wordRecord = await prisma.wordRecord.create({
    data: {
      sessionId,
      targetWord: targetWord.trim(),
      heardWord: heardWord.trim(),
      errorPhonemes: JSON.parse(JSON.stringify(errors)),
      guidanceText,
      isCorrect,
    },
  });

  // Update child's total word count
  await prisma.child.update({
    where: { id: childId },
    data: {
      totalWords: { increment: 1 },
      lastPractice: new Date(),
    },
  });

  // Update streak
  await updateStreak(childId);

  // Update mascot level based on total words
  await updateMascotLevel(childId);

  return NextResponse.json({
    wordRecordId: wordRecord.id,
    targetWord,
    heardWord,
    isCorrect,
    errors,
    guidanceText,
    articulationGuides,
  });
}

async function updateStreak(childId: string) {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return;

  const now = new Date();
  const lastPractice = child.lastPractice;

  if (!lastPractice) {
    await prisma.child.update({ where: { id: childId }, data: { streakDays: 1 } });
    return;
  }

  const daysDiff = Math.floor(
    (now.setHours(0, 0, 0, 0) - new Date(lastPractice).setHours(0, 0, 0, 0)) / 86400000
  );

  if (daysDiff === 0) return; // Same day, no change
  if (daysDiff === 1) {
    await prisma.child.update({ where: { id: childId }, data: { streakDays: { increment: 1 } } });
  } else {
    await prisma.child.update({ where: { id: childId }, data: { streakDays: 1 } });
  }
}

async function updateMascotLevel(childId: string) {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return;

  const words = child.totalWords;
  let level = 1;
  if (words >= 100) level = 5;
  else if (words >= 50) level = 4;
  else if (words >= 20) level = 3;
  else if (words >= 5) level = 2;

  if (level !== child.mascotLevel) {
    await prisma.child.update({ where: { id: childId }, data: { mascotLevel: level } });
  }
}
