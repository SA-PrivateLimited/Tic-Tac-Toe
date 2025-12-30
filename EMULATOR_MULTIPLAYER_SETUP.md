# Emulator-to-Emulator Multiplayer Setup

## The Problem
When hosting on an Android emulator, the server binds to the emulator's network interface. When another emulator tries to connect via `10.0.2.2`, it's trying to reach the host machine, not the other emulator.

## Solution: Port Forwarding

For emulator-to-emulator multiplayer, you need to forward the host machine's port to the emulator's port.

### Step 1: Start Hosting on Emulator 1
1. Open the app on Emulator 1
2. Go to Multiplayer → Host Game
3. Note the port number (e.g., 1234 or 8888)
4. Tap "Start Hosting"

### Step 2: Set Up Port Forwarding
In a terminal, run:
```bash
# Forward host machine's port to Emulator 1's port
# Replace 1234 with your actual port number
adb -s emulator-5554 forward tcp:1234 tcp:1234
```

### Step 3: Connect from Emulator 2
1. Open the app on Emulator 2
2. Go to Multiplayer → Join Game
3. Enter IP: `10.0.2.2`
4. Enter Port: `1234` (same as host)
5. Tap "Join Game"

## Important Notes

1. **Port Forwarding is Required**: Without port forwarding, Emulator 2 cannot reach Emulator 1's server
2. **Use Same Port**: The port on the host machine must match the emulator's port
3. **Check Emulator IDs**: Use `adb devices` to see which emulator is which
4. **Multiple Emulators**: If you have multiple emulators, forward ports for each one

## Troubleshooting

### Connection Refused Error
- Make sure port forwarding is set up: `adb -s emulator-5554 forward tcp:1234 tcp:1234`
- Verify the host is actually listening: Check the host emulator shows "Waiting for player to join..."
- Try a different port (e.g., 8888, 9999)

### EACCES Permission Denied
- Use ports above 1024 (e.g., 8888, 9999, 1234)
- Restart the app
- Check if another app is using the port

### Still Not Working?
1. Check both emulators are running: `adb devices`
2. Verify port forwarding: `adb -s emulator-5554 forward --list`
3. Try restarting both emulators
4. Use the default port 8888

