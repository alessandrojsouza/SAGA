//VALORES DOS RECIPIENTES

capacidadeCisterna = 0;
nivelCisterna = 0;
porcentagemCisterna = 0;

capacidadePoço = 0;
nivelPoço = 50;
porcentagemPoço = 100;


//CONTROLE DA ELETROVÁLVULA DE SUBIDA

function controleEletrovalvulaBomba() {
    valorAtual = document.getElementById('eletrovalvula_bomba').getAttribute("value"); //Estado atual da eletroválvula
    valorBomba = document.getElementById('bomba').getAttribute("value"); //Estado atual da bomba

    const xhttp = new XMLHttpRequest(); //Instancia objeto derequisição http

    //Se eletroválvula estiver desligada, a chamada da função irá enviar requisição pra placa para ligar, mudar a cor da luz e atualizar estado
    if (valorAtual == "0") {
        xhttp.open("GET", "http://192.168.0.109/LED1=ON");
        xhttp.send();
        document.getElementById('luz1').style.fill = "#00FF21";
        document.getElementById('eletrovalvula_bomba').setAttribute("value", "1");
    
    } else {   //Se eletroválvula estiver ligada, a chamada da função irá enviar requisição pra placa para desligar, mudar a cor da luz e atualizar estado
        if (valorBomba == "0") {
            xhttp.open("GET", "http://192.168.0.109/LED1=OFF");
            xhttp.send();
            document.getElementById('luz1').style.fill = "red";
            document.getElementById('eletrovalvula_bomba').setAttribute("value", "0");

        } else {    //Aviso para evitar forçar a bomba
            window.alert("Desligue a bomba antes de fechar a válvula")
        } 
    }
}

//CONTROLE DA ELETROVÁLVULA DE DESCIDA

function controleEletrovalvulaDreno() {
    valorAtual = document.getElementById('eletrovalvula_dreno').getAttribute("value");  //Valor atual da eletroválvula            
    const xhttp = new XMLHttpRequest(); //Instancia objeto de requisição http

    if (valorAtual == "0") {    ////Se eletroválvula estiver desligada, a chamada da função irá enviar requisição pra placa para ligar, mudar a cor da luz e atualizar estado
        xhttp.open("GET", "http://192.168.0.109/LED2=ON");
        xhttp.send();
        document.getElementById('luz2').style.fill = "#00FF21";
        document.getElementById('eletrovalvula_dreno').setAttribute("value", "1");
        
    } else {    //Se eletroválvula estiver ligada, a chamada da função irá enviar requisição pra placa para desligar, mudar a cor da luz e atualizar estado
        xhttp.open("GET", "http://192.168.0.109/LED2=OFF");
        xhttp.send();
        document.getElementById('luz2').style.fill = "red";
        document.getElementById('eletrovalvula_dreno').setAttribute("value", "0");
    }
}


//LEITURA DO SENSOR DE FLUXO DE SUBIDA

function lerSensorFluxoBomba() {
    setInterval(    //Função de loop (a cada 0,5 segundos)
        function() { 
            valorBomba = document.getElementById('bomba').getAttribute("value");    //Estado atual da bomba
            valorValvulaBomba = document.getElementById('eletrovalvula_bomba').getAttribute("value");   //Estado atual da eletroválvula de subida

            if (valorBomba == "1" && valorValvulaBomba == "1") {    //Se a bomba e eletroválvula estiverem ligadas...

                const xhttp = new XMLHttpRequest(); //Instancia objeto de requisição http
                xhttp.onload = function() { //Chama a função quando a requisição for carregada

                    document.getElementById("textoSensBomba").innerHTML = this.responseText + " l/min"; //Escreve valor da vazão (recebido por php pela requisição)
                    litros = parseFloat(this.responseText) * 0.5 / 60.0;    //Calcula a variação de litro a em 0,5 segundos
                    atualizarVolumes(litros);   //Atualiza os volumes, porcentagens e animação da água
                    
                }
                //Envia requisição ao php (pede atualização da vazão)
                xhttp.open("GET", "http://esptest.local/recebevazao.php");
                xhttp.send();
            }
        }, 500);    //Tempo do loop em milissegundos
}

//ATUALIZAÇÃO DE VOLUMES DOS RECIPIENTES
function atualizarVolumes(litros) { //(argumento litros recebido da função de leitura do sensor de fluxo)

    if (nivelCisterna <= 50.0 && porcentagemCisterna <= 100) {  //Se a cisterna não estiver cheia...

        nivelCisterna += litros; //Incrementa o volume da cisterna
        porcentagemCisterna = Math.round(nivelCisterna / 50 * 100); //Calcula a porcentagem com relação à capacidade da cisterna

        nivelPoço -= litros;    //Diminui o volume do poço
        porcentagemPoço = Math.round(nivelPoço / 50 * 100); //Calcula a porcentagem com relação à capacidade do poço

        //Escreve/insere nivel e porcentagem da cisterna no html
        document.getElementById("porcentCisterna").innerHTML = String(porcentagemCisterna) + " %";
        document.getElementById("nivelCisterna").innerHTML = String(nivelCisterna.toFixed(2)) + " litros";

        //Anima água dos recipientes
        document.getElementById("agua").setAttribute("height", String((100 - porcentagemCisterna) / 100 * 240.54123)); //Água da cisterna
        document.getElementById("agua2").setAttribute("height", String((100 - porcentagemPoço) / 100 * 249.19729)); //Água do poço
        
        //Atualiza sensores de nível
        atualizarSensoresNível();

    } else {    //Se a cisterna estiver cheia

        //Fecha eletroválvula de subida e desliga a bomba
        paradaTotalSubida();
    }

}

//FECHAMENTO DA ELETROVÁLVULA DE SUBIDA E DESLIGAMENTO DA BOMBA
function paradaTotalSubida() {

    //Muda a cor da bomba e eletroválvula para vermelho
    document.getElementById("bomba").style.fill = "red";
    document.getElementById('luz1').style.fill = "red";

    //Envia requisição para a placa fechar a bomba e desligar eletroválvula
    xhttp.open("GET", "http://192.168.0.109/BOMBA=OFF");    
    xhttp.send();
    xhttp.open("GET", "http://192.168.0.109/LED1=OFF");
    xhttp.send();

    //Altera estados da bomba e eletroválvula
    document.getElementById('bomba').setAttribute("value", "0");
    document.getElementById('eletrovalvula_bomba').setAttribute("value", "0");
}


//LEITURA DO SENSOR DE FLUXO DE DESCIDA

function lerSensorFluxoDreno() {
    setInterval(    //Loop de 0,5 segundos
        function() { 

            valorValvulaDreno = document.getElementById('eletrovalvula_dreno').getAttribute("value");   //Valor atual da eletroválvula de descida
            if (valorValvulaDreno == "1") { //Se eletroválvula estiver ligada...

                //Escreve/insere vazao de 10 l/min no html (PRECISA IMPLEMENTAR VARIAÇÃO E ANIMAÇÃO)
                const xhttp = new XMLHttpRequest();
                xhttp.onload = function() { document.getElementById("textoSensDreno").innerHTML = "10 l/min"; }
            }
        }, 500);    //Tempo do loop em milissegundos
}


//ATUALIZAÇÃO DOS SENSORES DE NÍVEL (com base na porcentagem do recipiente, muda a cor)

function atualizarSensoresNível() {
    sensor = "";
    if (porcentagemPoço >= 20) {   
        sensor = document.getElementById('sensor1');
        sensor.setAttribute("fill", "#00FF21");   
    } else {
        sensor = document.getElementById('sensor1');
        sensor.setAttribute("fill", "black");
    }
    if (porcentagemPoço >= 100) {
        sensor = document.getElementById('sensor2');
        sensor.setAttribute("fill", "#00FF21");      
        
    } else {
        sensor = document.getElementById('sensor2');
        sensor.setAttribute("fill", "black");       
    }
    if (porcentagemCisterna >= 20) {
        sensor = document.getElementById('sensor3');
        sensor.setAttribute("fill", "#00FF21");      
    } else {
        sensor = document.getElementById('sensor3');
        sensor.setAttribute("fill", "black");    
    }
    if (porcentagemCisterna >= 40) {
        sensor = document.getElementById('sensor4');
        sensor.setAttribute("fill", "#00FF21");    
    } else {
        sensor = document.getElementById('sensor4');
        sensor.setAttribute("fill", "black"); 
    }
    if (porcentagemCisterna >= 60) {
        sensor = document.getElementById('sensor5');
        sensor.setAttribute("fill", "#00FF21"); 
    } else {
        sensor = document.getElementById('sensor5');
        sensor.setAttribute("fill", "black");
    }
    if (porcentagemCisterna >= 80) {
        sensor = document.getElementById('sensor6');
        sensor.setAttribute("fill", "#00FF21");
    } else {
        sensor = document.getElementById('sensor6');
        sensor.setAttribute("fill", "black");
    }
    if (porcentagemCisterna >= 100) {
        sensor = document.getElementById('sensor7');
        sensor.setAttribute("fill", "#00FF21");
    } else {
        sensor = document.getElementById('sensor7');
        sensor.setAttribute("fill", "black");        
    }
}


//CONTROLE DA BOMBA

function controlarBomba() {
    valor = document.getElementById("bomba").getAttribute("value");     //Estado atual da bomba
    valorValvulaBomba = document.getElementById("eletrovalvula_bomba").getAttribute("value");     //Estado atual da eletroválvula de subida

    const xhttp = new XMLHttpRequest();     //Instancia objeto de requisição http

    if (valor == "0") {     //Se a bomba estiver desligada...
        if (valorValvulaBomba == "1"){      //E a eletroválvula de subida estiver aberta...

            document.getElementById("bomba").style.fill = "#00FF21";        //Muda cor da bomba

            //Envia requisição para a placa ligar a bomba
            xhttp.open("GET", "http://192.168.0.109/BOMBA=ON");
            xhttp.send();

            document.getElementById('bomba').setAttribute("value", "1");        //Atualiza o estado da bomba
        } else {
            window.alert("Abra a válvula antes de ligar a bomba");      //Aviso para evitar forçar a bomba
        }
            
    }

    if (valor == "1") {     //Se a bomba estiver ligada...

        //Muda a cor, envia requisição para a placa e atualiza o estado atual da bomba
        document.getElementById("bomba").style.fill = "red";
        xhttp.open("GET", "http://192.168.0.109/BOMBA=OFF");
        xhttp.send();
        document.getElementById('bomba').setAttribute("value", "0");
    }
}


//DEFINE POSIÇÃO DOS SENSORES DE NÍVEL (de acordo com a altura e posição y do recipiente)

function setSensores() {
    cisterna = document.getElementById("cisterna");     //Elemento html svg da cisterna
    poço = document.getElementById("poço");     //Elemento html svg do poço

    for (var i = 1; i <= 7; i++) {         //Repetição para cada sensor (começando de baixo para cima)

        sensor = document.getElementById("sensor" + String(i));     //Elemento html svg do sensor especifico
        rect = document.getElementById("rect" + String(i));         //Elemento html svg do retangulo do sensor
        ypoço = parseFloat(poço.getAttribute("y"));                 //Posição y do svg do poço
        ycisterna = parseFloat(cisterna.getAttribute("y"));         //Posição y do svg da cisterna
        alturaPoço = parseFloat(poço.getAttribute("height"));       //Altura do poço
        alturaCisterna = parseFloat(cisterna.getAttribute("height"));      //Altura do poço
        yRect = parseFloat(rect.getAttribute("y"));                 //Posição y do retangulo do sensor

        switch (i) {            //Decisões de altura especifica para cada sensor
            case 1: {
                sensor.setAttribute("transform", "translate(0 " + String(ypoço + (alturaPoço*0.8) - yRect) + ")");
                break;
            }
            case 2: {
                sensor.setAttribute("transform", "translate(0 " + String(ypoço - yRect) + ")");
                break;
            }
            case 3: {
                sensor.setAttribute("transform", "translate(0 " + String(ycisterna + (alturaCisterna*0.8) - yRect) + ")");
                break;
            }
            case 4: {
                sensor.setAttribute("transform", "translate(0 " + String(ycisterna + (alturaCisterna*0.6) - yRect) + ")");
                break;
            }
            case 5: {
                sensor.setAttribute("transform", "translate(0 " + String(ycisterna + (alturaCisterna*0.4) - yRect) + ")");
                break;
            }
            case 6: {
                sensor.setAttribute("transform", "translate(0 " + String(ycisterna + (alturaCisterna*0.2) - yRect) + ")");
                break;
            }
            case 7: {
                sensor.setAttribute("transform", "translate(0 " + String(ycisterna - yRect) + ")");
                break;
            }
            default:
                break;         
        }
    }
}



//DEFINE OS ESTADOS INICIAIS DOS ELEMENTOS

function realTime() {
    lerSensorFluxoBomba();
    lerSensorFluxoDreno();
    
    //Elementos html svg da bomba e eletroválvulas de subida e descida, respectivamente
    bomba = document.getElementById('bomba');
    eletroBomba = document.getElementById('eletrovalvula_bomba');
    eletroDreno = document.getElementById('eletrovalvula_dreno');
    
    setSensores();  //Define posição dos sensores
    
    

    //Instancia objeto de requisição http
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {     //Ao carregar a requisição...

        //Recupera valor dos estados das eletroválvulas e bomba armazenados no banco, e coloca em uma lista
        texto = JSON.parse(this.responseText);
        var resposta = texto.toString().split(",");

        //Atribui os estados atualizados (do banco) aos elementos
        eletroBomba.setAttribute("value", resposta[0]);
        eletroDreno.setAttribute("value", resposta[1]);
        bomba.setAttribute("value", resposta[2]);

        //Atualiza as cores de acordo com o estado atual de cada elemento
        if (bomba.getAttribute("value") == "1")
            bomba.style.fill = "#00FF21";
        else 
            bomba.style.fill = "red";

        if (eletroBomba.getAttribute("value") == "1")
            document.getElementById('luz1').style.fill = "#00FF21";
        else 
            document.getElementById('luz1').style.fill = "red";

        if (eletroDreno.getAttribute("value") == "1")
            document.getElementById('luz2').style.fill = "#00FF21";
        else 
            document.getElementById('luz2').style.fill = "red";
    }

    //Envia a requisição para receber os estados das eletroválvulas e bomba armazenados no mysql
    xhttp.open("GET", "http://esptest.local/recebevalores.php");
    xhttp.send();
}