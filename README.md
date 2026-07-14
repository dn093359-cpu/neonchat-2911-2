# PrivatChat – Anleitung

Eine private Chat-App nur für dich und deine Freunde. Läuft im Browser auf
Handy, PC und Tablet (als "PWA" sogar wie eine echte App installierbar) und
nutzt Google Firebase kostenlos als Backend.

## Wie privat ist das wirklich?

Die App verschlüsselt jede Nachricht **direkt auf deinem Gerät** mit
AES-256-GCM, bevor sie zu Firebase geschickt wird. Der Schlüssel entsteht aus
einem geheimen Passwort, das nur du und dein Chatpartner kennt (ihr vereinbart
es persönlich, z. B. am Telefon) – dieses Passwort verlässt niemals dein
Gerät. Firebase/Google speichert also nur unlesbaren Geheimtext.

Damit ist der **Nachrichteninhalt** vor Mitlesen durch den Anbieter oder
Dritte geschützt. Ehrlich dazu: Metadaten (wer mit wem wann chattet) sieht
Firebase weiterhin, und bei einer echten rechtlichen Anordnung an Google kann
diese Metadaten-Ebene betroffen sein – das kann keine App verhindern. Für
wirklich sensible Kommunikation sind etablierte, geprüfte E2E-Messenger wie
Signal die sicherere Wahl. Diese App ist ein solides Projekt für dich und
deine Freunde, keine geprüfte Sicherheitssoftware.

## Schritt 1: Firebase-Projekt erstellen

1. Gehe zu https://console.firebase.google.com
2. "Projekt hinzufügen" → Namen vergeben, z. B. "privatchat"
3. Links im Menü: **Build → Authentication** → "Los geht's" → Tab "Sign-in method"
   → **E-Mail/Passwort** aktivieren
4. Links im Menü: **Build → Firestore Database** → "Datenbank erstellen"
   → Produktionsmodus → Region wählen (z. B. `eur3` für Europa)

## Schritt 2: Firestore-Regeln setzen (nur du + deine Freunde)

In Firestore → Tab "Regeln" folgendes einfügen und veröffentlichen:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chats/{chatId} {
      allow read, create: if request.auth != null &&
        request.auth.token.email in resource.data.participants;
      allow create: if request.auth != null;

      match /messages/{messageId} {
        allow read, create: if request.auth != null &&
          request.auth.token.email in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
```

Das sorgt dafür, dass nur die Teilnehmer eines Chats seine Nachrichten lesen
oder schreiben können.

## Schritt 3: Web-App registrieren & Config eintragen

1. Firebase-Konsole → Zahnrad → "Projekteinstellungen"
2. Unten bei "Deine Apps" → Web-Symbol `</>` → App registrieren
3. Du bekommst ein `firebaseConfig`-Objekt (apiKey, authDomain, ...)
4. Öffne die Datei `index.html` und trage diese Werte oben bei
   `const firebaseConfig = { ... }` ein.

## Schritt 4: App online stellen (Firebase Hosting, kostenlos)

Auf deinem PC mit Node.js installiert:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Ordner mit index.html, manifest.json, sw.js als "public" auswählen
firebase deploy
```

Danach bekommst du eine Adresse wie `https://privatchat-xxxx.web.app` – die
kannst du dir und deinen Freunden schicken. Funktioniert auf jedem Gerät mit
Browser (Handy, PC, Tablet).

**Alternative ohne Kommandozeile:** Du kannst die drei Dateien auch bei
jedem anderen Webhoster oder z. B. GitHub Pages hochladen.

## Schritt 5: Als "richtige App" installieren

Sobald die Seite online ist:
- **Handy (Android/iPhone):** Seite im Browser öffnen → Menü → "Zum
  Startbildschirm hinzufügen"
- **PC (Chrome/Edge):** In der Adressleiste erscheint ein Installations-Symbol
  → anklicken

Danach startet die App wie eine normale App, ganz ohne Browser-Leiste.

## Nutzung

1. Jeder registriert sich mit E-Mail + eigenem Passwort
2. Chat starten: E-Mail des Freundes eingeben → "Chat"
3. Beim ersten Öffnen des Chats: geheimes Chat-Passwort festlegen (beide
   müssen dasselbe eingeben) – das ist der Verschlüsselungs-Schlüssel

## Dateien in diesem Paket

- `index.html` – die komplette App
- `manifest.json` – macht die App installierbar (PWA)
- `sw.js` – Service Worker für Installierbarkeit/Offline-Grundgerüst
