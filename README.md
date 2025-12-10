# TicTacToe - React Native App

A modern, beautiful TicTacToe game built with React Native for Android.

## Features

- **Classic TicTacToe Gameplay**: Play the timeless game with a beautiful dark theme interface
- **Score Tracking**: Keeps track of wins for both players and draws
- **Persistent Scores**: Scores are saved locally using AsyncStorage
- **Smooth Animations**: Modern UI with smooth transitions and visual feedback
- **Winning Highlights**: Winning combinations are highlighted on the board
- **Clean Design**: Minimalist dark theme with vibrant accent colors

## Tech Stack

- **React Native 0.73.2**: Latest React Native framework
- **TypeScript**: Type-safe development
- **Zustand**: Lightweight state management
- **AsyncStorage**: Local data persistence
- **React Navigation**: Screen navigation

## Project Structure

```
TicTacToe/
├── android/              # Android native code
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Board.tsx   # Game board component
│   │   ├── Cell.tsx    # Individual cell component
│   │   └── ScoreBoard.tsx  # Score display
│   ├── screens/        # App screens
│   │   └── GameScreen.tsx  # Main game screen
│   ├── store/          # State management
│   │   └── gameStore.ts    # Game state with Zustand
│   ├── types/          # TypeScript types
│   │   └── game.ts     # Game-related types
│   ├── utils/          # Utility functions
│   │   └── gameLogic.ts    # Game logic (win detection, etc.)
│   └── navigation/     # Navigation setup
│       └── AppNavigator.tsx
├── App.tsx             # Root component
└── package.json        # Dependencies
```

## Getting Started

### Prerequisites

- Node.js >= 18
- React Native development environment set up
- Android Studio (for Android development)
- JDK 17

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Metro bundler**:
   ```bash
   npm start
   ```

3. **Run on Android**:
   ```bash
   npm run android
   ```

## Building for Release

### Generate Release AAB (for Play Store)

```bash
./build-release.sh
```

Or manually:

```bash
cd android
./gradlew bundleRelease
```

The AAB file will be located at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Generate Release APK (for testing)

```bash
cd android
./gradlew assembleRelease
```

The APK file will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Play Store Deployment

See [PLAY_STORE_CHECKLIST.md](PLAY_STORE_CHECKLIST.md) for the complete deployment checklist.

### Key Configuration

- **App ID**: `com.satictactoe`
- **Version**: 1.0.0 (versionCode: 1)
- **Target SDK**: 34 (Android 14)
- **Min SDK**: 24 (Android 7.0)

## Release Signing

The app is configured with release signing:
- Keystore: `android/app/tictactoe-release-key.keystore`
- Alias: `tictactoe-key-alias`
- Passwords are stored in `gradle.properties` (not in git)

**⚠️ IMPORTANT**: Keep the keystore file and passwords secure! You'll need them for all future app updates.

## Screenshots

Add screenshots here before Play Store submission:
- Gameplay screen
- Victory screen
- Draw screen

## Privacy & Permissions

This app requires minimal permissions:
- **INTERNET**: Required by React Native (even though the app works offline)

The app does NOT:
- Collect any user data
- Require network connectivity
- Track users
- Display ads

## License

MIT License - feel free to use this project as a template for your own apps!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues, please file them in the GitHub issues section.
# Tic-Tac-Toe
