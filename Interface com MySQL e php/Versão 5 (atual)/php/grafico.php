<!DOCTYPE html>
<html>
  <head>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script type="text/javascript">
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = google.visualization.arrayToDataTable([
          ['Tempo', 'Nível'],

          <?php

          $servername = "192.168.0.108";
          $username = "esp";
          $password = "esp8266";
          $dbestados = "dbestados";
          $conn = new mysqli($servername, $username, $password, $dbestados);
          $tabela = "";
          $titulo = "";


          if ($conn->connect_error) {
              //Gravar log de erros
              die("Não foi possível estabelecer conexão com todos os bancos de dados: " . $conn->connect_error);
          }

          if($_SERVER['REQUEST_METHOD'] == "GET"){
              //echo "<h2> Recebeu a data: " . $_GET['data'] . "</h2>";
              $dataPesquisa = $_GET['data'];
              $numTabela = $_GET['tabela'];
              $periodo = $_GET['periodo'];

              if ($numTabela == 1) {
                  $tabela = "registrobomba";
                  $titulo = "Controle da bomba";
              }
              elseif ($numTabela == 2) {
                  $tabela = "nivelcisterna";
                  $titulo = "Nível da cisterna";
              }
                  
              elseif ($numTabela == 3) {
                  $tabela = "nivelpoco";
                  $titulo = "Nível do poço";
              }

              $dataArray = explode("-", $dataPesquisa);
              
              if ($periodo == "diario")
                  $dataPesquisa = $dataArray[0] . "-" . $dataArray[1] . "-" . $dataArray[2];

              elseif ($periodo == "mensal")
                  $dataPesquisa = $dataArray[0] . "-" . $dataArray[1];
                  
              elseif ($periodo == "anual")
                  $dataPesquisa = $dataArray[0];

              $sql = "SELECT * FROM " . $tabela . " WHERE data_hora LIKE '%" . $dataPesquisa. "%'";

              
          }else{
              //echo "<h2>Não recebeu nada, vai mostrar o mês atual<h2>";

              $dataAtual = date('Y-m');

              $sql = "SELECT * FROM registrobomba WHERE data_hora LIKE '%" . $dataAtual. "%'";
          }

          if (!$conn->query($sql)) {
              //Gravar log de erros
              die("Erro na gravação dos dados no BD");
          }

          $resultado = $conn->query($sql);

          while($linha = $resultado->fetch_assoc()){
              $data_hora = explode(" ", $linha["data_hora"]);

              $timestamp = strtotime($linha["data_hora"]);
              $dataTabela = date('d/m/Y H:i:s', $timestamp);
              $hora = $data_hora[1];
              $estado = $linha["estado"];
          ?>
          ['<?php echo $hora ?>',  <?php echo $estado ?>],

          <?php } ?>
          
        ]);


        var options = {
          title: 'Gráfico teste',
          curveType: 'function',
          legend: { position: 'bottom' }
        };

        var chart = new google.visualization.LineChart(document.getElementById('graficoLinha'));

        chart.draw(data, options);
      }
    </script>
  </head>
  <body>
    <div id="graficoLinha" style="width: 900px; height: 500px"></div>
  </body>
</html>
