import { describe, expect, it } from "vitest";
import { parseQuizRows, parseQuizText } from "../lib/quiz-import";

describe("quiz import", () => {
  it("imports the Word demo quiz text format", () => {
    const quiz = parseQuizText(`
Fahrduell - Demo-Quiz "Disney-Zauberquiz"
Demoquiz fuer Kinder
Frage 1
Welcher Junge kann fliegen und moechte nie erwachsen werden?
A) Simba
B) Peter Pan
C) Aladdin
D) Tarzan
Richtige Antwort: B
Erklaerung: Peter Pan lebt im Nimmerland.
Frage 2
Wie heisst die Eiskoenigin?
A) Anna
B) Elsa
C) Vaiana
D) Rapunzel
Richtige Antwort: B
Erklaerung: Elsa besitzt magische Kraefte.
`);

    expect(quiz.title).toContain("Disney");
    expect(quiz.questions).toHaveLength(2);
    expect(quiz.questions[0].answerB).toBe("Peter Pan");
    expect(quiz.questions[0].correctAnswer).toBe("B");
    expect(quiz.questions[1].explanation).toContain("Elsa");
  });

  it("imports Excel-style rows with German headers", () => {
    const quiz = parseQuizRows(
      [
        {
          Frage: "Was bedeutet ein rotes Dreieck?",
          "Antwort A": "Hinweis",
          "Antwort B": "Warnung",
          "Antwort C": "Parken",
          "Antwort D": "Ende",
          "Richtige Antwort": "B",
          Erklaerung: "Es warnt vor Gefahr."
        }
      ],
      "Excel Quiz"
    );

    expect(quiz.questions).toHaveLength(1);
    expect(quiz.questions[0].questionText).toContain("Dreieck");
    expect(quiz.questions[0].correctAnswer).toBe("B");
  });
});
