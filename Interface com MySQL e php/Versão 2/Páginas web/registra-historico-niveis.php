<?php
$nivelCisterna = filter_input(INPUT_GET, 'nivelCisterna', FILTER_VALIDATE_INT);
$nivelPoco = filter_input(INPUT_GET, 'nivelPoco', FILTER_VALIDATE_INT);

if (is_null($nivelCisterna) && is_null($nivelPoco)) {
  //Gravar log de erros
  die("Dados inválidos");
} 
$servername = "192.168.0.108";
$username = "esp";
$password = "esp8266";
$dbname = "dbestados";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  //Gravar log de erros
  die("Não foi possível estabelecer conexão com o BD: " . $conn->connect_error);
} 

if (!is_null($nivelCisterna)) {
    $sql = ($nivelCisterna == 100) ? "INSERT INTO nivelcisterna (estado) VALUES ('cheio')" : "INSERT INTO nivelcisterna (estado) VALUES ('baixo')";

    if (!$conn->query($sql)) {
        //Gravar log de erros
        die("Erro na gravação dos dados no BD");
    }
}

if (!is_null($nivelPoco)) {
  $sql = ($nivelPoco == 100) ? "INSERT INTO nivelpoco (estado) VALUES ('cheio')" : "INSERT INTO nivelpoco (estado) VALUES ('baixo')";

    if (!$conn->query($sql)) {
        //Gravar log de erros
        die("Erro na gravação dos dados no BD");
    }
}


$conn->close();
?>