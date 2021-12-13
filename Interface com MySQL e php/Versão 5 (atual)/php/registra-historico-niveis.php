<?php
$nivelCisterna = filter_input(INPUT_GET, 'nivelCisterna', FILTER_VALIDATE_INT);
$nivelPoco = filter_input(INPUT_GET, 'nivelPoco', FILTER_VALIDATE_INT);

if (is_null($nivelCisterna) && is_null($nivelPoco)) {
  //Gravar log de erros
  die("Dados inválidos");
} 
$servername = "192.168.0.106";
$username = "esp";
$password = "esp8266";
$dbname = "dbestados";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  //Gravar log de erros
  die("Não foi possível estabelecer conexão com o BD: " . $conn->connect_error);
} 

if (!is_null($nivelCisterna)) {
    $sql = "INSERT INTO nivelcisterna (estado) VALUES (" . $nivelCisterna . ")";

    if (!$conn->query($sql)) {
        //Gravar log de erros
        die("Erro na gravação dos dados no BD");
    }
}

if (!is_null($nivelPoco)) {
  $sql = "INSERT INTO nivelpoco (estado) VALUES (" . $nivelPoco . ")";

    if (!$conn->query($sql)) {
        //Gravar log de erros
        die("Erro na gravação dos dados no BD");
    }
}


$conn->close();
?>