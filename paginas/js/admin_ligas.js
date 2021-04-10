window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "ligas_agregar_resp":
      handleRespuestaAgregarLiga();
      break;
    case "ligas_eliminar_resp":
      handleRespuestaEliminarLiga();
      break;
    case "ligas_obtener_resp":
      handlePoblarListaLigas(data.data);
      break;
    case "equipo_editar_resp":
      handleRespuestaEditarLiga();
      break;
  }
});

window.onload = function () {
  let height = window.innerHeight;
  let contenedor = document.getElementById("contenedorListaLigas");
  contenedor.style.overflowY = "scroll";
  contenedor.style.height = height - 70 + "px";
  let msg = {
    accion: "ligas_obtener",
    data: { tipo: "liga" },
  };
  window.api.send("toMain", msg);
};

let formularioAgregar = document.getElementById("formularioAgregarLiga");

formularioAgregar.addEventListener("submit", handleFormularioAgregarSubmit);

let btnSeleccionarLogoLiga = document.getElementById(
  "seleccionarLogoLigaAgregar"
);
btnSeleccionarLogoLiga.addEventListener("click", handleBtnSeleccionarLogoLiga);

let btnEliminarSeleccionLogoLigaAgregar = document.getElementById(
  "eliminarSeleccionLogoLigaAgregar"
);

btnEliminarSeleccionLogoLigaAgregar.addEventListener(
  "click",
  handleBtnEliminarSeleccionLogoLigaAgregar
);

function handleFormularioAgregarSubmit(e) {
  e.preventDefault();
  let nombre = document.getElementById("nombreLigaAgregar").value;

  if (nombre && nombre !== "") {
    let msg = {
      accion: "ligas_agregar",
      data: {
        nombre: nombre,
      },
    };
    window.api.send("toMain", msg);
  }
}

function handleRespuestaAgregarLiga() {
  let nombre = document.getElementById("nombreLigaAgregar");
  nombre.value = "";
  alert("Liga agregada!");
}

function handleRespuestaEliminarLiga() {
  alert("Liga eliminada!");
}

function handlePoblarListaLigas(ligas) {
  let lista = document.getElementById("listaLigas");
  lista.innerHTML = "";
  let cuentaAgregados = document.getElementById("cuentaLigasAgregados");
  cuentaAgregados.innerText = "Total: " + ligas.length;
  ligas.forEach((equipo) => {
    var li = document.createElement("li");
    li.classList =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `${equipo.nombre}
      <div> <span style="cursor:pointer" class="badge badge-info badge-pill EditarLiga" data-id="${equipo._id}">editar</span>
      <span style="cursor:pointer" class="badge badge-danger badge-pill EliminarLiga" data-id="${equipo._id}">eliminar</span></div>`;
    lista.appendChild(li);
  });

  agregarEventosClase();
}

function agregarEventosClase() {
  let btnEditar = document.getElementsByClassName("EditarLiga");
  let btnEliminar = document.getElementsByClassName("EliminarLiga");

  Array.from(btnEditar).forEach((editar) => {
    editar.addEventListener("click", handleEditarLiga);
  });

  Array.from(btnEliminar).forEach((eliminar) => {
    eliminar.addEventListener("click", handleEliminarLiga);
  });
}

function handleEditarLiga(ev) {
  let id = ev.srcElement.dataset.id;
  let msg = {
    accion: "liga_edit_window",
    data: { id },
  };
  window.api.send("toMain", msg);
}

function handleEliminarLiga(ev) {
  let liga = ev.srcElement.dataset.id;
  let msg = {
    accion: "liga_eliminar",
    data: {
      id: liga,
    },
  };
  window.api.send("toMain", msg);
}

function handleRespuestaEditarLiga() {
  alert("Liga se ha editado con exito");
}
