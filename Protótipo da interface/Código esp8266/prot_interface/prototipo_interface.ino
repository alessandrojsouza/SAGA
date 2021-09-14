#include <ESP8266WiFi.h>
#include <Ticker.h>

const char* ssid = "Trojan";
const char* senha = "86112064KK";

//dados do site que vai receber a requisição GET
const char http_site[] = "http://esptest.local/registravazao.php";
const int http_port = 80;

IPAddress ip(192,168,0,108);
WiFiServer server(80);
WiFiClient client;

int led1 = 0; //d3
int led2 = 2; //d4
int potenciometro = A0;

Ticker ticker;

void setup() {
  Serial.begin(115200);
  delay(10);

  pinMode(potenciometro, INPUT);
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  digitalWrite(led1, 0);
  digitalWrite(led2, 0);

  Serial.println();
  Serial.print("Conectando à rede...");

  WiFi.begin(ssid, senha);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Conectado à rede "); Serial.println(ssid);

  server.begin();
  Serial.println("Servidor inicializado!");

  Serial.print("URL de conexão: ");
  Serial.print("http://");
  Serial.print(WiFi.localIP());
  Serial.println("/");
}

void loop() {
  client = server.available();
  if (!client) {
    delay(500);
    Serial.println("NodeMCU - Gravando dados no BD via GET");
    int valor2 = analogRead(A0);
    float voltagem = valor2 * 3.3 / 1023.0;
    float vazao = voltagem * 10.0 / 3.3;
    
    Serial.println("Gravando dados no BD: ");
    Serial.print(String(vazao)); Serial.println(" l/min");
  
    // Envio dos dados do sensor para o servidor via GET
    if ( !getPage((float)vazao)) {
      Serial.println("Falha na requisição GET");
    }
    return;
  }

  Serial.println("Novo cliente");

  while (!client.available()) {
    delay(1);
  }
  
  String request = client.readStringUntil('\r');
  Serial.println(request);
  client.flush();

  int valor = LOW;

  if (request.indexOf("/LED1=ON") != -1) {
    digitalWrite(led1, 1);
    valor = HIGH;
  }

  if (request.indexOf("/LED1=OFF") != -1) {
    digitalWrite(led1, 0);
    valor = LOW;
  }

  if (request.indexOf("/LED2=ON") != -1) {
    digitalWrite(led2, 1);
    valor = HIGH;
  }

  if (request.indexOf("/LED2=OFF") != -1) {
    digitalWrite(led2, 0);
    valor = LOW;
  }

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("");

  delay(1);
  Serial.println("Client disconnected");
  Serial.println("");
  
  
}

// Executa o HTTP GET request no site remoto
bool getPage(float vazao) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?valor=" + String(vazao); //Parâmetros com as leituras
  Serial.println(param);
  client.println("GET /registravazao.php" + param);
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
