#!/bin/bash

# Start the FastAPI Backend in the background
echo "🚀 Starting FastAPI Backend..."
source venv/bin/activate
python3 -m uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start the Vite Frontend
echo "✨ Starting Vite Frontend..."
cd frontend
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev &
FRONTEND_PID=$!

echo "====================================="
echo "✅ Backend running on http://localhost:8000"
echo "✅ Frontend running on http://localhost:5173"
echo "====================================="
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
