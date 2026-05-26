FROM node:20-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    xvfb \
    x11vnc \
    fluxbox \
    novnc \
    websockify \
    dbus-x11 \
    libgtk-3-0 \
    libnss3 \
    libasound2 \
    libxss1 \
    libxtst6 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgbm1 \
    libxshmfence1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x /app/docker/start-desktop.sh

EXPOSE 6080

CMD ["/app/docker/start-desktop.sh"]
