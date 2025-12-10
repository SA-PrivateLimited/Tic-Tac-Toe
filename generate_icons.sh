#!/bin/bash

# Script to generate Android app icons from a source logo
# Usage: ./generate_icons.sh <source_logo_file>

if [ -z "$1" ]; then
    echo "Usage: ./generate_icons.sh <source_logo_file>"
    echo "Example: ./generate_icons.sh logo.png"
    exit 1
fi

SOURCE_LOGO="$1"

if [ ! -f "$SOURCE_LOGO" ]; then
    echo "Error: Source logo file not found: $SOURCE_LOGO"
    exit 1
fi

# Define icon sizes and output paths
declare -A SIZES=(
    ["mdpi"]="48"
    ["hdpi"]="72"
    ["xhdpi"]="96"
    ["xxhdpi"]="144"
    ["xxxhdpi"]="192"
)

BASE_PATH="android/app/src/main/res"

echo "Generating app icons from: $SOURCE_LOGO"
echo "========================================"

# Generate icons for each density
for density in "${!SIZES[@]}"; do
    size="${SIZES[$density]}"
    output_dir="$BASE_PATH/mipmap-$density"

    echo "Generating ${density} (${size}x${size})..."

    # Create directory if it doesn't exist
    mkdir -p "$output_dir"

    # Generate square icon
    sips -z "$size" "$size" "$SOURCE_LOGO" --out "$output_dir/ic_launcher.png" > /dev/null 2>&1

    # Generate round icon (same image, Android will apply the mask)
    sips -z "$size" "$size" "$SOURCE_LOGO" --out "$output_dir/ic_launcher_round.png" > /dev/null 2>&1

    echo "✓ Created $output_dir/ic_launcher.png"
    echo "✓ Created $output_dir/ic_launcher_round.png"
done

echo ""
echo "========================================"
echo "✓ All icons generated successfully!"
echo ""
echo "Icon locations:"
echo "- android/app/src/main/res/mipmap-mdpi/"
echo "- android/app/src/main/res/mipmap-hdpi/"
echo "- android/app/src/main/res/mipmap-xhdpi/"
echo "- android/app/src/main/res/mipmap-xxhdpi/"
echo "- android/app/src/main/res/mipmap-xxxhdpi/"
echo ""
echo "Next steps:"
echo "1. Review the generated icons"
echo "2. Clean and rebuild: cd android && ./gradlew clean"
echo "3. Build AAB: ./gradlew bundleRelease"
