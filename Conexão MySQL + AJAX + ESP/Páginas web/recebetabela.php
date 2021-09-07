<?php
$conn = new mysqli("192.168.0.108", "esp", "esp8266", "dbpotenciometro");
if($conn->connect_error) {
  exit('Could not connect');
}

$sql = "SELECT * FROM voltagem";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
  // output data of each row
  echo "<tr>    <th>ID</th> <th>Valor</th>  <th>Tempo</th>  </tr>";
  while($row = $result->fetch_assoc()) {
    echo "<tr> <td>" . $row["ID"]. " </td> <td> " . $row["valor"]. "</td> <td>" . $row["tempo"]. "</td> </tr> <br>";
  }
} else {
  echo "Tabela vazia";
}
$conn->close();
?>