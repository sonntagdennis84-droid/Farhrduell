# Fahrduell online stellen

Fahrduell braucht fuer den Live-Betrieb einen dauerhaft laufenden Node-Prozess, PostgreSQL und eine oeffentliche HTTPS-Adresse. Der QR-Code funktioniert online erst dann sauber, wenn `NEXT_PUBLIC_APP_URL` auf diese HTTPS-Adresse zeigt.

Aktueller Sprint-1-Online-Stand:

```text
https://fahrduell-production.up.railway.app
```

## Empfohlener schneller Weg

Fuer den ersten echten Online-Test eignet sich ein Anbieter mit Docker/Node-App plus PostgreSQL:

- Railway
- Render
- Fly.io
- VPS mit Docker, zum Beispiel Hetzner

Vercel ist fuer klassische Next.js-Seiten bequem, aber wegen Socket.IO/WebSocket-Betrieb fuer dieses Projekt nicht der konservativste erste Weg.

## Benötigte Werte

Vor dem Deployment brauchst du:

- Git-Repository mit dem Projektcode
- PostgreSQL-Datenbank
- oeffentliche Domain oder Hosting-URL mit HTTPS
- diese ENV-Variablen im Hosting-Dashboard:

```bash
NEXT_PUBLIC_APP_URL=https://deine-domain.example
APP_URL=https://deine-domain.example
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/fahrduell?schema=public
AUTH_SECRET=ein-langes-zufaelliges-secret
ALLOW_DEMO_LOGIN=false
SOCKET_CORS_ORIGIN=https://deine-domain.example
PORT=3000
```

## Deployment-Reihenfolge

1. Repository zu GitHub/GitLab pushen.
2. App beim Hosting-Anbieter aus dem Repository erstellen.
3. PostgreSQL anlegen.
4. ENV-Variablen setzen.
5. Dockerfile oder Node-Start verwenden.
6. Migration ausfuehren: `pnpm db:migrate`.
7. Admin anlegen: `pnpm db:seed`.
8. Quiz-Grundpaket anlegen: `pnpm db:seed:quizzes`.
9. `/api/health` pruefen.
10. `/login` oeffnen.
11. Quiz starten und QR-Code mit Smartphone ueber Mobilfunk testen.

Automatisierter Smoke-Test:

```bash
SMOKE_BASE_URL=https://fahrduell-production.up.railway.app \
SMOKE_ADMIN_EMAIL=admin@fahrduell.de \
SMOKE_ADMIN_PASSWORD='...' \
pnpm smoke:mvp
```

## Was ich von dir brauche

Damit ich es tatsaechlich online stellen kann, brauche ich eins davon:

- Zugang zu einem vorhandenen Hosting-Projekt, oder
- deine Entscheidung fuer einen Anbieter, plus Login/Projektzugriff, oder
- ein GitHub-Repository, in das ich den Stand pushen soll.

Ohne Hosting-Zugang kann ich das Projekt deployment-ready machen, aber nicht selbst live schalten.
