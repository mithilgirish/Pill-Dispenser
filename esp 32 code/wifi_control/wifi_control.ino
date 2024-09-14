#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>  // Include ESP32 Servo library

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

// Handle the root URL
void handleRoot() {
  String html = "<html><body><h1>ESP32 Web Server</h1>";
  html += "<p>Control Servo Motors:</p>";
  html += "<p><a href=\"/servo?number=1&angle=0\">Move Servo 1 to 0 degrees</a></p>";
  html += "<p><a href=\"/servo?number=1&angle=90\">Move Servo 1 to 90 degrees</a></p>";
  html += "<p><a href=\"/servo?number=1&angle=180\">Move Servo 1 to 180 degrees</a></p>";
  html += "<p><a href=\"/servo?number=2&angle=0\">Move Servo 2 to 0 degrees</a></p>";
  html += "<p><a href=\"/servo?number=2&angle=90\">Move Servo 2 to 90 degrees</a></p>";
  html += "<p><a href=\"/servo?number=2&angle=180\">Move Servo 2 to 180 degrees</a></p>";
  html += "<!-- Add similar links for servo 3, 4, and 5 -->";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// Function to move the selected servo
void moveServo(int servoNumber, int angle) {
  switch (servoNumber) {
    case 1:
      servo1.write(angle);
      break;
    case 2:
      servo2.write(angle);
      break;
    case 3:
      servo3.write(angle);
      break;
    case 4:
      servo4.write(angle);
      break;
    case 5:
      servo5.write(angle);
      break;
    default:
      Serial.println("Invalid servo number.");
      break;
  }
}

// Handle servo motor control based on the URL arguments
void handleServoControl() {
  if (server.hasArg("number") && server.hasArg("angle")) {
    int servoNumber = server.arg("number").toInt();  // Get the servo number
    int angle = server.arg("angle").toInt();         // Get the angle
    
    if (servoNumber >= 1 && servoNumber <= 5 && angle >= 0 && angle <= 180) {
      moveServo(servoNumber, angle);  // Move the specified servo to the desired angle
      server.send(200, "text/plain", "Servo " + String(servoNumber) + " moved to " + String(angle) + " degrees");
    } else {
      server.send(400, "text/plain", "Invalid input. Servo number must be 1-5 and angle must be between 0 and 180.");
    }
  } else {
    server.send(400, "text/plain", "Missing number or angle parameters. Use ?number=1-5&angle=0-180.");
  }
}

void setup() {
  // Start serial communication
  Serial.begin(115200);

  // Initialize the servos on the specified pins
  servo1.attach(SERVO1PIN);
  servo2.attach(SERVO2PIN);
  servo3.attach(SERVO3PIN);
  servo4.attach(SERVO4PIN);
  servo5.attach(SERVO5PIN);

  // Move all servos to the neutral position (90 degrees)
  servo1.write(90);
  servo2.write(90);
  servo3.write(90);
  servo4.write(90);
  servo5.write(90);

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

  // Start the server
  server.begin();
  Serial.println("Web server started!");
}

void loop() {
  // Handle client requests
  server.handleClient();
}
