<?php
    $servername = "192.168.0.106";
    $username = "esp";
    $password = "esp8266";
    $dbestados = "dbestados";
    $conn = new mysqli($servername, $username, $password, $dbestados);
    $tabela = "";
    $titulo = "";

    
    if ($conn->connect_error) {
        //Gravar log de erros
        die("Não foi possível estabelecer conexão com todos os bancos de dados: " . $conn->connect_error);
    }
    
    if($_SERVER['REQUEST_METHOD'] == "POST"){
        //echo "<h2> Recebeu a data: " . $_POST['data'] . "</h2>";
        $dataPesquisa = $_POST['data'];
        $numTabela = $_POST['tabela'];
        $periodo = $_POST['periodo'];

        if ($numTabela == 1) {
            $tabela = "registrobomba";
            $titulo = "Controle da bomba";
        }
        elseif ($numTabela == 2) {
            $tabela = "nivelcisterna";
            $titulo = "Nível da cisterna";
        }
            
        elseif ($numTabela == 3) {
            $tabela = "nivelpoco";
            $titulo = "Nível do poço";
        }

        $dataArray = explode("-", $dataPesquisa);
        
        if ($periodo == "diario")
            $dataPesquisa = $dataArray[0] . "-" . $dataArray[1] . "-" . $dataArray[2];

        elseif ($periodo == "mensal")
            $dataPesquisa = $dataArray[0] . "-" . $dataArray[1];
            
        elseif ($periodo == "anual")
            $dataPesquisa = $dataArray[0];

        $sql = "SELECT * FROM " . $tabela . " WHERE data_hora LIKE '%" . $dataPesquisa. "%'";

         
    }else{
        //echo "<h2>Não recebeu nada, vai mostrar o mês atual<h2>";

        $dataAtual = date('Y-m');

        $sql = "SELECT * FROM registrobomba WHERE data_hora LIKE '%" . $dataAtual. "%'";
    }

    echo "<caption>" . $titulo . "</caption>";

    if (!$conn->query($sql)) {
        //Gravar log de erros
        die("Erro na gravação dos dados no BD");
    }

    $resultado = $conn->query($sql);

    while($linha = $resultado->fetch_assoc()){

        $timestamp = strtotime($linha["data_hora"]);
        $dataTabela = date('d/m/Y H:i:s', $timestamp);
        echo "<tr>";
        echo "<td>" . $linha["data_hora"] . "</td>";
        echo "<td>" . $linha["estado"] . "</td>";
        echo "</tr>";
    }

    
?>