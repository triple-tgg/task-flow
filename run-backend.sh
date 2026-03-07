#!/bin/bash

# Function to clean up background processes on script exit
cleanup() {
    echo -e "\nStopping Backend..."
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

echo "========================================="
echo "🚀 Backend is running!"
echo "Backend PID: $BACKEND_PID"
echo "--- URLs ---"
echo "Backend API:     http://localhost:3000"
echo "Backend Swagger: http://localhost:3000/api"
echo "Press [CTRL+C] to stop."
echo "========================================="

# Wait for process
wait $BACKEND_PID
