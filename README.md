# Fahrduell MVP

Fahrduell ist ein webbasiertes Live-Quiz für die Fahrlehrerausbildung. Das MVP enthält Login, Quizverwaltung, Live-Lobby mit QR-Code, Smartphone-Beitritt, synchrone Fragen, farbige Antwortbuttons, Timer, Punkteberechnung, Rangliste, Endergebnis und CSV-Export.

## Start

```bash
pnpm dev
```

Danach ist die App unter `http://localhost:3000` erreichbar.

## Login

Die App verwendet jetzt ausschließlich echte Benutzerkonten. Für den ersten Produktivzugang wird ein Admin über das Seed-Skript angelegt.

## Datenbank

Das Prisma-Schema für PostgreSQL liegt in [prisma/schema.prisma](C:/Users/sonnt/Documents/Codex/2026-06-26/arb/prisma/schema.prisma). Für das lokale MVP arbeitet die App zusätzlich mit einem In-Memory-Store, damit der Live-Quiz-Ablauf ohne eingerichtete PostgreSQL-Instanz direkt ausprobiert werden kann.

## Deployment

Das produktionsnahe Setup ist für Docker, PostgreSQL und Socket.IO vorbereitet:

- [Deployment-Anleitung](C:/Users/sonnt/Documents/Codex/2026-06-26/arb/docs/DEPLOYMENT.md)
- [Production Checklist](C:/Users/sonnt/Documents/Codex/2026-06-26/arb/docs/PRODUCTION_CHECKLIST.md)
- [Repository Audit](C:/Users/sonnt/Documents/Codex/2026-06-26/arb/docs/REPOSITORY_AUDIT.md)
- [Online stellen](C:/Users/sonnt/Documents/Codex/2026-06-26/arb/docs/GO_ONLINE.md)
- [Quiz-Seeding](C:/Users/sonnt/Documents/Codex/2026-06-26/arb/docs/QUIZ_SEEDING.md)
- Healthcheck: `/api/health`
- Docker Compose: `docker compose up --build`

## Prüfung

```bash
pnpm test
pnpm build
```
