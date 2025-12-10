#!/bin/bash

echo "Building TicTacToe Release AAB for Play Store..."

# Navigate to android directory
cd android

# Clean previous builds
echo "Cleaning previous builds..."
./gradlew clean

# Build release AAB
echo "Building release AAB..."
./gradlew bundleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Release AAB location:"
    echo "  android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "You can also build an APK for testing with:"
    echo "  cd android && ./gradlew assembleRelease"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo ""
fi

cd ..
