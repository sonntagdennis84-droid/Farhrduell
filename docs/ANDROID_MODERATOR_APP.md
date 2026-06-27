# Android Moderator-App

Fahrduell stellt die Moderatorsteuerung als Android-kompatible PWA bereit. Sie wird im Browser geoeffnet, kann auf dem Startbildschirm installiert werden und steuert dieselbe Live-Session wie die Beameransicht.

## Nutzung

1. Am Laptop eine Live-Session oeffnen.
2. In der Lobby den QR-Code im Bereich `Moderator-App` mit dem Android-Handy scannen.
3. Auf dem Handy einloggen.
4. Die Session ueber die Fernbedienung steuern.

Die Fernbedienung liegt unter:

```text
/host/[sessionId]/remote
```

## Funktionen

- Frage starten
- Antworten sperren
- Antwort aufloesen
- Erklaerung anzeigen
- Punktestand einblenden
- Naechste Frage vorbereiten
- Quiz beenden
- Top-3-Zwischenstand auf dem Handy

## Installation auf Android

In Chrome kann die App ueber `Zum Startbildschirm hinzufuegen` installiert werden. Dafuer sind vorhanden:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/fahrduell.svg`

Der Service Worker cached bewusst keine Quizdaten, damit Live-Sessions nicht mit veralteten Antworten oder Statuswerten arbeiten.
