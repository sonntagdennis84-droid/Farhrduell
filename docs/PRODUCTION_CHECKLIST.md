# Fahrduell Production Checklist

## Vor dem Deployment

- [ ] `NEXT_PUBLIC_APP_URL` zeigt auf die oeffentliche HTTPS-Domain.
- [ ] `APP_URL` zeigt auf dieselbe oeffentliche HTTPS-Domain.
- [ ] `DATABASE_URL` zeigt auf PostgreSQL, nicht auf lokale Testdaten.
- [ ] `AUTH_SECRET` ist gesetzt und lang genug.
- [ ] `NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL` ist gesetzt.
- [ ] `SOCKET_CORS_ORIGIN` enthaelt die oeffentliche Domain.
- [ ] PostgreSQL-Backup-Strategie ist geklaert.
- [ ] `pnpm build` laeuft erfolgreich.
- [ ] `pnpm test` laeuft erfolgreich.

## Deployment

- [ ] Container-Image wurde gebaut.
- [ ] `pnpm db:migrate` oder `prisma migrate deploy` wurde ausgefuehrt.
- [ ] Admin-User wurde mit `pnpm db:seed` angelegt.
- [ ] Quiz-Grundpaket wurde mit `pnpm db:seed:quizzes` angelegt.
- [ ] `/api/health` antwortet mit `ok: true`.
- [ ] `/login` ist ueber HTTPS erreichbar.
- [ ] `pnpm smoke:mvp` laeuft gegen die oeffentliche URL.
- [ ] Import mit mindestens einer Excel-Datei getestet.
- [ ] Datenbankverbindung fuer Import und Seed geprueft.

## Funktionstest

- [ ] Dozent kann sich einloggen.
- [ ] Dozent kann Quizliste oeffnen.
- [ ] Dozent kann eine Session starten.
- [ ] Lobby zeigt Join-Code und Klartext-Link.
- [ ] QR-Code enthaelt keine `localhost`- oder `127.0.0.1`-Adresse.
- [ ] Smartphone kann ueber Mobilfunk oder fremdes WLAN beitreten.
- [ ] Mindestens zwei Teilnehmer erscheinen live in der Lobby.
- [ ] Moderatorenansicht kann parallel geoeffnet werden.
- [ ] Frage wird synchron angezeigt.
- [ ] Antwort kann pro Teilnehmer nur einmal gespeichert werden.
- [ ] Rangliste aktualisiert sich.
- [ ] Endergebnis und CSV-Export funktionieren.

## Automatisierter Smoke-Test

```bash
SMOKE_BASE_URL=https://fahrduell-production.up.railway.app \
SMOKE_ADMIN_EMAIL=admin@fahrduell.de \
SMOKE_ADMIN_PASSWORD='...' \
pnpm smoke:mvp
```

Ohne Admin-Zugang prueft der Smoke-Test nur Healthcheck, Auth-Konfiguration und Schutz der Moderatorseiten.

## Sicherheit

- [ ] Teilnehmer kann keine Admin-/Dozentenseite oeffnen.
- [ ] Login-Endpunkt ist rate-limitiert.
- [ ] Join-Endpunkt ist rate-limitiert.
- [ ] Cookies sind in Produktion `secure` und `httpOnly`.
- [ ] Keine Secrets sind im Repository oder Frontend sichtbar.
- [ ] Stacktraces werden nicht oeffentlich angezeigt.

## Betrieb

- [ ] Monitoring fuer App-Prozess eingerichtet.
- [ ] Datenbank-Speicher und Verbindungen werden ueberwacht.
- [ ] Rollback-Image ist bekannt.
- [ ] Datenbank-Backup wurde testweise wiederhergestellt.
- [ ] Domain und HTTPS-Zertifikat sind gueltig.
