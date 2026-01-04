#!/bin/bash

echo "🚀 Starting Scolo Compliance Platform..."

# Kill any existing processes
echo "Stopping existing processes..."
pkill -f "uvicorn src.api.main:app" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8005 | xargs kill -9 2>/dev/null

# Start backend
echo "Starting backend on port 8005..."
cd backend
source .venv/bin/activate 2>/dev/null || python -m venv .venv && source .venv/bin/activate
pip install -q -r requirements.txt
uvicorn src.api.main:app --port 8005 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Start frontend
echo "Starting frontend on port 3000..."
cd web
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ Services started!"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:8005"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait and handle shutdown
trap "echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait