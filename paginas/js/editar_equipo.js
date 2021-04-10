window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "equipo_editar_obtener_resp":
      handleObtenerEquipo(data.data);
      break;
    case "logo_obtener_resp":
      handleLogoObtener(data.data);
      break;
  }
});

window.onload = function () {
  let msg = {
    accion: "equipo_obtener_editar",
    data: {},
  };
  window.api.send("toMain", msg);
};

let formularioEditar = document.getElementById("formularioEditarEquipo");

formularioEditar.addEventListener("submit", handleFormularioEditarSubmit);

let btnSeleccionarLogoEquipo = document.getElementById(
  "seleccionarLogoEquipoEditar"
);

btnSeleccionarLogoEquipo.addEventListener(
  "click",
  handleBtnSeleccionarLogoEquipo
);

let btnEliminarSeleccionLogoEquipoEditar = document.getElementById(
  "eliminarSeleccionLogoEquipoEditar"
);

btnEliminarSeleccionLogoEquipoEditar.addEventListener(
  "click",
  handleBtnEliminarSeleccionLogoEquipoEditar
);

function handleObtenerEquipo(equipo) {
  let nombre = document.getElementById("nombreEquipoEditar");
  let logoHidden = document.getElementById("logoEquipoEditar");
  let logoImg = document.getElementById("logoEquipo");
  let btnEliminarSeleccionLogoEquipoEditar = document.getElementById(
    "eliminarSeleccionLogoEquipoEditar"
  );
  nombre.value = equipo.nombre;
  logoHidden.value = equipo.logo;
  logoImg.src = equipo.logo;
  btnEliminarSeleccionLogoEquipoEditar.style.display = "none";
}

function handleFormularioEditarSubmit(e) {
  e.preventDefault();
  let nombre = document.getElementById("nombreEquipoEditar").value;
  let logo = document.getElementById("logoEquipoEditar").value;

  if (nombre && nombre !== "") {
    let msg = {
      accion: "equipo_editar",
      data: {
        nombre: nombre,
        logo: logo,
      },
    };
    window.api.send("toMain", msg);
  }
}

function handleLogoObtener(path) {
  let logo = path;
  let logoHidden = document.getElementById("logoEquipoEditar");
  let logoImg = document.getElementById("logoEquipo");
  let btnEliminarSeleccionLogoEquipoEditar = document.getElementById(
    "eliminarSeleccionLogoEquipoEditar"
  );
  logoImg.src = logo;
  logoHidden.value = logo;
  btnEliminarSeleccionLogoEquipoEditar.style.display = "inline-block";
}

function handleBtnEliminarSeleccionLogoEquipoEditar(e) {
  e.preventDefault();
  let logoHidden = document.getElementById("logoEquipoEditar");
  let logoImg = document.getElementById("logoEquipo");
  logoImg.src = "";
  logoHidden.value = "";
  this.style.display = "none";
}

function handleBtnSeleccionarLogoEquipo(ev) {
  ev.preventDefault();
  let msg = {
    accion: "seleccionar_logo_dialogo",
    data: {
      tipo: "edit",
    },
  };
  window.api.send("toMain", msg);
}
