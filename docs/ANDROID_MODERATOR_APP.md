# Android Moderator-App

Fahrduell stellt die Moderatorsteuerung als Android-kompatible WebView-/PWA-App bereit. Sie steuert dieselbe Live-Session wie die Beameransicht.

## Nutzung

1. Am Laptop eine Live-Session oeffnen.
2. In der Lobby den QR-Code im Bereich `Moderator-App` mit dem Android-Handy scannen oder die Android-App starten.
3. Einloggen.
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
- Moderator-Heatmap mit Teilnehmer-Emoji
- Swipe nach rechts fuer `Naechste Frage`, wenn diese Aktion sichtbar ist
- Swipe nach links fuer `Zurueck`
- Dezentes Vibrationsfeedback, wenn das Geraet `navigator.vibrate` unterstuetzt

## Lautstaerketasten

Android-WebViews und mobile Browser geben Hardware-Lautstaerketasten normalerweise nicht als normale JavaScript-Tastaturereignisse an die Webseite weiter. Deshalb sind `Lauter = Naechste Frage` und `Leiser = Punktestand/Zurueck` aktuell nicht zuverlaessig ohne ein zusaetzliches natives Capacitor-Plugin umsetzbar.

Der aktuelle Stand erzeugt deshalb keine Fehler und ignoriert diese Tasten. Fuer eine spaetere native App-Version kann ein kleines Capacitor-Plugin die Hardware-Key-Events abfangen und an die Fernbedienung weiterleiten.

## Installation auf Android

In Chrome kann die App ueber `Zum Startbildschirm hinzufuegen` installiert werden. Dafuer sind vorhanden:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/fahrduell.svg`

Der Service Worker cached bewusst keine Quizdaten, damit Live-Sessions nicht mit veralteten Antworten oder Statuswerten arbeiten.
