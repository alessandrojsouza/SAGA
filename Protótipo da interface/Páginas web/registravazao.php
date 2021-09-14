<?php
$valor = filter_input(INPUT_GET, 'valor', FILTER_VALIDATE_FLOAT);

if (is_null($valor)) {
  //Gravar log de erros
  die("Dados inválidos");
} 
$servername = "192.168.0.108";
$username = "esp";
$password = "esp8266";
$dbname = "dbpotenciometro";
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  //Gravar log de erros
  die("Não foi possível estabelecer conexão com o BD: " . $conn->connect_error);
} 
$sql = "INSERT INTO vazao (valor) VALUES ($valor)";

if (!$conn->query($sql)) {
  //Gravar log de erros
  die("Erro na gravação dos dados no BD");
}
$conn->close();
?>