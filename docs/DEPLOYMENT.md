# Fahrduell Deployment

Diese Anleitung beschreibt den produktionsnahen Betrieb der Fahrduell-MVP-App als Docker/Node-Anwendung mit PostgreSQL und Socket.IO.

## Zielarchitektur

- Next.js/Node-Prozess mit eigenem `server.mjs` fuer Socket.IO
- PostgreSQL als persistente Produktionsdatenbank
- Optional Redis fuer spaetere horizontale Socket.IO-Skalierung
- HTTPS ueber Hosting-Plattform, Reverse Proxy oder Load Balancer
- Oeffentliche Domain in `NEXT_PUBLIC_APP_URL`, damit QR-Codes nicht auf localhost zeigen

Hinweis zum aktuellen MVP-Stand: PostgreSQL-Schema, Migration, Admin-Seed und Prisma-Persistenz fuer Quizze, Sessions, Teilnehmer, Antworten und Live-Frage-Startzeit sind vorbereitet. Vor horizontaler Skalierung sollte der Socket.IO Redis-Adapter aktiviert und die Reconnect-UX erweitert werden. Der Status ist in `docs/REPOSITORY_AUDIT.md` dokumentiert.

## Lokale Entwicklung

```bash
pnpm install
pnpm dev
```

Lokaler Login:

- E-Mail: `demo@fahrduell.local`
- Passwort: `fahrduell`

Der Demo-Login ist nur fuer Development gedacht. In Produktion ist er standardmaessig deaktiviert.

## Environment-Variablen

| Variable | Zweck | Beispiel |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Oeffentliche URL fuer QR-Codes und Teilnehmerlinks | `https://fahrduell.de` |
| `APP_URL` | Serverseitige Basis-URL | `https://fahrduell.de` |
| `DATABASE_URL` | PostgreSQL-Verbindung fuer Prisma | `postgresql://USER:PASSWORD@HOST:5432/fahrduell?schema=public` |
| `AUTH_SECRET` | Langes zufaelliges Secret fuer Auth-Haertung | `openssl rand -base64 32` |
| `ALLOW_DEMO_LOGIN` | Demo-Login explizit erlauben | `false` |
| `DEMO_EMAIL` | Demo-Login-Mail fuer Development | `demo@fahrduell.local` |
| `DEMO_PASSWORD` | Demo-Login-Passwort fuer Development | `fahrduell` |
| `SOCKET_CORS_ORIGIN` | Erlaubte Socket.IO-Origin, kommasepariert | `https://fahrduell.de` |
| `REDIS_URL` | Optionaler Redis-Endpunkt fuer Skalierung | `redis://redis:6379` |
| `PORT` | HTTP-Port im Container | `3000` |
| `INITIAL_ADMIN_EMAIL` | Admin-Seed E-Mail | `admin@fahrduell.de` |
| `INITIAL_ADMIN_PASSWORD` | Admin-Seed Passwort | `change-me-before-production` |
| `INITIAL_ADMIN_NAME` | Admin-Seed Anzeigename | `Fahrduell Admin` |

In Produktion muessen `NEXT_PUBLIC_APP_URL` und `APP_URL` auf eine HTTPS-Adresse zeigen. Die App verhindert produktive QR-Links auf `localhost` oder `127.0.0.1`.

## Docker Compose

Produktionsnah lokal starten:

```bash
docker compose up --build
```

Die Compose-Datei startet:

- `app` auf Port `3000`
- `postgres` mit persistentem Volume
- `redis` als vorbereitete Skalierungskomponente

Healthcheck:

```bash
curl http://localhost:3000/api/health
```

## Datenbankmigration

Prisma-Schema:

```bash
pnpm prisma:generate
pnpm db:migrate
```

Im Container fuehrt der Startbefehl `pnpm db:migrate && node server.mjs` die Migration automatisch aus. In strengeren Produktionsumgebungen kann dieser Schritt als separater Release-Job laufen.

## Admin-User anlegen

```bash
INITIAL_ADMIN_EMAIL=admin@fahrduell.de \
INITIAL_ADMIN_PASSWORD='replace-with-a-long-password' \
INITIAL_ADMIN_NAME='Fahrduell Admin' \
pnpm db:seed
```

Das Passwort muss mindestens 12 Zeichen lang sein.

## Quiz-Grundpaket anlegen

```bash
pnpm db:seed:quizzes
```

Das Skript erstellt 14 vorbereitete Fahrschul-Quizze und ist idempotent. Details stehen in `docs/QUIZ_SEEDING.md`.

## Online-Testablauf

1. PostgreSQL-Datenbank anlegen.
2. Environment-Variablen setzen.
3. App bauen und starten.
4. `/api/health` pruefen.
5. Migrationen ausfuehren.
6. Admin-User seeden.
7. `/login` ueber die oeffentliche HTTPS-URL oeffnen.
8. Quiz starten und Lobby oeffnen.
9. QR-Code mit Smartphone scannen.
10. Sicherstellen, dass der QR-Link keine `localhost`- oder `127.0.0.1`-Adresse enthaelt.
11. Mit mehreren Smartphones Frage, Antwort, Rangliste und Endergebnis testen.
12. Server neu starten und pruefen, ob persistente Daten erhalten bleiben.

Automatisierter Smoke-Test:

```bash
SMOKE_BASE_URL=https://fahrduell-production.up.railway.app \
SMOKE_ADMIN_EMAIL=admin@fahrduell.de \
SMOKE_ADMIN_PASSWORD='...' \
pnpm smoke:mvp
```

## Socket.IO und Skalierung

Fuer MVP-Produktion ist eine einzelne Node-Instanz empfohlen. Bei mehreren Instanzen werden Sticky Sessions und ein Socket.IO-Adapter benoetigt, typischerweise Redis. `REDIS_URL` ist bereits als Environment-Variable vorgesehen; die Adapter-Integration sollte erst aktiviert werden, wenn horizontal skaliert wird.

## Rollback

1. Vor Deployment Datenbank-Backup erstellen.
2. Container-Image mit Versions-Tag deployen.
3. Bei Fehlern auf vorheriges Image zurueckrollen.
4. Wenn Migrationen inkompatibel waren, Datenbank aus Backup wiederherstellen.
5. `/api/health`, Login, Lobby, QR-Code und eine Testfrage erneut pruefen.

## Hosting-Hinweise

- Railway/Render/Fly.io: geeignet fuer schnellen MVP-Online-Test mit dauerhaftem Node-Prozess. Aktuelle Sprint-1-URL: `https://fahrduell-production.up.railway.app`.
- VPS/Hetzner plus Docker: langfristig robust, benoetigt Reverse Proxy, HTTPS und Backups.
- Vercel: wegen Socket.IO/WebSocket-Kompatibilitaet gesondert testen; fuer die erste stabile Version ist Docker/Node konservativer.
