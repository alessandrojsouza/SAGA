<?php
$vazaoSubida = filter_input(INPUT_GET, 'vazaoSubida', FILTER_VALIDATE_INT);
$vazaoDescida = filter_input(INPUT_GET, 'vazaoDescida', FILTER_VALIDATE_INT);

$conn = new mysqli("192.168.0.106", "esp", "esp8266", "dbestados");
if($conn->connect_error) {
    exit('Falha na conexão com o banco de dados');
}

if ($vazaoSubida == 1) {
  $sqlEstados= "SELECT estado FROM estados WHERE nome='vazaoSubida'";
}
elseif ($vazaoDescida == 1) {
  $sqlEstados= "SELECT estado FROM estados WHERE nome='vazaoDescida'";
}

$resultado = $conn->query($sqlEstados);

if ($linha = $resultado -> fetch_assoc()) {
  echo $linha["estado"];
}


$conn->close();
?>