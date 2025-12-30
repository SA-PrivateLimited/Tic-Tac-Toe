#!/bin/bash

# Script to run TicTacToe on multiple emulators with different ports

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting TicTacToe on Multiple Emulators${NC}\n"

# Check if emulators are running
EMULATOR1=$(adb devices | grep "emulator-5554" | wc -l)
EMULATOR2=$(adb devices | grep "emulator-5556" | wc -l)

# Start Metro bundlers on different ports
echo -e "${YELLOW}Starting Metro bundlers...${NC}"
PORT=8081 npx react-native start --port 8081 > /dev/null 2>&1 &
METRO1_PID=$!
echo -e "${GREEN}✓ Metro bundler 1 started on port 8081 (PID: $METRO1_PID)${NC}"

PORT=8083 npx react-native start --port 8083 > /dev/null 2>&1 &
METRO2_PID=$!
echo -e "${GREEN}✓ Metro bundler 2 started on port 8083 (PID: $METRO2_PID)${NC}"

sleep 3

# Setup port forwarding
echo -e "\n${YELLOW}Setting up port forwarding...${NC}"
if [ $EMULATOR1 -gt 0 ]; then
    adb -s emulator-5554 reverse tcp:8081 tcp:8081
    echo -e "${GREEN}✓ Port forwarding set for emulator-5554 (8081)${NC}"
fi

if [ $EMULATOR2 -gt 0 ]; then
    adb -s emulator-5556 reverse tcp:8083 tcp:8083
    echo -e "${GREEN}✓ Port forwarding set for emulator-5556 (8083)${NC}"
fi

# Build and install on first emulator
if [ $EMULATOR1 -gt 0 ]; then
    echo -e "\n${YELLOW}Building and installing on emulator-5554 (port 8081)...${NC}"
    cd android
    ./gradlew clean
    ./gradlew assembleDebug
    adb -s emulator-5554 install -r app/build/outputs/apk/debug/app-debug.apk
    adb -s emulator-5554 shell am start -n com.satictactoe/.MainActivity
    cd ..
    echo -e "${GREEN}✓ App installed and started on emulator-5554${NC}"
fi

# Build and install on second emulator
if [ $EMULATOR2 -gt 0 ]; then
    echo -e "\n${YELLOW}Building and installing on emulator-5556 (port 8083)...${NC}"
    cd android
    ./gradlew assembleDebug
    adb -s emulator-5556 install -r app/build/outputs/apk/debug/app-debug.apk
    adb -s emulator-5556 shell am start -n com.satictactoe/.MainActivity
    cd ..
    echo -e "${GREEN}✓ App installed and started on emulator-5556${NC}"
fi

echo -e "\n${BLUE}✅ Setup Complete!${NC}"
echo -e "${YELLOW}Emulator 1 (5554): Connected to Metro on port 8081${NC}"
echo -e "${YELLOW}Emulator 2 (5556): Connected to Metro on port 8083${NC}"
echo -e "\n${BLUE}For Multiplayer:${NC}"
echo -e "  - Emulator 1: Host game, share IP: ${GREEN}10.0.2.2${NC}"
echo -e "  - Emulator 2: Join game, enter IP: ${GREEN}10.0.2.2${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop Metro bundlers${NC}"

# Wait for user interrupt
wait

