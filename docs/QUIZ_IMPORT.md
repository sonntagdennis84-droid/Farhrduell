# Quiz-Import

Fahrduell kann Quizze ueber Word oder Excel importieren.

## Word-Format

Das Word-Dokument kann als einfacher Fragenblock aufgebaut sein:

```text
Fahrduell - Beispielquiz
Frage 1
Fragetext?
A) Antwort A
B) Antwort B
C) Antwort C
D) Antwort D
Richtige Antwort: B
Erklaerung: Kurze Erklaerung
```

Unterstuetzte optionale Felder:

- Merksatz
- Erinnerungsfrage
- Praxisbeispiel
- Tipp
- Kategorie
- Thema
- Schwierigkeit
- Zeitlimit
- Medientyp
- MedienURL
- AltText
- Medientitel

## Excel-Format

Die erste Tabelle sollte eine Kopfzeile enthalten. Unterstuetzte Spaltennamen:

- Frage
- Antwort A
- Antwort B
- Antwort C
- Antwort D
- Richtige Antwort
- Erklaerung
- Merksatz
- Erinnerungsfrage
- Praxisbeispiel
- Tipp
- Zeitlimit
- Kategorie
- Thema
- Schwierigkeit
- Medientyp
- MedienURL
- AltText
- Medientitel

## Nutzung

In der App:

```text
Quizze -> Import
```

Nach dem Import wird das neue Quiz direkt im Editor geoeffnet, damit Fragen vor dem Live-Einsatz geprueft werden koennen.
