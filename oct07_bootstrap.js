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
      $("#botaoValSub").text(estadoValSub);
    });
  
    database.ref("valDes").on("value", function(snap){
      estadoValDes= snap.val().estadoValDes;
      $("#botaoValDes").text(estadoValDes);
    });
  
    database.ref("bomba").on("value", function(snap){
      estadoBomba= snap.val().estadoBomba;
      $("#botaoBomba").text(estadoBomba);
    });

      
    
    //-----------ATUALIZA NO FIREBASE a partir de clicks nos objetos ----------------------------
    $("#botaoValSub").click(function(){
      var firebaseRef = database.ref("valSub").child("estadoValSub");
      if(estadoValSub == "Ligada"){
        if(estadoBomba == "Desligada"){
          firebaseRef.set("Desligada");
          estadoValSub = "Desligada";
          estadoBomba = "Desligada";
        }else{
          window.alert("Desligue a bomba primeiro.");
        }
      } else {
        firebaseRef.set("Ligada");
        estadoValSub = "Ligada";
      }
    });
  
    $("#botaoValDes").click(function(){
      var firebaseRef = database.ref("valDes").child("estadoValDes");
      if(estadoValDes == "Ligada"){
        firebaseRef.set("Desligada");
        estadoValDes = "Desligada";
      } else {
        firebaseRef.set("Ligada");
        estadoValDes = "Ligada";
      }
    });
  
    $("#botaoBomba").click(function(){
      var firebaseRef = database.ref("bomba").child("estadoBomba");
      if(estadoValSub == "Ligada"){ // val sub ligada:
        if(estadoBomba == "Ligada"){
          firebaseRef.set("Desligada");
          estadoBomba = "Desligada";
        } else {
          firebaseRef.set("Ligada");
          estadoBomba = "Ligada";
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
        $('#botaoValDes').removeClass('btn-success').addClass('btn-danger');
        $("#aguaDreno").attr("stroke","#7f3f00");
      } else {
        $("#ValDes").attr("fill","#008000");
        $("#aguaDreno").attr("stroke","#5B9BA2");
        $('#botaoValDes').removeClass('btn-danger').addClass('btn-success');
      }
    });

    database.ref("valSub").on("value", function(snap){
      estadoValSub = snap.val().estadoValSub;
      if(estadoValSub == "Desligada"){
        $("#ValSub").attr("fill","#ff0000");
        $('#botaoValSub').removeClass('btn-success').addClass('btn-danger');
      } else {
        $("#ValSub").attr("fill","#008000");
        $('#botaoValSub').removeClass('btn-danger').addClass('btn-success');
      }
    });
  
    database.ref("bomba").on("value", function(snap){
      estadoBomba = snap.val().estadoBomba;
      if(estadoBomba == "Desligada"){
        $("#bomba").attr("fill","#ff0000");
        $("#aguaBomba").attr("stroke","#7f3f00");
        $('#botaoBomba').removeClass('btn-success').addClass('btn-danger');
      } else {
        $("#bomba").attr("fill","#008000");
        $("#aguaBomba").attr("stroke","#5B9BA2");
        $('#botaoBomba').removeClass('btn-danger').addClass('btn-success');
      }
    });
  
  });