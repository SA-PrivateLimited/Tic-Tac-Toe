#!/bin/bash

# Script to set up port forwarding for emulator multiplayer

PORT=${1:-8888}
EMULATOR_ID=${2:-emulator-5554}

echo "Setting up port forwarding for multiplayer..."
echo "Port: $PORT"
echo "Emulator: $EMULATOR_ID"

# Check if emulator is connected
if ! adb devices | grep -q "$EMULATOR_ID"; then
    echo "Error: Emulator $EMULATOR_ID is not connected"
    echo "Available devices:"
    adb devices
    exit 1
fi

# Set up port forwarding
adb -s $EMULATOR_ID forward tcp:$PORT tcp:$PORT

if [ $? -eq 0 ]; then
    echo "✅ Port forwarding set up successfully!"
    echo "Host port $PORT -> Emulator $EMULATOR_ID port $PORT"
    echo ""
    echo "Now other emulators can connect to:"
    echo "  IP: 10.0.2.2"
    echo "  Port: $PORT"
else
    echo "❌ Failed to set up port forwarding"
    exit 1
fi

