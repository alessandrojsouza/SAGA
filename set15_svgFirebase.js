const firebaseConfig = {
  apiKey: "AIzaSyAGWOafTIwWe_0r9HV60v_p36CA4o-bSQ4",
  authDomain: "teste---esp8266.firebaseapp.com",
  databaseURL: "https://teste---esp8266-default-rtdb.firebaseio.com",
  projectId: "teste---esp8266",
  storageBucket: "teste---esp8266.appspot.com",
  messagingSenderId: "686708854493",
  appId: "1:686708854493:web:c4ece2715b686c3c439534",
  measurementId: "G-LN70JDHN17"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

$(document).ready(function(){
  var database = firebase.database();
  var estadoValSub;
  var estadoValDes;
  var estadoBomba;

  //-----------PEGA OS VALORES DO FIREBASE-----------------------
  database.ref("valSub").on("value", function(snap){
    estadoValSub = snap.val().estadoValSub;
    $("#estadoValSubTxt").text(estadoValSub);
    //acValSub = snap.val().acValSub;
    //var linha = document.createElement('tr');
    //$("tabela").append(acValSub);
    //linha.innerHTML = acValSub;
  });

  database.ref("valDes").on("value", function(snap){
    estadoValDes= snap.val().estadoValDes;
    $("#estadoValDesTxt").text(estadoValDes);
  });

  database.ref("bomba").on("value", function(snap){
    estadoBomba= snap.val().estadoBomba;
    $("#estadoBombaTxt").text(estadoBomba);
  });

  // fiz isso pq antes qnd atualizava a pag n pegava os valores filhos de acValSub 
  // so pegava na hora q clicava. Agr pega o ultimo valor
  firebase.database().ref('valSub/acValSub').limitToLast(1).on('child_added', function(snapshot) {
    acValSub = snapshot.val();
    $("#tempoValSub").text(acValSub);
    var linha = ' ';
    snapshot.forEach((child) => {
      console.log(child.val()); 
      linha += '<li>' + acValSub + '</li>';
    });
    linha.appendTo("#tabela");
  });

  firebase.database().ref('valDes/acValDes').limitToLast(1).on('child_added', function(snapshot) {
    acValDes = snapshot.val();
    $("#tempoValDes").text(acValDes);
    snapshot.forEach((child) => {
      console.log(child.val()); 
    });
  });

  firebase.database().ref('bomba/acBomba').limitToLast(1).on('child_added', function(snapshot) {
    acBomba = snapshot.val();
    $("#tempoBomba").text(acBomba);
    snapshot.forEach((child) => {
      console.log(child.val()); 
    });
  });

  
  //-----------ATUALIZA NO FIREBASE a partir de clicks nos objetos ----------------------------
  $(".botaoValSub").click(function(){
    var firebaseRef = database.ref("valSub").child("estadoValSub");
    var firebaseRef2 = database.ref('valSub').child('acValSub');
    tempo = new Date();
    h = tempo.getHours();
    m = tempo.getMinutes();
    s = tempo.getSeconds();
    if(estadoValSub == "Ligada"){
      if(estadoBomba == "Desligada"){
        firebaseRef.set("Desligada");
        estadoValSub = "Desligada";
        firebaseRef2.push(estadoValSub + ' em ' + h + ':' + m + ':' + s);
        $("#tempoValSub").text(estadoValSub + ' em ' + h + ':' + m + ':' + s);
        estadoBomba = "Desligada";
      }else{
        window.alert("Desligue a bomba primeiro.");
      }
    } else {
      firebaseRef.set("Ligada");
      estadoValSub = "Ligada";
      firebaseRef2.push(estadoValSub + ' em ' + h + ':' + m + ':' + s);
      $("#tempoValSub").text(estadoValSub + ' em ' + h + ':' + m + ':' + s);
    }
  });

  $(".botaoValDes").click(function(){
    var firebaseRef = database.ref("valDes").child("estadoValDes");
    var firebaseRef2 = database.ref("valDes").child("acValDes");
    tempo = new Date();
    h = tempo.getHours();
    m = tempo.getMinutes();
    s = tempo.getSeconds();
    if(estadoValDes == "Ligada"){
      firebaseRef.set("Desligada");
      estadoValDes = "Desligada";
      firebaseRef2.push(estadoValDes + ' em ' + h + ':' + m + ':' + s);
      $("#tempoValDes").text(estadoValDes + 'em ' + h + ':' + m + ':' + s);
    } else {
      firebaseRef.set("Ligada");
      estadoValDes = "Ligada";
      firebaseRef2.push(estadoValDes + ' em ' + h + ':' + m + ':' + s);
      $("#tempoValDes").text(estadoValDes + 'em ' + h + ':' + m + ':' + s);
    }
  });

  $(".botaoBomba").click(function(){
    var firebaseRef = database.ref("bomba").child("estadoBomba");
    var firebaseRef2 = database.ref("bomba").child("acBomba");
    tempo = new Date();
    h = tempo.getHours();
    m = tempo.getMinutes();
    s = tempo.getSeconds();
    if(estadoValSub == "Ligada"){ // val sub ligada:
      if(estadoBomba == "Ligada"){
        firebaseRef.set("Desligada");
        estadoBomba = "Desligada";
        firebaseRef2.push(estadoBomba + ' em ' + h + ':' + m + ':' + s);
        $("#tempoBomba").text(estadoBomba + ' em ' + h + ':' + m + ':' + s);
      } else {
        firebaseRef.set("Ligada");
        estadoBomba = "Ligada";
        firebaseRef2.push(estadoBomba + ' em ' + h + ':' + m + ':' + s);
        $("#tempoBomba").text(estadoBomba + ' em ' + h + ':' + m + ':' + s);
      }
    } else { // val sub desligada: 
      if(estadoBomba == "Desligada"){
        window.alert("Válvula de subida desligada");
      }
    }
  });
  
  //-----------Muda as cores------------------
  database.ref("valDes").on("value", function(snap){
    estadoValDes = snap.val().estadoValDes;
    if(estadoValDes == "Desligada"){
      $("#ValDes").attr("fill","#ff0000"); 
        $("#aguaDreno").attr("stroke","#7f3f00");
    } else {
      $("#ValDes").attr("fill","#008000");
        $("#aguaDreno").attr("stroke","#5B9BA2");
    }
  });

  database.ref("valSub").on("value", function(snap){
    estadoValSub = snap.val().estadoValSub;
    if(estadoValSub == "Desligada"){
      $("#ValSub").attr("fill","#ff0000"); 
    } else {
      $("#ValSub").attr("fill","#008000");
    }
  });

  database.ref("bomba").on("value", function(snap){
    estadoBomba = snap.val().estadoBomba;
    if(estadoBomba == "Desligada"){
      $("#bomba").attr("fill","#ff0000");
      $("#aguaBomba").attr("stroke","#7f3f00");
    } else {
      $("#bomba").attr("fill","#008000");
      $("#aguaBomba").attr("stroke","#5B9BA2");
    }
  });

  // ------- TABELA --------------
  
  /*
  function SelectAllData(){
    firebase.database().ref('bomba').once('value',
    function(AllRecords){
      AllRecords.forEach(
        function(CurrentRecord){
          var horario = CurrentRecord.val().tempoBomba;
          var estado = CurrentRecord.val().estadoBomba;
          AddItensToTable(horario, estado);
        }
      );
    });
  }

  window.onload =  SelectAllData;


  function AddItensToTable(horario, estado){
    var tbody = document.getElementById('tbody1');
    var trow = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    td1.innerHTML = estadoBomba;
    td2.innerHTML = tempoBomba;
    trow.appendChild(td1);
    trow.appendChild(td2);
    tbody.appendChild(trow);
  }
  */
});