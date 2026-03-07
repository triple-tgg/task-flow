#!/bin/bash

# Function to clean up background processes on script exit
cleanup() {
    echo -e "\nStopping Frontend..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Catch termination signals
trap cleanup SIGINT SIGTERM

echo "Starting Frontend (Vite/React)..."
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo "========================================="
echo "🚀 Frontend is running!"
echo "Frontend PID: $FRONTEND_PID"
echo "--- URLs ---"
echo "Frontend App:    http://localhost:5173"
echo "Press [CTRL+C] to stop."
echo "========================================="

# Wait for process
wait $FRONTEND_PID
