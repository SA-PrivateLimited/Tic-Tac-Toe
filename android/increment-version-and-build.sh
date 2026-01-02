#!/bin/bash

# Script to automatically increment version code and build AAB
# Usage: ./increment-version-and-build.sh [bundle|apk]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_GRADLE="${SCRIPT_DIR}/app/build.gradle"
BUILD_TYPE="${1:-bundle}"

# Extract current version code
CURRENT_VERSION_CODE=$(grep -E "versionCode\s+\d+" "${BUILD_GRADLE}" | grep -oE "\d+" | head -1)

if [ -z "$CURRENT_VERSION_CODE" ]; then
    echo "❌ Error: Could not find versionCode in build.gradle"
    exit 1
fi

# Increment version code
NEW_VERSION_CODE=$((CURRENT_VERSION_CODE + 1))

# Extract current version name
CURRENT_VERSION_NAME=$(grep -E "versionName\s+\"[^\"]+\"" "${BUILD_GRADLE}" | grep -oE "\"[^\"]+\"" | head -1 | tr -d '"')

if [ -z "$CURRENT_VERSION_NAME" ]; then
    echo "❌ Error: Could not find versionName in build.gradle"
    exit 1
fi

# Extract version number from version name (e.g., "1.0.25" -> "1.0.26")
VERSION_PARTS=($(echo "$CURRENT_VERSION_NAME" | tr '.' ' '))
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION_NAME="${MAJOR}.${MINOR}.${NEW_PATCH}"

echo "📦 Version Update:"
echo "   Current: Code ${CURRENT_VERSION_CODE}, Name ${CURRENT_VERSION_NAME}"
echo "   New:      Code ${NEW_VERSION_CODE}, Name ${NEW_VERSION_NAME}"
echo ""

# Update version code and version name in build.gradle
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/versionCode ${CURRENT_VERSION_CODE}/versionCode ${NEW_VERSION_CODE}/" "${BUILD_GRADLE}"
    sed -i '' "s/versionName \"${CURRENT_VERSION_NAME}\"/versionName \"${NEW_VERSION_NAME}\"/" "${BUILD_GRADLE}"
else
    # Linux
    sed -i "s/versionCode ${CURRENT_VERSION_CODE}/versionCode ${NEW_VERSION_CODE}/" "${BUILD_GRADLE}"
    sed -i "s/versionName \"${CURRENT_VERSION_NAME}\"/versionName \"${NEW_VERSION_NAME}\"/" "${BUILD_GRADLE}"
fi

echo "✅ Updated build.gradle with new version"
echo ""

# Build based on type
cd "${SCRIPT_DIR}"

if [ "$BUILD_TYPE" = "apk" ]; then
    echo "🔨 Building APK..."
    ./gradlew assembleRelease --no-daemon
    echo ""
    echo "✅ APK built: app/build/outputs/apk/release/app-release.apk"
else
    echo "🔨 Building AAB..."
    ./gradlew bundleRelease --no-daemon
    echo ""
    echo "✅ AAB built: app/build/outputs/bundle/release/app-release.aab"
    
    # Generate debug symbols
    if [ -f "generate-native-debug-symbols.sh" ]; then
        echo ""
        echo "🔨 Generating debug symbols..."
        chmod +x generate-native-debug-symbols.sh
        ./generate-native-debug-symbols.sh
    fi
fi

echo ""
echo "📋 Build Summary:"
echo "   Version Code: ${NEW_VERSION_CODE}"
echo "   Version Name: ${NEW_VERSION_NAME}"
echo "   Build Type: ${BUILD_TYPE}"
echo ""
echo "✅ Build complete!"

