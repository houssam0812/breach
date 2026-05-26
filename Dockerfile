FROM node:20-bookworm

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 3000

# Apply schema, then run Next.js in dev mode for local frontend/backend testing.
CMD ["sh", "-c", "npx prisma db push && npm run dev -- --hostname 0.0.0.0 --port 3000"]
