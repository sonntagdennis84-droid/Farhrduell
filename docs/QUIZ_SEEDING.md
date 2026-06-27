# Fahrduell Quiz Seeding

Sprint 1 enthaelt ein initiales Quiz-Grundpaket fuer die Fahrschuelerausbildung. Version 1.5 erweitert neue Seed-Fragen um Unterrichtsfelder fuer Erklaerungen, Merksaetze, Praxisbeispiele, Tipp-Joker und Medien-Metadaten.

## Umfang

Das Skript `scripts/seed-driving-school-quizzes.mjs` erstellt 14 vorbereitete Quizze:

1. Grundstoff 1 - Persoenliche Voraussetzungen / Risikofaktor Mensch
2. Grundstoff 2 - Rechtliche Rahmenbedingungen
3. Grundstoff 3 - Verkehrszeichen und Verkehrseinrichtungen
4. Grundstoff 4 - Strassenverkehrssystem und Bahnuebergaenge
5. Grundstoff 5 - Vorfahrt und Verkehrsregelungen
6. Grundstoff 6 - Geschwindigkeit, Abstand und umweltschonende Fahrweise
7. Grundstoff 7 - Andere Verkehrsteilnehmer
8. Grundstoff 8 - Verkehrsverhalten bei Fahrmanoevern
9. Grundstoff 9 - Ruhender Verkehr
10. Grundstoff 10 - Verhalten in besonderen Situationen
11. Grundstoff 11 - Lebenslanges Lernen / Folgen von Verstoessen
12. Grundstoff 12 - Technische Bedingungen / Fahrzeugbetrieb
13. Fachstoff B 1 - Fahrzeugtechnik, Sicherheitseinrichtungen und Anhaenger
14. Fachstoff B 2 - Personen- und Gueterbefoerderung / besondere Fahrten

Jedes Quiz enthaelt mindestens 10 Fragen mit vier Antwortmoeglichkeiten, genau einer richtigen Antwort, Erklaerung, antwortbezogenen Erklaerungen, Merksatz, Praxisbeispiel, Tipp, Erinnerungsfrage, Schwierigkeit, Kategorie und Thema.

Medienfelder werden fuer bestehende Grundfragen mit `mediaType = none` angelegt. Fuer eigene Bild- oder Videofragen kann eine externe URL oder ein Pfad unter `/uploads/questions/...` verwendet werden. Dateien koennen in `public/uploads/questions/` abgelegt werden.

## Ausfuehren

```bash
pnpm db:seed:quizzes
```

Voraussetzungen:

- `DATABASE_URL` zeigt auf die Ziel-Datenbank.
- Prisma-Migrationen wurden ausgefuehrt.
- `pnpm prisma:generate` wurde ausgefuehrt, falls der Prisma-Client noch nicht generiert ist.

## Idempotenz

Das Skript prueft den Quiz-Titel. Existiert ein Quiz bereits, wird es uebersprungen. Dadurch kann der Seed mehrfach ausgefuehrt werden, ohne Duplikate anzulegen und ohne manuell bearbeitete Quizze zu ueberschreiben.

## Railway

Im Railway-Projekt kann das Skript als einmaliger Job oder lokal gegen die Railway-Postgres-URL ausgefuehrt werden:

```bash
DATABASE_URL="postgresql://..." pnpm db:seed:quizzes
```
