<?php
$vazao = filter_input(INPUT_GET, 'vazao', FILTER_VALIDATE_FLOAT);
$eletroBomba = filter_input(INPUT_GET, 'eletroBomba', FILTER_VALIDATE_INT);
$eletroDreno = filter_input(INPUT_GET, 'eletroDreno', FILTER_VALIDATE_INT);
$bomba = filter_input(INPUT_GET, 'bomba', FILTER_VALIDATE_INT);

if (is_null($vazao) || is_null($eletroBomba) || is_null($eletroDreno) || is_null($bomba)) {
  //Gravar log de erros
  die("Dados inválidos");
} 
$servername = "192.168.0.108";
$username = "esp";
$password = "esp8266";
$dbpotenciometro = "dbpotenciometro";
$dbestados = "dbestados";
$conn1 = new mysqli($servername, $username, $password, $dbpotenciometro);
$conn2 = new mysqli($servername, $username, $password, $dbestados);

if ($conn1->connect_error || $conn2->connect_error) {
  //Gravar log de erros
  die("Não foi possível estabelecer conexão com o BD: " . $conn->connect_error);
} 
$sql1 = "INSERT INTO voltagem (valor) VALUES ($vazao)";
$sql2 = "UPDATE valvulas SET estado=$eletroBomba WHERE nome='eletrobomba'";
$sql3 = "UPDATE valvulas SET estado=$eletroDreno WHERE nome='eletrodreno'";
$sql4 = "UPDATE valvulas SET estado=$bomba WHERE nome='bomba'";

if (!$conn1->query($sql1) || !$conn2->query($sql2) || !$conn2->query($sql3) || !$conn2->query($sql4)) {
  //Gravar log de erros
  die("Erro na gravação dos dados no BD");
}
$conn1->close();
$conn2->close();
?>