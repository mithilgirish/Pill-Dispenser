#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5    // Change to the correct GPIO pin for ESP32 (typically GPIO 5)
#define RST_PIN 22  // Change to the correct GPIO pin for ESP32 (typically GPIO 22)
MFRC522 mfrc522(SS_PIN, RST_PIN);   // Create MFRC522 instance.

void setup() 
{
  Serial.begin(115200);  // You can use a higher baud rate for ESP32
  SPI.begin(18, 19, 23); // Initialize SPI with custom pins (SCK=18, MISO=19, MOSI=23)
  mfrc522.PCD_Init();    // Initiate MFRC522
  Serial.println("Approximate your card to the reader...");
  Serial.println();
}

void loop() 
{
  // Look for new cards
  if (mfrc522.PICC_IsNewCardPresent()) 
  {
    if (mfrc522.PICC_ReadCardSerial()) 
    {
      // NUID has been read
      MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
      Serial.print("RFID/NFC Tag Type: ");
      Serial.println(mfrc522.PICC_GetTypeName(piccType));

      // Print UID in the hex format
      Serial.print("UID:");
      for (int i = 0; i < mfrc522.uid.size; i++) 
      {
        Serial.print(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
        Serial.print(mfrc522.uid.uidByte[i], HEX);
      }
      Serial.println();

      mfrc522.PICC_HaltA();      // Halt PICC
      mfrc522.PCD_StopCrypto1(); // Stop encryption on PCD
    }
  }
}
