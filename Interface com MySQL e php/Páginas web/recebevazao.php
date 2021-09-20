<?php
$conn = new mysqli("192.168.0.108", "esp", "esp8266", "dbpotenciometro");
if($conn->connect_error) {
    exit('Falha na conexão com o banco de dados');
}

$sql = "SELECT * FROM voltagem ORDER BY ID DESC LIMIT 1";

$novoResultado = $conn->query($sql);

if ($linha = $novoResultado -> fetch_assoc()) {
    echo $linha["valor"];
} else {
  echo "<span>Sem fluxo</span>";
}
$conn->close();
?>