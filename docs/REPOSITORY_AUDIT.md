# Fahrduell Repository Audit

Stand: 2026-06-27

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
- Demo-Login ist in Produktion standardmaessig deaktiviert.
- Login- und Join-Endpunkte haben einfache In-Memory-Rate-Limits.

## Realtime

- Socket.IO-CORS liest erlaubte Origins aus `SOCKET_CORS_ORIGIN`, `NEXT_PUBLIC_APP_URL` oder `APP_URL`.
- Development erlaubt flexible Origins.
- Fuer mehrere App-Instanzen ist Redis vorbereitet, aber der Socket.IO-Redis-Adapter ist noch nicht aktiviert.

## Deployment-Dateien

- `.env.example`
- `Dockerfile`
- `docker-compose.yml`
- `docs/DEPLOYMENT.md`
- `docs/PRODUCTION_CHECKLIST.md`
- `app/api/health/route.ts`
- `scripts/seed-admin.mjs`
- `scripts/seed-driving-school-quizzes.mjs`
- `docs/QUIZ_SEEDING.md`

## Naechster empfohlener Arbeitsschritt

Reconnect und Skalierung produktionsreif machen:

1. Teilnehmer-Reconnect-UX verbessern, inklusive klarer Statusanzeige nach Wiederaufnahme.
2. Socket.IO Redis-Adapter bei mehreren Instanzen aktivieren.
3. Akzeptanztest: Server neu starten, Quiz/Session/Ergebnisse bleiben erhalten.
4. Akzeptanztest: kurzer Smartphone-Verbindungsabbruch fuehrt zur Wiederaufnahme.
