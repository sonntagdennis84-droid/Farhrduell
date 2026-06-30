import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/features/auth/users";
import { generateAiLabsSuggestion, type AiLabsAction } from "@/services/ai/ai-labs";
import type { AnswerOption } from "@/types/domain";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Nicht gefunden." }, { status: 404 });
    }

    const body = await request.json();
    const result = generateAiLabsSuggestion({
      action: String(body.action ?? "") as AiLabsAction,
      quizTitle: typeof body.quizTitle === "string" ? body.quizTitle : null,
      quizDescription: typeof body.quizDescription === "string" ? body.quizDescription : null,
      quizCategory: typeof body.quizCategory === "string" ? body.quizCategory : null,
      question: {
        questionText: String(body.question?.questionText ?? ""),
        answerA: String(body.question?.answerA ?? ""),
        answerB: String(body.question?.answerB ?? ""),
        answerC: String(body.question?.answerC ?? ""),
        answerD: String(body.question?.answerD ?? ""),
        correctAnswer: String(body.question?.correctAnswer ?? "A") as AnswerOption,
        category: typeof body.question?.category === "string" ? body.question.category : null,
        topic: typeof body.question?.topic === "string" ? body.question.topic : null
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI Labs konnte keinen Vorschlag erstellen.";
    const status = message === "Login erforderlich" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
