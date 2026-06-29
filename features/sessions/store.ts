import { randomBytes } from "node:crypto";
import type { Answer, AnswerOption, GameSession, LiveAnswerHeatmap, Participant, Question, Quiz, QuizCategory } from "@/types/domain";
import { buildLeaderboard, calculatePoints } from "@/lib/scoring";
import { canSubmitAnswer } from "@/lib/session-state";
import { getCurrentUserId } from "@/features/auth/session";
import { defaultParticipantEmoji, isAllowedParticipantEmoji } from "@/lib/participant-emojis";

type QuizInput = Omit<Partial<Quiz>, "questions"> & {
  title: string;
  categoryId?: string | null;
  categoryName?: string | null;
  questions: Array<
    Partial<Question> & Pick<Question, "questionText" | "answerA" | "answerB" | "answerC" | "answerD" | "correctAnswer">
  >;
};

const systemUserId = "system-instructor";

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma as any;
}

function iso(value: Date | string | null | undefined) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function toQuestion(question: any): Question {
  return {
    ...question,
    correctAnswer: question.correctAnswer as AnswerOption,
    createdAt: iso(question.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(question.updatedAt) ?? new Date().toISOString()
  };
}

function toQuiz(quiz: any): Quiz {
  return {
    ...quiz,
    createdAt: iso(quiz.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(quiz.updatedAt) ?? new Date().toISOString(),
    category: quiz.category ? toQuizCategory(quiz.category) : null,
    questions: [...(quiz.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex).map(toQuestion)
  };
}

function toQuizCategory(category: any): QuizCategory {
  return {
    ...category,
    createdAt: iso(category.createdAt) ?? new Date().toISOString(),
    updatedAt: iso(category.updatedAt) ?? new Date().toISOString()
  };
}

function toSession(session: any): GameSession {
  return {
    ...session,
    status: session.status,
    currentQuestionStartedAt: iso(session.currentQuestionStartedAt),
    startedAt: iso(session.startedAt),
    finishedAt: iso(session.finishedAt),
    createdAt: iso(session.createdAt) ?? new Date().toISOString()
  };
}

function toParticipant(participant: any): Participant {
  return {
    ...participant,
    emoji: participant.emoji ?? defaultParticipantEmoji,
    joinedAt: iso(participant.joinedAt) ?? new Date().toISOString(),
    lastSeenAt: iso(participant.lastSeenAt)
  };
}

function toAnswer(answer: any): Answer {
  return {
    ...answer,
    selectedAnswer: answer.selectedAnswer as AnswerOption,
    submittedAt: iso(answer.submittedAt) ?? new Date().toISOString()
  };
}

async function ensureDemoUser() {
  const prisma = await getPrisma();
  await prisma.user.upsert({
    where: { id: systemUserId },
    update: {},
    create: {
      id: systemUserId,
      name: "Fahrduell System",
      email: "system@fahrduell.local",
      passwordHash: "system-account-not-for-login",
      role: "INSTRUCTOR"
    }
  });
}

async function ensureDemoQuiz() {
  const prisma = await getPrisma();
  await ensureDefaultQuizCategories();
  const count = await prisma.quiz.count();
  if (count > 0) return;

  const defaultCategory = await prisma.quizCategory.findUnique({ where: { name: "Fahrschule" } });

  await ensureDemoUser();
  await prisma.quiz.create({
    data: {
      id: "demo-quiz",
      title: "Fahrduell Demo-Quiz",
      description: "Ein kompaktes Live-Quiz für die Fahrschulausbildung.",
      createdById: systemUserId,
      categoryId: defaultCategory?.id,
      questions: {
        create: [
          {
            id: "demo-question-0",
            orderIndex: 0,
            questionText: "Was bedeutet ein dreieckiges Verkehrszeichen mit rotem Rand?",
            answerA: "Hinweis auf eine Autobahn",
            answerB: "Warnung vor einer Gefahrstelle",
            answerC: "Absolutes Halteverbot",
            answerD: "Beginn einer Umweltzone",
            correctAnswer: "B",
            timeLimitSeconds: 20,
            explanation: "Dreieckige Zeichen mit rotem Rand sind Gefahrzeichen.",
            memorySentence: "Dreieck mit rotem Rand bedeutet: Achtung, Gefahr.",
            practicalExample: "Reduziere die Geschwindigkeit und rechne mit einer konkreten Gefahrstelle.",
            mediaType: "none"
          },
          {
            id: "demo-question-1",
            orderIndex: 1,
            questionText: "Wie gross sollte der Sicherheitsabstand auf trockener Fahrbahn mindestens sein?",
            answerA: "Halber Tachowert in Metern",
            answerB: "Ein Meter pro 10 km/h",
            answerC: "Immer exakt 20 Meter",
            answerD: "Nur der Bremsweg zaehlt",
            correctAnswer: "A",
            timeLimitSeconds: 20,
            explanation: "Als Faustregel gilt: halber Tachowert in Metern.",
            memorySentence: "Halber Tacho in Metern ist der Mindestabstand bei guten Bedingungen.",
            practicalExample: "Bei 50 km/h haeltst du mindestens etwa 25 Meter Abstand.",
            mediaType: "none"
          }
        ]
      }
    }
  });
}

export async function listQuizzes() {
  await ensureDemoQuiz();
  const prisma = await getPrisma();
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, questions: { orderBy: { orderIndex: "asc" } } }
  });
  return quizzes.map(toQuiz);
}

export async function getQuiz(id: string) {
  await ensureDemoQuiz();
  const prisma = await getPrisma();
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { category: true, questions: { orderBy: { orderIndex: "asc" } } }
  });
  return quiz ? toQuiz(quiz) : null;
}

export async function getQuizByTitle(title: string) {
  await ensureDemoQuiz();
  const prisma = await getPrisma();
  const quiz = await prisma.quiz.findFirst({
    where: { title: title.trim() },
    include: { category: true, questions: { orderBy: { orderIndex: "asc" } } }
  });
  return quiz ? toQuiz(quiz) : null;
}

export async function ensureDefaultQuizCategories() {
  const prisma = await getPrisma();
  for (const name of ["Fahrschule", "Privat"]) {
    await prisma.quizCategory.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
}

export async function listQuizCategories() {
  await ensureDefaultQuizCategories();
  const prisma = await getPrisma();
  const categories = await prisma.quizCategory.findMany({
    orderBy: { name: "asc" }
  });
  return categories.map(toQuizCategory);
}

async function resolveQuizCategory(input: { categoryId?: string | null; categoryName?: string | null }) {
  const prisma = await getPrisma();
  const categoryName = input.categoryName?.trim();
  if (categoryName) {
    const category = await prisma.quizCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName }
    });
    return category.id;
  }
  return input.categoryId?.trim() || null;
}

export async function createQuizCategory(name: string) {
  const prisma = await getPrisma();
  const cleanedName = name.trim();
  if (!cleanedName) throw new Error("Bitte einen Kategorienamen eingeben.");
  const category = await prisma.quizCategory.upsert({
    where: { name: cleanedName },
    update: {},
    create: { name: cleanedName }
  });
  return toQuizCategory(category);
}

export async function upsertQuiz(input: QuizInput) {
  await ensureDemoUser();
  const prisma = await getPrisma();
  const existing = input.id ? await prisma.quiz.findUnique({ where: { id: input.id } }) : null;
  const categoryId = await resolveQuizCategory(input);
  const currentUserId = (await getCurrentUserId()) ?? systemUserId;

  const quiz = await prisma.$transaction(async (tx: any) => {
    const savedQuiz = existing
      ? await tx.quiz.update({
          where: { id: input.id },
          data: { title: input.title, description: input.description ?? "", categoryId }
        })
      : await tx.quiz.create({
          data: { title: input.title, description: input.description ?? "", createdById: currentUserId, categoryId }
        });

    await tx.question.deleteMany({ where: { quizId: savedQuiz.id } });
    await tx.question.createMany({
      data: input.questions.map((question, index) => ({
        quizId: savedQuiz.id,
        orderIndex: index,
        questionText: question.questionText,
        answerA: question.answerA,
        answerB: question.answerB,
        answerC: question.answerC,
        answerD: question.answerD,
        correctAnswer: question.correctAnswer,
        timeLimitSeconds: Number(question.timeLimitSeconds ?? 20),
        explanation: question.explanation ?? "",
        answerAExplanation: question.answerAExplanation ?? null,
        answerBExplanation: question.answerBExplanation ?? null,
        answerCExplanation: question.answerCExplanation ?? null,
        answerDExplanation: question.answerDExplanation ?? null,
        memorySentence: question.memorySentence ?? null,
        memoryQuestion: question.memoryQuestion ?? null,
        practicalExample: question.practicalExample ?? null,
        hint: question.hint ?? null,
        mediaType: question.mediaType ?? "none",
        mediaUrl: question.mediaUrl ?? null,
        mediaAlt: question.mediaAlt ?? null,
        mediaCaption: question.mediaCaption ?? null,
        difficulty: question.difficulty ?? null,
        category: question.category ?? null,
        topic: question.topic ?? null,
        imageUrl: question.imageUrl ?? null
      }))
    });

    return tx.quiz.findUniqueOrThrow({
      where: { id: savedQuiz.id },
      include: { category: true, questions: { orderBy: { orderIndex: "asc" } } }
    });
  });

  return toQuiz(quiz);
}

export async function deleteQuiz(id: string) {
  const prisma = await getPrisma();
  await prisma.quiz.delete({ where: { id } });
}

function makeJoinCode() {
  return randomBytes(5).toString("base64url").replace(/[^A-Z0-9]/gi, "").slice(0, 8).toUpperCase();
}

export async function createSession(quizId: string) {
  const prisma = await getPrisma();
  let joinCode = makeJoinCode();
  while (!joinCode || (await prisma.gameSession.findUnique({ where: { joinCode } }))) {
    joinCode = makeJoinCode();
  }

  const session = await prisma.gameSession.create({
    data: { quizId, joinCode }
  });
  return toSession(session);
}

export async function getSession(sessionId: string) {
  const prisma = await getPrisma();
  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  return session ? toSession(session) : null;
}

export async function getSessionByJoinCode(joinCode: string) {
  const prisma = await getPrisma();
  const session = await prisma.gameSession.findUnique({ where: { joinCode: joinCode.toUpperCase() } });
  return session ? toSession(session) : null;
}

export async function getParticipant(participantId: string) {
  const prisma = await getPrisma();
  const participant = await prisma.participant.update({
    where: { id: participantId },
    data: { lastSeenAt: new Date() }
  }).catch(() => null);
  return participant ? toParticipant(participant) : null;
}

export async function getSessionBundle(sessionId: string) {
  const prisma = await getPrisma();
  const sessionRecord = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      quiz: { include: { questions: { orderBy: { orderIndex: "asc" } } } },
      participants: { orderBy: { joinedAt: "asc" } },
      answers: { orderBy: { submittedAt: "asc" } }
    }
  });
  if (!sessionRecord) return null;

  const session = toSession(sessionRecord);
  const quiz = toQuiz(sessionRecord.quiz);
  const participants = sessionRecord.participants.map(toParticipant);
  const answers = sessionRecord.answers.map(toAnswer);
  return { session, quiz, participants, answers, leaderboard: buildLeaderboard(participants, answers) };
}

function disambiguateParticipantNames(participants: Participant[]) {
  const counts = new Map<string, number>();
  return participants.map((participant) => {
    const nextCount = (counts.get(participant.displayName) ?? 0) + 1;
    counts.set(participant.displayName, nextCount);
    return {
      ...participant,
      displayName: nextCount === 1 ? participant.displayName : `${participant.displayName} (${nextCount})`
    };
  });
}

export function buildLiveAnswerHeatmap(bundle: Awaited<ReturnType<typeof getSessionBundle>>): LiveAnswerHeatmap | null {
  if (!bundle) return null;
  const question = bundle.quiz.questions[bundle.session.currentQuestionIndex];
  if (!question) return null;

  const participants = disambiguateParticipantNames(bundle.participants);
  const answersByParticipant = new Map<string, Answer>(
    bundle.answers
      .filter((answer: Answer) => answer.questionId === question.id)
      .map((answer: Answer) => [answer.participantId, answer] as const)
  );

  const heatmapParticipants = participants.map((participant) => {
    const answer = answersByParticipant.get(participant.id);
    return {
      id: participant.id,
      displayName: participant.displayName,
      emoji: participant.emoji ?? defaultParticipantEmoji,
      selectedAnswer: answer?.selectedAnswer ?? null,
      hasAnswered: Boolean(answer),
      answeredAt: answer?.submittedAt ?? null
    };
  });

  return {
    questionId: question.id,
    correctAnswer: bundle.session.status === "ANSWER_REVEALED" || bundle.session.status === "EXPLANATION_VISIBLE" || bundle.session.status === "LEADERBOARD_VISIBLE" || bundle.session.status === "FINISHED" ? question.correctAnswer : null,
    participants: heatmapParticipants,
    counts: {
      A: heatmapParticipants.filter((participant) => participant.selectedAnswer === "A").length,
      B: heatmapParticipants.filter((participant) => participant.selectedAnswer === "B").length,
      C: heatmapParticipants.filter((participant) => participant.selectedAnswer === "C").length,
      D: heatmapParticipants.filter((participant) => participant.selectedAnswer === "D").length,
      pending: heatmapParticipants.filter((participant) => !participant.hasAnswered).length
    }
  };
}

export function allParticipantsAnsweredCurrentQuestion(bundle: Awaited<ReturnType<typeof getSessionBundle>>) {
  if (!bundle) return false;
  const question = bundle.quiz.questions[bundle.session.currentQuestionIndex];
  if (!question || bundle.participants.length === 0) return false;
  const answeredParticipantIds = new Set(
    bundle.answers.filter((answer: Answer) => answer.questionId === question.id).map((answer: Answer) => answer.participantId)
  );
  return bundle.participants.every((participant: Participant) => answeredParticipantIds.has(participant.id));
}

export async function joinSession(joinCode: string, displayName: string, emoji = defaultParticipantEmoji) {
  const prisma = await getPrisma();
  const session = await getSessionByJoinCode(joinCode);
  if (!session) return null;
  const safeEmoji = isAllowedParticipantEmoji(emoji) ? emoji : defaultParticipantEmoji;
  const participant = await prisma.participant.create({
    data: {
      sessionId: session.id,
      displayName: displayName.trim(),
      emoji: safeEmoji,
      lastSeenAt: new Date()
    }
  });
  return { session, participant: toParticipant(participant) };
}

export async function startQuestion(sessionId: string) {
  const prisma = await getPrisma();
  const startedAt = new Date();
  const session = await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: "QUESTION_ACTIVE", startedAt, currentQuestionStartedAt: startedAt }
  });
  return getSessionBundle(sessionId);
}

export async function revealQuestion(sessionId: string) {
  const prisma = await getPrisma();
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: "ANSWER_REVEALED" }
  });
  return getSessionBundle(sessionId);
}

export async function lockAnswers(sessionId: string) {
  const prisma = await getPrisma();
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: "ANSWER_LOCKED" }
  });
  return getSessionBundle(sessionId);
}

export async function showExplanation(sessionId: string) {
  const prisma = await getPrisma();
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: "EXPLANATION_VISIBLE" }
  });
  return getSessionBundle(sessionId);
}

export async function showLeaderboard(sessionId: string) {
  const prisma = await getPrisma();
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: "LEADERBOARD_VISIBLE" }
  });
  return getSessionBundle(sessionId);
}

export async function nextQuestion(sessionId: string) {
  const prisma = await getPrisma();
  const bundle = await getSessionBundle(sessionId);
  if (!bundle) return null;

  if (bundle.session.currentQuestionIndex >= bundle.quiz.questions.length - 1) {
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { status: "FINISHED", finishedAt: new Date(), currentQuestionStartedAt: null }
    });
  } else {
    const startedAt = new Date();
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { currentQuestionIndex: bundle.session.currentQuestionIndex + 1, status: "QUESTION_ACTIVE", currentQuestionStartedAt: startedAt }
    });
  }

  return getSessionBundle(sessionId);
}

export async function finishSession(sessionId: string) {
  const prisma = await getPrisma();
  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { status: "FINISHED", finishedAt: new Date(), currentQuestionStartedAt: null }
  });
  return getSessionBundle(sessionId);
}

export async function submitAnswer(participantId: string, selectedAnswer: AnswerOption) {
  const prisma = await getPrisma();
  const participant = await prisma.participant.findUnique({ where: { id: participantId } });
  if (!participant) return { ok: false as const, reason: "Teilnehmer nicht gefunden" };
  const bundle = await getSessionBundle(participant.sessionId);
  if (!bundle) return { ok: false as const, reason: "Session nicht gefunden" };
  if (!canSubmitAnswer(bundle.session.status)) return { ok: false as const, reason: "Antwortphase ist geschlossen" };
  const question = bundle.quiz.questions[bundle.session.currentQuestionIndex];
  if (!question) return { ok: false as const, reason: "Frage nicht gefunden" };

  const startedAt = bundle.session.currentQuestionStartedAt ? new Date(bundle.session.currentQuestionStartedAt).getTime() : Date.now();
  const responseTimeMs = Math.max(Date.now() - startedAt, 0);
  const totalTimeMs = question.timeLimitSeconds * 1000;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const pointsAwarded = calculatePoints(isCorrect, totalTimeMs - responseTimeMs, totalTimeMs);

  try {
    const answer = await prisma.answer.create({
      data: {
        sessionId: bundle.session.id,
        participantId,
        questionId: question.id,
        selectedAnswer,
        isCorrect,
        responseTimeMs,
        pointsAwarded
      }
    });
    await prisma.participant.update({
      where: { id: participantId },
      data: { totalPoints: { increment: pointsAwarded }, lastSeenAt: new Date() }
    });
    const freshBundle = await getSessionBundle(bundle.session.id);
    if (freshBundle?.session.status === "QUESTION_ACTIVE" && allParticipantsAnsweredCurrentQuestion(freshBundle)) {
      const lockedBundle = await lockAnswers(bundle.session.id);
      return { ok: true as const, answer: toAnswer(answer), bundle: lockedBundle, autoLocked: true as const };
    }
    return { ok: true as const, answer: toAnswer(answer), bundle: freshBundle, autoLocked: false as const };
  } catch {
    return { ok: false as const, reason: "Antwort wurde bereits gespeichert" };
  }
}
