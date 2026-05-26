# Breach Separated Architecture

This repo now contains separate codebases by platform and a separate backend service.

## Folders

- `server/api`: standalone Node.js + Express API service
- `clients/web`: standalone Next.js web frontend
- `clients/mobile/ios`: standalone Expo iOS app
- `clients/mobile/android`: standalone Expo Android app
- `clients/desktop/electron`: standalone Electron desktop app

## Run each service

### Backend

1. `cd server/api`
2. `cp .env.example .env`
3. `npm install`
4. `npm run dev`

### Web frontend

1. `cd clients/web`
2. `cp .env.example .env.local`
3. `npm install`
4. `npm run dev`

### iOS frontend

1. `cd clients/mobile/ios`
2. `cp .env.example .env`
3. `npm install`
4. `npm run dev`

### Android frontend

1. `cd clients/mobile/android`
2. `cp .env.example .env`
3. `npm install`
4. `npm run dev`

### Desktop frontend

1. `cd clients/desktop/electron`
2. `cp .env.example .env`
3. `npm install`
4. `npm run dev`

## Notes

- Your original app remains unchanged in `src/` and can keep running during migration.
- This scaffold is the separation baseline; endpoints and UI features can now be migrated incrementally.

## Internal semantic conventions

- `server/api/src/config`: environment and runtime configuration
- `server/api/src/features/*`: domain features grouped by capability (example: `health`)
- `server/api/src/app.ts`: application wiring (middleware, routers)
- `server/api/src/server.ts`: process entrypoint

- `clients/web/src/app`: Next.js app router entrypoints
- `clients/web/src/features/*`: feature-specific data and UI modules
- `clients/web/src/shared/*`: shared non-feature utilities and config

- `clients/mobile/ios/src/app` and `clients/mobile/android/src/app`: platform entrypoints
- `clients/mobile/*/src/features/*`: feature UI modules per mobile platform

- `clients/desktop/electron/src/main`: Electron main process entrypoint
- `clients/desktop/electron/src/config`: desktop runtime/window configuration
- `clients/desktop/electron/src/features/*`: desktop feature-specific renderer assets
