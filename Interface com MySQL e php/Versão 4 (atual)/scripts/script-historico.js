function realTime() {

    //Elementos html svg da bomba e eletroválvulas de subida e descida, respectivamente
    bomba = "";
    valvSubida = "";
    valvDescida = "";

    //Instancia objeto de requisição http
    $.get("php/recebevalores.php", function(estados) {     //Ao carregar a requisição...

        //Recupera valor dos estados das eletroválvulas e bomba armazenados no banco, e coloca em uma lista
        texto = JSON.parse(estados);
        var resposta = texto.toString().split(",");

        //Atribui os estados atualizados (do banco) aos elementos
        valvSubida = resposta[0];
        valvDescida = resposta[1];
        bomba = resposta[2];
        vazaoSub = resposta[5];
        vazaoDes = resposta[6];

        porcentagemCisterna = parseInt(resposta[3]);
        porcentagemPoço = parseInt(resposta[4]);    
        nivelCisterna = porcentagemCisterna/100 * 50;
        nivelPoço = porcentagemPoço/100 * 50;  

        $("#estadoCisterna").text(porcentagemCisterna + "%");
        $("#estadoPoco").text(porcentagemPoço + "%");


        //Atualiza as cores de acordo com o estado atual de cada elemento
        if (bomba == "1") {
            $("#estadoBomba").text("Ligada");
            $("#estadoSensSub").text(vazaoSub);
        }
        else {
            $("#estadoBomba").text("Desligada");
            $("#estadoSensSub").text("sem fluxo");
        }
            

        if (valvSubida == "1") {
            $("#estadoValSub").text("Aberta");
        }    
        else {
            $("#estadoValSub").text("Fechada");
        }
            

        if (valvDescida == "1") {
            $("#estadoValDes").text("Aberta");
            $("#estadoSensDes").text(vazaoDes);
        }     
        else {
            $("#estadoValDes").text("Fechada");
            $("#estadoSensDes").text("sem fluxo");
        }
    });
}

$(document).ready(function () {
    setInterval(function () { realTime() }, 3000);

    document.getElementById("inputDiario").addEventListener("change", function() {
        var input = this.value;
        var dateEntered = new Date(input);
    
        $.post("php/filtra-historico.php", {data: input, tabela: 1, periodo: "diario"}, function(result){
            $("#acBomba").html(result);
    
        });
    
        $.post("php/filtra-historico.php", {data: input, tabela: 2, periodo: "diario"}, function(result){
            $("#nivelCisterna").html(result);
    
        });
    
        $.post("php/filtra-historico.php", {data: input, tabela: 3, periodo: "diario"}, function(result){
            $("#nivelPoco").html(result);
    
        });
    });
    
    document.getElementById("inputMensal").addEventListener("change", function() {
        var input = this.value;
        var dateEntered = new Date(input);
    
        $.post("php/filtra-historico.php", {data: input, tabela: 1, periodo: "mensal"}, function(result){
            $("#acBomba").html(result);
    
        });
    
        $.post("php/filtra-historico.php", {data: input, tabela: 2, periodo: "mensal"}, function(result){
            $("#nivelCisterna").html(result);
    
        });
    
        $.post("php/filtra-historico.php", {data: input, tabela: 3, periodo: "mensal"}, function(result){
            $("#nivelPoco").html(result);
    
        });
    });
    
    document.getElementById("inputAnual").addEventListener("change", function() {
        var input = this.value;
        var dateEntered = new Date(input);
    
        $.post("php/filtra-historico.php", {data: input, tabela: 1, periodo: "anual"}, function(result){
            $("#acBomba").html(result);
    
        });
    
        $.post("php/filtra-historico.php", {data: input, tabela: 2, periodo: "anual"}, function(result){
            $("#nivelCisterna").html(result);
    
        });
    
        $.post("php/filtra-historico.php", {data: input, tabela: 3, periodo: "anual"}, function(result){
            $("#nivelPoco").html(result);
    
        });
    });
});