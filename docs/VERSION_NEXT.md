# Fahrduell Version Next

Stand: 2026-06-29

## Moderator-Heatmap

- Die Moderator-Fernbedienung zeigt jetzt live, welche Teilnehmer A, B, C oder D gewaehlt haben.
- Teilnehmer ohne Antwort bleiben bis zur Abgabe in der Gruppe `Noch offen`.
- Bei gleichen Namen werden Anzeigenamen automatisch ergaenzt, zum Beispiel `Dennis (2)`.
- Die richtige Antwort wird erst nach dem Aufloesen markiert.
- Die Heatmap wird ausschliesslich an den Moderator-Raum `moderator:{sessionId}` gesendet.
- Teilnehmeransicht und Beameransicht erhalten keine Namenslisten pro Antwortgruppe.

## Sounddesign

- Neue Sound-Infrastruktur ueber `hooks/useFahrduellSound.ts`.
- Schalter fuer `Sound an` / `Sound aus` in Host-Ansicht und Moderator-Fernbedienung.
- Einstellung wird pro Ansicht in `localStorage` gespeichert.
- Aktuell angebundene Sound-Ereignisse:
  - `quiz-start`
  - `question-start`
  - `countdown-warning`
  - `answer-correct`
  - `leaderboard`
  - `winner`
- Fehlende Audiodateien werden sauber abgefangen. Die App bleibt stabil, auch wenn unter `public/sounds/` noch keine Dateien liegen.

## Sound-Dateinamen

Diese Dateinamen sind vorbereitet:

- `public/sounds/quiz-start.mp3`
- `public/sounds/question-start.mp3`
- `public/sounds/countdown-warning.mp3`
- `public/sounds/answer-submitted.mp3`
- `public/sounds/answer-correct.mp3`
- `public/sounds/answer-wrong.mp3`
- `public/sounds/leaderboard.mp3`
- `public/sounds/winner.mp3`

## Browser-Hinweise

- Mobile Browser und Desktop-Browser erlauben Audio oft erst nach einer Nutzerinteraktion.
- Nach dem ersten Tippen oder Klicken in Host-Ansicht oder Fernbedienung sollten Sounds normal funktionieren.
- Wenn ein Browser Audio blockiert, entsteht kein sichtbarer Fehler.
