window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "jugadores_equipo_obtener_resp":
      handleJugadoresEquipoObtener(data.data);
      break;
    case "jugador_agregar_resp":
      alert("Jugador agregado con éxito");
      break;
    case "jugador_eliminar_resp":
      handleRespuestaEliminarJugador();
      break;
    case "jugador_editar_resp":
      handleRespuestaEditarJugador();
      break;
  }
});

window.onload = function () {
  let height = window.innerHeight;
  let contenedor = document.getElementById("contenedorListaJugadores");
  contenedor.style.overflowY = "scroll";
  contenedor.style.height = height - 70 + "px";
  let msg = {
    accion: "jugadores_equipo_obtener",
    data: {},
  };
  window.api.send("toMain", msg);
};

let formularioAgregarJugador = document.getElementById(
  "formularioAgregarJugador"
);

formularioAgregarJugador.addEventListener(
  "submit",
  handleFormularioAgregarJugador
);

function handleJugadoresEquipoObtener(data) {
  document.title = `Jugadores ${data.nombreEquipo}`;
  let equipo = document.getElementById("equipo");
  equipo.value = data.idEquipo;

  Array.from(document.getElementsByClassName("nombreEquipo")).forEach((x) => {
    x.innerText = data.nombreEquipo;
  });

  let lista = document.getElementById("listaJugadores");
  lista.innerHTML = "";
  let cuentaAgregados = document.getElementById("cuentaJugadoresAgregados");
  cuentaAgregados.innerText = "Total: " + data.jugadores.length;
  data.jugadores.forEach((jugador) => {
    var li = document.createElement("li");
    li.classList =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `${jugador.numero}.- ${jugador.nombre} ${jugador.apellido}
    <div><span style="cursor:pointer" class="badge badge-info badge-pill EditarJugador" data-id="${jugador._id}">editar</span>
    <span style="cursor:pointer" class="badge badge-danger badge-pill EliminarJugador" data-id="${jugador._id}">eliminar</span></div>`;
    lista.appendChild(li);
  });

  agregarEventosClase();
}

function handleFormularioAgregarJugador() {
  let equipo = document.getElementById("equipo").value;
  let nombreJugadorAgregar = document.getElementById("nombreJugadorAgregar")
    .value;
  let apellidoJugadorAgregar = document.getElementById("apellidoJugadorAgregar")
    .value;
  let numeroJugadorAgregar = document.getElementById("numeroJugadorAgregar")
    .value;

  if (
    equipo === "" ||
    nombreJugadorAgregar === "" ||
    apellidoJugadorAgregar === "" ||
    numeroJugadorAgregar === ""
  ) {
    alert("Los campos marcados con ** son requeridos");
  } else {
    let msg = {
      accion: "jugador_agregar",
      data: {
        equipo: equipo,
        nombre: nombreJugadorAgregar,
        apellido: apellidoJugadorAgregar,
        numero: numeroJugadorAgregar,
      },
    };
    window.api.send("toMain", msg);
  }
}

function agregarEventosClase() {
  let btnEditar = document.getElementsByClassName("EditarJugador");
  let btnEliminar = document.getElementsByClassName("EliminarJugador");

  Array.from(btnEditar).forEach((editar) => {
    editar.addEventListener("click", handleEditarJugador);
  });

  Array.from(btnEliminar).forEach((eliminar) => {
    eliminar.addEventListener("click", handleEliminarJugador);
  });
}

function handleEditarJugador(ev) {
  let id = ev.srcElement.dataset.id;
  let msg = {
    accion: "jugador_edit_window",
    data: { id },
  };
  window.api.send("toMain", msg);
}

function handleEliminarJugador(ev) {
  let jugador = ev.srcElement.dataset.id;
  let msg = {
    accion: "jugador_eliminar",
    data: {
      id: jugador,
    },
  };
  window.api.send("toMain", msg);
}

function handleRespuestaEditarJugador() {
  alert("Jugador se ha editado con exito");
}

function handleRespuestaEliminarJugador() {
  alert("Jugador eliminado!");
}
