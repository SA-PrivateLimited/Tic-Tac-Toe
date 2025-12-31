# Internet Multiplayer - Quick Start Guide

## 🎮 Play with Your Brother from Different States!

The app now supports **Internet Multiplayer** - you can play with anyone, anywhere in the world!

## How It Works

1. **Open Multiplayer** in the app
2. **Select "Internet" mode** (instead of WiFi)
3. **Host creates a room** → Gets a 6-character room code (e.g., `ABC123`)
4. **Host shares the room code** with friend (via text, WhatsApp, etc.)
5. **Friend enters the code** → Joins the room
6. **Start playing!** 🎉

## Setup Required (One-Time)

To enable internet multiplayer, you need to set up Firebase (free):

### Quick Setup (5 minutes):

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create a new project** (or use existing)
3. **Enable Realtime Database**:
   - Go to "Realtime Database" in left menu
   - Click "Create Database"
   - Choose a location (e.g., us-central1)
   - Start in "test mode" (for now)
4. **Get Configuration File**:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click Android icon
   - Package name: `com.satictactoe`
   - Download `google-services.json`
5. **Place the file**:
   - Copy `google-services.json` to: `android/app/google-services.json`
6. **Rebuild the app**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```

That's it! Internet multiplayer will now work.

## Using Internet Multiplayer

### As Host (Creating Room):
1. Open app → Multiplayer
2. Select **"Internet"** tab
3. Click **"Create Room"**
4. You'll get a room code like `ABC123`
5. **Share this code** with your friend
6. Wait for them to join
7. Start playing!

### As Player (Joining Room):
1. Open app → Multiplayer
2. Select **"Internet"** tab
3. Enter the **room code** your friend shared
4. Click **"Join Room"**
5. Start playing!

## Features

✅ **Works from anywhere** - No need to be on same WiFi  
✅ **Simple room codes** - Easy to share (6 characters)  
✅ **Real-time sync** - Moves appear instantly  
✅ **Free to use** - Firebase free tier is generous  

## Troubleshooting

**"Firebase is not available" error?**
- Make sure `google-services.json` is in `android/app/`
- Rebuild the app after adding the file

**"Room not found" error?**
- Check the room code is correct
- Room codes are case-insensitive
- Make sure host created the room first

**Connection issues?**
- Check internet connection on both devices
- Verify Firebase Realtime Database is enabled
- Try creating a new room

## WiFi vs Internet Mode

- **WiFi Mode**: Works on same network, no setup needed
- **Internet Mode**: Works from anywhere, requires Firebase setup

Both modes work the same way - just choose based on where your friend is!

---

**Need help?** See `FIREBASE_SETUP.md` for detailed setup instructions.

