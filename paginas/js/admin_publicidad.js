window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "obtener_publicidad_resp":
      handleObtenerPublicidad(data.data);
      AgregarEventosEliminar();
      break;
    case "publicidad_obtener_resp":
      handleObtenerPublicidad(data.data);
      AgregarEventosEliminar();
      break;
  }
});

function AgregarEventosEliminar() {
  Array.from(document.getElementsByClassName("EliminarPublicidad")).forEach(
    (btn) => {
      btn.addEventListener("click", handleEliminaPublicidad);
    }
  );
}

window.onload = function () {
  let height = window.innerHeight;
  let contenedor = document.getElementById("contenedorPublicidad");
  contenedor.style.overflowY = "scroll";
  contenedor.style.height = height - 70 + "px";
  let msg3 = {
    accion: "obtenerImagenesPublicidad",
    data: { ventana: "admin" },
  };
  window.api.send("toMain", msg3);
};

let btnCargarImagenesPublicidad = document.getElementById(
  "cargarImagenesPublicidad"
);
btnCargarImagenesPublicidad.addEventListener(
  "click",
  handleBtnCargarImagenesPublicidad
);

function handleObtenerPublicidad(ads) {
  let contenedor = document.getElementById("contenedorPublicidad");
  contenedor.innerHTML = "";
  let anuncios = "";

  ads.forEach((ad) => {
    anuncios += `<div class="col-sm-3 p-1 mb-1" style="height:200px">
    <div class='card' style="height:200px">
    <div class='card-body'>
    <div style="position:relative">
        <span class="badge badge-danger EliminarPublicidad" data-id="${ad._id}" style="cursor:pointer;right:5px;top:5px;position:absolute">X</span>
        <img src="${ad.ubicacion}" class="card-img-top" style="width: 180px;" alt=""></div>
         </div>
         <div style="position:relative;bottom:1px"><p class="text-center">${ad.nombre}</p></div>
    </div>
       
      </div>`;
  });
  contenedor.innerHTML = anuncios;
}

function handleEliminaPublicidad(e) {
  e.preventDefault();
  let id = e.srcElement.dataset.id;

  let msg3 = {
    accion: "eliminar_publicidad",
    data: { id },
  };
  window.api.send("toMain", msg3);
}

function handleBtnCargarImagenesPublicidad(ev) {
  ev.preventDefault();
  let msg = {
    accion: "seleccionar_publicidad_dialogo",
    data: {
      tipo: "admin",
    },
  };
  window.api.send("toMain", msg);
}
