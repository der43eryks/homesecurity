# Arduino Home Security Integration

This Arduino project provides authentication and communication with the Home Security backend system. It handles device authentication, status reporting, and alert transmission for security sensors.

## 📋 Requirements

### Hardware
- **Arduino Board:** ESP32 (recommended) or Arduino Uno/Nano with ESP8266 WiFi module
- **Sensors:**
  - PIR Motion Sensor
  - Door/Window Magnetic Sensor
  - LED indicators (optional)
- **Power Supply:** Stable 5V power source
- **WiFi Connection:** Stable internet connection

### Software
- Arduino IDE 1.8.x or later
- Required Libraries:
  - `WiFi.h` (built-in for ESP32)
  - `HTTPClient.h` (built-in for ESP32)
  - `ArduinoJson.h` (install via Library Manager)

## 🔧 Setup Instructions

### 1. Install Required Libraries
1. Open Arduino IDE
2. Go to **Tools > Manage Libraries**
3. Search for and install:
   - `ArduinoJson` by Benoit Blanchon

### 2. Configure Settings
1. Open `config.h`
2. Update the following settings:
   ```cpp
   #define WIFI_SSID "YOUR_WIFI_SSID"
   #define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
   #define DEVICE_ID "12345678"
   #define EMAIL "test@example.com"
   #define PASSWORD "password123"
   ```

### 3. Hardware Connections

#### ESP32 Pin Connections:
```
Status LED:    GPIO 2
Alert LED:     GPIO 4
Motion Sensor: GPIO 5
Door Sensor:   GPIO 6
```

#### Arduino Uno/Nano with ESP8266:
```
Status LED:    Digital Pin 2
Alert LED:     Digital Pin 4
Motion Sensor: Digital Pin 5
Door Sensor:   Digital Pin 6
```

### 4. Upload Code
1. Connect Arduino to computer
2. Select correct board and port in Arduino IDE
3. Upload `arduino_auth.ino`

## 🔍 Testing

### 1. Serial Monitor
Open Serial Monitor (115200 baud) to see:
- WiFi connection status
- Authentication attempts
- Sensor readings
- Alert transmissions

### 2. LED Status Indicators
- **Status LED (Green):** Device is online and authenticated
- **Status LED (Red):** Connection or authentication failed
- **Status LED (Blinking):** Connecting to WiFi
- **Alert LED (Blinking):** Sensor triggered, alert sent

### 3. Test Scenarios
1. **WiFi Connection:** LED should turn green
2. **Authentication:** Should see "Authentication successful!" in Serial Monitor
3. **Motion Sensor:** Wave hand in front of sensor, check for alert
4. **Door Sensor:** Open/close door, check for alert

## 📡 API Endpoints Used

### Authentication
- `POST /api/auth/login` - Device authentication
- `GET /api/health` - Server health check

### Alerts
- `POST /api/alerts` - Send sensor alerts

## 🔧 Troubleshooting

### Common Issues

#### 1. WiFi Connection Failed
**Symptoms:** Status LED red, "WiFi connection failed!" in Serial Monitor
**Solutions:**
- Check WiFi credentials in `config.h`
- Ensure WiFi signal is strong
- Verify network allows new devices

#### 2. Authentication Failed
**Symptoms:** "Authentication failed!" in Serial Monitor
**Solutions:**
- Verify device_id, email, password match database
- Check server is online at `https://homesecurity-cw0e.onrender.com`
- Ensure CORS is properly configured

#### 3. Sensors Not Working
**Symptoms:** No alerts when sensors triggered
**Solutions:**
- Check wiring connections
- Verify sensor power supply
- Test sensors individually with simple code

#### 4. HTTP Errors
**Symptoms:** HTTP response codes other than 200
**Solutions:**
- Check server URL is correct
- Verify HTTPS certificate is valid
- Check network firewall settings

### Debug Commands

Add this to your code for debugging:
```cpp
void loop() {
  // ... existing code ...
  
  // Print status every 10 seconds
  static unsigned long lastDebug = 0;
  if (millis() - lastDebug > 10000) {
    printStatus();
    lastDebug = millis();
  }
}
```

## 📊 Expected Behavior

### Normal Operation
1. **Startup:** LED blinks while connecting to WiFi
2. **WiFi Connected:** Status LED turns green
3. **Authentication:** "Authentication successful!" message
4. **Monitoring:** Device sends status updates every 30 seconds
5. **Alerts:** Alert LED blinks when sensors triggered

### Error Recovery
- **WiFi Disconnect:** Automatically reconnects
- **Authentication Expired:** Retries every minute
- **Server Unavailable:** Continues local operation, retries later

## 🔒 Security Features

- **HTTPS Only:** All communications encrypted
- **Cookie Management:** Secure authentication token storage
- **Input Validation:** Sanitized sensor data
- **Rate Limiting:** Prevents alert spam

## 📈 Performance

- **Status Updates:** Every 30 seconds
- **Sensor Checks:** Every 1 second
- **Authentication Retry:** Every 60 seconds
- **Memory Usage:** ~20KB program, ~8KB variables

## 🚀 Advanced Configuration

### Adding More Sensors
1. Define new pin in `config.h`
2. Add sensor check in `checkSensors()`
3. Add alert transmission in `sendAlert()`

### Custom Alert Types
```cpp
void sendCustomAlert(String event, String message) {
  sendAlert(event, message);
}
```

### NTP Time Sync (Recommended)
For accurate timestamps, add NTP library:
```cpp
#include <NTPClient.h>
#include <WiFiUdp.h>

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");
```

## 📞 Support

If you encounter issues:
1. Check Serial Monitor for error messages
2. Verify all connections and settings
3. Test individual components
4. Check server logs for failed requests

## 📝 License

This code is provided as-is for educational and development purposes. Use at your own risk in production environments. 