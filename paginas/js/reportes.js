let query = {
  idLiga: null,
  homeId: null,
  visitanteId: null,
  fechaInicio: null,
  fechaFinal: null,
};

let resultado = [];

window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "ligas_obtener_resp":
      handlePoblarDDLLigas(data.data);
      break;
    case "equipos_obtener_resp":
      handlePoblarDDLEquipos(data.data);
      break;
    case "buscar_juegos_resp":
      handleBuscarJuegos(data.data);
      break;
    case "guardar_reporte_resp":
      contenedorReporte = document.getElementById("contenedorReporte");
      contenedorReporte.style.overflowY = "scroll";
      alert(data.data);
      break;
    case "juego_eliminar_resp":
      alert("Juego eliminado");
      handleBtnBuscar();
      break;
  }
});

window.onload = function () {
  let msg = {
    accion: "ligas_obtener",
    data: { tipo: "reporte" },
  };
  window.api.send("toMain", msg);

  let height = window.innerHeight;
  let contenedorReporte = document.getElementById("contenedorReporte");
  contenedorReporte.style.height = height - 100 + "px";
};

let seleccionadorDDLLiga = document.getElementById("seleccionadorLiga");
seleccionadorDDLLiga.addEventListener("change", handleSeleccionadorLiga);

let seleccionadorHomeclub = document.getElementById("seleccionadorHomeclub");
seleccionadorHomeclub.addEventListener("change", handleSeleccionadorHomeclub);

let seleccionadorVisitante = document.getElementById("seleccionadorVisitante");
seleccionadorVisitante.addEventListener("change", handleSeleccionadorVisitante);

let btnBuscar = document.getElementById("btnBuscar");
btnBuscar.addEventListener("click", handleBtnBuscar);

let btnGuardar = document.getElementById("btnGuardar");
btnGuardar.addEventListener("click", handleBtnGuardar);

function handlePoblarDDLLigas(ligas) {
  let seleccionador = document.getElementById("seleccionadorLiga");
  seleccionador.innerHTML = "";
  let items = '<option value="">-- Seleccione una liga</option>';
  ligas.forEach((liga) => {
    items += `<option value="${liga._id}">${liga.nombre}</option>`;
  });

  seleccionador.innerHTML = items;
}

function handleSeleccionadorLiga(e) {
  idLiga = e.target.options[e.target.options.selectedIndex].value;
  query.idLiga = idLiga;

  let msg = {
    accion: "equipos_obtener_juego",
    data: { liga: idLiga, ventana: "reporte" },
  };
  window.api.send("toMain", msg);
  let contenedorBtnBuscar = document.getElementById("contenedorBtnBuscar");
  contenedorBtnBuscar.style.display = "flex";
}

function handlePoblarDDLEquipos(equipos) {
  let listaHome = document.getElementById("seleccionadorHomeclub");
  let listaVisitante = document.getElementById("seleccionadorVisitante");
  listaHome.innerHTML = "";
  listaVisitante.innerHTML = "";
  let itemsHome = '<option value="">-- Todos los equipos</option>';
  let itemsVisitante = '<option value="">-- Todos los equipos</option>';
  equipos.forEach((equipo) => {
    itemsHome += `<option value="${equipo._id}">${equipo.nombre}</option>`;
    itemsVisitante += `<option value="${equipo._id}">${equipo.nombre}</option>`;
  });
  listaHome.innerHTML = itemsHome;
  listaVisitante.innerHTML = itemsVisitante;

  Array.from(document.getElementsByClassName("NombreEquipos")).forEach(
    (row) => {
      row.style.display = "flex";
    }
  );
}

function handleSeleccionadorHomeclub(e) {
  idHome = e.target.options[e.target.options.selectedIndex].value;
  query.homeId = idHome;

  let op = document
    .getElementById("seleccionadorVisitante")
    .getElementsByTagName("option");
  for (let i = 0; i < op.length; i++) {
    // lowercase comparison for case-insensitivity
    op[i].value.toLowerCase() == idHome
      ? (op[i].disabled = true)
      : (op[i].disabled = false);
  }
}

function handleSeleccionadorVisitante(e) {
  idVisitante = e.target.options[e.target.options.selectedIndex].value;
  query.visitanteId = idVisitante;

  let op = document
    .getElementById("seleccionadorHomeclub")
    .getElementsByTagName("option");
  for (let i = 0; i < op.length; i++) {
    // lowercase comparison for case-insensitivity
    op[i].value.toLowerCase() == idVisitante
      ? (op[i].disabled = true)
      : (op[i].disabled = false);
  }
}

function handleBtnBuscar() {
  let fechaInicial = document.getElementById("fechaInicial").value;
  let fechaFinal = document.getElementById("fechaFinal").value;

  if (fechaInicial) {
    query.fechaInicio = fechaInicial;
  }

  if (fechaFinal) {
    query.fechaFinal = fechaFinal;
  }

  let msg = {
    accion: "buscar_juegos",
    data: query,
  };
  window.api.send("toMain", msg);
}

function handleBuscarJuegos(juegos) {
  let bodyReporte = document.getElementById("bodyReporte");
  bodyReporte.innerHTML = "";
  let data = "";
  if (juegos.length > 0) {
    resultado = [];
    juegos.forEach((juego) => {
      let obj = {
        id: juego._id,
        fecha: juego.fechaTexto,
        home: juego.home,
        visitante: juego.visitante,
        puntajeHome: juego.puntajeHome,
        puntajeVisitante: juego.puntajeVisitante,
        faltasHome: juego.totalFaltasHome,
        faltasVisitante: juego.totalFaltasVisitante,
      };
      data += `<tr><td style="width: 14%;"><small>${obj.fecha}</small></td><td style="width: 14%;"><small>${obj.home}</small></td><td style="width: 14%;"><small>${obj.visitante}</small></td><td style="width: 12%;"><small>${obj.puntajeHome}</small></td><td style="width: 12%;"><small>${obj.puntajeVisitante}</small></td><td style="width: 14%;"><small>${obj.faltasHome}</small></td><td style="width: 14%;"><small>${obj.faltasVisitante}</small></td><td style="width: 6%;"><span class="badge badge-danger EliminarJuego" data-id="${obj.id}">X</span></td></tr>`;
      resultado.push(obj);
    });
    bodyReporte.innerHTML = data;

    let contenedorBtnGuardar = document.getElementById("contenedorBtnGuardar");
    contenedorBtnGuardar.style.display = "flex";

    agregarEventosClase();
  }
}

function handleBtnGuardar() {
  contenedorReporte = document.getElementById("contenedorReporte");
  contenedorReporte.style.overflowY = "visible";
  let msg = {
    accion: "guardar_reporte",
    data: {},
  };
  window.api.send("toMain", msg);
}

function agregarEventosClase() {
  let btnEliminarJuego = document.getElementsByClassName("EliminarJuego");
  Array.from(btnEliminarJuego).forEach((eliminar) => {
    eliminar.addEventListener("click", handleEliminarJuego);
  });
}

function handleEliminarJuego(ev) {
  let juego = ev.srcElement.dataset.id;
  console.log(juego);
  let msg = {
    accion: "juego_eliminar",
    data: {
      id: juego,
    },
  };
  window.api.send("toMain", msg);
}
