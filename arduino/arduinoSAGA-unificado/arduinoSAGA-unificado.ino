#include <ESP8266WiFi.h>

//  NOME E SENHA DA REDE
const char* ssid = " ";  //ADAPTAR
const char* senha = " ";  //ADAPTAR

//  DADOS DO SITE QUE VAI RECEBER A REQUISIÇÃO GET
const char http_site[] = "http://esptest.local/versao-5/php/registra-estados.php";
const int http_port = 80;

//  IP DO SERVIDOR COM O BANCO DE DADOS
IPAddress ip(192,168,0,106);  //ADAPTAR

//  DEFINIÇÃO DA PORTA DO SERVIDOR E OBJETO CLIENTE
WiFiServer server(80);
WiFiClient client;

//  DEFINIÇÃO DOS PINOS
#define nvl100            13
#define nvl80             12
#define nvl60             11
#define nvl40             10
#define nvl20              9
#define pocoAlto           7
#define pocoBaixo          6
#define ledEntrada        16
#define ledSaida          17
#define valvulaEntrada    14
#define valvulaSaida      15
#define bomba              8
#define ligarBomba         4
#define desligarBomba     18
#define botaoReset         5
#define sensorFluxoEntrada 2
#define sensorFluxoSaida   3
#define interrupcaoEntrada 0 //interrupt = 0 equivale ao pino digital 2
#define interrupcaoSaida   1

const float calibracao = 4.5;

float fluxoNominalEntrada = 13.00;
float fluxoNominalSaida = 13.00;

int limiteVazio = 50;
int limiteCheio = 100;

unsigned long contadorSaida = 0;
unsigned long contadorEntrada = 0;

int nivel = 0;
int nivelPoco = 0;

boolean enchendo = false;
boolean falhas = false;
boolean vazamentos = false;
boolean historicoFalhas = false;
boolean historicoVazamentos = false;
boolean situacaoEntrada = false;
boolean requisicaoCliente = false;
boolean requisicaoSistema = false;

float fluxoEntrada = 0;
float fluxoSaida = 0;
float volumeEntrada = 0;
float volumeSaida = 0;
float volumeTotalEntrada = 0;
float volumeTotalSaida = 0;
unsigned long tempo_antes = 0;

void setup() {
  pinMode(nvl100, INPUT);
  pinMode(nvl80, INPUT);
  pinMode(nvl60, INPUT);
  pinMode(nvl40, INPUT);
  pinMode(nvl20, INPUT);
  pinMode(pocoAlto, INPUT);
  pinMode(pocoBaixo, INPUT);
  pinMode(ledEntrada, OUTPUT);
  pinMode(ledSaida, OUTPUT);
  pinMode(valvulaEntrada, INPUT);
  pinMode(valvulaSaida, INPUT);
  pinMode(ligarBomba, INPUT);
  pinMode(desligarBomba, INPUT);
  pinMode(bomba, OUTPUT);
  pinMode(sensorFluxoEntrada,  INPUT_PULLUP);
  pinMode(sensorFluxoSaida, INPUT_PULLUP);
  pinMode(botaoReset, INPUT);

  delay(10);
  Serial.begin(9600);
  Serial.println();
  Serial.print("Conectando à rede...");

  //  CONEXÃO COM WIFI
  WiFi.begin(ssid, senha);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Conectado à rede "); Serial.println(ssid);

  // INICIALIZAÇÃO DO SERVIDOR
  server.begin();
  Serial.println("Servidor inicializado!");

  Serial.print("URL de conexão: ");
  Serial.print("http://");
  Serial.print(WiFi.localIP());
  Serial.println("/");
}

void loop() {
  falhas = false;

  boolean situacaoSaida;

  int valValvulaEntrada = digitalRead(valvulaEntrada);
  int valValvulaSaida = digitalRead(valvulaSaida);
  int valBomba = digitalRead(bomba);
  int valLigarBomba = digitalRead(ligarBomba);
  int valDesligarBomba = digitalRead(desligarBomba);;
  int valBotaoReset = digitalRead(botaoReset);
  int val100 = digitalRead(nvl100);
  int val80 = digitalRead(nvl80);
  int val60 = digitalRead(nvl60);
  int val40 = digitalRead(nvl40);
  int val20 = digitalRead(nvl20);
  int valAlto = digitalRead(pocoAlto);
  int valBaixo = digitalRead(pocoBaixo);
  int sensoresNivel[7] = {valBaixo, valAlto, val20, val40, val60, val80, val100};


  // POÇO E CISTERNA
  for (int i = 7; i > 0; i--) {
    if (sensoresNivel[i-1] == 1) {

      if (i > 2){
        nivel = (i-2) * 20;
        i = 3; 
      } else {
        nivelPoco = (i == 2 ? 100 : 20);
      }
      
    }
    if (sensoresNivel[i-1] == 0) {
      if (i > 2){
        nivel = (i - 3) * 20;
      } else {
        nivelPoco = (i == 2) ? 20 : 0;
      }
    }  
  }

  if (nivelPoco == 100) {
    situacaoSaida = false;
    digitalWrite(ledSaida, LOW);
  } else if (nivelPoco != 20 && nivelPoco != 0){
    Serial.println("Irregularidade nos sensores detectada");
    falhas = true;
  }

  if (nivel == 100){
    situacaoEntrada = false;
    digitalWrite(ledEntrada, LOW);
  } else if (nivel != 80 && nivel != 60 && nivel != 40 && nivel != 20 && nivel != 0){
    falhas = true;
    Serial.println("Irregularidade nos sensores detectada");
  }

  //  PARTE DAS VALVULAS

  if (millis() > 4000)
  {
    if (fluxoEntrada <= fluxoNominalEntrada || fluxoSaida <= fluxoNominalSaida)
    {
      vazamentos = true;
    }
    else if (fluxoEntrada > fluxoNominalEntrada && fluxoSaida > fluxoNominalSaida)
    {
      vazamentos = false;
    }
  }
  
  if (falhas)
  {
    historicoFalhas = true;
  }
  if (vazamentos)
  {
    historicoVazamentos = true;
  }
  if (valBotaoReset == 1)
  {
    historicoFalhas = false;
    historicoVazamentos = false;
  }
  if (historicoFalhas || historicoVazamentos || falhas || vazamentos)
  {
    digitalWrite(bomba, LOW);
    digitalWrite(ledEntrada, LOW);
    digitalWrite(ledSaida, LOW);
    enchendo = false;
    situacaoEntrada = false;
    situacaoSaida = false;
    Serial.println("Falhas encontradas! A bomba permanecera desligada e as valvulas fechadas ate que o botao de reset seja acionado");
  }
  else// se historicoFalhas for false
  {

    if (valValvulaEntrada == 1 && nivel < 100 )
    {
      digitalWrite(ledEntrada, 1);
      situacaoEntrada = true;
    }
    else if (valValvulaEntrada == 0)
    {
      if (enchendo == false)
      {
        digitalWrite(ledEntrada, 0);
        situacaoEntrada = false;
      }
      else // se enchendo for true
      {
        digitalWrite(ledEntrada, 1);
        situacaoEntrada = true;
        Serial.println("Aviso!! A valvula nao pode ser fechada enquanto a bomba estiver ligada!");
      }
    }

    if (valValvulaSaida == 1 && nivelPoco < 100 )
    {
      digitalWrite(ledSaida, 1);
      situacaoSaida = true;
    }
    else if (valValvulaSaida == 0)
    {
      digitalWrite(ledSaida, 0);
      situacaoSaida = false;
    }
  }

  //                     BOMBA

  if (valDesligarBomba)
  {
    digitalWrite(bomba, LOW);
    enchendo = false;
    requisicaoSistema = false;
    requisicaoCliente = false;
    Serial.println("Desativada pelo cliente");
  }
  else // se valDesligarBomba for false
  {
    if (valLigarBomba)
    {
      requisicaoCliente = true;
    }
    else
    {
      requisicaoCliente = false;
    }
    if (nivel <= limiteVazio)
    {
      requisicaoSistema = true;
    }

    if (requisicaoCliente || requisicaoSistema)
    {
      if (nivel <= limiteVazio)
      {
        if (situacaoEntrada && nivelPoco > 0)
        {
          digitalWrite(bomba, HIGH);
          enchendo = true;
          Serial.println("Ligada! enchendo cisterna.");
        }
        else if (situacaoEntrada && nivelPoco == 0)
        {
          digitalWrite(bomba, LOW);
          enchendo = false;
          Serial.println("Desligada. Nao e possivel ligar a bomba pois nao ha agua no poco");
        }
        else if (!situacaoEntrada && nivelPoco > 0)
        {
          digitalWrite(bomba, LOW);
          enchendo = false;
          Serial.println("Desligada. Abra a valvula de entrada primeiro.");
        }
        else if (!situacaoEntrada && nivelPoco == 0)
        {
          digitalWrite(bomba, LOW);
          enchendo = false;
          Serial.println("Desligada. Valvula de entrada fechada e poco vazio");
        }
      }

      else if (nivel >= limiteCheio)
      {
        digitalWrite(bomba, LOW);
        enchendo = false;
        requisicaoSistema = false;
        requisicaoCliente = false;
        Serial.println("Nao e possivel ligar a bomba. A cisterna ja esta cheia");
      }
      else // se o nivel estiver entre os limites
      {

        if (enchendo)
        {
           if(nivelPoco == 0)
           {
             enchendo = false;
           }
           else// se o poco tiver adua
           {
           Serial.println("A bomba ja esta ligada!");
           }
        }
        else // se enchendo for false
        {
          if (situacaoEntrada && nivelPoco > 0)
          {
            digitalWrite(bomba, HIGH);
            enchendo = true;
            Serial.println("Ligada! enchendo cisterna por requisicao do cliente");
          }
          else if (situacaoEntrada && nivelPoco == 0)
          {
            digitalWrite(bomba, LOW);
            enchendo = false;
            Serial.println("Desligada. Nao e possivel ligar a bomba pois nao ha agua no poco");
          }
          else if (!situacaoEntrada && nivelPoco > 0)
          {
            digitalWrite(bomba, LOW);
            enchendo = false;
            Serial.println("Desligada. Abra a valvula de entrada primeiro.");
          }
          else if (!situacaoEntrada && nivelPoco == 0)
          {
            digitalWrite(bomba, LOW);
            enchendo = false;
            Serial.println("Desligada. Valvula de entrada fechada e poco vazio");
          }
        }
      }
    }
    else // se requisicaoCliente e requisicaoSistema for falso
    {
      digitalWrite(bomba, LOW);
      Serial.println("Desligada. O acionamento da bomba ainda nao foi requisitado");
      enchendo = false;
    }
  }
  


  // fluxos


  if ((millis() - tempo_antes) > 1000) {

    detachInterrupt(interrupcaoEntrada);
    detachInterrupt(interrupcaoSaida);

    fluxoEntrada  = ((1000.0 / (millis() - tempo_antes)) * contadorEntrada) / calibracao; // converte os pulsos para L/min
    fluxoSaida = ((1000.0 / (millis() - tempo_antes)) * contadorSaida) / calibracao;

    volumeEntrada = fluxoEntrada / 60;
    volumeTotalEntrada += volumeEntrada;
    volumeSaida = fluxoSaida / 60;
    volumeTotalSaida += volumeSaida;

    Serial.print("Fluxo de entrada: ");
    Serial.print(fluxoEntrada);
    Serial.print(" L/min   ");

    Serial.print("Volume: ");
    Serial.print(volumeTotalEntrada);
    Serial.println(" L");

    Serial.print("Fluxo de saida:   ");
    Serial.print(fluxoSaida);
    Serial.print(" L/min   ");

    Serial.print("Volume: ");
    Serial.print(volumeTotalSaida);
    Serial.println(" L");
    Serial.println(" ");

    contadorEntrada = 0;
    contadorSaida = 0;

    tempo_antes = millis();

    attachInterrupt(interrupcaoEntrada, contadorPulsoEntrada, FALLING);
    attachInterrupt(interrupcaoSaida, contadorPulsoSaida, FALLING);
  }
    
  
  client = server.available();
  if (!client) {
    Serial.println("NodeMCU - Gravando dados no BD via GET");    
    
    Serial.println("Gravando dados no BD: ");
    Serial.println("Vazão de subida: " + String(fluxoEntrada) + " l/min");
    Serial.println("Vazão de descida " + String(fluxoSaida) + " l/min");
    Serial.println("Eletroválvula de subida: " + String(valValvulaEntrada));
    Serial.println("Eletroválvula de descida: " + String(valValvulaSaida));
    Serial.println("Bomba: " + String(valBomba));
    Serial.println("Porcentagem da cisterna (maior sensor): " + String(nivel));
    Serial.println("Porcentagem do poço (maior sensor): " + String(nivelPoco));
    
    // Envio dos dados do sensor para o servidor via GET
    if ( !registraEstados((float)fluxoEntrada, (float)fluxoSaida, (int)valValvulaEntrada, (int)valValvulaSaida, (int)valBomba, (int)nivel, (int)nivelPoco)) {
      Serial.println("Falha na requisição GET");
    }
    
    if ( !registraCisterna((int)nivel) ) {
      Serial.println("Falha na requisição GET");
    }

    if ( !registraPoco((int)nivelPoco) ) { 
      Serial.println("Falha na requisição GET");
    }

    return;
  }

  Serial.println("Novo cliente");

  while (!client.available()) {
    delay(1);
  }
  
  String request = client.readStringUntil('\r');
  client.flush();

  if (request.indexOf("/LED1=ON") != -1) {
    digitalWrite(valvulaEntrada, HIGH);
  }

  if (request.indexOf("/LED1=OFF") != -1) {
    digitalWrite(valvulaEntrada, LOW);
  }

  if (request.indexOf("/LED2=ON") != -1) {
    digitalWrite(valvulaSaida, HIGH);
  }

  if (request.indexOf("/LED2=OFF") != -1) {
    digitalWrite(valvulaSaida, LOW);
  }

  if (request.indexOf("/BOMBA=ON") != -1) {
    digitalWrite(bomba, HIGH);
    if ( !registraBomba((int) digitalRead(bomba)) ) {
        Serial.println("Falha na requisição GET");
    }

  }
  if (request.indexOf("/BOMBA=OFF") != -1) {
    digitalWrite(bomba, LOW);
    if ( !registraBomba((int) digitalRead(bomba)) ) {
        Serial.println("Falha na requisição GET");
    }

  }



  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("");

  Serial.println("Client disconnected");
  Serial.println("");
  
  
}

// Executa o HTTP GET request no site remoto
bool registraEstados(float fluxoEntrada, float fluxoSaida, int valValvulaEntrada, int valValvulaSaida, int valBomba, int nivel, int nivelPoco) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?vazao=" + String(fluxoEntrada) + "&eletroBomba=" + String(valValvulaEntrada) + "&eletroDreno=" + String(valValvulaSaida) + "&bomba=" + String(valBomba) + "&sensCisterna=" + String(nivel) + "&sensPoco=" + String(nivelPoco) + "&vazao2=" + String(fluxoSaida); //Parâmetros com as leituras
  Serial.println(param);
  Serial.println("-------------------------------");
  client.println("GET /versao-5/php/registra-estados.php" + param);
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

bool registraCisterna(int nivel) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?nivelCisterna=" + String(nivel); //Parâmetro com as leituras
  client.println("GET /versao-5/php/registra-historico-niveis.php" + param);
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

bool registraPoco(int nivelPoco) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?nivelPoco=" + String(nivelPoco); //Parâmetro com as leituras
  client.println("GET /versao-5/php/registra-historico-niveis.php" + param);
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

bool registraBomba(int valBomba) {
  if ( !client.connect(ip, http_port) ) {
    Serial.println("Falha na conexao com o site ");
    return false;
  }
  String param = "?bomba=" + String(valBomba); //Parâmetro com as leituras
  client.println("GET /versao-5/php/registra-historico-bomba.php" + param);
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


void contadorPulsoEntrada()
{
  contadorEntrada++;
}
void contadorPulsoSaida()
{
  contadorSaida++;
}
