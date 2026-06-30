import { describe, expect, it } from "vitest";
import { generateAiLabsSuggestion } from "@/services/ai/ai-labs";

const question = {
  questionText: "Wie verhalten Sie sich an einer Kreuzung ohne Verkehrszeichen?",
  answerA: "Rechts vor links beachten",
  answerB: "Immer zuerst fahren",
  answerC: "Nur auf Gegenverkehr achten",
  answerD: "Hupen und weiterfahren",
  correctAnswer: "A" as const,
  category: "Vorfahrt",
  topic: "Kreuzung"
};

describe("AI Labs preview suggestions", () => {
  it("creates an editable explanation without saving anything", () => {
    const result = generateAiLabsSuggestion({ action: "explanation", question });
    expect(result.provider).toBe("local-preview");
    expect(result.suggestion).toContain("Antwort A");
    expect(result.suggestion).toContain("Rechts vor links beachten");
  });

  it("creates a reusable image prompt", () => {
    const result = generateAiLabsSuggestion({ action: "imagePrompt", question });
    expect(result.suggestion).toContain("Fahrschul-Illustration");
    expect(result.suggestion).toContain(question.questionText);
  });

  it("rejects incomplete questions", () => {
    expect(() =>
      generateAiLabsSuggestion({
        action: "memorySentence",
        question: { ...question, answerC: "" }
      })
    ).toThrow("Antwortmoeglichkeiten");
  });
});
