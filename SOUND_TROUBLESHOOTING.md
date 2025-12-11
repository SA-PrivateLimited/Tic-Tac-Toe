# Sound Troubleshooting Guide

## Issue: No Sound Change When Selecting Instruments

### Possible Causes:

1. **App Not Rebuilt** (Most Common)
   - New sound files need to be bundled into the app
   - Solution: Rebuild the app

2. **Emulator Audio Issues**
   - Some emulators have audio disabled or muted
   - Solution: Check emulator audio settings or test on real device

3. **Sound Files Not Loading**
   - Files might not be in the correct location
   - Solution: Check console logs for loading errors

## Solutions:

### 1. Rebuild the App

```bash
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild and run
npx react-native run-android
```

### 2. Check Emulator Audio

- Open emulator settings
- Go to Settings > Sound
- Ensure volume is up
- Or test on a real Android device

### 3. Check Console Logs

When you select an instrument, you should see:
- `✅ Sound loaded successfully for [instrument]: [filename]`
- `🔊 Attempting to play [instrument] sound...`
- `✅ Successfully played [instrument] sound`

If you see errors:
- `❌ Sound file for [instrument] not found` - Files not bundled
- `❌ Failed to play` - Audio system issue

### 4. Verify Sound Files

Check that files exist:
```bash
ls -lh android/app/src/main/res/raw/*.wav
```

Should show:
- bell_ring.wav
- drum_hit.wav
- guitar_tone.wav
- piano_tone.wav
- synth_beep.wav

### 5. Test on Real Device

Emulators sometimes have audio issues. Testing on a real device is recommended.

## Expected Behavior:

1. Open Sound Settings
2. Select an instrument (e.g., Piano)
3. Should hear a test sound immediately
4. Make a move in the game
5. Should hear the selected instrument sound

## Debug Mode:

The app now includes detailed logging. Check Metro console for:
- Sound loading status
- Playback attempts
- Error messages

