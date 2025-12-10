# Tic Tac Toe - Web Game & Privacy Policy

This folder contains the web version of Tic Tac Toe game and privacy policy page for deployment on Vercel.

## 🎮 Features

- **Playable Web Game**: Full Tic Tac Toe game with betting/points system
- **Privacy Policy**: Required for Google Play Store submission
- **Local Storage**: Saves scores, balances, and bet amounts
- **Responsive Design**: Works on desktop and mobile

## 📁 Files

- `game.html` - The playable Tic Tac Toe game (main page)
- `index.html` - Privacy policy page
- `vercel.json` - Vercel configuration
- `package.json` - Project metadata
- `README.md` - This file

## 🚀 Deployment Instructions

### Deploy to Vercel via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   cd privacy-policy
   git init
   git add .
   git commit -m "Add Tic Tac Toe web game and privacy policy"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration
   - Click "Deploy"

3. **Get your URLs:**
   - Main game: `https://your-project.vercel.app`
   - Privacy policy: `https://your-project.vercel.app/privacy`

### Alternative: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd privacy-policy
   vercel --prod
   ```

3. **Follow the prompts and get your deployment URL**

## 🔗 URLs After Deployment

- **Game**: `https://your-project.vercel.app` (or `https://your-project.vercel.app/game`)
- **Privacy Policy**: `https://your-project.vercel.app/privacy`

## 📱 For Google Play Console

Use the privacy policy URL (`https://your-project.vercel.app/privacy`) in your Google Play Console privacy policy field.

## ⚠️ Important Notes

### Android App is NOT Affected

- The Android app code is in the parent directories
- This `privacy-policy` folder is completely separate
- Your AAB and APK builds will remain exactly the same
- The Android app source code in `src/` is untouched

### Future Builds

Your Android builds will always be the same as long as you don't modify the Android source code:
- Location: `/Users/sandeepgupta/Desktop/playStore/TicTacToe/android/`
- Source: `/Users/sandeepgupta/Desktop/playStore/TicTacToe/src/`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

To rebuild with the same version:
```bash
cd /Users/sandeepgupta/Desktop/playStore/TicTacToe/android
./gradlew bundleRelease  # For AAB
./gradlew assembleRelease  # For APK
```
