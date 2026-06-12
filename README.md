# Job Kompass

Ein kleiner Fragebogen, mit dem man für sich selbst festhalten kann, wo man gerade steht.
Es geht um Selbstvertrauen, Gesundheit, Alltag, soziale Kontakte, Arbeit und ein paar Dinge
mehr. Die meisten Fragen laufen über eine Skala von 1 bis 10, dazu kommen ein paar Ja/Nein
Fragen und offene Felder zum Schreiben.

Gedacht ist das für kleine Gruppen. Eine Person (die Leitung) macht einen Raum auf, alle
anderen treten mit einem Code von ihrem eigenen Handy bei. Bevor sie den Code teilt, kann die
Leitung eigene Fragen ergänzen. Am Ende lässt sich alles als PDF oder CSV speichern.

## Warum nichts auf einem Server liegt

Es gibt keinen Server, der die Antworten speichert. Die Verbindung läuft direkt von Gerät zu
Gerät über WebRTC (mit PeerJS). Der Browser der Leitung ist der Raum. Alle Antworten landen
nur dort im Arbeitsspeicher. Sobald die Leitung den Tab schließt oder auf "Sitzung beenden"
tippt, ist alles weg.

Der einzige fremde Dienst ist der öffentliche PeerJS Broker. Der hilft den Geräten nur dabei,
sich zu finden, ungefähr wie eine Telefonvermittlung. Antworten laufen da nicht durch.

Ein Punkt noch: Der Tab der Leitung muss offen bleiben, solange der Raum läuft. Das Ganze ist
für Gruppen bis etwa 30 Personen gedacht, nicht für Hunderte.

## Lokal starten

```bash
npm install
npm run dev
```

Danach die angezeigte Adresse in zwei Fenstern öffnen, im ersten einen Raum erstellen, im
zweiten mit dem Code beitreten.

## Bauen

```bash
npm run build
npm run preview
```

## Selbst hosten

Der Build landet in `dist/` und besteht aus reinen statischen Dateien. Die laufen auf jedem
Webhost.

Für GitHub Pages liegt unter `.github/workflows/deploy.yml` ein Workflow, der bei jedem Push
auf `main` automatisch deployt. Vorher in den Einstellungen des Repos unter Pages als Quelle
"GitHub Actions" auswählen.

In `vite.config.ts` steht `base` auf `'./'`, damit läuft die Seite unter jedem Pfad. Wer auf
eine Projektseite wie `name.github.io/reponame/` deployt und absolute Pfade braucht, setzt
`base` auf `'/reponame/'`.

## Export

Teilnehmende können am Ende ihre eigenen Antworten als PDF speichern. Die Leitung kann
einzelne Abgaben ansehen und als PDF sichern, alle Abgaben zusammen als PDF exportieren oder
alles als CSV für Excel herunterladen.

## Hinweis

Erstellt von [Tiltann.dev](https://tiltann.dev). Privates Projekt. Wird von keiner Einrichtung
und keiner Organisation unterstützt, geprüft oder empfohlen.
