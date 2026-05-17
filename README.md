# 3D-Druck Kostenrechner — gebioMized

Dynamischer Kostenrechner für den Bambu Lab P1S. Mobile-first, läuft als PWA (Add to Homescreen).

## Lokal starten

```bash
npm install
npm run dev
```

## Auf Vercel deployen

1. Repo auf GitHub pushen (oder Ordner direkt in Vercel ziehen)
2. Vercel erkennt Vite automatisch — einfach „Deploy" klicken
3. Fertig ✓

Oder per Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Als iPhone-App (PWA)

1. App im Safari öffnen
2. Teilen → „Zum Home-Bildschirm"
3. Läuft dann wie eine native App — offline funktionsfähig, localStorage bleibt erhalten

## Features

- Kalkulation: Material, Strom, Verschleiß
- Projekte: Speichern & verwalten mit localStorage (persistent)
- Filamentliste: editierbar
- Verschleißteile: Preise & Lebensdauer direkt editierbar
- Dark Mode: automatisch
- 16px Inputs (kein iOS-Zoom), 48px Tap-Targets
