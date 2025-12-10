#!/bin/bash

# Script to process logo image into Android app icons
# Place your logo image as 'logo.png' or 'logo.jpg' in the project root

LOGO_FILE=""
ICON_SIZES=(48 72 96 144 192)
DENSITIES=("mdpi" "hdpi" "xhdpi" "xxhdpi" "xxxhdpi")

# Find logo file
if [ -f "logo.png" ]; then
    LOGO_FILE="logo.png"
elif [ -f "logo.jpg" ]; then
    LOGO_FILE="logo.jpg"
elif [ -f "logo.jpeg" ]; then
    LOGO_FILE="logo.jpeg"
else
    echo "❌ Logo file not found!"
    echo "Please place your logo image as 'logo.png', 'logo.jpg', or 'logo.jpeg' in the project root"
    exit 1
fi

echo "✅ Found logo: $LOGO_FILE"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Please install ImageMagick manually:"
        echo "   macOS: brew install imagemagick"
        echo "   Or use online tool: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html"
        exit 1
    fi
fi

echo "📦 Generating app icons..."

# Create square icons
for i in "${!ICON_SIZES[@]}"; do
    SIZE=${ICON_SIZES[$i]}
    DENSITY=${DENSITIES[$i]}
    OUTPUT_DIR="android/app/src/main/res/mipmap-${DENSITY}"
    
    echo "  Creating ${DENSITY} icons (${SIZE}x${SIZE})..."
    
    # Square icon
    convert "$LOGO_FILE" -resize ${SIZE}x${SIZE} -background none -gravity center -extent ${SIZE}x${SIZE} "${OUTPUT_DIR}/ic_launcher.png"
    
    # Round icon (create rounded square)
    convert "$LOGO_FILE" -resize ${SIZE}x${SIZE} -background none -gravity center -extent ${SIZE}x${SIZE} \
            \( +clone -alpha extract -draw "fill black polygon 0,0 0,${SIZE} ${SIZE},${SIZE} ${SIZE},0 fill white circle ${SIZE},${SIZE} ${SIZE},0" \
            \( +clone -flip \) -compose Multiply -composite \
            \( +clone -flop \) -compose Multiply -composite \) \
            -alpha off -compose CopyOpacity -composite "${OUTPUT_DIR}/ic_launcher_round.png"
done

echo ""
echo "✅ Icons generated successfully!"
echo "📁 Icons saved to: android/app/src/main/res/mipmap-*/"
echo ""
echo "Next steps:"
echo "1. Rebuild the app: cd android && ./gradlew clean && ./gradlew bundleRelease"
echo "2. The new icons will be included in your AAB file"

