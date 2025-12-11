# Kotlin Compatibility Issue - Play Console Warning

## Issue Description

Google Play Console shows a warning:
> "Kotlin incompatibilities will cause crashes"
> 
> Your app uses Kotlin's `removeFirst()` and `removeLast()` extension functions, which conflict with Java functions in Android 15. This will cause apps to crash on devices on Android 14 or earlier.
>
> Affected code: `com.swmansion.rnscreens.r.D` (in react-native-screens library)

## Current Status

- **Library**: `react-native-screens@3.27.0`
- **Kotlin Version**: 1.8.0
- **Target SDK**: 35 (Android 15)
- **Issue**: This is a known issue in react-native-screens library, not our code

## Options

### Option 1: Proceed Anyway (Recommended for now)
The Play Console allows you to "Proceed anyway" with this warning. However, this may cause crashes on Android 14 and earlier devices.

**Risk**: Medium - Some users on older Android versions may experience crashes.

### Option 2: Wait for Library Update
Wait for `react-native-screens` to release a version that fixes this issue.

**Status**: Check for updates: `npm outdated react-native-screens`

### Option 3: Downgrade Target SDK (Not Recommended)
Target SDK 34 instead of 35, but this violates Play Store requirements for new apps.

**Not Recommended**: Play Store requires targeting the latest SDK.

### Option 4: Patch the Library (Advanced)
Manually patch the react-native-screens library code, but this is complex and requires maintaining a fork.

## Recommended Action

1. **For now**: Proceed with the warning in Play Console
2. **Monitor**: Watch for crashes in Play Console crash reports
3. **Update**: Check regularly for react-native-screens updates that fix this
4. **Alternative**: Consider if you can remove react-native-screens dependency (if not critical)

## Checking for Updates

```bash
npm outdated react-native-screens
npm view react-native-screens versions --json
```

## Related Issues

- This is a known issue with react-native-screens and Android 15
- The library maintainers are aware of this issue
- Check: https://github.com/software-mansion/react-native-screens/issues

## Workaround (If Needed)

If crashes occur, you may need to:
1. Temporarily target SDK 34 (not recommended long-term)
2. Wait for react-native-screens update
3. Consider alternative navigation libraries

