let equipos;
let juego = {
  idLiga: null,
  visitanteId: null,
  homeId: null,
  visitante: null,
  home: null,
  fecha: null,
  estado: "activo",
  puntajeVisitante: 0,
  faltasVisitante: 0,
  tiempoFueraVisitante: 0,
  puntajeHome: 0,
  faltasHome: 0,
  tiempoFueraHome: 0,
  periodoActual: 1,
  overtimeActual: 0,
  totalPeriodos: null,
  duracionPeriodo: null,
  duracionOvertime: null,
  enTiempoExtra: false,
  logoVisitante: null,
  logoHome: null,
  tiempoCouch: null,
  descansoPeriodo: null,
  descansoMedioTiempo: null,
  homePosicionPantalla: "derecha",
  visitantePosicionPantalla: "izquierda",
  periodoConcluido: 0,
  totalFaltasVisitante: 0,
  totalFaltasHome: 0,
  tipoNotacion: "general",
};

let btnIniciarPartido = document.getElementById("btnIniciarPartido");
btnIniciarPartido.addEventListener("click", handleBtnIniciarPartido);

let seleccionadorDDLLiga = document.getElementById("seleccionadorLigaJuego");
seleccionadorDDLLiga.addEventListener("change", handleSeleccionadorLiga);

let tipoNotacionNuevoPartido = document.getElementById(
  "tipoNotacionNuevoPartido"
);
tipoNotacionNuevoPartido.addEventListener(
  "change",
  handleTipoNotacionNuevoPartido
);

window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "equipos_agregar_resp":
      handleRespuestaAgregarEquipo();
      break;
    case "equipos_eliminar_resp":
      handleRespuestaEliminarEquipo();
      break;
    case "equipos_obtener_resp":
      handlePoblarListaEquipos(data.data);
      equipos = data.data;
      break;
    case "ligas_obtener_resp":
      handlePoblarDDLLigas(data.data);
      break;
  }
});

window.onload = function () {
  let height = window.innerHeight;
  let contenedores = document.getElementsByClassName(
    "contenedorListaEquiposJuego"
  );
  Array.from(contenedores).forEach((cont) => {
    cont.style.overflowY = "scroll";
    cont.style.height = height - 250 + "px";
  });

  let msg2 = {
    accion: "ligas_obtener",
    data: { tipo: "juego" },
  };
  window.api.send("toMain", msg2);
};

function handlePoblarListaEquipos(equipos) {
  let listaHome = document.getElementById("listaEquiposHome");
  let listaVisitante = document.getElementById("listaEquiposVisitante");
  listaHome.innerHTML = "";
  listaVisitante.innerHTML = "";
  equipos.forEach((equipo) => {
    var liHome = document.createElement("li");
    var liVisitante = document.createElement("li");
    liHome.id = `EquipoHome-${equipo._id}`;
    liVisitante.id = `EquipoVisitante-${equipo._id}`;
    liHome.classList =
      "list-group-item d-flex justify-content-between align-items-center EquipoHome";
    liHome.innerHTML = `<span style="width:100%;cursor:pointer" class="SeleccionarEquipo" data-tipo="home" data-id="EquipoHome-${equipo._id}" data-nombre="${equipo.nombre}">${equipo.nombre}</span>
      `;
    liVisitante.classList =
      "list-group-item d-flex justify-content-between align-items-center EquipoVisitante";
    liVisitante.innerHTML = `<span style="width:100%;cursor:pointer" class="SeleccionarEquipo" data-tipo="visitante" data-id="EquipoVisitante-${equipo._id}" data-nombre="${equipo.nombre}">${equipo.nombre}</span>
      `;
    listaHome.appendChild(liHome);
    listaVisitante.appendChild(liVisitante);
  });

  agregarEventosClase();
}

function agregarEventosClase() {
  let btnSeleccionar = document.getElementsByClassName("SeleccionarEquipo");
  Array.from(btnSeleccionar).forEach((editar) => {
    editar.addEventListener("click", handleSeleccionarEquipo);
  });
}

function handleSeleccionarEquipo(ev) {
  let tipo = ev.srcElement.dataset.tipo;
  let id = ev.srcElement.dataset.id;
  let nombre = ev.srcElement.dataset.nombre;
  let idContrario = "";
  if (tipo === "home") {
    idContrario = `EquipoVisitante-${id.split("-")[1]}`;
  } else {
    idContrario = `EquipoHome-${id.split("-")[1]}`;
  }

  if (tipo === "home") {
    Array.from(document.getElementsByClassName("EquipoHome")).forEach(
      (home) => {
        home.classList.remove("active");
      }
    );
    Array.from(document.getElementsByClassName("EquipoVisitante")).forEach(
      (home) => {
        home.classList.remove("disabled");
      }
    );
  } else {
    Array.from(document.getElementsByClassName("EquipoVisitante")).forEach(
      (home) => {
        home.classList.remove("active");
      }
    );
    Array.from(document.getElementsByClassName("EquipoHome")).forEach(
      (home) => {
        home.classList.remove("disabled");
      }
    );
  }

  let selectedItem = document.getElementById(id);
  let itemContrario = document.getElementById(idContrario);
  selectedItem.classList.add("active");
  itemContrario.classList.add("disabled");

  if (tipo === "home") {
    juego.homeId = id.split("-")[1];
    let equipoHome = equipos.find((x) => x._id === juego.homeId);
    juego.home = nombre;
    juego.logoHome = equipoHome !== null ? equipoHome.logo : "";
  } else {
    juego.visitanteId = id.split("-")[1];
    let equipoVisitante = equipos.find((x) => x._id === juego.visitanteId);
    juego.visitante = nombre;
    juego.logoVisitante = equipoVisitante !== null ? equipoVisitante.logo : "";
  }
  // let btnAgregar = document.getElementById("btnIniciarPartido");
  // if (juego.homeId !== null && juego.visitanteId !== null) {
  //   btnAgregar.style.display = "block-inline";
  // } else {
  //   btnAgregar.style.display = "none";
  // }
}

function handleBtnIniciarPartido() {
  let horaInicio = document.getElementById("horaInicio").value;
  let totalPeriodos = document.getElementById("totalPeriodosNuevoPartido")
    .value;
  let duracionPeriodos = document.getElementById("duracionPeriodoNuevoPartido")
    .value;
  let duracionOvertime = document.getElementById("duracionOvertimeNuevoPartido")
    .value;
  let tiempoCouch = document.getElementById("tiempoCouchNuevoPartido").value;
  let descansoPeriodo = document.getElementById("descansoPeriodoNuevoPartido")
    .value;
  let descansoMedioTiempo = document.getElementById(
    "descansoMedioTiempoNuevoPartido"
  ).value;
  if (
    totalPeriodos === "" ||
    duracionPeriodos === "" ||
    duracionOvertime === "" ||
    tiempoCouch === "" ||
    descansoPeriodo === "" ||
    descansoMedioTiempo === ""
  ) {
    alert("Los campos de configuración general son obligatorios");
  } else {
    juego.fecha = horaInicio;
    juego.totalPeriodos = parseInt(totalPeriodos, 10);
    juego.duracionPeriodo = parseInt(duracionPeriodos, 10);

    juego.duracionOvertime = parseInt(duracionOvertime, 10);
    juego.tiempoCouch = parseInt(tiempoCouch, 10);
    juego.descansoPeriodo = parseInt(descansoPeriodo, 10);
    juego.descansoMedioTiempo = parseInt(descansoMedioTiempo, 10);
    let msg = {
      accion: "juego_agregar",
      data: juego,
    };
    window.api.send("toMain", msg);
  }
}

function handleSeleccionadorLiga(e) {
  idLiga = e.target.options[e.target.options.selectedIndex].value;
  if (idLiga !== "") {
    juego.idLiga = idLiga;
  }
  let msg = {
    accion: "equipos_obtener_juego",
    data: { liga: idLiga, ventana: "juego" },
  };
  window.api.send("toMain", msg);
}

function handlePoblarDDLLigas(ligas) {
  let seleccionador = document.getElementById("seleccionadorLigaJuego");
  seleccionador.innerHTML = "";
  let items = '<option value="">-- Seleccione una liga</option>';
  ligas.forEach((liga) => {
    items += `<option value="${liga._id}">${liga.nombre}</option>`;
  });

  seleccionador.innerHTML = items;
}

function handleTipoNotacionNuevoPartido(e) {
  tipoNotacion = e.target.options[e.target.options.selectedIndex].value;
  if (tipoNotacion !== "") {
    juego.tipoNotacion = tipoNotacion;
  }
}
