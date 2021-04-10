window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "licencia_obtener_resp":
      handleRespuestaLicencia(data.data);
      break;

    case "solicitar_licencia_resp":
      alert(data.data);
      let msg = {
        accion: "licencia_obtener",
        data: {},
      };
      window.api.send("toMain", msg);
      break;
  }
});

window.onload = function () {
  let msg = {
    accion: "licencia_obtener",
    data: {},
  };
  window.api.send("toMain", msg);
};

let btnGenerarSolicitudLicencia = document.getElementById(
  "btnGenerarSolicitudLicencia"
);
// let btnCargarArchivoLicencia = document.getElementById(
//   "btnCargarArchivoLicencia"
// );
let btnGenerarRegeneracionLicencia = document.getElementById(
  "btnGenerarRegeneracionLicencia"
);

btnGenerarSolicitudLicencia.addEventListener(
  "click",
  handleBtnGenerarSolicitudLicencia
);

Array.from(document.getElementsByClassName("btnCargarArchivoLicencia")).forEach(
  (btnCargarArchivoLicencia) => {
    btnCargarArchivoLicencia.addEventListener(
      "click",
      handleBtnCargarArchivoLicencia
    );
  }
);

btnGenerarRegeneracionLicencia.addEventListener(
  "click",
  handleBtnGenerarRegeneracionLicencia
);

function handleRespuestaLicencia(data) {
  Array.from(document.getElementsByClassName("RowLicencia")).forEach((r) => {
    r.style.display = "none";
  });
  let rowSolicitud = document.getElementById("solicitudLicencia");
  let rowConfirmacion = document.getElementById("confirmacionLicencia");
  let rowInfo = document.getElementById("infoLicencia");
  let rowError = document.getElementById("errorLicencia");
  switch (data.msg) {
    case "solicitud":
      rowSolicitud.style.display = "flex";
      break;
    case "confirmacion":
      rowConfirmacion.style.display = "flex";
      break;
    case "info":
      let titular =
        data.data.unidadOrganizacional !== ""
          ? `${data.data.unidadOrganizacional}, ${data.data.organizacion}`
          : `${data.data.organizacion}`;
      let ubicacion = `${data.data.provincia}, ${data.data.pais}`;
      let alta = `Id de registro: ${data.data.fechaAlta}`;
      let id = `Id Transacción: ${data.data.dispositivo}`;

      let infoTitularLicencia = document.getElementById("infoTitularLicencia");
      let infoUbicacionLicencia = document.getElementById(
        "infoUbicacionLicencia"
      );
      let infoAltaLicencia = document.getElementById("infoAltaLicencia");
      let infoIdLicencia = document.getElementById("infoIdLicencia");
      infoTitularLicencia.innerText = titular;
      infoUbicacionLicencia.innerText = ubicacion;
      infoAltaLicencia.innerText = alta;
      infoIdLicencia.innerText = id;

      rowInfo.style.display = "flex";
      break;
    case "error":
      rowError.style.display = "flex";
      break;
  }
}

function handleBtnGenerarSolicitudLicencia() {
  let data = {
    organizacion: "",
    logotipo: "",
    dispositivo: "",
    licencia: "",
    unidadOrganizacional: "",
    provincia: "",
    pais: "",
    correo: "",
    fechaAlta: 0,
    estado: 0,
  };
  let nombreTitularLicencia = document.getElementById("nombreTitularLicencia")
    .value;
  let nombreUnidadOrganizacionalLicencia = document.getElementById(
    "nombreUnidadOrganizacionalLicencia"
  ).value;
  let estadoTitularLicencia = document.getElementById("estadoTitularLicencia")
    .value;
  let paisTitularLicencia = document.getElementById("paisTitularLicencia")
    .value;
  let correoTitularLicencia = document.getElementById("correoTitularLicencia")
    .value;

  if (
    nombreTitularLicencia === "" ||
    estadoTitularLicencia === "" ||
    paisTitularLicencia === ""
  ) {
    alert("Los campos marcados con ** son requeridos");
  } else {
    data.organizacion = nombreTitularLicencia;
    data.unidadOrganizacional = nombreUnidadOrganizacionalLicencia;
    data.provincia = estadoTitularLicencia;
    data.pais = paisTitularLicencia;
    data.correo = correoTitularLicencia;

    let msg = {
      accion: "licencia_solicitar",
      data: data,
    };
    window.api.send("toMain", msg);
  }
}

function handleBtnGenerarRegeneracionLicencia() {
  let msg = {
    accion: "licencia_regenerar",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleBtnCargarArchivoLicencia() {
  let msg = {
    accion: "licencia_instalar",
    data: {},
  };
  window.api.send("toMain", msg);
}
