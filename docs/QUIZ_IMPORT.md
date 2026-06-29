# Quiz-Import

Fahrduell kann Quizze über Word, Excel und CSV importieren. Der Import-Assistent arbeitet in drei Schritten:

1. Dateien wählen
2. Vorschau prüfen
3. Import bestätigen

## Mehrfach-Upload

Der Importbereich unterstützt mehrere Dateien in einem Vorgang:

- `.docx`
- `.xlsx`
- `.xls`
- `.csv`

Jede Datei wird separat verarbeitet. Ein Fehler in einer Datei stoppt die übrigen Dateien nicht.

## Importbericht

Nach Vorschau oder Import zeigt Fahrduell pro Datei:

- Dateiname
- erkannter Quizname
- Anzahl importierter Fragen
- Anzahl übersprungener Fragen
- Warnungen
- Fehlerstatus

## Dubletten

Quiztitel werden beim Import geprüft.

- Ohne Ersetzen wird ein bestehendes Quiz mit gleichem Titel übersprungen.
- Mit aktivierter Ersetzen-Option wird das bestehende Quiz überschrieben.

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
Erklärung: Kurze Erklärung
```

Unterstützte optionale Felder:

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

Die erste Tabelle oder bevorzugt das Blatt `Fragen` sollte eine Kopfzeile enthalten. Unterstützte Spaltennamen:

- Quiztitel
- Kategorie
- Thema
- ZeitlimitSek
- Frage
- Antwort A
- Antwort B
- Antwort C
- Antwort D
- Richtige Antwort
- Erklärung
- Merksatz
- Erinnerungsfrage
- Praxisbeispiel
- Tipp
- Schwierigkeit
- Medientyp
- MedienURL
- Medienpfad
- AltText
- Medientitel

## Master-Dateien

Wenn eine Excel-Datei mehrere Quizze enthält, trennt Fahrduell diese automatisch anhand der Spalte `Quiztitel`. So kann eine Master-Datei mehrere einzelne Quizze in einem Import erzeugen.

## Nutzung

In der App:

```text
Quizze -> Import
```

Nach erfolgreichem Import gelangst du direkt zur Quizübersicht oder zum ersten importierten Quiz.
