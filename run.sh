#!/usr/bin/env bash
#
# Gridlock Intelligence System — macOS / Linux 1-tap runner (mirrors run.bat).
#
# Sets up the backend virtualenv + dependencies and starts BOTH servers:
#   - FastAPI backend (uvicorn)
#   - Vite frontend (npm run dev)
#
# If the default backend port (8000) is already in use by another app, this
# script transparently picks the next free port AND points the frontend at it
# (via VITE_API_BASE_URL), so the simulator keeps working without you having to
# stop the other app.
#
# Usage:  ./run.sh        (from the repo root)
#         PORT=9000 ./run.sh   to force a specific backend port
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Pick a backend port: honor $PORT, else 8000, else next free one --------
DEFAULT_PORT="${PORT:-8000}"
PORT="$(python3 - "$DEFAULT_PORT" <<'PY'
import socket, sys
start = int(sys.argv[1])
for p in range(start, start + 50):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("127.0.0.1", p)) != 0:
            print(p)
            break
else:
    print(start)
PY
)"
if [ "$PORT" != "$DEFAULT_PORT" ]; then
  printf '\xe2\x9a\xa0\xef\xb8\x8f  Port %s is busy — using %s for the backend instead.\n' "$DEFAULT_PORT" "$PORT"
fi

# --- Backend ----------------------------------------------------------------
printf '[1/2] Setting up backend...\n'
cd "$ROOT/backend"
if [ ! -d venv ]; then
  printf 'Creating virtual environment...\n'
  python3 -m venv venv
fi
# shellcheck disable=SC1091
source venv/bin/activate
printf 'Installing backend dependencies...\n'
python -m pip install --quiet --upgrade pip
python -m pip install --quiet -r requirements.txt
printf 'Starting FastAPI on http://127.0.0.1:%s ...\n' "$PORT"
uvicorn api.main:app --host 127.0.0.1 --port "$PORT" --reload &
BACKEND_PID=$!

# --- Frontend ---------------------------------------------------------------
printf '[2/2] Setting up frontend...\n'
cd "$ROOT/frontend"
npm install
# Point the frontend at whichever port the backend actually bound to.
export VITE_API_BASE_URL="http://127.0.0.1:$PORT"
npm run dev &
FRONTEND_PID=$!

cleanup() {
  printf '\nShutting down...\n'
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

printf '===================================================\n'
printf 'Backend:  http://127.0.0.1:%s\n' "$PORT"
printf 'Frontend: see the Vite URL above (usually http://localhost:5173)\n'
printf 'Press Ctrl+C to stop both servers.\n'
printf '===================================================\n'
wait
