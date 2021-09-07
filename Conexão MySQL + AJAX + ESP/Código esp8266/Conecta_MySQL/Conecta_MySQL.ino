#include <ESP8266WiFi.h>
#include <WiFiClient.h>

//configurações de WI-FI
const char ssid[] = "nome_da_rede";
const char psw[] = "senha";

//dados do site que vai receber a requisição GET
const char http_site[] = "http://esptest.local";
const int http_port = 80;

// Variáveis globais
WiFiClient client;
IPAddress server(192,168,0,108); //Endereço IP do servidor
int potenciometro = A0;

void setup() {
  delay(5000);
  Serial.begin(9600);
  Serial.println("NodeMCU - Gravando dados no BD via GET");
  Serial.print("Aguardando conexão");
  
  // Tenta conexão com Wi-fi
  WiFi.begin(ssid, psw);
  while ( WiFi.status() != WL_CONNECTED ) {
    delay(1000);
    Serial.print(".");
  }
  Serial.print("\nWI-FI conectado com sucesso: ");
  Serial.println(ssid);

}

void loop() {
  delay(3000); //delay de 3s entre as leituras
  int valor = analogRead(A0);
  float voltagem = valor * 3.3 / 1023.0;
  
  Serial.println("Gravando dados no BD: ");
  Serial.print(String(voltagem)); Serial.print(" volts, "); 

  // Envio dos dados do sensor para o servidor via GET
  if ( !getPage((float)voltagem)) {
    Serial.println("GET request failed");
  }
}

// Executa o HTTP GET request no site remoto
bool getPage(float voltagem) {
  if ( !client.connect(server, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?valor=" + String(voltagem); //Parâmetros com as leituras
  Serial.println(param);
  client.println("GET /index.php" + param);
  client.println("Host: ");
  client.println(http_site);
  client.println("Connection: close");
  client.println();
  client.println();

    // Informações de retorno do servidor para debug
  while(client.available()){
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }
  return true;
}
