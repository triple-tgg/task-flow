#!/bin/bash

# Function to clean up background processes on script exit
cleanup() {
    echo -e "\nStopping all processes..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Catch termination signals
trap cleanup SIGINT SIGTERM

echo "Starting Backend (NestJS)..."
cd backend || exit
npm run start:dev &
BACKEND_PID=$!
cd ..

echo "Starting Frontend (Vite/React)..."
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo "========================================="
echo "🚀 Project is running!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "--- URLs ---"
echo "Backend API:     http://localhost:3000"
echo "Backend Swagger: http://localhost:3000/api"
echo "Frontend App:    http://localhost:5173"
echo "Press [CTRL+C] to stop both services."
echo "========================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
