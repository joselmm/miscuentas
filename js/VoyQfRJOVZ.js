const urlBD = JSON.parse(sessionStorage.getItem("cache")).urlBD;
const sheetJson = JSON.parse(sessionStorage.getItem("cache")).sheetJson;

var jsData;
fetch(sheetJson)
  .then((res) => {
    return res.text();
  })
  .then((txt) => {
    var jsonData = txt.substr(txt.indexOf("(") + 1).slice(0, -2);
    jsData = JSON.parse(jsonData);
    console.log("ya");
  })
  .then(() => {
    var Data = [];
    var temp = {};
    for (let i = 0; i < jsData.table.rows.length; i++) {
      temp = {};

      for (let j = 0; j < jsData.table.cols.length; j++) {
        if (!!jsData.table.cols[j].label) {
          if (!!jsData.table.rows[i].c[j]) {
            var value =
              typeof jsData.table.rows[i].c[j].v != "number" &&
              jsData.table.rows[i].c[j].f
                ? jsData.table.rows[i].c[j].f
                : jsData.table.rows[i].c[j].v;
          } else {
            var value = "";
          }
          temp[jsData.table.cols[j].label] = value;
        }
      }
      Data.push(temp);
    }

    SSCONN.primevideoDB = Data;
  });

var imagenCargando = document.createElement("img");
imagenCargando.src = "https://c.tenor.com/v_OKGJFSkOQAAAAC/loading-gif.gif";
imagenCargando.style.width = "100%";
imagenCargando.id = "imgcargando";
imagenCargando.style.margin = "0 auto 0 auto";
const tbody = document.querySelector("#tbody");
const inputBuscar = document.querySelector("#imput_buscar");

var meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function function_ID() {
  if (SSCONN.primevideoDB) {
    if (document.getElementById("imgcargando")) {
      tbody.removeChild(document.getElementById("imgcargando"));
    }
    tbody.innerHTML = "";
    //=======================================================================

    // CODIGO A EJECUTAR AQUI:

    // variables generales necesarias

    for (var i = 0; i < SSCONN.primevideoDB.length; i++) {
      let objetoFila = SSCONN.primevideoDB[i];
      var elementoFila = document.createElement("tr");
      var columnaDEAcciones = document.createElement("th");
      columnaDEAcciones.innerHTML = `<a href="#u${
        i + 1
      }" type="button" class="btn btn-warning" id="u${
        i + 1
      }"><i class="fas fa-pencil-alt"></i></a>
	<a href="#u${i + 1}" type="button" class="btn btn-danger" id="d${
        i + 1
      }"><i class="far fa-trash-alt"></i></a>
	`;

      elementoFila.appendChild(columnaDEAcciones);

      for (header in objetoFila) {
        if (header) {
          var columna = document.createElement("th");

          switch (header) {
            case "Dias_Vigentes":
              if (objetoFila[header] < 26) {
                columna.style.color = "blue";
              } else if (objetoFila[header] >= 26 && objetoFila[header] < 30) {
                columna.style.color = "yellow";
              } else if (objetoFila[header] >= 30 && objetoFila[header] < 50) {
                columna.style.color = "#FFAE20";
              } else if (objetoFila[header] >= 50) {
                columna.style.color = "red";
              }
              var acortado = objetoFila[header].toString().substr(0, 5);
              columna.innerHTML = acortado;
              break;

            default:
              columna.innerHTML = objetoFila[header];
              break;
          }

          elementoFila.appendChild(columna);
        }
      }

      tbody.appendChild(elementoFila);
    }

    botonesEliminar = document.querySelectorAll("table.table a[id^='d']");
    botonesActualizar = document.querySelectorAll("table.table a[id^='u']");

    botonesEliminar.forEach(EventoBorrar);

    function EventoBorrar(enlaceBorrar) {
      enlaceBorrar.addEventListener("click", AccionBorrar);

      function AccionBorrar(e) {
        let id = Number(
          this.parentNode.parentNode.getElementsByTagName("th")[5].textContent
        );

        let nombreCliente =
          this.parentNode.parentNode.getElementsByTagName("th")[2].textContent;

        var cuerpoFila = [{ id: id }];
        var resultado = window.confirm(
          "Seguro que quieres borrar a " +
            nombreCliente +
            ", con id: " +
            id +
            "?"
        );

        if (resultado) {
          deleteRows(urlBD, "Prime Video", cuerpoFila, "id");

          setTimeout(function () {
            location.reload();
          }, 6000);
        }
      }
    }

    botonesActualizar.forEach(EventoEditar);
    var objetoFilaAEditar;
    function EventoEditar(enlaceEditar, indiceBtn) {
      enlaceEditar.addEventListener("click", AccionEditar);

      function AccionEditar(e) {
        if (document.querySelector("#revisar-popup")) {
          document.querySelector("#revisar-popup").outerHTML = "";
        }

        var padre = document.querySelector("table.table").parentNode;
        var tabla = document.querySelector("table.table");
        padre.removeChild(tabla);

        var formulario = document.createElement("form");
        var idFila = Number(
          enlaceEditar.parentNode.parentNode.getElementsByTagName("th")[5]
            .textContent
        );

        for (var i = 0; i < SSCONN.primevideoDB.length; i++) {
          if (SSCONN.primevideoDB[i].id == idFila) {
            objetoFilaAEditar = SSCONN.primevideoDB[i];
            break;
          }
        }
        var btnDias;
        var si = false;
        for (header in objetoFilaAEditar) {
          if (header) {
            var input = document.createElement("input");
            var label = document.createElement("label");
            label.textContent = header;
            if (header == "Fecha_Inicio") {
              input.type = "datetime-local";
              input.value = extractDate(objetoFilaAEditar[header]);

            } else if (header == "Dias_Vigentes") {
              input.value = '=NOW() - INDIRECT(CONCAT("C";ROW()))';
              input.setAttribute("readonly", "");
            } else if (header == "Fecha_Inicio") {
              input.value = objetoFilaAEditar[header];
            } else if (header == "Fecha_Finalizacion") {
              input.value =
                '= INDIRECT(CONCAT("C";ROW())) + ' + objetoFilaAEditar.sumar;
              input.setAttribute("readonly", "");

              btnDias = document.createElement("div");
              btnDias.classList.add("btn");
              btnDias.classList.add("btn-primary");
              btnDias.classList.add("m-4");
              btnDias.textContent = "editar-manual";
              btnDias.id = "btn-Dias";

              si = true;
            } else if (header == "id") {
              input.value = objetoFilaAEditar[header];
              input.setAttribute("readonly", "");
            } else {
              input.value = objetoFilaAEditar[header];
            }

            input.name = header;
            formulario.style.textAlign = "center";
            formulario.id = "formulario_editar";
            formulario.appendChild(label);
            formulario.appendChild(document.createElement("br"));
            formulario.appendChild(input);
            formulario.appendChild(document.createElement("br"));
            if (btnDias && si) {
              formulario.appendChild(btnDias);
              formulario.appendChild(document.createElement("br"));
              btnDias.addEventListener("click", editarManual);
              si = false;
            }
          }
        }
        var btnActualizar = document.createElement("div");
        btnActualizar.classList.add("btn");
        btnActualizar.classList.add("btn-primary");
        btnActualizar.classList.add("m-4");
        btnActualizar.textContent = "Actualizar";
        btnActualizar.id = "btn_actualizar";
        formulario.appendChild(btnActualizar);

        var btnAtras = document.createElement("div");
        btnAtras.classList.add("btn");
        btnAtras.classList.add("btn-danger");
        btnAtras.classList.add("m-4");
        btnAtras.textContent = "Atras";

        document.body.appendChild(btnAtras);
        document.body.appendChild(formulario);
        btnAtras.addEventListener("click", () => {
          location.reload();
        });

        btnActualizar.addEventListener("click", eventoActualizar);
      }
    }

    function eventoActualizar(e) {
      var inputActualizar = document.querySelectorAll(
        "#formulario_editar input"
      );
      //document.getElementsByName("Fecha_Inicio")[0].value.substring(0,document.getElementsByName("Fecha_Inicio")[0].value.length-6)
      for (header in objetoFilaAEditar) {
        for (var i = 0; i < inputActualizar.length; i++) {
          if (header == inputActualizar[i].name) {
            if (header === "Whatsapp") {
              var phonePattern = /[-+](\d)+ (\d)+ (\d)+/;
              var toSend = inputActualizar[i].value;
              if (phonePattern.test(toSend)) {
                toSend = toSend.replace("+57", "");
                toSend = toSend.replace(/ /g, "");
                objetoFilaAEditar[header] = toSend;
              }
            } else if (header === "Fecha_Inicio") {
              objetoFilaAEditar[header] = inputActualizar[i].value.substring(
                0,
                inputActualizar[i].value.length - 6
              );
            } else if (objetoFilaAEditar[header] != inputActualizar[i].value) {
              objetoFilaAEditar[header] = inputActualizar[i].value;
            }
            if (header === "sumar") {
              objetoFilaAEditar["sumar"] = document
                .querySelector("[name=Fecha_Finalizacion]")
                .value.split("+")[1];
            }
          }
        }
      }

      var Array_de_objetos = [objetoFilaAEditar];

      updateRows(urlBD, "Prime Video", Array_de_objetos, "id").then(() => {
        location.reload();
      });

      //setTimeout(function(){
      //
      //},2500)

      e.target.hidden = true;
    }

    inputBuscar.addEventListener("input", accionDeBuscar);
    function accionDeBuscar() {
      if (inputBuscar.value == "") {
        function_ID();
      } else {
        tbody.innerHTML = "";

        var phonePattern = /[-+](\d)+ (\d)+ (\d)+/;
        var toSearch = inputBuscar.value;
        if (phonePattern.test(inputBuscar.value)) {
          toSearch = inputBuscar.value;
          toSearch = toSearch.replace("+57", "");
          toSearch = toSearch.replace(/ /g, "");
        }

        for (var i = 0; i < SSCONN.primevideoDB.length; i++) {
          var objetoFila = SSCONN.primevideoDB[i];
          var regExp = new RegExp(`${toSearch}`, "gi");
          var test =
            regExp.test(SSCONN.primevideoDB[i].Whatsapp) ||
            regExp.test(SSCONN.primevideoDB[i].Nombre);

          if (test) {
            var elementoFila = document.createElement("tr");
            var columnaDEAcciones = document.createElement("th");
            columnaDEAcciones.innerHTML = `<a href="#u${
              i + 1
            }" type="button" class="btn btn-warning" id="u${
              i + 1
            }"><i class="fas fa-pencil-alt"></i></a>
	<a href="#u${i + 1}" type="button" class="btn btn-danger" id="d${
              i + 1
            }"><i class="far fa-trash-alt"></i></a>
	`;
            elementoFila.appendChild(columnaDEAcciones);

            for (header in objetoFila) {
              if (header) {
                var columna = document.createElement("th");
                var columna = document.createElement("th");

                switch (header) {
                  case "Dias_Vigentes":
                    var acortado = objetoFila[header].toString().substr(0, 5);
                    columna.innerHTML = acortado;

                    if (objetoFila[header] < 26) {
                      columna.style.color = "blue";
                    } else if (
                      objetoFila[header] >= 26 &&
                      objetoFila[header] < 30
                    ) {
                      columna.style.color = "yellow";
                    } else if (
                      objetoFila[header] >= 30 &&
                      objetoFila[header] < 50
                    ) {
                      columna.style.color = "#FFAE20";
                    } else if (objetoFila[header] >= 50) {
                      columna.style.color = "red";
                    }
                    break;
                  case "Fecha_Inicio":
                    columna.innerHTML = objetoFila[header];

                    break;
                  case "Fecha_Finalizacion":
                    columna.innerHTML = objetoFila[header];

                    break;
                  default:
                    columna.innerHTML = objetoFila[header];
                    break;
                }
              }

              elementoFila.appendChild(columna);
            }

            tbody.appendChild(elementoFila);
          }
        }
        botonesEliminar = document.querySelectorAll("table.table a[id^='d']");
        botonesActualizar = document.querySelectorAll("table.table a[id^='u']");

        botonesEliminar.forEach(EventoBorrar);
      }
      botonesActualizar.forEach(EventoEditar);
    }

    const btnBorrar = document.getElementById("btnborrar");
    btnBorrar.addEventListener("click", () => {
      inputBuscar.value = "";
      function_ID();
    });

    //=======================================================================
    //=======================================================================
    // DETENER INTERVAL
    clearInterval(interval_ID);
    //=======================================================================
  }
}

var interval_ID = setInterval(function_ID, 0);

var revisados = [];

var revisar = function () {
  var buttonDeslizar = document.getElementById("button-deslizar");
  var dateToday = new Date();
  dateToday.setHours(0);
  dateToday.setMilliseconds(0);
  dateToday.setMinutes(0);
  dateToday.setSeconds(0);

  for (let i = 0; i < SSCONN.primevideoDB.length; i++) {
    var dateArray = SSCONN.primevideoDB[i].Fecha_Finalizacion.split(" ");
    var endingDate = new Date(
      dateArray[2],
      meses.map((mes) => mes.toLowerCase()).indexOf(dateArray[1]),
      dateArray[0]
    );
    var diasFaltantes = (dateToday.getTime() - endingDate.getTime()) / 86400000;

    if (-5 <= diasFaltantes && diasFaltantes <= -3) {
      var message =
        SSCONN.primevideoDB[i].Nombre +
        ' SE LE ACABARÁ su plan "' +
        SSCONN.primevideoDB[i].ESTADO +
        '"\n ID: ' +
        SSCONN.primevideoDB[i].id +
        " el PRÓXIMO " +
        SSCONN.primevideoDB[i].Fecha_Finalizacion;

      revisados.push({
        id: SSCONN.primevideoDB[i].id,
        message: message,
        vigencia: SSCONN.primevideoDB[i].Dias_Vigentes,
      });
    } else if (-2 == diasFaltantes) {
      var message =
        SSCONN.primevideoDB[i].Nombre +
        ' SE LE ACABARÁ su plan "' +
        SSCONN.primevideoDB[i].ESTADO +
        '"\n ID: ' +
        SSCONN.primevideoDB[i].id +
        " PASADO MAÑANA " +
        SSCONN.primevideoDB[i].Fecha_Finalizacion;

      revisados.push({
        id: SSCONN.primevideoDB[i].id,
        message: message,
        vigencia: SSCONN.primevideoDB[i].Dias_Vigentes,
      });
    } else if (-1 == diasFaltantes) {
      var message =
        SSCONN.primevideoDB[i].Nombre +
        ' SE LE ACABARÁ su plan "' +
        SSCONN.primevideoDB[i].ESTADO +
        '"\n ID: ' +
        SSCONN.primevideoDB[i].id +
        " MAÑANA " +
        SSCONN.primevideoDB[i].Fecha_Finalizacion;

      revisados.push({
        id: SSCONN.primevideoDB[i].id,
        message: message,
        vigencia: SSCONN.primevideoDB[i].Dias_Vigentes,
      });
    } else if (0 == diasFaltantes) {
      var message =
        SSCONN.primevideoDB[i].Nombre +
        ' se le ACABÓ su plan "' +
        SSCONN.primevideoDB[i].ESTADO +
        '"\n ID: ' +
        SSCONN.primevideoDB[i].id +
        " HOY " +
        SSCONN.primevideoDB[i].Fecha_Finalizacion;

      revisados.push({
        id: SSCONN.primevideoDB[i].id,
        message: message,
        vigencia: SSCONN.primevideoDB[i].Dias_Vigentes,
      });
    } else if (1 == diasFaltantes) {
      var message =
        SSCONN.primevideoDB[i].Nombre +
        ' se le ACABÓ su plan "' +
        SSCONN.primevideoDB[i].ESTADO +
        '"\n ID: ' +
        SSCONN.primevideoDB[i].id +
        " AYER " +
        SSCONN.primevideoDB[i].Fecha_Finalizacion;

      revisados.push({
        id: SSCONN.primevideoDB[i].id,
        message: message,
        vigencia: SSCONN.primevideoDB[i].Dias_Vigentes,
      });
    } else if (2 <= diasFaltantes && diasFaltantes <= 7) {
      var message =
        SSCONN.primevideoDB[i].Nombre +
        ' se le ACABÓ su plan "' +
        SSCONN.primevideoDB[i].ESTADO +
        '"\n ID: ' +
        SSCONN.primevideoDB[i].id +
        " el " +
        SSCONN.primevideoDB[i].Fecha_Finalizacion;

      revisados.push({
        id: SSCONN.primevideoDB[i].id,
        message: message,
        vigencia: SSCONN.primevideoDB[i].Dias_Vigentes,
      });
    }
  }

  //===========================================================================================
  //===========================================================================================
  //===========================================================================================
  //===========================================================================================
  //===========================================================================================

  // sacar parejas de vigecia, id y dias vigentes para luego ordenar

  var orden = [];
  for (let index = 0; index < revisados.length; index++) {
    orden.push(revisados[index].vigencia);
  }

  var primordiales = [];
  for (let index = 0; index < orden.length; index++) {
    if (orden[index] < 31 && 28 <= orden[index]) {
      primordiales.push(orden[index]);
    }
  }

  //ordenar de menor a mayor
  orden.sort(function (a, b) {
    return b - a;
  });
  //ordenar de mayor a menor
  primordiales.sort(function (a, b) {
    return b - a;
  });

  // eliminacion de los primordiales de la array orden y obtencion de los datos secundarios
  var secundarios = orden.filter((el) => !primordiales.includes(el));

  //union de todos los datos
  var valoresOrdenados = primordiales.concat(secundarios);

  //reodenamiento de los revisados:

  var revisadosOrdenados = [];

  for (let i = 0; i < valoresOrdenados.length; i++) {
    for (let j = 0; j < revisados.length; j++) {
      if (valoresOrdenados[i] == revisados[j].vigencia) {
        revisadosOrdenados.push(revisados[j]);
      }
    }
  }

  //quitando duplicados, me dio flojera entenderlo

  revisadosOrdenados = revisadosOrdenados.reduce((acc, item) => {
    if (!acc.includes(item)) {
      acc.push(item);
    }
    return acc;
  }, []);

  if (revisadosOrdenados.length > 0) {
    document.getElementById("revisar-popup").hidden = false;
    turno = "no";
    var $mensageDialog = document.getElementById("dialogo-revisar");
    var $anteriorRevisar = document.getElementById("idanterior");
    var $siguienteRevisar = document.getElementById("idsiguiente");
    $anteriorRevisar.addEventListener("click", revisarTurnoA);
    $siguienteRevisar.addEventListener("click", revisarTurnoS);
    function revisarTurnoA() {
      if (turno == "no" && turno == 0) {
        $mensageDialog.innerHTML =
          revisadosOrdenados[revisadosOrdenados.length - 1].message;
        buttonDeslizar.href =
          "#u" + revisadosOrdenados[revisadosOrdenados.length - 1].id;
        buttonDeslizar.click();
        turno = revisadosOrdenados.length - 1;
      } else if (turno > 0 && turno <= revisadosOrdenados.length - 1) {
        $mensageDialog.innerHTML = revisadosOrdenados[turno - 1].message;
        buttonDeslizar.href = "#u" + revisadosOrdenados[turno - 1].id;
        buttonDeslizar.click();
        turno = turno - 1;
      }
    }
    function revisarTurnoS() {
      if (turno == "no") {
        $mensageDialog.innerHTML = revisadosOrdenados[0].message;
        buttonDeslizar.href = "#u" + revisadosOrdenados[0].id;
        buttonDeslizar.click();
        turno = 0;
      } else if (turno === revisadosOrdenados.length - 1) {
        document.getElementById("revisar-popup").hidden = true;
        turno = "no";
        buttonDeslizar.href = "#button-revisar";
        buttonDeslizar.click();
      } else if ((turno) => 0 && turno < revisadosOrdenados.length - 1) {
        $mensageDialog.innerHTML = revisadosOrdenados[turno + 1].message;
        buttonDeslizar.href = "#u" + revisadosOrdenados[turno + 1].id;
        buttonDeslizar.click();
        turno = turno + 1;
      }
    }
  }
};

function copiarContacto() {
  var textContact = document.querySelector(
    "#" + document.querySelector("#button-deslizar").href.split("#")[1]
  ).parentElement.parentNode.children[12].textContent;
  var textArea = document.createElement("textarea");
  if (!(textContact.length == 10)) {
    document.body.appendChild(textArea);
    textArea.value = textContact;
    textArea.select();
    document.execCommand("copy");
    textArea.outerHTML = "";
    alert("Contacto copiado");
  } else {
    document.body.appendChild(textArea);
    textArea.value = textContact;
    textArea.select();
    document.execCommand("copy");
    textArea.outerHTML = "";
    var nombre = document.querySelector(
      "#" + document.querySelector("#button-deslizar").href.split("#")[1]
    ).parentElement.parentNode.children[2].textContent;
    var aChat = document.getElementById("ir-a-chat");
    aChat.href =
      "whatsapp://send/?text=Hola " + nombre + "&phone=57" + textContact;
    aChat.click();
  }
}

document
  .getElementById("copy-contact")
  .addEventListener("click", copiarContacto);
document.getElementById("button-revisar").addEventListener("click", revisar);

function editarManual() {
  document.querySelector("[name=Fecha_Finalizacion]").readOnly = false;
  document.querySelector("[name=Fecha_Finalizacion]").focus();
}


              function extractDate(string) {
                if (isNaN(string.slice(-4))) return;
                var meses = [
                  "enero",
                  "febrero",
                  "marzo",
                  "abril",
                  "mayo",
                  "junio",
                  "julio",
                  "agosto",
                  "septiembre",
                  "octubre",
                  "noviembre",
                  "diciembre",
                ];
                var [dia, mes, año] = string.split(" ");

                var fecha = "YYYY-MM-DDThh:mm";
                fecha = fecha.replace("hh:mm", "00:00");
                fecha = fecha.replace("YYYY", año);
                if (meses.indexOf(mes) + 1 < 10) {
                  fecha = fecha.replace("MM", "0" + (meses.indexOf(mes) + 1));
                } else {
                  fecha = fecha.replace("MM", meses.indexOf(mes) + 1);
                }
                if (dia < 10) {
                  fecha = fecha.replace("DD", "0" + dia);
                } else {
                  fecha = fecha.replace("DD", dia);
                }
                return fecha;
              }
