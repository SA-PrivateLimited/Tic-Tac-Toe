# Firebase Setup for Internet Multiplayer

To enable internet multiplayer (play from anywhere), you need to set up Firebase Realtime Database.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable **Realtime Database** (not Firestore)

## Step 2: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the Android icon to add an Android app
4. Enter package name: `com.satictactoe`
5. Download `google-services.json`
6. Place it in: `android/app/google-services.json`

## Step 3: Configure Android Build

1. Open `android/build.gradle` (project level)
2. Add to `dependencies`:
   ```gradle
   classpath 'com.google.gms:google-services:4.4.0'
   ```

3. Open `android/app/build.gradle`
4. Add at the **top** of the file (after other apply statements):
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

5. Add to `dependencies`:
   ```gradle
   implementation platform('com.google.firebase:firebase-bom:32.7.0')
   implementation 'com.google.firebase:firebase-database'
   ```

## Step 4: Configure Realtime Database Rules

1. In Firebase Console, go to **Realtime Database**
2. Click on **Rules** tab
3. Set rules to allow read/write (for testing):
   ```json
   {
     "rules": {
       "rooms": {
         ".read": true,
         ".write": true
       },
       "games": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
4. Click **Publish**

**⚠️ Security Note**: These rules allow anyone to read/write. For production, implement authentication.

## Step 5: Rebuild the App

```bash
cd android
./gradlew clean
cd ..
npm run android
```

## Step 6: Test Internet Multiplayer

1. Open the app on two devices (or emulators)
2. Go to Multiplayer → Select "Internet" mode
3. One player: Click "Create Room" → Share room code
4. Other player: Enter room code → Click "Join Room"
5. Start playing!

## Troubleshooting

### "Firebase is not available" Error
- Make sure `google-services.json` is in `android/app/`
- Rebuild the app after adding Firebase files
- Check that Firebase dependencies are installed

### "Room not found" Error
- Make sure both players are using the same room code
- Room codes expire after 1 hour of inactivity
- Try creating a new room

### Connection Issues
- Check internet connection on both devices
- Verify Firebase Realtime Database is enabled
- Check Firebase console for errors

## Alternative: Use Free Firebase Tier

Firebase has a generous free tier:
- 1 GB storage
- 10 GB/month transfer
- Perfect for testing and small apps

## Security (For Production)

For production, implement:
1. Firebase Authentication
2. Secure database rules
3. Room expiration
4. Rate limiting

---

**Note**: Internet multiplayer requires Firebase setup. WiFi multiplayer works without Firebase.

