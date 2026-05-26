#!/usr/bin/env bash
set -euo pipefail

export DISPLAY=:99

# Cleanup stale Xvfb lock if container restarts.
rm -f /tmp/.X99-lock

# Start virtual X server
Xvfb :99 -screen 0 1366x768x24 -ac +extension GLX +render -noreset &

# Minimal window manager
fluxbox >/tmp/fluxbox.log 2>&1 &

# Expose desktop through VNC
x11vnc -display :99 -forever -shared -nopw -rfbport 5900 >/tmp/x11vnc.log 2>&1 &

# noVNC web socket proxy
websockify --web=/usr/share/novnc/ 6080 localhost:5900 >/tmp/websockify.log 2>&1 &

# Run Electron app (root in container requires no-sandbox)
exec /app/node_modules/.bin/electron . --no-sandbox --disable-gpu
