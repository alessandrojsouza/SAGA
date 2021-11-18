#include <ESP8266WiFi.h>

const char* ssid = "Trojan";
const char* senha = "86112064KK";

//dados do site que vai receber a requisição GET
const char http_site[] = "http://esptest.local/versao-4/php/registra-estados.php";
const int http_port = 80;

IPAddress ip(192,168,0,108);
WiFiServer server(80);
WiFiClient client;

int eletroValvulaSub = 0;
int eletroValvulaDes = 0;
int bomba = 0;
int sensCisterna = 0; //(maior sensor de nivel acionado na cisterna)
int sensPoco = 100;     //(maior sensor de nivel acionado no poco)
float sensFluxoSub = 50;
float sensFluxoDes = 50;

/*OFICIAL (SENSORES DE NIVEL): int sens1, sens2, sens3, sens4, sens5, sens6, sens7;
int sensoresNivel[7] = {sens1, sens2, sens3, sens4, sens5, sens6, sens7}; */

void setup() {
  Serial.begin(115200);
  delay(10);

  /*  OFICIAL
  pinMode(eletroValvulaSub, OUTPUT);
  pinMode(eletroValvulaDes, OUTPUT);
  pinMode(bomba, OUTPUT);
  pinMode(sensCisterna, INPUT);
  pinMode(sensPoco, INPUT);
  pinMode(sensFluxoSub, INPUT);
  pinMode(sensFluxoDes, INPUT);

  pinMode(sens1, INPUT);
  pinMode(sens2, INPUT);
  pinMode(sens3, INPUT);
  pinMode(sens4, INPUT);
  pinMode(sens5, INPUT);
  pinMode(sens6, INPUT);
  pinMode(sens7, INPUT);
  */
  

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
    Serial.println("NodeMCU - Gravando dados no BD via GET");    
    
    Serial.println("Gravando dados no BD: ");
    Serial.println("Vazão de subida: " + String(sensFluxoSub) + " l/min");  //OFICIAL: analogRead(sensFluxoSub)
    Serial.println("Vazão de descida " + String(sensFluxoDes) + " l/min");  //OFICIAL: analogRead(sensFluxoDes)
    Serial.println("Eletroválvula de subida: " + String(eletroValvulaSub)); //OFICIAL: digitalRead(eletroValvulaSub)
    Serial.println("Eletroválvula de descida: " + String(eletroValvulaDes)); //OFICIAL: digitalRead(eletroValvulaDes)
    Serial.println("Bomba: " + String(bomba));  //OFICIAL: digitalRead(bomba)
    Serial.println("Porcentagem da cisterna (maior sensor): " + String(sensCisterna)); //OFICIAL
    Serial.println("Porcentagem do poço (maior sensor): " + String(sensPoco)); //OFICIAL
    
    // Envio dos dados do sensor para o servidor via GET
    if ( !registraEstados((float)sensFluxoSub, (float)sensFluxoDes, (int)eletroValvulaSub, (int)eletroValvulaDes, (int)bomba, (int)sensCisterna, (int)sensPoco)) {    //OFICIAL: digital/analogRead(...)
      Serial.println("Falha na requisição GET");
    }
    
    if ( !registraCisterna((int)sensCisterna) ) {   //OFICIAL: digitalRead(sensX)
      Serial.println("Falha na requisição GET");
    }

    if ( !registraPoco((int)sensPoco) ) {   //OFICIAL: digitalRead(sensY)
      Serial.println("Falha na requisição GET");
    }

    Serial.println("teile");

    return;
  }

  Serial.println("Novo cliente");

  while (!client.available()) {
    delay(1);
  }
  
  String request = client.readStringUntil('\r');
  client.flush();

  if (request.indexOf("/LED1=ON") != -1) {
    eletroValvulaSub = 1;
    //OFICIAL: digitalWrite(eletroValvulaSub, 1);
  }

  if (request.indexOf("/LED1=OFF") != -1) {
    eletroValvulaSub = 0;
    //OFICIAL: digitalWrite(eletroValvulaSub, 0);
  }

  if (request.indexOf("/LED2=ON") != -1) {
    eletroValvulaDes = 1;
    //OFICIAL: digitalWrite(eletroValvulaDes, 1);
  }

  if (request.indexOf("/LED2=OFF") != -1) {
    eletroValvulaDes = 0;
    //OFICIAL: digitalWrite(eletroValvulaDes, 0);
  }

  if (request.indexOf("/BOMBA=ON") != -1) {
    bomba = 1;
    if ( !registraBomba((int)bomba) ) {
        Serial.println("Falha na requisição GET");
    }

    /* OFICIAL:
    digitalWrite(bomba, 1);
    if ( !registraBomba((int) digitalRead(bomba)) ) {
        Serial.println("Falha na requisição GET");
    }
    */
  }
  if (request.indexOf("/BOMBA=OFF") != -1) {
    bomba = 0;
    if ( !registraBomba((int)bomba) ) {
        Serial.println("Falha na requisição GET");
    }

    /* OFICIAL:
    digitalWrite(bomba, 0);
    if ( !registraBomba((int) digitalRead(bomba)) ) {
        Serial.println("Falha na requisição GET");
    }
    */
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

  /* OFICIAL:
  for (int i = 7; i > 0; i--) {
    if (digitalRead(sensoresNivel[i-1]) == 1) {

      if (i > 2){
        sensCisterna = (i-2) * 20;
        i = 3; 
      } else {
        sensPoco = (i == 2 ? 100 : 20);
      }
      
    }
    if (digitalRead(sensoresNivel[i-1]) == 0) {
      if (i > 2){
        sensCisterna = (i - 3) * 20;
      } else {
        sensPoco = (i == 2) ? 20 : 0;
      }
    }  
  }
  */



  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("");

  Serial.println("Client disconnected");
  Serial.println("");
  
  
}

// Executa o HTTP GET request no site remoto
bool registraEstados(float vazaoSub, float vazaoDes, int estadoEletroBomba, int estadoEletroDreno, int bomba, int sensCisterna, int sensPoco) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?vazao=" + String(vazaoSub) + "&eletroBomba=" + String(estadoEletroBomba) + "&eletroDreno=" + String(estadoEletroDreno) + "&bomba=" + String(bomba) + "&sensCisterna=" + String(sensCisterna) + "&sensPoco=" + String(sensPoco) + "&vazao2=" + String(vazaoDes); //Parâmetros com as leituras
  Serial.println(param);
  Serial.println("-------------------------------");
  client.println("GET /versao-4/php/registra-estados.php" + param);
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
  client.println("GET /versao-4/php/registra-historico-niveis.php" + param);
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
  client.println("GET /versao-4/php/registra-historico-niveis.php" + param);
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
  client.println("GET /versao-4/php/registra-historico-bomba.php" + param);
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
