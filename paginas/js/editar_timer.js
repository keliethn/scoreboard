window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "duration_obtener_resp":
      handleObtenerDuracion(data.data);
      break;
  }
});

window.onload = function () {
  let msg = {
    accion: "timer_obtener_duracion",
    data: {},
  };
  window.api.send("toMain", msg);
};

let btnEditar = document.getElementById("btnGuardarEditarTimer");
btnEditar.addEventListener("click", handleEditionTimer);

let formEditar = document.getElementById("formGuardarEditarTimer");
formEditar.addEventListener("submit", handleEditionTimer);

function handleObtenerDuracion(duracion) {
  var timer = duracion;
  var minutes, seconds;
  minutes = parseInt(timer / 60, 10);
  seconds = parseInt(timer % 60, 10);

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  let inputMinutos = document.getElementById("inputEditarMinutos");
  let inputSegundos = document.getElementById("inputEditarSegundos");

  inputMinutos.value = minutes;
  inputSegundos.value = seconds;
}

function handleEditionTimer(e) {
  e.preventDefault();
  let valueMinutos = document.getElementById("inputEditarMinutos").value;
  let valueSegundos = document.getElementById("inputEditarSegundos").value;

  if (valueMinutos === "" || valueSegundos === "") {
    alert("Los campos son obligatorios!");
  } else {
    let minutos = parseInt(valueMinutos, 10) * 60;
    let segundos = parseInt(valueSegundos, 10);

    let nuevaDuracion = minutos + segundos;
    let msg = {
      accion: "editar_duracion",
      data: nuevaDuracion,
    };
    window.api.send("toMain", msg);
  }
}
