# Breach

A location-based Q&A community. Ask questions about any place — bars, neighborhoods, venues — and get answers from people who've been there.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v4 (credentials)
- **Styling**: Tailwind CSS (dark Reddit-like theme)
- **Geocoding**: OpenStreetMap Nominatim (no API key required)

## Features

- 📍 Ask questions tagged with a real location (address, neighborhood, venue)
- 🗳️ Upvote / downvote posts and answers (Reddit-style)
- ✅ Mark accepted answers
- 🔔 Subscribe to locations to follow activity
- 🔍 Search across questions and locations
- 🌍 Location autocomplete via Nominatim

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

You need a PostgreSQL database. Create one, then update `.env.local`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/breach"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"   # run: openssl rand -base64 32
```

### 3. Push the schema & generate the client

```bash
npm run db:push
npm run db:generate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker Compose deployment (y50 style)

This project can run with Docker Compose in the same style as other services on y50 (single `docker-compose.yml`, `restart: unless-stopped`, env-file driven config).

### 1. Create runtime env file

Copy `.env.example` to `.env` and set at least:

```env
POSTGRES_DB="breach"
POSTGRES_USER="breach"
POSTGRES_PASSWORD="strong-password"
NEXTAUTH_URL="http://YOUR_SERVER_IP:3000"
NEXTAUTH_SECRET="run-openssl-rand-base64-32"
```

`DATABASE_URL` from `.env` is ignored in compose mode, because compose injects an internal `db` hostname URL automatically.

### 2. Start services

```bash
docker compose up -d --build
```

### 3. Check logs

```bash
docker compose logs -f app
```

### 4. Stop services

```bash
docker compose down
```

### 5. Update deployment

```bash
git pull
docker compose up -d --build
```

## Database commands

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema changes to DB |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate` | Create a migration |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Home feed (hot/new)
│   ├── submit/page.tsx           # Create a post
│   ├── login/page.tsx            # Sign in
│   ├── register/page.tsx         # Create account
│   ├── search/page.tsx           # Search results
│   ├── posts/[id]/page.tsx       # Post detail + answers
│   ├── locations/[slug]/page.tsx # Location feed
│   └── api/                      # API routes
├── components/
│   ├── layout/                   # Navbar, Providers
│   ├── posts/                    # PostCard, PostForm, VoteButton
│   ├── answers/                  # AnswerCard, AnswerForm, AnswerSection
│   ├── locations/                # LocationPicker, SubscribeButton
│   └── ui/                       # Button, Badge
├── lib/
│   ├── db.ts                     # Prisma singleton
│   ├── auth.ts                   # NextAuth config
│   └── utils.ts                  # Helpers
└── types/
    └── next-auth.d.ts            # Session type augmentation
```
