import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const quizBlueprints = [
  ["grundstoff-1-risikofaktor-mensch", "Grundstoff 1 - Persoenliche Voraussetzungen / Risikofaktor Mensch", "Grundstoff", "Persoenliche Voraussetzungen / Risikofaktor Mensch"],
  ["grundstoff-2-rechtliche-rahmenbedingungen", "Grundstoff 2 - Rechtliche Rahmenbedingungen", "Grundstoff", "Rechtliche Rahmenbedingungen"],
  ["grundstoff-3-verkehrszeichen", "Grundstoff 3 - Verkehrszeichen und Verkehrseinrichtungen", "Grundstoff", "Verkehrszeichen und Verkehrseinrichtungen"],
  ["grundstoff-4-strassenverkehrssystem", "Grundstoff 4 - Strassenverkehrssystem und Bahnuebergaenge", "Grundstoff", "Strassenverkehrssystem und Bahnuebergaenge"],
  ["grundstoff-5-vorfahrt", "Grundstoff 5 - Vorfahrt und Verkehrsregelungen", "Grundstoff", "Vorfahrt und Verkehrsregelungen"],
  ["grundstoff-6-geschwindigkeit", "Grundstoff 6 - Geschwindigkeit, Abstand und umweltschonende Fahrweise", "Grundstoff", "Geschwindigkeit, Abstand und Umwelt"],
  ["grundstoff-7-andere-verkehrsteilnehmer", "Grundstoff 7 - Andere Verkehrsteilnehmer", "Grundstoff", "Andere Verkehrsteilnehmer"],
  ["grundstoff-8-fahrmanoever", "Grundstoff 8 - Verkehrsverhalten bei Fahrmanoevern", "Grundstoff", "Fahrmanoever"],
  ["grundstoff-9-ruhender-verkehr", "Grundstoff 9 - Ruhender Verkehr", "Grundstoff", "Ruhender Verkehr"],
  ["grundstoff-10-besondere-situationen", "Grundstoff 10 - Verhalten in besonderen Situationen", "Grundstoff", "Besondere Situationen"],
  ["grundstoff-11-lebenslanges-lernen", "Grundstoff 11 - Lebenslanges Lernen / Folgen von Verstoessen", "Grundstoff", "Lebenslanges Lernen / Folgen"],
  ["grundstoff-12-technik-fahrzeugbetrieb", "Grundstoff 12 - Technische Bedingungen / Fahrzeugbetrieb", "Grundstoff", "Technische Bedingungen / Fahrzeugbetrieb"],
  ["fachstoff-b-1-fahrzeugtechnik", "Fachstoff B 1 - Fahrzeugtechnik, Sicherheitseinrichtungen und Anhaenger", "Fachstoff B", "Fahrzeugtechnik / Sicherheit / Anhaenger"],
  ["fachstoff-b-2-besondere-fahrten", "Fachstoff B 2 - Personen- und Gueterbefoerderung / besondere Fahrten", "Fachstoff B", "Personen- und Gueterbefoerderung / besondere Fahrten"]
];

const templates = [
  {
    questionText: "Welche Verhaltensweise passt am besten zum Thema {topic}?",
    answerA: "Ruhig bleiben, vorausschauend handeln und Regeln beachten.",
    answerB: "Schnell entscheiden, auch wenn die Lage unklar ist.",
    answerC: "Sich nur am Verhalten des Fahrzeugs vor einem orientieren.",
    answerD: "Erst reagieren, wenn andere Verkehrsteilnehmer hupen.",
    correctAnswer: "A",
    explanation: "Sicheres Fahren bedeutet, Situationen frueh zu erkennen und regelgerecht zu handeln.",
    memorySentence: "Frueh erkennen, ruhig entscheiden, regelgerecht handeln.",
    memoryQuestion: "Woran erkennst du im Alltag eine vorausschauende Entscheidung?",
    practicalExample: "Sprich im Unterricht eine Alltagssituation durch, in der fruehes Beobachten Zeit verschafft.",
    hint: "Denke an vorausschauendes und regelkonformes Verhalten."
  },
  {
    questionText: "Warum ist {topic} fuer Fahranfaenger besonders wichtig?",
    answerA: "Weil es nur in der theoretischen Pruefung vorkommt.",
    answerB: "Weil dadurch Risiken frueher erkannt und Fehler vermieden werden.",
    answerC: "Weil man dadurch grundsaetzlich schneller fahren darf.",
    answerD: "Weil dadurch alle Vorfahrtsregeln entfallen.",
    correctAnswer: "B",
    explanation: "Fahranfaenger profitieren besonders von klaren Routinen und Risikobewusstsein.",
    memorySentence: "Routinen helfen, wenn sie sicher und bewusst aufgebaut werden.",
    memoryQuestion: "Welche Situation wuerdest du dazu im Unterricht besprechen?",
    practicalExample: "Lass die Gruppe eine typische Anfaengerentscheidung mit sicherer Alternative vergleichen.",
    hint: "Es geht um Risikoerkennung, nicht um schnelleres Fahren."
  },
  {
    questionText: "Was ist bei einer unklaren Verkehrslage im Bereich {topic} richtig?",
    answerA: "Beschleunigen, um die Situation schnell zu verlassen.",
    answerB: "Abstand verringern, damit niemand einscheren kann.",
    answerC: "Geschwindigkeit reduzieren und bremsbereit bleiben.",
    answerD: "Nur auf die eigene Vorfahrt achten.",
    correctAnswer: "C",
    explanation: "Bei unklarer Lage sind angepasste Geschwindigkeit und Bremsbereitschaft entscheidend.",
    memorySentence: "Unklar bedeutet: Tempo raus und bremsbereit bleiben.",
    memoryQuestion: "Welche Hinweise zeigen dir, dass eine Lage unklar ist?",
    practicalExample: "Nutze eine Kreuzungs- oder Parkraumsituation, in der Sicht verdeckt ist.",
    hint: "Was verschafft dir bei Unsicherheit mehr Reaktionszeit?"
  },
  {
    questionText: "Welche Aussage zu {topic} ist pruefungsnah richtig?",
    answerA: "Regeln gelten nur bei dichtem Verkehr.",
    answerB: "Sicherheit und Ruecksicht gehen vor Bequemlichkeit.",
    answerC: "Wer unsicher ist, soll moeglichst schnell weiterfahren.",
    answerD: "Andere muessen immer mit eigenen Fehlern rechnen.",
    correctAnswer: "B",
    explanation: "Ruecksicht und Gefahrenvermeidung sind Grundprinzipien im Strassenverkehr.",
    memorySentence: "Sicherheit und Ruecksicht stehen vor Bequemlichkeit.",
    memoryQuestion: "Wie erklaerst du Ruecksicht in einem Satz?",
    practicalExample: "Diskutiere, wann man trotz eigener Vorfahrt defensiv bleibt.",
    hint: "Pruefungsnah ist die Antwort, die Sicherheit und Ruecksicht staerkt."
  },
  {
    questionText: "Wie sollte man sich verhalten, wenn andere im Bereich {topic} Fehler machen?",
    answerA: "Auf dem eigenen Recht bestehen.",
    answerB: "Mit Fehlern rechnen und defensiv reagieren.",
    answerC: "Dicht auffahren, damit die Situation klarer wird.",
    answerD: "Lichthupe dauerhaft einsetzen.",
    correctAnswer: "B",
    explanation: "Defensives Verhalten verhindert Konflikte und Unfaelle.",
    memorySentence: "Mit Fehlern anderer rechnen ist aktiver Selbstschutz.",
    memoryQuestion: "Was bedeutet defensiv fahren konkret?",
    practicalExample: "Beschreibe eine Situation, in der jemand die Vorfahrt falsch einschaetzt.",
    hint: "Nicht Rechthaben zaehlt, sondern Unfallvermeidung."
  },
  {
    questionText: "Welche Rolle spielt Beobachtung beim Thema {topic}?",
    answerA: "Sie ist nur beim Abbiegen wichtig.",
    answerB: "Sie ersetzt alle Verkehrsregeln.",
    answerC: "Sie hilft, Gefahren rechtzeitig zu erkennen.",
    answerD: "Sie ist nur auf Autobahnen notwendig.",
    correctAnswer: "C",
    explanation: "Regelmaessige Beobachtung ist Grundlage fuer rechtzeitiges Reagieren.",
    memorySentence: "Wer frueh sieht, kann frueh reagieren.",
    memoryQuestion: "Welche Spiegel- und Schulterblick-Routine passt dazu?",
    practicalExample: "Lass die Teilnehmenden eine Beobachtungsroutine laut mitsprechen.",
    hint: "Welche Faehigkeit macht Gefahren sichtbar, bevor sie kritisch werden?"
  },
  {
    questionText: "Was ist eine typische Gefahr bei {topic}?",
    answerA: "Routine ohne Aufmerksamkeit.",
    answerB: "Zu grosser Sicherheitsabstand.",
    answerC: "Zu fruehes Blinken in jeder Situation.",
    answerD: "Zu langsames Lesen von Verkehrsschildern im Stand.",
    correctAnswer: "A",
    explanation: "Unaufmerksamkeit und falsche Routine fuehren haeufig zu riskanten Entscheidungen.",
    memorySentence: "Routine braucht Aufmerksamkeit, sonst wird sie riskant.",
    memoryQuestion: "Welche Routine kann gefaehrlich werden, wenn man sie nicht bewusst ausfuehrt?",
    practicalExample: "Sammle Beispiele fuer Situationen, die trotz Routine volle Konzentration brauchen.",
    hint: "Achte auf die Antwort, die eine echte Gefahr beschreibt."
  },
  {
    questionText: "Welche Entscheidung ist bei {topic} meist die sicherste?",
    answerA: "Im Zweifel warten und die Lage klaeren.",
    answerB: "Im Zweifel vorfahren.",
    answerC: "Im Zweifel hupen.",
    answerD: "Im Zweifel die Geschwindigkeit halten.",
    correctAnswer: "A",
    explanation: "Warten und klaeren ist sicherer als riskantes Erzwingen.",
    memorySentence: "Im Zweifel warten ist keine Schwaeche, sondern Sicherheit.",
    memoryQuestion: "Wann ist Warten im Verkehr die bessere Entscheidung?",
    practicalExample: "Stelle eine unklare Vorfahrtssituation nach und frage nach der sichersten Entscheidung.",
    hint: "Welche Antwort reduziert Risiko, statt Druck aufzubauen?"
  },
  {
    questionText: "Wie wirkt sich Stress auf Entscheidungen bei {topic} aus?",
    answerA: "Stress verbessert die Reaktionsqualitaet immer.",
    answerB: "Stress kann Wahrnehmung und Entscheidung verschlechtern.",
    answerC: "Stress ist nur bei langen Fahrten relevant.",
    answerD: "Stress betrifft nur Beifahrer.",
    correctAnswer: "B",
    explanation: "Stress kann Tunnelblick, Hektik und Fehlentscheidungen beguenstigen.",
    memorySentence: "Stress verengt den Blick; Ruhe erweitert die Entscheidung.",
    memoryQuestion: "Welche Strategie hilft gegen hektisches Fahren?",
    practicalExample: "Besprecht eine Pruefungssituation und eine konkrete Beruhigungsstrategie.",
    hint: "Stress macht Entscheidungen nicht automatisch besser."
  },
  {
    questionText: "Was sollte nach einem Fehler im Bereich {topic} passieren?",
    answerA: "Fehler ignorieren und Thema wechseln.",
    answerB: "Fehler analysieren, Konsequenzen verstehen und Verhalten anpassen.",
    answerC: "Nur die richtige Antwort auswendig lernen.",
    answerD: "Mehr Geschwindigkeit trainieren.",
    correctAnswer: "B",
    explanation: "Lernen entsteht durch Verstehen, Wiederholen und bewusstes Anpassen.",
    memorySentence: "Fehler werden wertvoll, wenn man sie versteht und daraus handelt.",
    memoryQuestion: "Welche Merkhilfe nimmst du aus dieser Frage mit?",
    practicalExample: "Lass nach einem Fehler die sichere Alternative in einem Satz formulieren.",
    hint: "Die beste Antwort macht aus dem Fehler einen Lernschritt."
  }
];

function fill(value, topic) {
  return value.replaceAll("{topic}", topic);
}

function questionsFor(category, topic) {
  return templates.map((template, index) => ({
    orderIndex: index,
    questionText: fill(template.questionText, topic),
    answerA: fill(template.answerA, topic),
    answerB: fill(template.answerB, topic),
    answerC: fill(template.answerC, topic),
    answerD: fill(template.answerD, topic),
    correctAnswer: template.correctAnswer,
    timeLimitSeconds: 25,
    explanation: fill(template.explanation, topic),
    answerAExplanation: template.correctAnswer === "A" ? "Diese Antwort passt, weil sie Sicherheit und Regelverstaendnis verbindet." : "Diese Antwort ist zu einseitig oder riskant.",
    answerBExplanation: template.correctAnswer === "B" ? "Diese Antwort passt, weil sie Risikoerkennung und sicheres Verhalten betont." : "Diese Antwort fuehrt nicht zur sichersten Entscheidung.",
    answerCExplanation: template.correctAnswer === "C" ? "Diese Antwort passt, weil sie Reaktionszeit schafft und Gefahren reduziert." : "Diese Antwort reicht fuer eine sichere Verkehrssituation nicht aus.",
    answerDExplanation: template.correctAnswer === "D" ? "Diese Antwort waere nur richtig, wenn sie Sicherheit und Ruecksicht staerkt." : "Diese Antwort verlaesst sich zu stark auf andere und ist nicht pruefungsnah.",
    memorySentence: fill(template.memorySentence, topic),
    memoryQuestion: fill(template.memoryQuestion, topic),
    practicalExample: fill(template.practicalExample, topic),
    hint: fill(template.hint, topic),
    mediaType: "none",
    mediaUrl: null,
    mediaAlt: null,
    mediaCaption: null,
    difficulty: index < 4 ? "leicht" : index < 8 ? "mittel" : "schwer",
    category,
    topic
  }));
}

async function ensureOwner() {
  const email = process.env.INITIAL_ADMIN_EMAIL || "seed@fahrduell.local";
  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) return existingByEmail.id;

  const user = await prisma.user.upsert({
    where: { id: "seed-admin-owner" },
    update: {},
    create: {
      id: "seed-admin-owner",
      name: "Fahrduell Seed",
      email,
      passwordHash: "seed-script-owner",
      role: "ADMIN"
    }
  });
  return user.id;
}

const ownerId = await ensureOwner();
const schoolCategory = await prisma.quizCategory.upsert({
  where: { name: "Fahrschule" },
  update: {},
  create: { name: "Fahrschule" }
});

for (const [slug, title, category, topic] of quizBlueprints) {
  const existing = await prisma.quiz.findFirst({ where: { title } });
  if (existing) {
    console.log(`Skip existing quiz: ${title}`);
    continue;
  }

  await prisma.quiz.create({
    data: {
      id: slug,
      title,
      description: `Live-Quiz fuer Fahrschueler: ${topic}.`,
      createdById: ownerId,
      categoryId: schoolCategory.id,
      questions: { create: questionsFor(category, topic) }
    }
  });
  console.log(`Created quiz: ${title}`);
}

await prisma.$disconnect();
