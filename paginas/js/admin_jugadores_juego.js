let totalSeleccionado = 0;
let totalPermitido = 5;
let modo;
let listaJugadoresSeleccionados = [];

window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "no_jugadores_equipo":
      alert(
        "No existen jugadores para mostrar. Por favor registre la lista de jugadores en el apartado equipos"
      );
      break;
    case "no_jugadores_completo":
      alert(
        "El equipo no cuenta con suficiente jugadores. Se requiere al menos 5 jugadores para seleccionar"
      );
      break;
    case "jugadores_disponibles_resp":
      handleJugadoresDisponiblesObtener(data.data);
      break;
  }
});

window.onload = function () {
  let height = window.innerHeight;
  Array.from(
    document.getElementsByClassName("contenedorListaJugadores")
  ).forEach((c) => {
    c.style.overflowY = "scroll";
    c.style.height = height - 150 + "px";
  });

  let msg = {
    accion: "jugadores_obtener_disponible",
    data: true,
  };
  window.api.send("toMain", msg);
};

function handleJugadoresDisponiblesObtener(data) {
  document.title = `Jugadores Disponibles ${
    data.modo === "sustitucion"
      ? "para sustitución."
      : data.modo === "retiro"
      ? "para sustitución."
      : ""
  } ${data.nombreEquipo}`;
  totalPermitido = data.modo === "apertura" ? 5 : 1;
  modo = data.modo;
  // Array.from(document.getElementsByClassName("nombreEquipo")).forEach((x) => {
  //   x.innerText = data.nombreEquipo;
  // });

  let lista = document.getElementById("listaJugadores");
  lista.innerHTML = "";
  let cuentaAgregados = document.getElementById("cuentaJugadoresDisponibles");
  cuentaAgregados.innerText = "Total: " + data.lista.length;
  data.lista.forEach((jugador) => {
    var li = document.createElement("li");
    li.id = `disponible-${jugador._id}`;
    li.classList =
      "list-group-item d-flex justify-content-between align-items-center list-group-item-warning";
    li.innerHTML = `<div class="SeleccionJugadorDisponible" style="width:100%;cursor:pointer;" data-id="${jugador._id}" data-numero="${jugador.numero}" data-nombre="${jugador.nombre} ${jugador.apellido}">${jugador.numero}- ${jugador.nombre} ${jugador.apellido}</div>`;
    lista.appendChild(li);

    agregarEventoSeleccionJugadorDisponible();
  });
}

function agregarEventoSeleccionJugadorDisponible() {
  Array.from(
    document.getElementsByClassName("SeleccionJugadorDisponible")
  ).forEach((e) => {
    e.addEventListener("click", handleSeleccionJugadorDisponible);
  });
}

function agregarEventoSeleccionJugadorSeleccionado() {
  Array.from(
    document.getElementsByClassName("SeleccionJugadorSeleccionado")
  ).forEach((e) => {
    e.addEventListener("click", handleSeleccionJugadorSeleccionado);
  });
}

function handleSeleccionJugadorDisponible(e) {
  e.preventDefault();
  if (totalSeleccionado < totalPermitido) {
    let id = e.srcElement.dataset.id;
    let nombre = e.srcElement.dataset.nombre;
    let numero = e.srcElement.dataset.numero;
    let listaDisponibles = document.getElementById("listaJugadores");
    let listaSeleccionados = document.getElementById(
      "listaJugadoresSeleccionados"
    );

    var li = document.createElement("li");
    li.id = `seleccionado-${id}`;
    li.classList =
      "list-group-item d-flex justify-content-between align-items-center list-group-item-success";
    li.innerHTML = `<div class="SeleccionJugadorSeleccionado" style="width:100%;cursor:pointer;" data-id="${id}" data-numero="${numero}" data-nombre="${nombre}">${numero}- ${nombre}</div>`;
    listaSeleccionados.appendChild(li);
    agregarEventoSeleccionJugadorSeleccionado();
    let elementToRemove = document.getElementById("disponible-" + id);
    listaDisponibles.removeChild(elementToRemove);
    listaJugadoresSeleccionados.push({
      idJugador: id,
      numeroJugador: numero,
      nombreJugador: nombre,
    });
    totalSeleccionado++;
    handleRowAcciones();
  }
}

function handleSeleccionJugadorSeleccionado(e) {
  e.preventDefault();
  let id = e.srcElement.dataset.id;
  let nombre = e.srcElement.dataset.nombre;
  let numero = e.srcElement.dataset.numero;
  let listaDisponibles = document.getElementById("listaJugadores");
  let listaSeleccionados = document.getElementById(
    "listaJugadoresSeleccionados"
  );

  var li = document.createElement("li");
  li.id = `disponible-${id}`;
  li.classList =
    "list-group-item d-flex justify-content-between list-group-item-warning align-items-center";
  li.innerHTML = `<div class="SeleccionJugadorDisponible" style="width:100%;cursor:pointer;" data-id="${id}" data-numero="${numero}" data-nombre="${nombre}">${numero}- ${nombre}</div>`;
  listaDisponibles.appendChild(li);
  agregarEventoSeleccionJugadorDisponible();
  let elementToRemove = document.getElementById("seleccionado-" + id);
  listaSeleccionados.removeChild(elementToRemove);
  listaJugadoresSeleccionados = listaJugadoresSeleccionados.filter(
    (x) => x.id !== id
  );
  totalSeleccionado--;

  handleRowAcciones();
}

function handleRowAcciones() {
  let elemento;
  let mostrar = false;

  if (modo === "apertura" && totalSeleccionado === totalPermitido) {
    elemento = document.getElementById("btnAgregarListaJugadores");
    mostrar = true;
  } else if (modo === "sustitucion" && totalSeleccionado === totalPermitido) {
    elemento = document.getElementById("btnSustituirJugador");
    mostrar = true;
  } else if (modo === "retiro" && totalSeleccionado === totalPermitido) {
    elemento = document.getElementById("btnRetirarJugador");
    mostrar = true;
  }

  console.log("modo", modo);
  console.log("totalSeleccionado", totalSeleccionado);
  console.log("totalPermitido", totalPermitido);

  if (mostrar === true) {
    elemento.style.display = "flex";
  }
}

let btnAgregarListaJugadores = document.getElementById(
  "btnAgregarListaJugadores"
);
btnAgregarListaJugadores.addEventListener(
  "click",
  handleBtnAgregarListaJugadores
);

function handleBtnAgregarListaJugadores() {
  let msg = {
    accion: "jugadores_agregar_lista_juego",
    data: listaJugadoresSeleccionados,
  };
  window.api.send("toMain", msg);
}

let btnSustituirJugador = document.getElementById("btnSustituirJugador");
btnSustituirJugador.addEventListener("click", handleBtnSustituirJugador);

function handleBtnSustituirJugador() {
  let msg = {
    accion: "jugador_sustituir_juego",
    data: listaJugadoresSeleccionados[0],
  };
  window.api.send("toMain", msg);
}

let btnRetirarJugador = document.getElementById("btnRetirarJugador");
btnRetirarJugador.addEventListener("click", handleBtnRetirarJugador);

function handleBtnRetirarJugador() {
  let msg = {
    accion: "jugador_retirar_juego",
    data: listaJugadoresSeleccionados[0],
  };
  window.api.send("toMain", msg);
}
