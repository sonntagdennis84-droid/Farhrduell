# Fahrduell MVP

Fahrduell ist ein webbasiertes Live-Quiz fuer die Fahrlehrerausbildung. Das MVP enthaelt Login, Quizverwaltung, Live-Lobby mit QR-Code, Smartphone-Beitritt, synchrone Fragen, farbige Antwortbuttons, Timer, Punkteberechnung, Rangliste, Endergebnis und CSV-Export.

## Start

```bash
pnpm dev
```

Danach ist die App unter http://localhost:3000 erreichbar.

## Demo-Login

- E-Mail: `demo@fahrduell.local`
- Passwort: `fahrduell`

Dashboard, Quizverwaltung, Lobby und Moderatorenansicht sind durch diesen Login geschützt. Teilnehmerseiten unter `/join/...` und `/play/...` bleiben öffentlich, damit der QR-Code ohne Dozenten-Login funktioniert.

## Datenbank

Das Prisma-Schema fuer PostgreSQL liegt in `prisma/schema.prisma`. Fuer das lokale MVP arbeitet die App zusaetzlich mit einem In-Memory-Store, damit der Live-Quiz-Ablauf ohne eingerichtete PostgreSQL-Instanz direkt ausprobiert werden kann.

## Deployment

Das produktionsnahe Setup ist fuer Docker, PostgreSQL und Socket.IO vorbereitet:

- [Deployment-Anleitung](docs/DEPLOYMENT.md)
- [Production Checklist](docs/PRODUCTION_CHECKLIST.md)
- [Repository Audit](docs/REPOSITORY_AUDIT.md)
- [Online stellen](docs/GO_ONLINE.md)
- [Quiz-Seeding](docs/QUIZ_SEEDING.md)
- Healthcheck: `/api/health`
- Docker Compose: `docker compose up --build`

## Pruefung

```bash
pnpm test
pnpm build
```
