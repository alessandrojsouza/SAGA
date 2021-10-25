#include <ESP8266WiFi.h>

const char* ssid = "Trojan";
const char* senha = "86112064KK";

//dados do site que vai receber a requisição GET
const char http_site[] = "http://esptest.local/registra-estados.php";
const int http_port = 80;

IPAddress ip(192,168,0,108);
WiFiServer server(80);
WiFiClient client;

int led1 = 0; //d3
int led2 = 2; //d4
int potenciometro = A0;
int bomba = 0;

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
    int bytes = analogRead(A0);
    float voltagem = bytes * 3.3 / 1023.0;
    float vazao = voltagem * 30.0 / 3.3;

    int estadoEletroBomba = digitalRead(led1);
    int estadoEletroDreno = digitalRead(led2);
    
    Serial.println("Gravando dados no BD: ");
    Serial.print(String(vazao)); Serial.println(" l/min");
    Serial.println(estadoEletroBomba);
    Serial.println(estadoEletroDreno);
    Serial.println(bomba);
    
    // Envio dos dados do sensor para o servidor via GET
    if ( !getPage((float)vazao, (int)estadoEletroBomba, (int)estadoEletroDreno, (int)bomba)) {
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

  if (request.indexOf("/BOMBA=ON") != -1) {
    bomba = 1;
  }
  if (request.indexOf("/BOMBA=OFF") != -1) {
    bomba = 0;
  }

  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("");

  delay(1);
  Serial.println("Client disconnected");
  Serial.println("");
  
  
}

// Executa o HTTP GET request no site remoto
bool getPage(float vazao, int estadoEletroBomba, int estadoEletroDreno, int bomba) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?vazao=" + String(vazao) + "&" + "eletroBomba=" + String(estadoEletroBomba) + "&" + "eletroDreno=" + String(estadoEletroDreno) + "&" + "bomba=" + String(bomba); //Parâmetros com as leituras
  Serial.println(param);
  client.println("GET /registra-estados.php" + param);
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
