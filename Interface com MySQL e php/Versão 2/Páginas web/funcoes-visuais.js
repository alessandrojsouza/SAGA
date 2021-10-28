$(document).ready(function(){
    $.ajaxSetup({ cache: false });

    realTime();

    $("#eletrovalvula_bomba").click(function () { controleEletrovalvulaSubida() });
    $("#eletrovalvula_dreno").click(function () { controleEletrovalvulaDescida() });
    $("#bomba").click(function () { controlarBomba() });

});

//VALORES DOS RECIPIENTES
capacidadeCisterna = 0;
nivelCisterna = 0;
porcentagemCisterna = 0;

capacidadePoço = 0;
nivelPoço = 50;
porcentagemPoço = 100;

function controleEletrovalvulaSubida() {
    valorAtual = $("#eletrovalvula_bomba").attr("value");
    valorBomba = $("#bomba").attr("value");

    if (valorAtual == "0") {  //Se eletroválvula estiver desligada, a chamada da função irá enviar requisição pra placa para ligar, mudar a cor da luz e atualizar estado
        $("#luz1").attr("fill", "#00FF21")
        $("#eletrovalvula_bomba").attr("value", "1");

        $.get("http://192.168.0.109/LED1=ON");
    
    } else {   //Se eletroválvula estiver ligada, a chamada da função irá enviar requisição pra placa para desligar, mudar a cor da luz e atualizar estado
        if (valorBomba == "0") {
            $("#luz1").attr("fill", "red")
            $("#eletrovalvula_bomba").attr("value", "0");

            $.get("http://192.168.0.109/LED1=OFF");

        } else {    //Aviso para evitar forçar a bomba
            window.alert("Desligue a bomba antes de fechar a válvula")
        } 
    }
}

function controleEletrovalvulaDescida() {
    valorAtual = $("#eletrovalvula_dreno").attr("value");  //Valor atual da eletroválvula            

    if (valorAtual == "0") {    ////Se eletroválvula estiver desligada, a chamada da função irá enviar requisição pra placa para ligar, mudar a cor da luz e atualizar estado
        $("#luz2").attr("fill", "#00FF21")
        $("#eletrovalvula_dreno").attr("value", "1");

        $.get("http://192.168.0.109/LED2=ON");
        
    } else {    //Se eletroválvula estiver ligada, a chamada da função irá enviar requisição pra placa para desligar, mudar a cor da luz e atualizar estado
        $("#luz2").attr("fill", "red")
        $("#eletrovalvula_dreno").attr("value", "0");

        $.get("http://192.168.0.109/LED2=OFF");
    }
}

function controlarBomba() {
    valorAtual = $("#bomba").attr("value"); //Estado atual da bomba
    valorValvulaSubida = $("#eletrovalvula_bomba").attr("value");     //Estado atual da eletroválvula de subida

    if (valorAtual == "0") {     //Se a bomba estiver desligada...
        if (valorValvulaSubida == "1"){      // e a eletroválvula de subida estiver aberta...

            $("#bomba").attr("fill", "#00FF21");  //Muda cor da bomba

            //Envia requisição para a placa ligar a bomba
            $.get("http://192.168.0.109/BOMBA=ON");


            $("#bomba").attr("value", "1");   //Atualiza o estado da bomba

        } else {
            window.alert("Abra a válvula antes de ligar a bomba");      //Aviso para evitar forçar a bomba
        }
            
    }

    if (valorAtual == "1") {     //Se a bomba estiver ligada...

        //Muda a cor, envia requisição para a placa e atualiza o estado atual da bomba
        $("#bomba").attr("fill", "red");
        $("#bomba").attr("value", "0");

        $.get("http://192.168.0.109/BOMBA=OFF");
    }
}

//FECHAMENTO DA ELETROVÁLVULA DE SUBIDA E DESLIGAMENTO DA BOMBA
function paradaTotalSubida() {

    //Muda a cor da bomba e eletroválvula para vermelho
    $("#bomba").attr("fill", "red");
    $("#luz1").attr("fill", "red");

    //Envia requisição para a placa fechar a bomba e desligar eletroválvula
    $.get("http://192.168.0.109/BOMBA=OFF");    
    $.get("http://192.168.0.109/LED1=OFF");

    //Altera estados da bomba e eletroválvula
    $("#bomba").attr("value", "0");
    $("#eletrovalvula_bomba").attr("value", "0");
}

//DEFINE POSIÇÃO DOS SENSORES DE NÍVEL (de acordo com a altura e posição y do recipiente)

function setSensores() {
    cisterna = $("#cisterna");     //Elemento html svg da cisterna
    poço = $("#poço");     //Elemento html svg do poço

    for (var i = 1; i <= 7; i++) {         //Repetição para cada sensor (começando de baixo para cima)

        sensor = $("#sensor" + String(i));     //Elemento html svg do sensor especifico
        rect = $("#rect" + String(i));         //Elemento html svg do retangulo do sensor
        ypoço = parseFloat(poço.attr("y"));                 //Posição y do svg do poço
        ycisterna = parseFloat(cisterna.attr("y"));         //Posição y do svg da cisterna
        alturaPoço = parseFloat(poço.attr("height"));       //Altura do poço
        alturaCisterna = parseFloat(cisterna.attr("height"));      //Altura do poço
        yRect = parseFloat(rect.attr("y"));                 //Posição y do retangulo do sensor

        switch (i) {            //Decisões de altura especifica para cada sensor
            case 1: {
                sensor.attr("transform", "translate(0 " + String(ypoço + (alturaPoço*0.8) - yRect) + ")");
                break;
            }
            case 2: {
                sensor.attr("transform", "translate(0 " + String(ypoço - yRect) + ")");
                break;
            }
            case 3: {
                sensor.attr("transform", "translate(0 " + String(ycisterna + (alturaCisterna*0.8) - yRect) + ")");
                break;
            }
            case 4: {
                sensor.attr("transform", "translate(0 " + String(ycisterna + (alturaCisterna*0.6) - yRect) + ")");
                break;
            }
            case 5: {
                sensor.attr("transform", "translate(0 " + String(ycisterna + (alturaCisterna*0.4) - yRect) + ")");
                break;
            }
            case 6: {
                sensor.attr("transform", "translate(0 " + String(ycisterna + (alturaCisterna*0.2) - yRect) + ")");
                break;
            }
            case 7: {
                sensor.attr("transform", "translate(0 " + String(ycisterna - yRect) + ")");
                break;
            }
            default:
                break;         
        }
    }
}

//ATUALIZAÇÃO DE VOLUMES DOS RECIPIENTES
function atualizarVolumes(litros) { //(argumento litros recebido da função de leitura do sensor de fluxo)

    nivelCisterna += litros; //Incrementa o volume da cisterna
    porcentagemCisterna = Math.round(nivelCisterna / 50 * 100); //Calcula a porcentagem com relação à capacidade da cisterna

    nivelPoço -= litros;    //Diminui o volume do poço
    porcentagemPoço = Math.round(nivelPoço / 50 * 100); //Calcula a porcentagem com relação à capacidade do poço

    //Escreve/insere nivel e porcentagem da cisterna no html
    $("#porcentCisterna").text(String(porcentagemCisterna) + " %");
    $("#nivelCisterna").text(String(nivelCisterna.toFixed(2)) + " litros");

    //Anima água dos recipientes
    $("#agua").attr("height", String((100 - porcentagemCisterna) / 100 * 240.54123)); //Água da cisterna
    $("#agua2").attr("height", String((100 - porcentagemPoço) / 100 * 249.19729)); //Água do poço
    
    //Atualiza sensores de nível
    atualizarSensoresNível();

    if (nivelCisterna >= 50.0 && porcentagemCisterna >= 100) {    //Se a cisterna estiver cheia

        //Fecha eletroválvula de subida e desliga a bomba
        paradaTotalSubida();
    }

}