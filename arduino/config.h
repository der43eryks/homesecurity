/*
 * Arduino Configuration File
 * 
 * Update these settings before uploading to your Arduino
 */

#ifndef CONFIG_H
#define CONFIG_H

// =============================================================================
// WIFI CONFIGURATION
// =============================================================================

// Replace with your WiFi credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

// Your backend server URL
#define SERVER_URL "https://homesecurity-cw0e.onrender.com"

// Device credentials (must match your database)
#define DEVICE_ID "12345678"
#define EMAIL "test@example.com"
#define PASSWORD "password123"

// =============================================================================
// HARDWARE PIN CONFIGURATION
// =============================================================================

// LED pins
#define STATUS_LED_PIN 2      // Built-in LED for status
#define ALERT_LED_PIN 4       // LED for alerts

// Sensor pins
#define MOTION_PIN 5          // PIR motion sensor
#define DOOR_PIN 6            // Door/window sensor

// Additional sensors (uncomment if using)
// #define TEMPERATURE_PIN A0   // Temperature sensor
// #define SOUND_PIN 7          // Sound sensor
// #define SMOKE_PIN 8          // Smoke detector

// =============================================================================
// TIMING CONFIGURATION
// =============================================================================

// Update intervals (in milliseconds)
#define STATUS_UPDATE_INTERVAL 30000  // 30 seconds
#define AUTH_RETRY_INTERVAL 60000     // 1 minute
#define SENSOR_CHECK_INTERVAL 1000    // 1 second

// WiFi connection timeout
#define WIFI_TIMEOUT 10000            // 10 seconds

// =============================================================================
// DEBUG CONFIGURATION
// =============================================================================

// Enable/disable debug output
#define DEBUG_MODE true

// Serial baud rate
#define SERIAL_BAUD 115200

// =============================================================================
// SECURITY CONFIGURATION
// =============================================================================

// Enable HTTPS (recommended for production)
#define USE_HTTPS true

// Alert spam prevention delay
#define ALERT_DELAY 2000              // 2 seconds

#endif // CONFIG_H 