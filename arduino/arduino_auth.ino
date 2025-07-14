/*
 * Home Security Arduino Authentication Flow
 * 
 * This Arduino code handles authentication with the Home Security backend
 * and manages device status reporting and alert transmission.
 * 
 * Hardware Requirements:
 * - Arduino Uno/Nano with ESP8266 WiFi module
 * - OR ESP32 (recommended for built-in WiFi)
 * - LED indicators for status
 * - Sensors (motion, door, etc.)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// =============================================================================
// CONFIGURATION
// =============================================================================

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* SERVER_URL = "https://homesecurity-cw0e.onrender.com";
const char* DEVICE_ID = "12345678";
const char* EMAIL = "test@example.com";
const char* PASSWORD = "password123";

// Pin Definitions
const int STATUS_LED_PIN = 2;      // Built-in LED for status
const int ALERT_LED_PIN = 4;       // LED for alerts
const int MOTION_PIN = 5;          // PIR motion sensor
const int DOOR_PIN = 6;            // Door/window sensor

// Timing Configuration
const unsigned long STATUS_UPDATE_INTERVAL = 30000;  // 30 seconds
const unsigned long AUTH_RETRY_INTERVAL = 60000;     // 1 minute
const unsigned long SENSOR_CHECK_INTERVAL = 1000;    // 1 second

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

bool isAuthenticated = false;
bool isOnline = false;
String authCookies = "";
unsigned long lastStatusUpdate = 0;
unsigned long lastAuthAttempt = 0;
unsigned long lastSensorCheck = 0;
unsigned long deviceUptime = 0;

// =============================================================================
// SETUP FUNCTION
// =============================================================================

void setup() {
  // Initialize Serial for debugging
  Serial.begin(115200);
  Serial.println("Home Security Arduino Starting...");
  
  // Initialize pins
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(ALERT_LED_PIN, OUTPUT);
  pinMode(MOTION_PIN, INPUT);
  pinMode(DOOR_PIN, INPUT);
  
  // Initialize status LEDs
  updateStatusLED(LED_OFF);
  updateAlertLED(LED_OFF);
  
  // Connect to WiFi
  setupWiFi();
  
  // Attempt initial authentication
  authenticateDevice();
  
  Serial.println("Setup complete!");
}

// =============================================================================
// MAIN LOOP
// =============================================================================

void loop() {
  unsigned long currentTime = millis();
  
  // Handle WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    setupWiFi();
  }
  
  // Authentication check and retry
  if (!isAuthenticated && (currentTime - lastAuthAttempt > AUTH_RETRY_INTERVAL)) {
    Serial.println("Attempting authentication...");
    authenticateDevice();
    lastAuthAttempt = currentTime;
  }
  
  // Status update
  if (isAuthenticated && (currentTime - lastStatusUpdate > STATUS_UPDATE_INTERVAL)) {
    reportStatus();
    lastStatusUpdate = currentTime;
  }
  
  // Sensor monitoring
  if (currentTime - lastSensorCheck > SENSOR_CHECK_INTERVAL) {
    checkSensors();
    lastSensorCheck = currentTime;
  }
  
  // Update uptime
  deviceUptime = currentTime / 1000;
  
  delay(100); // Small delay to prevent watchdog issues
}

// =============================================================================
// WIFI CONNECTION
// =============================================================================

void setupWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    updateStatusLED(LED_BLINKING);
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    updateStatusLED(LED_GREEN);
    isOnline = true;
  } else {
    Serial.println();
    Serial.println("WiFi connection failed!");
    updateStatusLED(LED_RED);
    isOnline = false;
  }
}

// =============================================================================
// AUTHENTICATION FUNCTIONS
// =============================================================================

bool authenticateDevice() {
  if (!isOnline) {
    Serial.println("Cannot authenticate - not online");
    return false;
  }
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/auth/login");
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  String jsonPayload = "{\"device_id\":\"" + String(DEVICE_ID) + 
                      "\",\"email\":\"" + String(EMAIL) + 
                      "\",\"password\":\"" + String(PASSWORD) + "\"}";
  
  Serial.println("Sending authentication request...");
  Serial.println("Payload: " + jsonPayload);
  
  int httpCode = http.POST(jsonPayload);
  String response = http.getString();
  
  Serial.print("HTTP Response Code: ");
  Serial.println(httpCode);
  Serial.println("Response: " + response);
  
  if (httpCode == 200) {
    // Extract cookies from response headers
    String cookies = http.header("Set-Cookie");
    if (cookies.length() > 0) {
      authCookies = extractCookies(cookies);
      Serial.println("Authentication successful!");
      Serial.println("Cookies: " + authCookies);
      isAuthenticated = true;
      updateStatusLED(LED_GREEN);
      return true;
    } else {
      Serial.println("No cookies received");
      isAuthenticated = false;
      updateStatusLED(LED_RED);
      return false;
    }
  } else {
    Serial.println("Authentication failed!");
    isAuthenticated = false;
    updateStatusLED(LED_RED);
    return false;
  }
  
  http.end();
}

String extractCookies(String cookieHeader) {
  // Simple cookie extraction - look for token cookie
  int tokenIndex = cookieHeader.indexOf("token=");
  if (tokenIndex != -1) {
    int endIndex = cookieHeader.indexOf(";", tokenIndex);
    if (endIndex == -1) {
      endIndex = cookieHeader.length();
    }
    return cookieHeader.substring(tokenIndex, endIndex);
  }
  return "";
}

// =============================================================================
// STATUS REPORTING
// =============================================================================

void reportStatus() {
  if (!isAuthenticated || !isOnline) {
    Serial.println("Cannot report status - not authenticated or online");
    return;
  }
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/health");
  http.addHeader("Cookie", authCookies);
  
  Serial.println("Checking server health...");
  
  int httpCode = http.GET();
  String response = http.getString();
  
  Serial.print("Health Check HTTP Code: ");
  Serial.println(httpCode);
  
  if (httpCode == 200) {
    Serial.println("Server is healthy");
    updateStatusLED(LED_GREEN);
    
    // Parse response for additional info
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    
    if (doc.containsKey("status") && doc["status"] == "OK") {
      Serial.println("Backend status: OK");
    }
  } else {
    Serial.println("Server health check failed");
    updateStatusLED(LED_RED);
    isAuthenticated = false; // Force re-authentication
  }
  
  http.end();
}

// =============================================================================
// SENSOR MONITORING
// =============================================================================

void checkSensors() {
  // Check motion sensor
  static bool lastMotionState = false;
  bool currentMotionState = digitalRead(MOTION_PIN) == HIGH;
  
  if (currentMotionState && !lastMotionState) {
    Serial.println("Motion detected!");
    sendAlert("motion_detected", "Motion sensor triggered");
    updateAlertLED(LED_BLINKING);
    delay(2000); // Prevent spam
  }
  
  // Check door sensor
  static bool lastDoorState = false;
  bool currentDoorState = digitalRead(DOOR_PIN) == HIGH;
  
  if (currentDoorState != lastDoorState) {
    String event = currentDoorState ? "door_opened" : "door_closed";
    String message = currentDoorState ? "Door opened" : "Door closed";
    Serial.println(message);
    sendAlert(event, message);
    updateAlertLED(LED_BLINKING);
    delay(1000);
  }
  
  lastMotionState = currentMotionState;
  lastDoorState = currentDoorState;
}

// =============================================================================
// ALERT TRANSMISSION
// =============================================================================

void sendAlert(String event, String message) {
  if (!isAuthenticated || !isOnline) {
    Serial.println("Cannot send alert - not authenticated or online");
    return;
  }
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/alerts");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Cookie", authCookies);
  
  // Create alert JSON
  String alertJson = "{\"type\":\"sensor\",\"event\":\"" + event + 
                    "\",\"message\":\"" + message + 
                    "\",\"timestamp\":\"" + getCurrentTimestamp() + "\"}";
  
  Serial.println("Sending alert: " + alertJson);
  
  int httpCode = http.POST(alertJson);
  String response = http.getString();
  
  Serial.print("Alert HTTP Code: ");
  Serial.println(httpCode);
  
  if (httpCode == 200) {
    Serial.println("Alert sent successfully!");
  } else {
    Serial.println("Failed to send alert!");
    Serial.println("Response: " + response);
  }
  
  http.end();
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

String getCurrentTimestamp() {
  // Simple timestamp - in production, you'd want to sync with NTP
  unsigned long seconds = millis() / 1000;
  unsigned long hours = seconds / 3600;
  unsigned long minutes = (seconds % 3600) / 60;
  seconds = seconds % 60;
  
  return String(hours) + ":" + 
         (minutes < 10 ? "0" : "") + String(minutes) + ":" + 
         (seconds < 10 ? "0" : "") + String(seconds);
}

// =============================================================================
// LED STATUS FUNCTIONS
// =============================================================================

enum LEDState {
  LED_OFF,
  LED_GREEN,
  LED_RED,
  LED_BLINKING
};

void updateStatusLED(LEDState state) {
  switch (state) {
    case LED_OFF:
      digitalWrite(STATUS_LED_PIN, LOW);
      break;
    case LED_GREEN:
      digitalWrite(STATUS_LED_PIN, HIGH);
      break;
    case LED_RED:
      digitalWrite(STATUS_LED_PIN, HIGH);
      break;
    case LED_BLINKING:
      digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
      break;
  }
}

void updateAlertLED(LEDState state) {
  switch (state) {
    case LED_OFF:
      digitalWrite(ALERT_LED_PIN, LOW);
      break;
    case LED_GREEN:
      digitalWrite(ALERT_LED_PIN, HIGH);
      break;
    case LED_RED:
      digitalWrite(ALERT_LED_PIN, HIGH);
      break;
    case LED_BLINKING:
      digitalWrite(ALERT_LED_PIN, !digitalRead(ALERT_LED_PIN));
      break;
  }
}

// =============================================================================
// DEBUG FUNCTIONS
// =============================================================================

void printStatus() {
  Serial.println("=== DEVICE STATUS ===");
  Serial.print("WiFi Status: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  Serial.print("Authentication: ");
  Serial.println(isAuthenticated ? "Authenticated" : "Not Authenticated");
  Serial.print("Online: ");
  Serial.println(isOnline ? "Yes" : "No");
  Serial.print("Uptime: ");
  Serial.print(deviceUptime);
  Serial.println(" seconds");
  Serial.print("Motion Sensor: ");
  Serial.println(digitalRead(MOTION_PIN) == HIGH ? "Triggered" : "Normal");
  Serial.print("Door Sensor: ");
  Serial.println(digitalRead(DOOR_PIN) == HIGH ? "Open" : "Closed");
  Serial.println("===================");
} 