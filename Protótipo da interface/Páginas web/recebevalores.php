<?php
$conn = new mysqli("192.168.0.108", "esp", "esp8266", "dbestados");
if($conn->connect_error) {
    exit('Falha na conexão com o banco de dados');
}

$sqlEstados= "SELECT estado FROM valvulas";


$novoResultado = $conn->query($sqlEstados);

$valores = array();

if ($novoResultado->num_rows > 0) {
    while ($linha = $novoResultado -> fetch_assoc()) {
        array_push($valores, $linha["estado"]);
    }
} else {
  echo "<span>Sem fluxo</span>";
}

echo json_encode($valores);
$conn->close();
?>