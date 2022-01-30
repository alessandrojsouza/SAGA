function lerSensorFluxoSubida(porcentagemCisternabd, porcentagemPocobd) {
    $(".textoSensBomba").text("0 l/min"); //Escreve valor padrão da vazão

    estadoBomba = $("#bomba").attr("value");
    estadoValvulaSubida = $("#eletrovalvula_bomba").attr("value");

    if (estadoBomba == "1" && estadoValvulaSubida == "1" && nivelCisterna <= 50 && porcentagemCisterna <= 100) {
        $.get("php/recebevazao.php?vazaoSubida=1", function(vazao) { //Chama a função quando a requisição for carregada
        
            $(".textoSensBomba").text(vazao + " l/min"); //Escreve valor da vazão (recebido por php pela requisição)
            litros = parseFloat(vazao) * 1.0/60.0;    //Calcula a variação de litro em 0,5 segundos
            atualizarVolumes(litros, porcentagemCisternabd, porcentagemPocobd);   //Atualiza os volumes, porcentagens e animação da água
        });
    }

}

//LEITURA DO SENSOR DE FLUXO DE DESCIDA

function lerSensorFluxoDreno(porcentagemCisternabd, porcentagemPocobd) {
    $(".textoSensDreno").text("0 l/min"); //Escreve valor padrão da vazão

    estadoValvulaDescida = $("#eletrovalvula_dreno").attr("value");

    if (estadoValvulaDescida == "1" && nivelPoço <= 50 && porcentagemPoço <= 100) {
        $.get("php/recebevazao.php?vazaoDescida=1", function(vazao) { //Chama a função quando a requisição for carregada

            $(".textoSensDreno").text(vazao + " l/min"); //Escreve valor da vazão (recebido por php pela requisição)
            litros = -parseFloat(vazao) * 1.0/60.0;    //Calcula a variação de litro em 0,5 segundos
            atualizarVolumes(litros, porcentagemCisternabd, porcentagemPocobd);   //Atualiza os volumes, porcentagens e animação da água
        });
    }
}

//ATUALIZAÇÃO DOS SENSORES DE NÍVEL (com base na porcentagem do recipiente, muda a cor)

function atualizarSensoresNível() {
    sensor = "";

    if (porcentagemPoço >= 20) {   
        sensor = $("#sensor1");
        sensor.attr("fill", "#00FF21");
        $.get("http://192.168.0.110/SENS1=ON"); //ADAPTAR
    } else if (porcentagemPoço < 20) {
        sensor = $("#sensor1");
        sensor.attr("fill", "black");
        $.get("http://192.168.0.110/SENS1=OFF"); //ADAPTAR
    }
    if (porcentagemPoço >= 100) {
        sensor = $("#sensor2");
        sensor.attr("fill", "#00FF21");
        $.get("http://192.168.0.110/SENS2=ON"); //ADAPTAR
  
        
    } else if (porcentagemPoço < 100 && porcentagemPoço > 20) {
        sensor = $("#sensor2");
        sensor.attr("fill", "black");
        $.get("http://192.168.0.110/SENS2=OFF");  //ADAPTAR
    }
    if (porcentagemCisterna >= 20) {
        sensor = $("#sensor3");
        sensor.attr("fill", "#00FF21");
        $.get("http://192.168.0.110/SENS3=ON");   //ADAPTAR
    } else if (porcentagemCisterna < 20){
        sensor = $("#sensor3");
        sensor.attr("fill", "black");
        $.get("http://192.168.0.110/SENS3=OFF");  //ADAPTAR
    }
    if (porcentagemCisterna >= 40) {
        sensor = $("#sensor4");
        sensor.attr("fill", "#00FF21");
        $.get("http://192.168.0.110/SENS4=ON");  //ADAPTAR

    } else if (porcentagemCisterna < 40 && porcentagemCisterna > 20) {
        sensor = $("#sensor4");
        sensor.attr("fill", "black");
        $.get("http://192.168.0.110/SENS4=OFF");  //ADAPTAR

    }
    if (porcentagemCisterna >= 60) {
        sensor = $("#sensor5");
        sensor.attr("fill", "#00FF21");
        $.get("http://192.168.0.110/SENS5=ON");  //ADAPTAR
    } else if (porcentagemCisterna < 60 && porcentagemCisterna > 40) {
        sensor = $("#sensor5");
        sensor.attr("fill", "black");
        $.get("http://192.168.0.110/SENS5=OFF");  //ADAPTAR
    }
    if (porcentagemCisterna >= 80) {
        sensor = $("#sensor6");
        sensor.attr("fill", "#00FF21");
        $.get("http://192.168.0.110/SENS6=ON");  //ADAPTAR
    } else if (porcentagemCisterna < 80 && porcentagemCisterna > 60) {
        sensor = $("#sensor6");
        sensor.attr("fill", "black");
        $.get("http://192.168.0.110/SENS6=OFF");  //ADAPTAR

    }
    if (porcentagemCisterna >= 100) {
        sensor = $("#sensor7");
        sensor.attr("fill", "#00FF21");
        $.get("http://192.168.0.110/SENS7=ON");  //ADAPTAR
    } else if (porcentagemCisterna < 100 && porcentagemCisterna > 80) {
        sensor = $("#sensor7");
        sensor.attr("fill", "black");
        $.get("http://192.168.0.110/SENS7=OFF");  //ADAPTAR
    }

    return true;
}

function recebeEstados(bomba, valvSubida, valvDescida) {

    setTimeout(function() {
        //Instancia objeto de requisição http
        $.get("php/recebevalores.php", function(estados) {     //Ao carregar a requisição...

            //Recupera valor dos estados das eletroválvulas e bomba armazenados no banco, e coloca em uma lista
            texto = JSON.parse(estados);
            var resposta = texto.toString().split(",");

            lerSensorFluxoDreno(resposta[3], resposta[4]);
            lerSensorFluxoSubida(resposta[3], resposta[4]);

            //Atribui os estados atualizados (do banco) aos elementos
            valvSubida.attr("value", resposta[0]);
            valvDescida.attr("value", resposta[1]);
            bomba.attr("value", resposta[2]);

            //Atualiza as cores de acordo com o estado atual de cada elemento
            if (bomba.attr("value") == "1") {
                bomba.attr("fill", "#00FF21");
                $("#botaoBomba").removeClass('btn-danger').addClass('btn-success');
                $("#botaoBomba").text("Ligada");
                $("#aguaBomba").attr("stroke","#5B9BA2");
            }
            else {
                bomba.attr("fill", "red");
                $("#botaoBomba").removeClass('btn-success').addClass('btn-danger');
                $("#botaoBomba").text("Desligada");
                $("#aguaBomba").attr("stroke","#7f3f00");
            }
                

            if (valvSubida.attr("value") == "1") {
                $("#luz1").attr("fill", "#00FF21");
                $("#botaoValSub").removeClass('btn-danger').addClass('btn-success');
                $("#botaoValSub").text("Aberta");
            }    
            else {
                $("#luz1").attr("fill", "red");
                $("#botaoValSub").removeClass('btn-success').addClass('btn-danger');
                $("#botaoValSub").text("Fechada");
            }
                

            if (valvDescida.attr("value") == "1") {
                $("#luz2").attr("fill", "#00FF21");
                $("#botaoValDes").removeClass('btn-danger').addClass('btn-success');
                $("#botaoValDes").text("Aberta");
                $("#aguaDreno").attr("stroke","#5B9BA2");
            }     
            else {
                $("#luz2").attr("fill", "red");
                $("#botaoValDes").removeClass('btn-success').addClass('btn-danger');
                $("#botaoValDes").text("Fechada");
                $("#aguaDreno").attr("stroke","#7f3f00");
            }
        });
       
        recebeEstados(bomba, valvSubida, valvDescida);
     }, 1000);
    

}



//DEFINE OS ESTADOS INICIAIS DOS ELEMENTOS

function realTime() {
    
    //Elementos html svg da bomba e eletroválvulas de subida e descida, respectivamente
    bomba = $("#bomba");
    valvSubida = $("#eletrovalvula_bomba");
    valvDescida = $("#eletrovalvula_dreno");
    
    setSensores();  //Define posição dos sensores
    

    recebeEstados(bomba, valvSubida, valvDescida);
}