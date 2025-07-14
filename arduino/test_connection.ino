/*
 * Arduino Connection Test
 * 
 * Simple test to verify Arduino can connect to the backend
 * and authenticate successfully.
 * 
 * This is a minimal version for testing connectivity.
 */

#include <WiFi.h>
#include <HTTPClient.h>

// Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL = "https://homesecurity-cw0e.onrender.com";

// Test credentials
const char* DEVICE_ID = "12345678";
const char* EMAIL = "test@example.com";
const char* PASSWORD = "password123";

void setup() {
  Serial.begin(115200);
  Serial.println("=== Arduino Connection Test ===");
  
  // Connect to WiFi
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    
    // Test server health
    testServerHealth();
    
    // Test authentication
    testAuthentication();
    
  } else {
    Serial.println();
    Serial.println("WiFi connection failed!");
  }
}

void loop() {
  // Keep the loop empty for testing
  delay(1000);
}

void testServerHealth() {
  Serial.println("\n--- Testing Server Health ---");
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/health");
  
  int httpCode = http.GET();
  String response = http.getString();
  
  Serial.print("HTTP Response Code: ");
  Serial.println(httpCode);
  Serial.println("Response: " + response);
  
  if (httpCode == 200) {
    Serial.println("✅ Server health check PASSED");
  } else {
    Serial.println("❌ Server health check FAILED");
  }
  
  http.end();
}

void testAuthentication() {
  Serial.println("\n--- Testing Authentication ---");
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/api/auth/login");
  http.addHeader("Content-Type", "application/json");
  
  String jsonPayload = "{\"device_id\":\"" + String(DEVICE_ID) + 
                      "\",\"email\":\"" + String(EMAIL) + 
                      "\",\"password\":\"" + String(PASSWORD) + "\"}";
  
  Serial.println("Sending payload: " + jsonPayload);
  
  int httpCode = http.POST(jsonPayload);
  String response = http.getString();
  
  Serial.print("HTTP Response Code: ");
  Serial.println(httpCode);
  Serial.println("Response: " + response);
  
  if (httpCode == 200) {
    Serial.println("✅ Authentication PASSED");
    
    // Extract and display cookies
    String cookies = http.header("Set-Cookie");
    if (cookies.length() > 0) {
      Serial.println("Cookies received: " + cookies);
    } else {
      Serial.println("No cookies received");
    }
    
  } else {
    Serial.println("❌ Authentication FAILED");
  }
  
  http.end();
} 