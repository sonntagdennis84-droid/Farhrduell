# Fahrduell AI Labs

Stand: 2026-06-30

## Ziel

Fahrduell AI Labs ist als interne Testumgebung fuer erste KI-Funktionen vorbereitet. Die Funktionen ergaenzen bestehende Quizfragen, erzeugen aber keine kompletten Quizze und speichern keine Inhalte automatisch.

## Sichtbarkeit und Rechte

- Sichtbar nur fuer Benutzer mit Rolle `ADMIN`.
- Moderatoren mit Rolle `INSTRUCTOR` sehen im Quizeditor kein AI-Labs-Panel.
- Der API-Endpunkt `POST /api/ai-labs/generate` prueft ebenfalls die Admin-Rolle.
- Nicht-Admins erhalten fuer den Endpunkt eine neutrale `404`-Antwort, damit die Funktion nicht als verfuegbar erscheint.

## Aktueller Funktionsumfang

Im Quizeditor erscheint fuer Admins ein Bereich `Fahrduell AI Labs`.

Vorbereitet sind:

- Erklaerung erzeugen
- Merksatz erzeugen
- Praxisbeispiel erzeugen
- Bildvorschlag als Prompt erzeugen

Der Ablauf ist immer:

1. Admin waehlt eine bestehende Frage aus.
2. Admin startet eine AI-Labs-Funktion.
3. Fahrduell zeigt eine Vorschau.
4. Admin kann den Text bearbeiten.
5. Admin uebernimmt, verwirft oder kopiert den Vorschlag.

Die Felder `explanation`, `memorySentence` und `practicalExample` koennen uebernommen werden. Bildvorschlaege werden in Phase 1 nur als Prompt angezeigt und koennen kopiert werden.

## Architektur

Die Logik liegt getrennt unter:

- `services/ai/ai-labs.ts`

Der API-Endpunkt liegt unter:

- `app/api/ai-labs/generate/route.ts`

Die UI ist im Quizeditor vorbereitet:

- `components/quiz/QuizEditor.tsx`

Der aktuelle Anbieter ist `local-preview`. Das ist ein bewusst einfacher lokaler Platzhalter, damit UI, Rechte und Workflow getestet werden koennen, bevor ein externer KI-Anbieter angebunden wird.

## Sicherheit

- Keine automatische Veroeffentlichung.
- Keine automatische Speicherung.
- Keine Sichtbarkeit fuer Moderatoren.
- Admin prueft jeden Vorschlag selbst.

## Naechste Ausbaustufen

- Externen KI-Anbieter in `services/ai/` anbinden.
- Konfiguration ueber Environment-Variablen ergaenzen.
- Bildgenerierung an den bestehenden Bildprompt anschliessen.
- Dokument-, PDF- und Medienanalyse als eigene Services vorbereiten.
- Eigene Admin-Testseite fuer AI-Labs-Auswertungen ergaenzen.
