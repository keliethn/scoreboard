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
      break;
    case "equipo_editar_resp":
      handleRespuestaEditarEquipo();
      break;

    case "logo_obtener_resp":
      handleLogoObtener(data.data);
      break;
    case "ligas_obtener_resp":
      handlePoblarDDLLigas(data.data);
      break;
  }
});

window.onload = function () {
  let height = window.innerHeight;
  let contenedor = document.getElementById("contenedorListaEquipos");
  contenedor.style.overflowY = "scroll";
  contenedor.style.height = height - 70 + "px";
  let msg = {
    accion: "equipos_obtener",
    data: {},
  };
  window.api.send("toMain", msg);

  let msg2 = {
    accion: "ligas_obtener",
    data: { tipo: "equipo" },
  };
  window.api.send("toMain", msg2);
};

let formularioAgregar = document.getElementById("formularioAgregarEquipo");

formularioAgregar.addEventListener("submit", handleFormularioAgregarSubmit);

let btnSeleccionarLogoEquipo = document.getElementById(
  "seleccionarLogoEquipoAgregar"
);
btnSeleccionarLogoEquipo.addEventListener(
  "click",
  handleBtnSeleccionarLogoEquipo
);

let btnEliminarSeleccionLogoEquipoAgregar = document.getElementById(
  "eliminarSeleccionLogoEquipoAgregar"
);
btnEliminarSeleccionLogoEquipoAgregar.addEventListener(
  "click",
  handleBtnEliminarSeleccionLogoEquipoAgregar
);

let seleccionadorDDLLiga = document.getElementById("seleccionadorLigaEquipo");
seleccionadorDDLLiga.addEventListener("change", handleSeleccionadorLiga);

function handleFormularioAgregarSubmit(e) {
  e.preventDefault();
  let nombre = document.getElementById("nombreEquipoAgregar").value;
  let logo = document.getElementById("logoEquipoAgregar").value;
  let liga = document.getElementById("liga").value;

  if (nombre && nombre !== "") {
    let msg = {
      accion: "equipos_agregar",
      data: {
        nombre: nombre,
        logo: logo,
        liga: liga,
      },
    };
    window.api.send("toMain", msg);
  }
}

function handleRespuestaAgregarEquipo() {
  let nombre = document.getElementById("nombreEquipoAgregar");
  let logoHidden = document.getElementById("logoEquipoAgregar");
  let logoImg = document.getElementById("logoEquipo");
  let btnEliminarSeleccionLogoEquipoAgregar = document.getElementById(
    "eliminarSeleccionLogoEquipoAgregar"
  );
  nombre.value = "";
  logoHidden.value = "";
  logoImg.src = "";
  btnEliminarSeleccionLogoEquipoAgregar.style.display = "none";
  alert("Equipo agregado!");
  nombre.focus();
}

function handleRespuestaEliminarEquipo() {
  alert("Equipo eliminado!");
}

function handlePoblarListaEquipos(equipos) {
  let lista = document.getElementById("listaEquipos");
  lista.innerHTML = "";
  let cuentaAgregados = document.getElementById("cuentaEquiposAgregados");
  cuentaAgregados.innerText = "Total: " + equipos.length;
  equipos.forEach((equipo) => {
    var li = document.createElement("li");
    li.classList =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `${equipo.nombre}
    <div><span style="cursor:pointer" class="badge badge-success badge-pill AdminJugadoresEquipo" data-id="${equipo._id}">Jugadores <span>(${equipo.totalJugadores})</span></span> <span style="cursor:pointer" class="badge badge-info badge-pill EditarEquipo" data-id="${equipo._id}">editar</span>
    <span style="cursor:pointer" class="badge badge-danger badge-pill EliminarEquipo" data-id="${equipo._id}">eliminar</span></div>`;
    lista.appendChild(li);
  });

  agregarEventosClase();
}

function handlePoblarDDLLigas(ligas) {
  let seleccionador = document.getElementById("seleccionadorLigaEquipo");
  seleccionador.innerHTML = "";
  let items = '<option value="">-- Seleccione una liga</option>';
  ligas.forEach((liga) => {
    items += `<option value="${liga._id}">${liga.nombre}</option>`;
  });

  seleccionador.innerHTML = items;
}

function agregarEventosClase() {
  let btnJugadores = document.getElementsByClassName("AdminJugadoresEquipo");
  let btnEditar = document.getElementsByClassName("EditarEquipo");
  let btnEliminar = document.getElementsByClassName("EliminarEquipo");

  Array.from(btnJugadores).forEach((jugadores) => {
    jugadores.addEventListener("click", handleAdminJugadores);
  });
  Array.from(btnEditar).forEach((editar) => {
    editar.addEventListener("click", handleEditarEquipo);
  });

  Array.from(btnEliminar).forEach((eliminar) => {
    eliminar.addEventListener("click", handleEliminarEquipo);
  });
}

function handleAdminJugadores(ev) {
  let id = ev.srcElement.dataset.id;
  let msg = {
    accion: "equipo_jugadores_window",
    data: { id },
  };
  window.api.send("toMain", msg);
}

function handleEditarEquipo(ev) {
  let id = ev.srcElement.dataset.id;
  let msg = {
    accion: "equipo_edit_window",
    data: { id },
  };
  window.api.send("toMain", msg);
}

function handleEliminarEquipo(ev) {
  let equipo = ev.srcElement.dataset.id;
  let msg = {
    accion: "equipo_eliminar",
    data: {
      id: equipo,
    },
  };
  window.api.send("toMain", msg);
}

function handleBtnSeleccionarLogoEquipo(ev) {
  ev.preventDefault();
  let msg = {
    accion: "seleccionar_logo_dialogo",
    data: {
      tipo: "admin",
    },
  };
  window.api.send("toMain", msg);
}

function handleLogoObtener(path) {
  let logo = path;
  let logoHidden = document.getElementById("logoEquipoAgregar");
  let logoImg = document.getElementById("logoEquipo");
  let btnEliminarSeleccionLogoEquipoAgregar = document.getElementById(
    "eliminarSeleccionLogoEquipoAgregar"
  );
  logoImg.src = logo;
  logoHidden.value = logo;
  btnEliminarSeleccionLogoEquipoAgregar.style.display = "inline-block";
}

function handleBtnEliminarSeleccionLogoEquipoAgregar(e) {
  e.preventDefault();
  let logoHidden = document.getElementById("logoEquipoAgregar");
  let logoImg = document.getElementById("logoEquipo");
  logoImg.src = "";
  logoHidden.value = "";
  this.style.display = "none";
}

function handleRespuestaEditarEquipo() {
  alert("Equipo se ha editado con exito");
}

function handleSeleccionadorLiga(e) {
  idLiga = e.target.options[e.target.options.selectedIndex].value;

  let hiddenLiga = document.getElementById("liga");
  hiddenLiga.value = idLiga;
}
