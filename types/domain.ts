export type Role = "ADMIN" | "INSTRUCTOR";
export type AnswerOption = "A" | "B" | "C" | "D";
export type GameMode = "classic" | "team_battle" | "knockout" | "survival";
export type SessionStatus =
  | "LOBBY"
  | "RUNNING"
  | "QUESTION_ACTIVE"
  | "ANSWER_LOCKED"
  | "ANSWER_REVEALED"
  | "EXPLANATION_VISIBLE"
  | "LEADERBOARD_VISIBLE"
  | "QUESTION_FINISHED"
  | "FINISHED";
export type MediaType = "none" | "image" | "video" | "audio";

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
  answerAExplanation?: string | null;
  answerBExplanation?: string | null;
  answerCExplanation?: string | null;
  answerDExplanation?: string | null;
  memorySentence?: string | null;
  memoryQuestion?: string | null;
  practicalExample?: string | null;
  hint?: string | null;
  mediaType?: MediaType | string | null;
  mediaUrl?: string | null;
  mediaAlt?: string | null;
  mediaCaption?: string | null;
  difficulty?: string | null;
  category?: string | null;
  topic?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  createdById: string;
  categoryId?: string | null;
  category?: QuizCategory | null;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
};

export type QuizCategory = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type GameSession = {
  id: string;
  quizId: string;
  hostUserId?: string | null;
  joinCode: string;
  status: SessionStatus;
  gameMode?: GameMode | string;
  currentQuestionIndex: number;
  currentQuestionStartedAt?: string | null;
  enableJokers?: boolean;
  jokerLimitPerParticipant?: number;
  isTimerPaused?: boolean;
  startedAt?: string | null;
  finishedAt?: string | null;
  createdAt: string;
};

export type Team = {
  id: string;
  sessionId: string;
  name: string;
  color?: string | null;
  totalPoints: number;
  createdAt: string;
};

export type Participant = {
  id: string;
  sessionId: string;
  teamId?: string | null;
  team?: Team | null;
  displayName: string;
  avatarId?: number | null;
  emoji?: string | null;
  livesRemaining?: number;
  isEliminated?: boolean;
  eliminatedAtQuestionIndex?: number | null;
  totalPoints: number;
  joinedAt: string;
  lastSeenAt?: string | null;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: Role;
  profileImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
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

export type TeamLeaderboardRow = Team & {
  rank: number;
  participantCount: number;
};

export type LiveAnswerHeatmapParticipant = {
  id: string;
  displayName: string;
  teamId?: string | null;
  team?: Team | null;
  avatarId?: number | null;
  emoji?: string | null;
  livesRemaining?: number;
  isEliminated?: boolean;
  selectedAnswer: AnswerOption | null;
  hasAnswered: boolean;
  answeredAt?: string | null;
};

export type LiveAnswerHeatmap = {
  questionId: string;
  correctAnswer?: AnswerOption | null;
  participants: LiveAnswerHeatmapParticipant[];
  counts: {
    A: number;
    B: number;
    C: number;
    D: number;
    pending: number;
  };
};
