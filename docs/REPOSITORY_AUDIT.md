# Fahrduell Repository Audit

Stand: 2026-06-29

## Framework und Runtime

- Next.js App Router mit React, TypeScript und Tailwind CSS.
- Eigener Node-Server `server.mjs`, damit Socket.IO dauerhaft laufen kann.
- Socket.IO Rooms sind pro `GameSession` getrennt.
- `PORT` ist konfigurierbar, der Server lauscht auf `0.0.0.0`.

## Datenhaltung

- Prisma-Schema fuer PostgreSQL ist vorhanden.
- Initiale Prisma-Migration liegt unter `prisma/migrations/202606270001_initial`.
- Admin-Seed ist ueber `scripts/seed-admin.mjs` vorbereitet.
- Fahrschul-Quiz-Grundpaket ist ueber `scripts/seed-driving-school-quizzes.mjs` vorbereitet.
- Login kann gegen Prisma `User` pruefen.
- Quiz-, Session-, Teilnehmer- und Antwortdaten laufen ueber die Prisma-Repository-Schicht in `features/sessions/store.ts`.
- Der aktuelle Frage-Startzeitpunkt fuer die Live-Punkteberechnung wird in `GameSession.currentQuestionStartedAt` gespeichert.

Konsequenz: Persistente Kerndaten und Live-Frage-Startzeit sind vorbereitet. Vor echter horizontaler Skalierung muessen Reconnect-UX und Socket.IO-Redis-Adapter finalisiert werden.

## Lokale URLs und QR-Code

- QR-Code-Links laufen ueber `getJoinBaseUrl()`.
- In Produktion sind `NEXT_PUBLIC_APP_URL` oder `APP_URL` Pflicht.
- In Produktion wird verhindert, dass QR-Codes auf `localhost` oder `127.0.0.1` zeigen.
- Ohne ENV wird im Development eine LAN-IP als Fallback genutzt, wenn die Lobby ueber localhost geoeffnet wird.

## Auth und Sicherheit

- Moderator-/Dozentenbereiche sind durch Middleware geschuetzt.
- Auth-Cookie ist `httpOnly`, in Produktion `secure`, und wird mit `AUTH_SECRET` signiert.
- Demo-Login wurde entfernt; Produktion laeuft jetzt ueber echte Admin-/Moderator-Konten.
- Login- und Join-Endpunkte haben einfache In-Memory-Rate-Limits.

## Realtime

- Socket.IO-CORS liest erlaubte Origins aus `SOCKET_CORS_ORIGIN`, `NEXT_PUBLIC_APP_URL` oder `APP_URL`.
- Development erlaubt flexible Origins.
- Fuer mehrere App-Instanzen ist Redis vorbereitet, aber der Socket.IO-Redis-Adapter ist noch nicht aktiviert.
- Moderator-spezifische Live-Daten laufen getrennt ueber den Room `moderator:{sessionId}`.
- Die Live-Heatmap fuer Antworten wird nur an Moderator-Clients verteilt, nicht an Teilnehmer oder die oeffentliche Beameransicht.

## Moderatorsteuerung

- Die Fernbedienung unter `app/host/[sessionId]/remote` zeigt live, wer schon geantwortet hat, welche Antwort gewaehlt wurde und wer noch offen ist.
- Gleiche Teilnehmernamen werden fuer die Heatmap automatisch eindeutig gemacht.
- Die korrekte Antwortgruppe wird erst nach der Aufloesung markiert.
- Beim erneuten Oeffnen der Fernbedienung waehrend einer laufenden Frage wird die aktuelle Heatmap sofort serverseitig mitgegeben.

## Soundsystem

- Host-Ansicht und Moderator-Fernbedienung nutzen `hooks/useFahrduellSound.ts`.
- Sound an/aus wird per `localStorage` pro Oberflaeche gespeichert.
- Fehlende Sounddateien unter `public/sounds/` sind unkritisch und fuehren nicht zu Abstuerzen.
- Browserseitige Audio-Sperren nach dem Seitenladen sind beruecksichtigt und werden still behandelt.

## Fahrduell AI Labs

- AI Labs ist lokal fuer Admins im Quizeditor vorbereitet.
- Moderatoren sehen keine AI-Labs-Oberflaeche.
- `POST /api/ai-labs/generate` prueft die Rolle serverseitig und liefert fuer Nicht-Admins neutral `404`.
- Die KI-Logik ist in `services/ai/ai-labs.ts` getrennt vorbereitet.
- Aktueller Anbieter ist `local-preview`, damit Workflow, Rechte und UI ohne externen KI-Key getestet werden koennen.
- Vorschlaege werden nur angezeigt und erst nach Admin-Bestaetigung in Formularfelder uebernommen.

## Deployment-Dateien

- `.env.example`
- `Dockerfile`
- `docker-compose.yml`
- `docs/DEPLOYMENT.md`
- `docs/PRODUCTION_CHECKLIST.md`
- `docs/VERSION_NEXT.md`
- `app/api/health/route.ts`
- `scripts/seed-admin.mjs`
- `scripts/seed-driving-school-quizzes.mjs`
- `docs/QUIZ_SEEDING.md`
- `docs/AI_LABS.md`
- `docs/FEATURES.md`

## Naechster empfohlener Arbeitsschritt

Deployment-Feinschliff und Medienausbau:

1. Echte Sounddateien fuer die vorbereiteten Audio-Slots hinterlegen.
2. Reconnect-Akzeptanztests auf echten Smartphones dokumentieren.
3. Socket.IO Redis-Adapter aktivieren, sobald mehrere App-Instanzen relevant werden.
4. Medien-Upload-UX fuer Bilder, Audio und Video weiter vereinfachen.
