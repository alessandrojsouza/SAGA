#include <ESP8266WiFi.h>

const char* ssid = "nome_da_rede";
const char* senha = "senha_da_rede"
//dados do site que vai receber a requisição GET
const char http_site[] = "http://esptest.local/php/registra-estados.php";
const int http_port = 80;

IPAddress ip(192,168,0,108);
WiFiServer server(80);
WiFiClient client;

int led1 = 0; //d3
int led2 = 2; //d4
int potenciometro = A0;
int bomba = 0;
int sensCisterna = 0;
int sensPoco = 100;


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
    float vazao2 = vazao;

    int estadoEletroBomba = digitalRead(led1);
    int estadoEletroDreno = digitalRead(led2);
    
    Serial.println("Gravando dados no BD: ");
    Serial.print(String(vazao)); Serial.println(" l/min");
    Serial.println(estadoEletroBomba);
    Serial.println(estadoEletroDreno);
    Serial.println(bomba);
    
    // Envio dos dados do sensor para o servidor via GET
    if ( !registraEstados((float)vazao, (int)estadoEletroBomba, (int)estadoEletroDreno, (int)bomba, (int)sensCisterna, (int)sensPoco, (float)vazao2)) {
      Serial.println("Falha na requisição GET");
    }
    if ( sensCisterna == 100 || sensCisterna == 0) {
      if ( !registraCisterna((int)sensCisterna) ) {
        Serial.println("Falha na requisição GET");
      }
    }
    if ( sensPoco == 100 || sensPoco == 0) {
      if ( !registraPoco((int)sensPoco) ) {
        Serial.println("Falha na requisição GET");
      }
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

  if (request.indexOf("/LED1=ON") != -1) {
    digitalWrite(led1, 1);
  }

  if (request.indexOf("/LED1=OFF") != -1) {
    digitalWrite(led1, 0);
  }

  if (request.indexOf("/LED2=ON") != -1) {
    digitalWrite(led2, 1);
  }

  if (request.indexOf("/LED2=OFF") != -1) {
    digitalWrite(led2, 0);
  }

  if (request.indexOf("/BOMBA=ON") != -1) {
    bomba = 1;
    if ( !registraBomba((int)bomba) ) {
        Serial.println("Falha na requisição GET");
    }
  }
  if (request.indexOf("/BOMBA=OFF") != -1) {
    bomba = 0;
    if ( !registraBomba((int)bomba) ) {
        Serial.println("Falha na requisição GET");
    }
  }

  for (int i = 7; i > 0; i--) {
    if (request.indexOf("/SENS" + String(i) + "=ON") != -1) {

      if (i > 2){
        sensCisterna = (i-2) * 20;
        i = 3; 
      } else {
        sensPoco = (i == 2 ? 100 : 20);
      }
      
    }
    if (request.indexOf("/SENS" + String(i) + "=OFF") != -1) {
      if (i > 2){
        sensCisterna = (i - 3) * 20;
      } else {
        sensPoco = (i == 2) ? 20 : 0;
      }
    }  
  }



  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("");

  delay(1);
  Serial.println("Client disconnected");
  Serial.println("");
  
  
}

// Executa o HTTP GET request no site remoto
bool registraEstados(float vazaoSub, int estadoEletroBomba, int estadoEletroDreno, int bomba, int sensCisterna, int sensPoco, float vazaoDes) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?vazao=" + String(vazaoSub) + "&" + "eletroBomba=" + String(estadoEletroBomba) + "&" + "eletroDreno=" + String(estadoEletroDreno) + "&" + "bomba=" + String(bomba) + "&" + "sensCisterna=" + String(sensCisterna) + "&" + "sensPoco=" + String(sensPoco) + "&vazao2=" + String(vazaoDes); //Parâmetros com as leituras
  Serial.println(param);
  client.println("GET /php/registra-estados.php" + param);
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

bool registraCisterna(int sensCisterna) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?nivelCisterna=" + String(sensCisterna); //Parâmetro com as leituras
  Serial.println(param);
  client.println("GET /php/registra-historico-niveis.php" + param);
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

bool registraPoco(int sensPoco) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?nivelPoco=" + String(sensPoco); //Parâmetro com as leituras
  Serial.println(param);
  client.println("GET /php/registra-historico-niveis.php" + param);
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

bool registraBomba(int bomba) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?bomba=" + String(bomba); //Parâmetro com as leituras
  Serial.println(param);
  client.println("GET /php/registra-historico-bomba.php" + param);
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
