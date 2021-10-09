#include <FirebaseArduino.h>
#include <ESP8266WiFi.h>

#define WIFI_SSID "AnaLaura"
#define WIFI_PASSWORD "astres07"
#define FIREBASE_HOST "teste---esp8266-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "1iYuVEA6IZyhmyI5Bh63zhPFA94km0Joqo82M1gw"

int ledBomba = 5;
int ledDreno = 4;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("Conectado ");
  Serial.println(WiFi.localIP());

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  pinMode(ledBomba, OUTPUT);
  pinMode(ledDreno, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  int eletrovalvulaBomba = Firebase.getInt("eletrovalvulaBomba");
  Serial.println(eletrovalvulaBomba);
  if(eletrovalvulaBomba == 0){
    digitalWrite(ledBomba, LOW);
  } else {
    digitalWrite(ledBomba, HIGH);
  }
  int eletrovalvulaDreno = Firebase.getInt("eletrovalvulaDreno");
  Serial.println(eletrovalvulaDreno);
  if(eletrovalvulaDreno == 0){
    digitalWrite(ledDreno, LOW);
  } else {
    digitalWrite(ledDreno, HIGH);
  }

  //set data:
  //Firebase.set(ledStatus, "1");
}
