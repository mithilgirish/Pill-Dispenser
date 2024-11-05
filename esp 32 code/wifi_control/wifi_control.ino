#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>
#include <EEPROM.h>          // Include EEPROM library
#include <ArduinoJson.h>     // Include ArduinoJson library

// Define GPIO pins for the servo motors
#define SERVO1PIN 13
#define SERVO2PIN 12
#define SERVO3PIN 14
#define SERVO4PIN 27
#define SERVO5PIN 26

// Wi-Fi credentials
const char* ssid = "Name";
const char* password = "Pass";

// Create a WebServer object on port 80
WebServer server(80);

// Create 5 Servo objects
Servo servo1, servo2, servo3, servo4, servo5;

// Arrays to store pill counts and names for each servo motor
int pillCounts[5] = {10, 10, 10, 10, 10};  // Start with 10 pills per motor
String pillNames[5] = {"", "", "", "", ""};  // Store names of pills

// Function to set CORS headers
void setCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
}

// Handle the root URL
void handleRoot() {
  // Set CORS headers
  setCorsHeaders();

  // Create a JSON document
  StaticJsonDocument<256> doc;

  // Add data to the JSON document
  for (int i = 0; i < 5; i++) {
    doc["servo"][i]["number"] = i + 1;
    doc["servo"][i]["remainingPills"] = pillCounts[i];
    doc["servo"][i]["pillName"] = pillNames[i];
  }

  // Serialize JSON to a string
  String jsonResponse;
 serializeJson(doc, jsonResponse);

  // Send the JSON response
  server.send(200, "application/json", jsonResponse);
}

// Function to move the selected servo and decrement the pill count
void moveServo(int servoNumber, int angle) {
  int angleRET = 0;
  if (pillCounts[servoNumber - 1] > 0) {
    switch (servoNumber) {
      case 1:
        servo1.write(angle);
        delay(500);
        servo1.write(angleRET);
        break;
      case 2:
        servo2.write(angle);
        delay(500);
        servo2.write(angleRET);
        break;
      case 3:
        servo3.write(angle);
        delay(500);
        servo3.write(angleRET);
        break;
      case 4:
        servo4.write(angle);
        delay(500);
        servo4.write(angleRET);
        break;
      case 5:
        servo5.write(angle);
        delay(500);
        servo5.write(angleRET);
        break;
      default:
        Serial.println("Invalid servo number.");
        return;
    }

    // Decrease pill count
    pillCounts[servoNumber - 1]--;
    writePillCount(servoNumber - 1, pillCounts[servoNumber - 1]);

    Serial.println("Servo " + String(servoNumber) + " moved. Remaining pills: " + String(pillCounts[servoNumber - 1]));
  } else {
    Serial.println("No pills left for servo " + String(servoNumber));
  }
}

// Handle servo motor control based on the URL arguments
void handleServoControl() {
  // Set CORS headers
  setCorsHeaders();

  if (server.hasArg("number") && server.hasArg("angle")) {
    int servoNumber = server.arg("number").toInt();  // Get the servo number
    int angle = server.arg("angle").toInt();         // Get the angle
    
    if (servoNumber >= 1 && servoNumber <= 5) {
      moveServo(servoNumber, angle);  // Move the specified servo to dispense the pill
      
      // Create a JSON response
      StaticJsonDocument<256> jsonResponse;
      jsonResponse["status"] = "success";
      jsonResponse["message"] = "Servo " + String(servoNumber) + " moved.";
      jsonResponse["remainingPills"] = pillCounts[servoNumber - 1];
      
      String jsonString;
      serializeJson(jsonResponse, jsonString);
      server.send(200, "application/json", jsonString);
    } else {
      // Create an error response
      StaticJsonDocument<256> jsonResponse;
      jsonResponse["status"] = "error";
      jsonResponse["message"] = "Invalid input. Servo number must be 1-5 and angle must be 90.";
      
      String jsonString;
      serializeJson(jsonResponse, jsonString);
      server.send(400, "application/json", jsonString);
    }
  } else {
    // Create an error response for missing parameters
    StaticJsonDocument<256> jsonResponse;
    jsonResponse["status"] = "error";
    jsonResponse["message"] = "Missing number or angle parameters.";
    
    String jsonString;
    serializeJson(jsonResponse, jsonString);
    server.send(400, "application/json", jsonString);
  }
}


// Handle updating pill counts and names from the React app
void handleUpdatePills() {
  // Set CORS headers
  setCorsHeaders();

  if (server.hasArg("number") && server.hasArg("count") && server.hasArg("name")) {
    int servoNumber = server.arg("number").toInt();  // Get the servo number
    int count = server.arg("count").toInt();         // Get the pill count
    String name = server.arg("name");                // Get the pill name
    
    if (servoNumber >= 1 && servoNumber <= 5) {
      pillCounts[servoNumber - 1] = count;
      pillNames[servoNumber - 1] = name;

      // Save to EEPROM
      writePillCount(servoNumber - 1, count);
      writePillName(servoNumber - 1, name);

      // Create a success response
      StaticJsonDocument<256> jsonResponse;
      jsonResponse["status"] = "success";
      jsonResponse["message"] = "Pill count and name updated for Servo " + String(servoNumber);
      
      // Serialize the JSON document to a String
      String jsonString;
      serializeJson(jsonResponse, jsonString);
      
      // Send the JSON response
      server.send(200, "application/json", jsonString);
    } else {
      // Create an error response for invalid servo number
      StaticJsonDocument<256> jsonResponse;
      jsonResponse["status"] = "error";
      jsonResponse["message"] = "Invalid servo number. Must be 1-5.";
      
      // Serialize the JSON document to a String
      String jsonString;
      serializeJson(jsonResponse, jsonString);
      server.send(400, "application/json", jsonString);
    }
  } else {
    // Create an error response for missing parameters
    StaticJsonDocument<256> jsonResponse;
    jsonResponse["status"] = "error";
    jsonResponse["message"] = "Missing number, count, or name parameters.";
    
    // Serialize the JSON document to a String
    String jsonString;
    serializeJson(jsonResponse, jsonString);
    server.send(400, "application/json", jsonString);
  }
}



// Write pill count to EEPROM
void writePillCount(int servoIndex, int count) {
  EEPROM.put(servoIndex * sizeof(int), count);
  EEPROM.commit();
}

// Write pill name to EEPROM
void writePillName(int servoIndex, String name) {
  for (int i = 0; i < 20; i++) {  // Assuming a max name length of 20 characters
    if (i < name.length()) {
      EEPROM.write(20 * servoIndex + i + sizeof(int), name[i]);
    } else {
      EEPROM.write(20 * servoIndex + i + sizeof(int), 0);  // Null terminate
    }
  }
  EEPROM.commit();
}

// Read pill count from EEPROM
int readPillCount(int servoIndex) {
  int count;
  EEPROM.get(servoIndex * sizeof(int), count);
  return count;
}

// Read pill name from EEPROM
String readPillName(int servoIndex) {
  char name[21] = {0};  // Assuming a max name length of 20 characters + null terminator
  for (int i = 0; i < 20; i++) {
    name[i] = EEPROM.read(20 * servoIndex + i + sizeof(int));
  }
  return String(name);
}

void setup() {
  // Start serial communication
  Serial.begin(115200);

  // Initialize EEPROM with a size of 512 bytes
  EEPROM.begin(512);

  // Initialize the servos on the specified pins
  servo1.attach(SERVO1PIN);
  servo2.attach(SERVO2PIN);
  servo3.attach(SERVO3PIN);
  servo4.attach(SERVO4PIN);
  servo5.attach(SERVO5PIN);

  // Retrieve saved pill counts and names from EEPROM
  for (int i = 0; i < 5; i++) {
    pillCounts[i] = readPillCount(i);  // Default to 10 pills if not set
    if (pillCounts[i] == 0) {
      pillCounts[i] = 10;  // Set default count if EEPROM was not initialized
    }
    pillNames[i] = readPillName(i);    // Default to empty name
  }

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Connected to Wi-Fi");
  Serial.print("ESP32 IP address: ");
  Serial.println(WiFi.localIP());

  // Define routes for the web server
  server.on("/", handleRoot);
  server.on("/servo", handleServoControl);
  server.on("/updatePills", handleUpdatePills);  // Route to update pill counts and names

  // Start the server
  server.begin();
  Serial.println("Web server started!");
}

void loop() {
  // Handle client requests
  server.handleClient();
}