package com.satictactoe

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.net.NetworkInterface
import java.net.InetAddress

class NetworkInfoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "NetworkInfoModule"
    }

    @ReactMethod
    fun getDeviceIP(promise: Promise) {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            var ipAddress: String? = null
            
            while (interfaces.hasMoreElements()) {
                val networkInterface = interfaces.nextElement()
                
                // Skip interfaces that are down or loopback
                if (!networkInterface.isUp || networkInterface.isLoopback) {
                    continue
                }
                
                val addresses = networkInterface.inetAddresses
                
                while (addresses.hasMoreElements()) {
                    val address = addresses.nextElement()
                    
                    // Skip loopback addresses
                    if (address.isLoopbackAddress) {
                        continue
                    }
                    
                    // Get IPv4 address
                    val hostAddress = address.hostAddress
                    // Check if it's a valid IPv4 address (not IPv6)
                    if (hostAddress != null && hostAddress.contains(".") && !hostAddress.contains(":")) {
                        // Prefer addresses that are not link-local (169.254.x.x)
                        if (!hostAddress.startsWith("169.254.")) {
                            ipAddress = hostAddress
                            // Prefer WiFi addresses (wlan0) over others
                            if (networkInterface.name.contains("wlan") || networkInterface.name.contains("wifi")) {
                                promise.resolve(ipAddress)
                                return
                            }
                        }
                    }
                }
            }
            
            // If we found an IP, return it; otherwise return null
            if (ipAddress != null) {
                promise.resolve(ipAddress)
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get IP address: ${e.message}", e)
        }
    }
}

