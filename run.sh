#!/bin/bash

# Stop on first error
set -e

# Use trap to kill both processes when Ctrl+C is pressed
cleanup() {
    echo ""
    echo "Stopping servers..."

    if [[ -n "$BACKEND_PID" ]]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi

    if [[ -n "$FRONTEND_PID" ]]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    echo "Done. Exiting."
    exit 0
}

trap cleanup SIGINT

# -------------------------
# Create & activate venv
# -------------------------
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating one from requirements.txt..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies from requirements.txt..."
    pip install -r requirements.txt
else
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# -------------------------
# Start FastAPI backend
# -------------------------
echo "Starting FastAPI backend..."
cd emotion-server
uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# -------------------------
# Start React frontend
# -------------------------
echo "Starting React frontend..."
cd ../emotion-client
npm install
npm start &
FRONTEND_PID=$!

# Return to root folder so cleanup works from any directory
cd ..

# -------------------------
# Wait for both processes
# -------------------------
wait $BACKEND_PID
wait $FRONTEND_PID
