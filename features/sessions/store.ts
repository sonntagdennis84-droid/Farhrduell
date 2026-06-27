import { randomBytes } from "node:crypto";
import type { Answer, AnswerOption, GameSession, Participant, Question, Quiz } from "@/types/domain";
import { buildLeaderboard, calculatePoints } from "@/lib/scoring";
import { canSubmitAnswer } from "@/lib/session-state";

type QuizInput = Omit<Partial<Quiz>, "questions"> & {
  title: string;
  questions: Array<
    Partial<Question> & Pick<Question, "questionText" | "answerA" | "answerB" | "answerC" | "answerD" | "correctAnswer">
  >;
};

const demoUserId = "demo-instructor";

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
    questions: [...(quiz.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex).map(toQuestion)
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
    where: { id: demoUserId },
    update: {},
    create: {
      id: demoUserId,
      name: "Fahrduell Demo",
      email: "demo@fahrduell.local",
      passwordHash: "development-demo-login",
      role: "INSTRUCTOR"
    }
  });
}

async function ensureDemoQuiz() {
  const prisma = await getPrisma();
  const count = await prisma.quiz.count();
  if (count > 0) return;

  await ensureDemoUser();
  await prisma.quiz.create({
    data: {
      id: "demo-quiz",
      title: "Fahrduell Demo-Quiz",
      description: "Ein kompaktes Live-Quiz fuer die Fahrschulausbildung.",
      createdById: demoUserId,
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
    include: { questions: { orderBy: { orderIndex: "asc" } } }
  });
  return quizzes.map(toQuiz);
}

export async function getQuiz(id: string) {
  await ensureDemoQuiz();
  const prisma = await getPrisma();
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { orderIndex: "asc" } } }
  });
  return quiz ? toQuiz(quiz) : null;
}

export async function upsertQuiz(input: QuizInput) {
  await ensureDemoUser();
  const prisma = await getPrisma();
  const existing = input.id ? await prisma.quiz.findUnique({ where: { id: input.id } }) : null;

  const quiz = await prisma.$transaction(async (tx: any) => {
    const savedQuiz = existing
      ? await tx.quiz.update({
          where: { id: input.id },
          data: { title: input.title, description: input.description ?? "" }
        })
      : await tx.quiz.create({
          data: { title: input.title, description: input.description ?? "", createdById: demoUserId }
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
      include: { questions: { orderBy: { orderIndex: "asc" } } }
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

export async function joinSession(joinCode: string, displayName: string) {
  const prisma = await getPrisma();
  const session = await getSessionByJoinCode(joinCode);
  if (!session) return null;
  const participant = await prisma.participant.create({
    data: {
      sessionId: session.id,
      displayName: displayName.trim(),
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
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: { currentQuestionIndex: bundle.session.currentQuestionIndex + 1, status: "RUNNING", currentQuestionStartedAt: null }
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
    return { ok: true as const, answer: toAnswer(answer), bundle: await getSessionBundle(bundle.session.id) };
  } catch {
    return { ok: false as const, reason: "Antwort wurde bereits gespeichert" };
  }
}
