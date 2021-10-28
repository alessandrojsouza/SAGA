<?php
$vazao = filter_input(INPUT_GET, 'vazao', FILTER_VALIDATE_FLOAT);
$vazao2 = filter_input(INPUT_GET, 'vazao2', FILTER_VALIDATE_FLOAT);
$eletroBomba = filter_input(INPUT_GET, 'eletroBomba', FILTER_VALIDATE_INT);
$eletroDreno = filter_input(INPUT_GET, 'eletroDreno', FILTER_VALIDATE_INT);
$bomba = filter_input(INPUT_GET, 'bomba', FILTER_VALIDATE_INT);
$sensCisterna = filter_input(INPUT_GET, 'sensCisterna', FILTER_VALIDATE_INT);
$sensPoço = filter_input(INPUT_GET, 'sensPoco', FILTER_VALIDATE_INT);

if (is_null($vazao) && is_null($eletroBomba) && is_null($eletroDreno) && is_null($bomba) && is_null($sensCisterna) && is_null($sensPoço)) {
  //Gravar log de erros
  die("Dados inválidos");
} 

$servername = "192.168.0.108";
$username = "esp";
$password = "esp8266";
$dbpotenciometro = "dbpotenciometro";
$dbestados = "dbestados";
$conn = new mysqli($servername, $username, $password, $dbestados);

if ($conn->connect_error) {
  //Gravar log de erros
  die("Não foi possível estabelecer conexão com todos os bancos de dados: " . $conn->connect_error);
}

$sql1 = "UPDATE estados SET estado=$vazao WHERE nome='vazaoSubida'";
$sql2 = "UPDATE estados SET estado=$eletroBomba WHERE nome='eletrobomba'";
$sql3 = "UPDATE estados SET estado=$eletroDreno WHERE nome='eletrodreno'";
$sql4 = "UPDATE estados SET estado=$bomba WHERE nome='bomba'";
$sql5 = "UPDATE estados SET estado=$sensCisterna WHERE nome='sensCisterna'";
$sql6 = "UPDATE estados SET estado=$sensPoço WHERE nome='sensPoço'";
$sql7 = "UPDATE estados SET estado=$vazao2 WHERE nome='vazaoDescida'";

if (!$conn->query($sql1) || !$conn->query($sql2) || !$conn->query($sql3) || !$conn->query($sql4) || !$conn->query($sql5) || !$conn->query($sql6) || !$conn->query($sql7)) {
  //Gravar log de erros
  die("Erro na gravação dos dados no BD");
}
$conn->close();
?>