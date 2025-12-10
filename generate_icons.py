#!/usr/bin/env python3
"""
Generate Android app icons from a source logo
Usage: python3 generate_icons.py <source_logo_file>
"""

import os
import sys
from PIL import Image

# Define icon sizes for different densities
ICON_SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
}

def generate_icons(source_logo_path):
    """Generate all required Android icon sizes from a source logo"""

    if not os.path.exists(source_logo_path):
        print(f"Error: Source logo file not found: {source_logo_path}")
        return False

    try:
        # Open source image
        img = Image.open(source_logo_path)
        print(f"Generating app icons from: {source_logo_path}")
        print(f"Source image size: {img.size}")
        print("=" * 50)

        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')

        base_path = 'android/app/src/main/res'

        # Generate icons for each density
        for density, size in ICON_SIZES.items():
            output_dir = os.path.join(base_path, f'mipmap-{density}')
            os.makedirs(output_dir, exist_ok=True)

            print(f"Generating {density} ({size}x{size})...")

            # Resize image
            resized_img = img.resize((size, size), Image.Resampling.LANCZOS)

            # Save square icon
            square_path = os.path.join(output_dir, 'ic_launcher.png')
            resized_img.save(square_path, 'PNG')
            print(f"  ✓ Created {square_path}")

            # Save round icon (same image, Android will apply the mask)
            round_path = os.path.join(output_dir, 'ic_launcher_round.png')
            resized_img.save(round_path, 'PNG')
            print(f"  ✓ Created {round_path}")

        print()
        print("=" * 50)
        print("✓ All icons generated successfully!")
        print()
        print("Next steps:")
        print("1. Review the generated icons")
        print("2. Clean and rebuild: cd android && ./gradlew clean")
        print("3. Build AAB: ./gradlew bundleRelease")

        return True

    except Exception as e:
        print(f"Error generating icons: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 generate_icons.py <source_logo_file>")
        print("Example: python3 generate_icons.py logo.png")
        sys.exit(1)

    source_logo = sys.argv[1]
    success = generate_icons(source_logo)
    sys.exit(0 if success else 1)
