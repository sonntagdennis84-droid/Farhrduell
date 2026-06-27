export type Role = "ADMIN" | "INSTRUCTOR";
export type AnswerOption = "A" | "B" | "C" | "D";
export type SessionStatus = "LOBBY" | "RUNNING" | "QUESTION_ACTIVE" | "QUESTION_FINISHED" | "FINISHED";

export type Question = {
  id: string;
  quizId: string;
  orderIndex: number;
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: AnswerOption;
  timeLimitSeconds: number;
  explanation?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
};

export type GameSession = {
  id: string;
  quizId: string;
  joinCode: string;
  status: SessionStatus;
  currentQuestionIndex: number;
  currentQuestionStartedAt?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  createdAt: string;
};

export type Participant = {
  id: string;
  sessionId: string;
  displayName: string;
  totalPoints: number;
  joinedAt: string;
  lastSeenAt?: string | null;
};

export type Answer = {
  id: string;
  sessionId: string;
  participantId: string;
  questionId: string;
  selectedAnswer: AnswerOption;
  isCorrect: boolean;
  responseTimeMs: number;
  pointsAwarded: number;
  submittedAt: string;
};

export type LeaderboardRow = Participant & {
  rank: number;
  correctAnswers: number;
  averageResponseTimeMs: number;
};
