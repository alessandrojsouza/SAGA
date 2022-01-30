<?php
$bomba = filter_input(INPUT_GET, 'bomba', FILTER_VALIDATE_INT);

if (is_null($bomba)) {
    die("Dados inválidos");
}

$servername = "192.168.0.106"; //ADAPTAR
$username = "esp";
$password = "esp8266";
$dbname = "dbestados";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  //Gravar log de erros
  die("Não foi possível estabelecer conexão com o BD: " . $conn->connect_error);
} 

if ($bomba == 1) {
    $sql = "INSERT INTO registrobomba (estado) VALUES ('acionada')";
} else if ($bomba == 0) {
    $sql = "INSERT INTO registrobomba (estado) VALUES ('desligada')";
}

if (!$conn->query($sql)) {
    //Gravar log de erros
    die("Erro na gravação dos dados no BD");
}

$conn->close();
?>