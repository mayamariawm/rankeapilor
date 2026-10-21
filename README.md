# Rankea (working name)

Pilot app for ranking trendy cafés and restaurants in Lima, starting with Miraflores and Barranco. One codebase for iPhone and Android, built with Expo (React Native). The app is in Spanish (es-PE).

## What works today

- **Onboarding**: name and @usuario.
- **Descubrir**: search, filter by district (Miraflores, Barranco) and type (cafés, brunch, panaderías, restaurantes, bares, "Nuevos"), list or map view.
- **Rank a visit**: optional one-line note and photo, pick how it felt (Me encantó / Estuvo bien / No me gustó), then answer a few "¿cuál te gustó más?" questions. Binary search places it in your list and gives a score out of 10.
- **Mi lista**: your ranked places and a "Quiero ir" (want to go) list.
- **Share**: a 9:16 image of your top 5, sized for Instagram Stories and TikTok.
- **Amigos**: invite button (native share sheet) and a friends feed.
- **Add a place** that is missing.

## Not done yet (needs decisions or accounts)

- **Backend.** Everything is stored on the phone. The friends feed shows clearly labelled sample activity. Real friends, invites and sync need a Supabase project: see [docs/BACKEND.md](docs/BACKEND.md).
- **Venue list.** 20 starter places in `src/lib/venues.ts`. Every pin is approximate and unverified. Grow it to about 120 with [docs/venues.csv](docs/venues.csv), and mark new openings with `isNew`.
- **Google Maps key for Android store builds** (the map works in Expo Go without one). Add it under `android.config.googleMaps.apiKey` in `app.json`.
- **Name, icon and splash** are placeholders.

## Try it on your phone (about 10 minutes)

1. Install Node.js 20 or newer on your computer.
2. Install **Expo Go** from the App Store or Google Play.
3. In this folder run:
   ```bash
   npm install
   npx expo start
   ```
4. Scan the QR code: with the Camera app on iPhone, or from inside Expo Go on Android.

## Ship to pilot users (TestFlight and Google Play closed testing)

You need an Apple Developer account (US$99 a year) and a Google Play developer account (US$25 once). No Mac is needed: EAS builds in the cloud.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile pilot --platform all
npx eas-cli@latest submit --profile pilot --platform ios      # goes to TestFlight
npx eas-cli@latest submit --profile pilot --platform android  # upload to a closed testing track
```

TestFlight allows up to 10,000 external testers by email or public link. Google Play closed testing works with an email list or Google Group.

## Development

```bash
npm run typecheck   # TypeScript
npm test            # ranking logic tests
```

- Screens live in `src/app/` (Expo Router: every file is a screen).
- Ranking logic: `src/lib/ranking.ts`. Storage: `src/lib/store.tsx` (the place where backend calls will go).
- The web preview (`npx expo start --web`) is only for quick checks; the map and image sharing work on phones only.
