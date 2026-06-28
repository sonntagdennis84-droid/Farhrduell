# Fahrduell online stellen

Fahrduell braucht für den Live-Betrieb einen dauerhaft laufenden Node-Prozess, PostgreSQL und eine öffentliche HTTPS-Adresse. Der QR-Code funktioniert online erst dann sauber, wenn `NEXT_PUBLIC_APP_URL` auf diese HTTPS-Adresse zeigt.

Aktueller Online-Stand:

```text
https://fahrduell-production.up.railway.app
```

## Empfohlener schneller Weg

Für den ersten echten Online-Test eignet sich ein Anbieter mit Docker- oder Node-App plus PostgreSQL:

- Railway
- Render
- Fly.io
- VPS mit Docker, zum Beispiel Hetzner

Vercel ist für klassische Next.js-Seiten bequem, aber wegen Socket.IO/WebSocket-Betrieb für dieses Projekt nicht der konservativste erste Weg.

## Benötigte Werte

Vor dem Deployment brauchst du:

- Git-Repository mit dem Projektcode
- PostgreSQL-Datenbank
- öffentliche Domain oder Hosting-URL mit HTTPS
- diese ENV-Variablen im Hosting-Dashboard:

```bash
NEXT_PUBLIC_APP_URL=https://deine-domain.example
APP_URL=https://deine-domain.example
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/fahrduell?schema=public
AUTH_SECRET=ein-langes-zufaelliges-secret
NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL=admin@fahrduell.de
SOCKET_CORS_ORIGIN=https://deine-domain.example
PORT=3000
INITIAL_ADMIN_EMAIL=admin@fahrduell.de
INITIAL_ADMIN_PASSWORD=dein-passwort
INITIAL_ADMIN_NAME=Fahrduell Admin
```

## Deployment-Reihenfolge

1. Repository zu GitHub oder GitLab pushen.
2. App beim Hosting-Anbieter aus dem Repository erstellen.
3. PostgreSQL anlegen.
4. ENV-Variablen setzen.
5. Dockerfile oder Node-Start verwenden.
6. Migration ausführen: `pnpm db:migrate`.
7. Admin anlegen oder aktualisieren: `pnpm db:seed`.
8. Quiz-Grundpaket anlegen: `pnpm db:seed:quizzes`.
9. `/api/health` prüfen.
10. `/login` öffnen.
11. Quiz starten und QR-Code mit Smartphone über Mobilfunk testen.

Automatisierter Smoke-Test:

```bash
SMOKE_BASE_URL=https://fahrduell-production.up.railway.app \
SMOKE_ADMIN_EMAIL=admin@fahrduell.de \
SMOKE_ADMIN_PASSWORD='...' \
pnpm smoke:mvp
```
