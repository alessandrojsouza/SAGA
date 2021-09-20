nivelCisterna = 0;
porcentagemCisterna = "";

function controleEletrovalvulaBomba() {
    valorAtual = document.getElementById('eletrovalvula_bomba').getAttribute("value");
    valorBomba = document.getElementById('bomba').getAttribute("value");               
    const xhttp = new XMLHttpRequest();

    if (valorAtual == "0") {
        xhttp.open("GET", "http://192.168.0.109/LED1=ON");
        xhttp.send();
        document.getElementById('luz1').style.fill = "#00FF21";
        document.getElementById('eletrovalvula_bomba').setAttribute("value", "1");
        
    } else {
        if (valorBomba == "0") {
            xhttp.open("GET", "http://192.168.0.109/LED1=OFF");
            xhttp.send();
            document.getElementById('luz1').style.fill = "red";
            document.getElementById('eletrovalvula_bomba').setAttribute("value", "0");
        } else {
            window.alert("Desligue a bomba antes de fechar a válvula")
        }
        
    }

}

function controleEletrovalvulaDreno() {
    valorAtual = document.getElementById('eletrovalvula_dreno').getAttribute("value");                
    const xhttp = new XMLHttpRequest();

    if (valorAtual == "0") {
        xhttp.open("GET", "http://192.168.0.109/LED2=ON");
        xhttp.send();
        document.getElementById('luz2').style.fill = "#00FF21";
        document.getElementById('eletrovalvula_dreno').setAttribute("value", "1");
        
    } else {
        xhttp.open("GET", "http://192.168.0.109/LED2=OFF");
        xhttp.send();
        document.getElementById('luz2').style.fill = "red";
        document.getElementById('eletrovalvula_dreno').setAttribute("value", "0");
    }
}

function lerSensorFluxoBomba() {
    setInterval(
        function() { 
            valorBomba = document.getElementById('bomba').getAttribute("value");
            valorValvulaBomba = document.getElementById('eletrovalvula_bomba').getAttribute("value");
            if (valorBomba == "1" && valorValvulaBomba == "1") {
                const xhttp = new XMLHttpRequest();
                xhttp.onload = function() { 
                    document.getElementById("textoSensBomba").innerHTML = this.responseText + " l/min"; 
                    litros = parseFloat(this.responseText) * 0.5 / 60.0;

                    if (nivelCisterna <= 10.0 && porcentagemCisterna <= 100) {
                        nivelCisterna += litros;
                        porcentagemCisterna = Math.round(nivelCisterna / 10 * 100);
                        document.getElementById("porcentCisterna").innerHTML = String(porcentagemCisterna) + " %";
                        document.getElementById("nivelCisterna").innerHTML = String(nivelCisterna.toFixed(2)) + " litros";
                    } else {
                        document.getElementById("bomba").style.fill = "red";
                        xhttp.open("GET", "http://192.168.0.109/BOMBA=OFF");
                        xhttp.send();
                        document.getElementById('bomba').setAttribute("value", "0");
                    }
                    

                    

                }
                
                xhttp.open("GET", "http://esptest.local/recebevazao.php");
                xhttp.send();
            }
        }, 500);

}

function lerSensorFluxoDreno() {
    setInterval(
        function() { 
            valorValvulaDreno = document.getElementById('eletrovalvula_dreno').getAttribute("value");
            if (valorValvulaDreno == "1") {
                const xhttp = new XMLHttpRequest();
                xhttp.onload = function() { document.getElementById("textoSensDreno").innerHTML = this.responseText + " l/min"; }
                xhttp.open("GET", "http://esptest.local/recebevazao.php");
                xhttp.send();
            }
        }, 500);

}

function controlarBomba() {
    valor = document.getElementById("bomba").getAttribute("value");
    valorValvulaBomba = document.getElementById("eletrovalvula_bomba").getAttribute("value");
    const xhttp = new XMLHttpRequest();
    if (valor == "0") {
        if (valorValvulaBomba == "1"){
            document.getElementById("bomba").style.fill = "#00FF21";
            xhttp.open("GET", "http://192.168.0.109/BOMBA=ON");
            xhttp.send();
            document.getElementById('bomba').setAttribute("value", "1");
        } else {
            window.alert("Abra a válvula antes de ligar a bomba")
        }
            
    }

    if (valor == "1") {
        document.getElementById("bomba").style.fill = "red";
        xhttp.open("GET", "http://192.168.0.109/BOMBA=OFF");
        xhttp.send();
        document.getElementById('bomba').setAttribute("value", "0");
    }
}

function realTime() {
    lerSensorFluxoBomba();
    lerSensorFluxoDreno();

    bomba = document.getElementById('bomba');
    eletroBomba = document.getElementById('eletrovalvula_bomba');
    eletroDreno = document.getElementById('eletrovalvula_dreno');
    
    
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() { 
        texto = JSON.parse(this.responseText);
        var resposta = texto.toString().split(",");


        eletroBomba.setAttribute("value", resposta[0]);


        eletroDreno.setAttribute("value", resposta[1]);


        bomba.setAttribute("value", resposta[2]);

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
    xhttp.open("GET", "http://esptest.local/recebevalores.php");
    xhttp.send();
}