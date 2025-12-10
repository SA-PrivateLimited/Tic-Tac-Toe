# App Logo Setup Guide

## Your Logo Description
- Orange background
- Tic-Tac-Toe grid with X's and O's
- "TIC-TAC-TOE" text below the grid
- Black and off-white colors

## Required Icon Sizes

Your logo needs to be converted to these sizes for Android:

### Square Icons (ic_launcher.png)
- **mipmap-mdpi**: 48x48 px
- **mipmap-hdpi**: 72x72 px
- **mipmap-xhdpi**: 96x96 px
- **mipmap-xxhdpi**: 144x144 px
- **mipmap-xxxhdpi**: 192x192 px

### Round Icons (ic_launcher_round.png)
- Same sizes as above, but with rounded corners

### Play Store Icon
- **512x512 px** (32-bit PNG with alpha channel)

## How to Generate Icons from Your Logo

### Option 1: Android Asset Studio (Recommended - Easiest)
1. Go to: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. Upload your logo image (preferably 512x512 or larger)
3. Adjust settings:
   - **Icon Type**: Launcher Icons
   - **Shape**: Square (for ic_launcher) and Round (for ic_launcher_round)
   - **Padding**: Adjust if needed
4. Click "Download" to get a zip file
5. Extract the zip and copy the icons to the appropriate folders

### Option 2: Android Studio Image Asset Studio
1. Open project in Android Studio
2. Right-click on `android/app/src/main/res` folder
3. Select **New > Image Asset**
4. Choose **Launcher Icons (Adaptive and Legacy)**
5. Upload your logo image
6. Android Studio will generate all sizes automatically
7. Click "Next" and "Finish"

### Option 3: Manual Conversion (Using ImageMagick or Online Tools)
If you have the logo file, you can resize it manually:
- Use online tools like: https://www.iloveimg.com/resize-image
- Or use ImageMagick command line tool

## File Locations

After generating icons, place them here:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   ├── ic_launcher.png (48x48)
│   └── ic_launcher_round.png (48x48)
├── mipmap-hdpi/
│   ├── ic_launcher.png (72x72)
│   └── ic_launcher_round.png (72x72)
├── mipmap-xhdpi/
│   ├── ic_launcher.png (96x96)
│   └── ic_launcher_round.png (96x96)
├── mipmap-xxhdpi/
│   ├── ic_launcher.png (144x144)
│   └── ic_launcher_round.png (144x144)
└── mipmap-xxxhdpi/
    ├── ic_launcher.png (192x192)
    └── ic_launcher_round.png (192x192)
```

## Quick Steps

1. **Prepare your logo**: 
   - Make sure it's at least 512x512 pixels
   - PNG format with transparent background (if needed)
   - Or square format if using solid background

2. **Generate icons**:
   - Use Android Asset Studio (Option 1 above) - it's the easiest
   - Upload your logo
   - Download the generated zip

3. **Replace icons**:
   - Extract the downloaded zip
   - Copy all icon files to the folders listed above
   - Replace existing placeholder icons

4. **Rebuild app**:
   ```bash
   cd android && ./gradlew clean && ./gradlew bundleRelease
   ```

## Tips

- **Square icons**: Your logo should work well as square icons
- **Round icons**: The tool will automatically create rounded versions
- **Padding**: You may want to add some padding so the grid doesn't touch edges
- **Background**: The orange background will work well for icons
- **Text**: The "TIC-TAC-TOE" text might be too small at smaller icon sizes - consider using just the grid for smaller icons

## Need Help?

If you have the logo image file, you can:
1. Place it in the project root as `logo.png` or `logo.jpg`
2. I can help you process it further

Or use the online tool at: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

