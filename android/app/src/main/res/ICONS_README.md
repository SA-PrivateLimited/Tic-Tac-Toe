# App Icons Required

You need to add app icons for the following densities:

## Icon Specifications

### ic_launcher.png (Square Icon)
- mipmap-mdpi: 48x48 px
- mipmap-hdpi: 72x72 px
- mipmap-xhdpi: 96x96 px
- mipmap-xxhdpi: 144x144 px
- mipmap-xxxhdpi: 192x192 px

### ic_launcher_round.png (Round Icon)
- mipmap-mdpi: 48x48 px
- mipmap-hdpi: 72x72 px
- mipmap-xhdpi: 96x96 px
- mipmap-xxhdpi: 144x144 px
- mipmap-xxxhdpi: 192x192 px

## How to Generate Icons

1. **Use Android Studio's Image Asset Studio**:
   - Open project in Android Studio
   - Right-click on `res` folder
   - New > Image Asset
   - Choose Icon Type: Launcher Icons
   - Upload your 512x512 icon
   - It will generate all required sizes

2. **Use online tools**:
   - https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
   - Upload a 512x512 PNG image
   - Download the generated zip
   - Extract to the res folder

3. **Use icon packs**:
   - Search for "TicTacToe icon" on https://www.flaticon.com
   - Download and resize for different densities

## Temporary Solution

For now, you can use React Native's default red square icon to test the build.
The app will still function, but you should add proper icons before Play Store submission.
