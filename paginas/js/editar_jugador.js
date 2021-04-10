window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "jugador_editar_obtener_resp":
      handleObtenerJugador(data.data);
      break;
  }
});

window.onload = function () {
  let msg = {
    accion: "jugador_obtener_editar",
    data: {},
  };
  window.api.send("toMain", msg);
};

let formularioEditar = document.getElementById("formularioEditarJugador");

formularioEditar.addEventListener("submit", handleFormularioEditarSubmit);

function handleObtenerJugador(jugador) {
  let equipo = document.getElementById("equipo");
  let nombreJugadorEditar = document.getElementById("nombreJugadorEditar");
  let apellidoJugadorEditar = document.getElementById("apellidoJugadorEditar");
  let numeroJugadorEditar = document.getElementById("numeroJugadorEditar");

  equipo.value = jugador.equipo;
  nombreJugadorEditar.value = jugador.nombre;
  apellidoJugadorEditar.value = jugador.apellido;
  numeroJugadorEditar.value = jugador.numero;
}

function handleFormularioEditarSubmit(e) {
  e.preventDefault();
  let equipo = document.getElementById("equipo").value;
  let nombreJugadorEditar = document.getElementById("nombreJugadorEditar")
    .value;
  let apellidoJugadorEditar = document.getElementById("apellidoJugadorEditar")
    .value;
  let numeroJugadorEditar = document.getElementById("numeroJugadorEditar")
    .value;

  if (
    equipo === "" ||
    nombreJugadorEditar === "" ||
    apellidoJugadorEditar === "" ||
    numeroJugadorEditar === ""
  ) {
    alert("Los campos marcados con ** son requeridos");
  } else {
    let msg = {
      accion: "jugador_editar",
      data: {
        equipo: equipo,
        nombre: nombreJugadorEditar,
        apellido: apellidoJugadorEditar,
        numero: numeroJugadorEditar,
      },
    };
    window.api.send("toMain", msg);
  }
}
