FROM node:20-bookworm

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# Install all deps (including devDeps needed for next build: typescript, tailwindcss, postcss)
RUN npm install

COPY . .

RUN npx prisma generate && npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm start"]
