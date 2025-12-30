# Running TicTacToe on Multiple Emulators

## Quick Setup Guide

### Step 1: Start Two Emulators
```bash
# Start first emulator (already running on port 5554)
# Start second emulator
emulator -avd Medium_Phone_API_36.1 -port 5556 &
```

### Step 2: Start Metro Bundlers on Different Ports
```bash
# Terminal 1 - Metro for first emulator
PORT=8081 npx react-native start --port 8081

# Terminal 2 - Metro for second emulator  
PORT=8083 npx react-native start --port 8083
```

### Step 3: Setup Port Forwarding
```bash
# Forward ports for both emulators
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5556 reverse tcp:8083 tcp:8083
```

### Step 4: Install App on Both Emulators
```bash
# Build once
cd android && ./gradlew assembleDebug && cd ..

# Install on first emulator (port 8081)
adb -s emulator-5554 install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s emulator-5554 shell am start -n com.satictactoe/.MainActivity

# Install on second emulator (port 8083)
adb -s emulator-5556 install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s emulator-5556 shell am start -n com.satictactoe/.MainActivity
```

## For Multiplayer Testing

### Emulator-to-Emulator Connection:
- **Emulator 1 (Host)**: 
  - IP Address: `10.0.2.2` (this is the emulator's way to access the host machine)
  - Port: `8888` (default)
  
- **Emulator 2 (Join)**:
  - Enter IP: `10.0.2.2`
  - Port: `8888`

### Important Notes:
1. Both emulators must be running
2. Both Metro bundlers must be running on their respective ports
3. For emulator-to-emulator, use `10.0.2.2` as the IP address
4. The app will automatically detect the IP or show instructions

## Troubleshooting

If connection fails:
1. Check both Metro bundlers are running: `lsof -ti:8081,8083`
2. Verify port forwarding: `adb -s emulator-5554 reverse --list`
3. Check if app is installed: `adb -s emulator-5554 shell pm list packages | grep satictactoe`
4. Restart Metro bundlers if needed

