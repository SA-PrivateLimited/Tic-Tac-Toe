# Firebase Security Setup for Internet Multiplayer

This guide explains how to set up Firebase security for the TicTacToe internet multiplayer feature using the service account key.

## ⚠️ Important Security Notes

**NEVER commit the service account key to git or include it in the app bundle!**

The `ServiceAccountKeys.json` file should:
- ✅ Be in `.gitignore`
- ✅ Be used only for server-side operations
- ✅ Be kept secure and private
- ❌ NEVER be included in the React Native app bundle
- ❌ NEVER be uploaded to version control

## Setup Steps

### 1. Install Firebase Admin SDK (for deploying rules)

```bash
npm install --save-dev firebase-admin
```

### 2. Deploy Database Rules

Run the deployment script:

```bash
node scripts/deploy-firebase-rules.js
```

This will:
- Load the service account key
- Initialize Firebase Admin SDK
- Deploy security rules to your Realtime Database

### 3. Verify Rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tictactoe-ddc0b`
3. Go to **Realtime Database** → **Rules** tab
4. Verify the rules are deployed correctly

## Current Security Rules

The current rules allow public read/write access for multiplayer functionality:

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

### Why Public Access?

For a simple multiplayer game like TicTacToe:
- ✅ No sensitive user data is stored
- ✅ Game state is temporary (rooms are cleaned up)
- ✅ Simple implementation without authentication overhead
- ✅ Works immediately without user sign-up

### For Production (Optional)

If you want to add authentication for better security:

1. **Enable Anonymous Authentication** in Firebase Console
2. **Update the app** to sign in anonymously
3. **Update database rules** to require authentication:

```json
{
  "rules": {
    "rooms": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "games": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## Service Account Permissions

The service account needs the following IAM roles:
- **Firebase Realtime Database Admin** (to deploy rules)
- **Firebase Admin** (for full access if needed)

## Troubleshooting

### Error: "Service account key not found"
- Ensure `ServiceAccountKeys.json` is in the project root
- Check file permissions

### Error: "Failed to initialize Firebase Admin"
- Verify the service account key is valid
- Check that the project ID matches your Firebase project

### Error: "Failed to deploy rules"
- Ensure Realtime Database is enabled
- Verify service account has proper permissions
- Check database URL matches your project

## Database Structure

```
/rooms/{roomId}
  - host: boolean
  - player2: boolean
  - createdAt: timestamp

/games/{gameId}
  - board: array (9 cells)
  - currentPlayer: 'X' | 'O'
  - winner: 'X' | 'O' | null
  - isDraw: boolean
  - lastMove: { index: number, player: 'X' | 'O' } | null
```

## Cleanup

Rooms and games are automatically cleaned up when:
- Host disconnects (room is removed)
- Game ends (can be manually cleaned up)

For production, consider adding:
- Automatic cleanup of old rooms (Cloud Functions)
- Rate limiting to prevent abuse
- Room expiration (remove rooms older than 1 hour)

