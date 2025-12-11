package com.satictactoe

import android.media.MediaPlayer
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class SoundPlayerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var mediaPlayer: MediaPlayer? = null

    override fun getName(): String {
        return "SoundPlayerModule"
    }

    @ReactMethod
    fun playSound(fileName: String, promise: Promise) {
        try {
            // Stop and release any existing MediaPlayer
            stopSound(null)

            // Get the resource ID for the sound file (from raw folder)
            val resourceName = fileName.replace(".wav", "")
            val resourceId = reactApplicationContext.resources.getIdentifier(
                resourceName,
                "raw",
                reactApplicationContext.packageName
            )

            if (resourceId == 0) {
                promise.reject("SOUND_NOT_FOUND", "Sound file not found: $fileName")
                return
            }

            // Create and play the MediaPlayer
            mediaPlayer = MediaPlayer.create(reactApplicationContext, resourceId)
            mediaPlayer?.apply {
                setOnCompletionListener {
                    release()
                    mediaPlayer = null
                }
                start()
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("PLAYBACK_ERROR", "Error playing sound: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stopSound(promise: Promise?) {
        try {
            mediaPlayer?.apply {
                if (isPlaying) {
                    stop()
                }
                release()
            }
            mediaPlayer = null
            promise?.resolve(true)
        } catch (e: Exception) {
            promise?.reject("STOP_ERROR", "Error stopping sound: ${e.message}", e)
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        mediaPlayer?.release()
        mediaPlayer = null
    }
}
