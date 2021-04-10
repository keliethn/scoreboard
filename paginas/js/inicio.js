let timerPausado = true;
let idJuegoActivo = null;
let juego = null;
let duracionTimerTimeout = 0;
let intervalTimeout = null;
let timerTimeoutActivo = false;
let posicionPantallaHome = null;
let posicionPantallaVisitante = null;

window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "generales_obtener_resp":
      document.title = `${String(data.data.titular).toUpperCase()}`;

      break;
    case "mostrar_msg_bonus":
      mostrarMsgBonus(data.data);
      break;
    case "ocultar_msg_bonus":
      Array.from(document.getElementsByClassName("Bonus")).forEach((x) => {
        x.style.display = "none";
      });
      break;
    case "juego_obtener_resp":
      if (data.data.juego !== null) {
        posicionPantallaVisitante = data.data.visitantePosicionPantalla;
        posicionPantallaHome = data.data.homePosicionPantalla;
      }

      handleAgregarJuegoActivo(data.data);

      if (data.data.juego !== null) {
        if (data.data.juego.tipoNotacion !== "general") {
          let msg3 = {
            accion: "obtenerJugadoresActivos",
            data: {},
          };
          window.api.send("toMain", msg3);
        }
      }

      let msg2 = {
        accion: "obtenerTextoTimer",
        data: {},
      };
      window.api.send("toMain", msg2);
      break;
    case "juego_obtener_resp_modif":
      if (data.data.juego !== null) {
        posicionPantallaVisitante = data.data.visitantePosicionPantalla;
        posicionPantallaHome = data.data.homePosicionPantalla;
      }

      handleAgregarJuegoActivo(data.data);

      if (data.data.juego !== null) {
        if (data.data.juego.tipoNotacion !== "general") {
          let msg4 = {
            accion: "obtenerJugadoresActivos",
            data: {},
          };
          window.api.send("toMain", msg4);
        }
      }

      break;
    case "actualizarTimer":
      let timerElement = document.getElementById("timer");
      timerElement.innerText = data.data;

      break;
    case "actualizarTextoTimer":
      let timerEl = document.getElementById("timer");
      timerEl.innerText = data.data;
      break;
    case "actualizarTextoPeriodo":
      let periodoActualElement = document.getElementById("actualizaPeriodo");
      periodoActualElement.innerText = "";
      let textoPeriodo = `${
        data.data.overtime === true ? "OVERTIME" : "PERIODO"
      } ${data.data.periodo}`;
      periodoActualElement.innerText = textoPeriodo;
      break;
    case "no_external_screen":
      alert("Conecte un monitor externo para iniciar proyección");
      break;
    case "preguntarOvertime":
      let response = confirm("Iniciar Overtime?");
      let msg = {
        accion: "respuestaOvertime",
        data: response,
      };
      window.api.send("toMain", msg);
      break;
    case "projector_screen_not_found":
      alert(
        "No se puede completar esta acción. No existe pantalla de proyección activa"
      );
      break;
    case "jugadores_obtener_resp":
      handleObtenerJugadoresJuego(data.data);
      break;
  }
});

window.onload = function () {
  let msg = {
    accion: "juego_obtener_activo",
    data: true,
  };
  window.api.send("toMain", msg);

  let msg2 = {
    accion: "generales_obtener",
    data: {},
  };
  window.api.send("toMain", msg2);
};

let presentarInfoLicencia = document.getElementById("presentarInfoLicencia");
presentarInfoLicencia.addEventListener("click", handlePresentarInfoLicencia);

let btnAbrirProyector = document.querySelector("#abrirProyector");
btnAbrirProyector.addEventListener("click", handleAbrirProyector);

let btnCerrarProyector = document.querySelector("#cerrarProyector");
btnCerrarProyector.addEventListener("click", handleCerrarProyector);

// let btnLogoProyector = document.querySelector("#logoProyector");
// btnLogoProyector.addEventListener("click", handleLogoProyector);

let btnOscurecerProyector = document.querySelector("#oscurecerProyector");
btnOscurecerProyector.addEventListener("click", handleBlankProyector);

let btnPublicidadProyector = document.querySelector("#publicidadProyector");
btnPublicidadProyector.addEventListener("click", handlePublicidadProyector);

let btnTablaProyector = document.querySelector("#tablaProyector");
btnTablaProyector.addEventListener("click", handleTablaProyector);

let btnPizarraProyector = document.querySelector("#pizarraProyector");
btnPizarraProyector.addEventListener("click", handlePizarraProyector);

let btnAdminEquipos = document.querySelector("#adminEquipos");
btnAdminEquipos.addEventListener("click", handleAdminEquipos);

let btnAdminReportes = document.querySelector("#adminReportes");
btnAdminReportes.addEventListener("click", handleAdminReportes);

let btnAdminLigas = document.querySelector("#adminLigas");
btnAdminLigas.addEventListener("click", handleAdminLigas);

let btnAdminPublicidad = document.querySelector("#adminPublicidad");
btnAdminPublicidad.addEventListener("click", handleAdminPublicidad);

let btnIniciarJuego = document.querySelector("#iniciarJuego");
btnIniciarJuego.addEventListener("click", handleIniciarJuego);

let btnTerminarJuego = document.querySelector("#terminarJuego");
btnTerminarJuego.addEventListener("click", handleTerminarJuego);

let btnCambiarPosicionPantalla = document.querySelector(
  "#cambiarPosicionPantalla"
);
btnCambiarPosicionPantalla.addEventListener(
  "click",
  handleCambiarPosicionPantalla
);

let timerElement = document.querySelector("#timer");
timerElement.addEventListener("click", handleTimerPlay);
timerElement.addEventListener("dblclick", handleTimerEdit);

function handleAbrirProyector(e) {
  let msg = {
    accion: "projector_open_window",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleCerrarProyector(e) {
  let msg = {
    accion: "projector_close_window",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleLogoProyector() {
  let msg = {
    accion: "projector_logo_open",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleBlankProyector() {
  let msg = {
    accion: "projector_blank_open",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handlePublicidadProyector() {
  let msg = {
    accion: "projector_publicidad_open",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handlePizarraProyector() {
  if (idJuegoActivo !== null) {
    let msg = {
      accion: "projector_pizarra_open",
      data: {},
    };
    window.api.send("toMain", msg);
  } else {
    alert("No hay juego activo para mostrar");
  }
}
function handleTablaProyector() {
  if (idJuegoActivo !== null) {
    let msg = {
      accion: "projector_tabla_open",
      data: {},
    };
    window.api.send("toMain", msg);
  } else {
    alert("No hay juego activo para mostrar");
  }
}

function handleAdminEquipos(e) {
  let msg = {
    accion: "equipos_open_window",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleAdminReportes(e) {
  let msg = {
    accion: "reportes_open_window",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleAdminLigas(e) {
  let msg = {
    accion: "ligas_open_window",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleAdminPublicidad(e) {
  let msg = {
    accion: "publicidad_open_window",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleIniciarJuego(e) {
  let msg = {
    accion: "juego_agregar_window",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleTerminarJuego(e) {
  let respuesta = confirm("Confirme finalización de partido");
  if (respuesta === true) {
    let msg = {
      accion: "juego_terminar",
      data: {},
    };
    window.api.send("toMain", msg);
  }
}

function handleTimerPlay() {
  timerPausado = !timerPausado;
  let msg = {
    accion: "timer_play",
    data: {
      pause: timerPausado,
    },
  };
  window.api.send("toMain", msg);
}

function handleTimerEdit() {
  let msg = {
    accion: "timer_edit_window",
    data: {},
  };
  window.api.send("toMain", msg);
}

function handleModificarPuntaje(e) {
  e.preventDefault();

  let tipo = this.dataset.tipo;
  let amount = this.dataset.amount;
  let action = this.dataset.action;
  if (action === "sustraer") {
    amount = parseInt(amount, 10) * -1;
  } else {
    amount = parseInt(amount, 10);
  }

  let msg = {
    accion: "modificarPuntaje",
    data: {
      id: idJuegoActivo,
      tipo,
      action,
      amount,
    },
  };
  window.api.send("toMain", msg);
}

function handleModificarTimeout(e) {
  e.preventDefault();
  if (timerTimeoutActivo === false) {
    let permitir = true;
    let tipo = this.dataset.tipo;
    if (tipo === "home" && juego.tiempoFueraHome > 4) {
      permitir = false;
    } else if (tipo === "visitante" && juego.tiempoFueraVisitante > 4) {
      permitir = false;
    }

    if (permitir === true) {
      let amount = this.dataset.amount;
      let action = this.dataset.action;
      let permitrAccion = true;
      if (
        action === "sustraer" &&
        tipo === "home" &&
        juego.tiempoFueraHome > 0
      ) {
        permitrAccion = false;
      } else if (
        action === "sustraer" &&
        tipo === "visitante" &&
        juego.tiempoFueraVisitante > 0
      ) {
        permitrAccion = false;
      }
      if (permitrAccion === true) {
        if (action === "sustraer") {
          amount = parseInt(amount, 10) * -1;
        } else {
          amount = parseInt(amount, 10);
        }

        let msg = {
          accion: "modificarTimeout",
          data: {
            id: idJuegoActivo,
            tipo,
            action,
            amount,
          },
        };
        window.api.send("toMain", msg);
        iniciarCronometroTimeout(juego.tiempoCouch, tipo);
      }
    }
  }
}

function handleModificarFoul(e) {
  e.preventDefault();

  let tipo = this.dataset.tipo;
  let amount = this.dataset.amount;
  let action = this.dataset.action;
  if (action === "sustraer") {
    amount = parseInt(amount, 10) * -1;
  } else {
    amount = parseInt(amount, 10);
  }

  let msg = {
    accion: "modificarFoul",
    data: {
      id: idJuegoActivo,
      tipo,
      action,
      amount,
    },
  };
  window.api.send("toMain", msg);
}

function handleCambiarPosicionPantalla() {
  let msg = {
    accion: "cambiarPosicionPantalla",
    data: {
      id: idJuegoActivo,
    },
  };
  window.api.send("toMain", msg);
}

function iniciarCronometroTimeout(minutos, tipo) {
  duracionTimerTimeout = minutos * 60;
  var seconds;
  timerTimeoutActivo = true;
  let elementoIndicador;
  if (tipo === "home") {
    elementoIndicador = document.getElementById("indicadorTimeoutHome");
  } else {
    elementoIndicador = document.getElementById("indicadorTimeoutVisitante");
  }

  elementoIndicador.style.display = "block";
  intervalTimeout = setInterval(() => {
    seconds = parseInt(duracionTimerTimeout, 10);
    seconds = seconds < 10 ? "0" + seconds : seconds;

    let timeText = seconds;

    let timerTimeout = document.getElementById("timerTimeout");

    timerTimeout.innerText = `${timeText}`;

    if (--duracionTimerTimeout < 0) {
      terminarCronometroTimeout();
      // let msg2 = {
      //   accion: "minutos_inicio_obtener",
      //   data: {},
      // };
      // window.api.send("toMain", msg2);
    }
  }, 1000);
}

function terminarCronometroTimeout() {
  clearInterval(intervalTimeout);
  timerTimeoutActivo = false;
  elementoIndicadorHome = document.getElementById("indicadorTimeoutHome");
  elementoIndicadorVisitante = document.getElementById(
    "indicadorTimeoutVisitante"
  );
  elementoIndicadorHome.style.display = "none";
  elementoIndicadorVisitante.style.display = "none";
  let timerTimeout = document.getElementById("timerTimeout");
  timerTimeout.innerText = "00";
}

function handleResetTimeoutTimer() {
  if (timerTimeoutActivo === true) {
    terminarCronometroTimeout();
  }
}

function mostrarMsgBonus(data) {
  let bonusHome = document.getElementById("bonusHome");
  let bonusVisitante = document.getElementById("bonusVisitante");

  if (data.tipo === "home") {
    bonusHome.style.display = "block";
  } else if (data.tipo === "visitante") {
    bonusVisitante.style.display = "block";
  }
}

function handlePresentarInfoLicencia() {
  let msg = {
    accion: "licencia_open_window",
    data: {},
  };
  window.api.send("toMain", msg);
}

function layoutPuntajeGeneral(tipo) {
  let layoutGeneralPuntaje = `<div class="row">
<div class="pr-0 col-lg-2">
  <ul class="list-group">
    <a href="#" class="ModificarPuntaje list-group-item list-group-item-action list-group-item-danger" data-tipo="${tipo}" data-amount="1" data-action="sustraer"><strong>-1</strong></a>
    <a href="#" class="ModificarPuntaje list-group-item list-group-item-action list-group-item-danger" data-tipo="${tipo}" data-amount="2" data-action="sustraer"><strong>-2</strong></a>
    <a href="#" class="ModificarPuntaje list-group-item list-group-item-action list-group-item-danger" data-tipo="${tipo}" data-amount="3" data-action="sustraer"><strong>-3</strong></a>
  </ul>
</div>
<div class="col-lg-8">
  <div class="row">
    <div class="col-lg-12">
      <div class="text-center alert alert-secondary" style="margin-bottom:0px">
        <h1 id="totalPuntaje${capitalize(
          tipo
        )}" class="display-1 font-weight-bold"></h1>
      </div>
    </div>
  </div>
</div>
<div class="pl-0 col-lg-2">
  <ul class="list-group">
    <a href="#" class="ModificarPuntaje list-group-item list-group-item-action list-group-item-success" data-tipo="${tipo}" data-amount="1" data-action="adicionar"><strong>+1</strong></a>
    <a href="#" class="ModificarPuntaje list-group-item list-group-item-action list-group-item-success" data-tipo="${tipo}" data-amount="2" data-action="adicionar"><strong>+2</strong></a>
    <a href="#" class="ModificarPuntaje list-group-item list-group-item-action list-group-item-success" data-tipo="${tipo}" data-amount="3" data-action="adicionar"><strong>+3</strong></a>
  </ul>
</div>
</div>`;

  return layoutGeneralPuntaje;
}

function layoutIncidenciasGeneral(tipo) {
  let layoutGeneralIncidenciasHome = `<div class="row">
  <div class="col-lg-6">
    <div class="row">
      <div class="col-lg-4" style="padding-top: 50px; padding-right: 0px">
        <ul class="list-group">
          <a href="#" class="ModificarFoul list-group-item list-group-item-action list-group-item-danger" data-tipo="${tipo}" data-amount="1" data-action="adicionar"><strong>+1</strong>
          </a>
        </ul>
      </div>
      <div class="col-lg-8">
        <div class="row">
          <div class="text-center col-lg-12">
            <strong class="text-danger">FOULS</strong>
          </div>
          <div class="col-lg-12">
            <div class="alert alert-danger text-center" style="margin-bottom:0px">
              <h1 id="totalFoul${capitalize(
                tipo
              )}" class="display-3 font-weight-bold text-danger text-center"></h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-6">
    <div class="row">
      <div class="col-lg-8">
        <div class="row">
          <div class="text-center col-lg-12">
            <strong class="text-success">T. COACH</strong>
          </div>
          <div class="col-lg-12">
            <div class="alert alert-success text-center" style="margin-bottom:0px">
              <h1 id="totalTimeout${capitalize(
                tipo
              )}" class="display-3 font-weight-bold text-success text-center"></h1>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4" style="padding-top: 50px; padding-left: 0px">
        <ul class="list-group">
          <a href="#" class="ModificarTimeout list-group-item list-group-item-action list-group-item-success" data-tipo="${tipo}" data-amount="1" data-action="adicionar"><strong>+1</strong></a>
        </ul>
      </div>
    </div>
  </div>
</div>`;

  let layoutGeneralIncidenciasVisitante = `<div class="row">
<div class="col-lg-6">
  <div class="row">
    <div
      class="col-lg-4"
      style="padding-top: 50px; padding-right: 0px"
    >
      <ul class="list-group">
        <a
          href="#"
          class="ModificarTimeout list-group-item list-group-item-action list-group-item-success"
          data-tipo="${tipo}"
          data-amount="1"
          data-action="adicionar"
          ><strong>+1</strong></a
        >
      </ul>
    </div>
    <div class="col-lg-8">
      <div class="row">
        <div class="text-center col-lg-12">
          <strong class="text-success">T. COACH</strong>
        </div>
        <div class="col-lg-12">
          <div class="alert alert-success" style="margin-bottom:0px">
            <h1
              id="totalTimeout${capitalize(tipo)}"
              class="display-3 font-weight-bold text-success"
            >
              0
            </h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="col-lg-6">
  <div class="row">
    <div class="col-lg-8">
      <div class="row">
        <div class="text-center col-lg-12">
          <strong class="text-danger">FOULS</strong>
        </div>
        <div class="col-lg-12">
          <div class="alert alert-danger" style="margin-bottom:0px">
            <h1
              id="totalFoul${capitalize(tipo)}"
              class="display-3 font-weight-bold text-danger"
            >
              0
            </h1>
          </div>
        </div>
      </div>
    </div>
    <div
      class="col-lg-4"
      style="padding-top: 50px; padding-left: 0px"
    >
      <ul class="list-group">
        <a
          href="#"
          class="ModificarFoul list-group-item list-group-item-action list-group-item-danger"
          data-tipo="${tipo}"
          data-amount="1"
          data-action="adicionar"
          ><strong>+1</strong></a
        >
      </ul>
    </div>
  </div>
</div>
</div> `;
  return tipo === "home"
    ? layoutGeneralIncidenciasHome
    : layoutGeneralIncidenciasVisitante;
}

function LayoutTiempoCouch(tipo) {
  let tipoGeneral = `
  <div class="col-lg-2"></div>
  <div class="col-lg-3">
   <h1 class="text-success" id="indicadorTimeoutHome"><span style='display:flex;flex-direction:row-reverse'>&#8598;</span></h1> 
 
  </div>
  <div class="col-lg-2">
    <div>
      <span
        id="resetTimeoutTimer"
        class="badge badge-danger"
        style="cursor: pointer; width: 100%"
        >TERMINAR</span
      >
    </div>
    <div class="alert alert-success text-center">
      <h2 id="timerTimeout" class="text-success">00</h2>
    </div>
  </div>
  <div class="col-lg-3">
    <!--   <h1 class="text-success">&#8598;</h1> -->
    <h1 id="indicadorTimeoutVisitante">&#8599;</h1>
  </div>
  <div class="col-lg-2"></div>
  `;
  let tipoDetallado = `
  <div class="col-lg-2"></div>
  <div class="col-lg-3">
    <!-- <h1>&#10229;</h1> -->
    <div class="row">
      <div class="col-lg-6">
        <div>
          <span
            class="badge badge-success ModificarTimeout"
            data-tipo="home"
            data-amount="1"
            data-action="adicionar"
            style="cursor: pointer; width: 100%"
            >T. Couch (+1)</span
          >
        </div>
        <div class="alert alert-success text-center">
          <h2 id="totalTimeoutHome" class="text-success">00</h2>
        </div>
      </div>
      <div
        class="col-lg-6"
        style="
          display: flex;
          justify-content: center;
          align-items: center;
        "
      >
        <h1 id="indicadorTimeoutHome">&#10230;</h1>
        <!--  <h1>&#10229;</h1>-->
      </div>
    </div>
  </div>
  <div class="col-lg-2">
    <div>
      <span
        id="resetTimeoutTimer"
        class="badge badge-danger"
        style="cursor: pointer; width: 100%"
        >TERMINAR</span
      >
    </div>
    <div class="alert alert-success text-center">
      <h2 id="timerTimeout" class="text-success">00</h2>
    </div>
  </div>
  <div class="col-lg-3">

  <div class="row">
  <div
  class="col-lg-6"
  style="
    display: flex;
    justify-content: center;
    align-items: center;
  "
>
 
 <h1 id="indicadorTimeoutVisitante">&#10229;</h1>
</div>
    <div class="col-lg-6">
      <div>
        <span
          class="badge badge-success ModificarTimeout"
          data-tipo="visitante"
          data-amount="1"
          data-action="adicionar"
          style="cursor: pointer; width: 100%"
          >T. Couch (+1)</span
        >
      </div>
      <div class="alert alert-success text-center">
        <h2 id="totalTimeoutVisitante" class="text-success">00</h2>
      </div>
    </div>
   
  </div>
  </div>
  <div class="col-lg-2"></div>
  `;

  return tipo === "general" ? tipoGeneral : tipoDetallado;
}

function capitalize(s) {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function handleBtnDefineListaEquipo(e) {
  e.preventDefault();
  let tipo = this.dataset.tipo;
  let juego = this.dataset.juego;

  let msg = {
    accion: "lista_jugadores_open_window",
    data: { tipo, juego, modo: "apertura" },
  };
  window.api.send("toMain", msg);
}

function handleAgregarJuegoActivo(data) {
  let noGamePlaceholder = document.getElementById("noGamePlaceholder");
  let btnIniciarJuego = document.getElementById("iniciarJuego");
  let btnTerminaJuego = document.getElementById("terminarJuego");
  let contenedorTimer = document.getElementById("contenedorTimer");
  let btnTablaProyector = document.getElementById("tablaProyector");
  let contenedorDataEquipos = document.getElementById("contenedorDataEquipos");
  let contenedorLayoutTiempoCouch = document.getElementById(
    "contenedorLayoutTiempoCouch"
  );
  if (data.juego === null) {
    noGamePlaceholder.style.display = "flex";
    btnIniciarJuego.style.display = "block";
    contenedorTimer.style.display = "none";
    contenedorDataEquipos.style.display = "none";
    contenedorLayoutTiempoCouch.style.display = "none";
    btnTerminaJuego.style.display = "none";
  } else {
    noGamePlaceholder.style.display = "none";
    btnIniciarJuego.style.display = "none";
    contenedorTimer.style.display = "flex";
    contenedorDataEquipos.style.display = "flex";
    contenedorLayoutTiempoCouch.style.display = "flex";
    btnTerminaJuego.style.display = "block";
  }

  if (data.juego !== null) {
    idJuegoActivo = data.juego._id;
    juego = data.juego;
    let logoHome = document.getElementById("logoHome");
    let logoVisitante = document.getElementById("logoVisitante");
    let tituloHome = document.getElementById("nombreEquipoHome");
    let tituloVisitante = document.getElementById("nombreEquipoVisitante");
    let contenedorLayoutHome = document.getElementById("contenedorLayoutHome");
    let contenedorLayoutVisitante = document.getElementById(
      "contenedorLayoutVisitante"
    );

    contenedorLayoutHome.innerHTML = "";
    contenedorLayoutVisitante.innerHTML = "";
    contenedorLayoutTiempoCouch.innerHTML = "";

    contenedorLayoutTiempoCouch.innerHTML = LayoutTiempoCouch(
      data.juego.tipoNotacion
    );

    if (data.juego.tipoNotacion === "general") {
      let layoutGeneralHome = layoutPuntajeGeneral("home");
      let layoutGeneralIncidenciasHome = layoutIncidenciasGeneral("home");
      let layoutGeneralVisitante = layoutPuntajeGeneral("visitante");
      let layoutGeneralIncidenciasVisitante = layoutIncidenciasGeneral(
        "visitante"
      );

      contenedorLayoutHome.innerHTML = `${layoutGeneralHome}<hr class="m-0">${layoutGeneralIncidenciasHome}`;
      contenedorLayoutVisitante.innerHTML = `${layoutGeneralVisitante}<hr class="m-0">${layoutGeneralIncidenciasVisitante}`;
    } else {
      btnTablaProyector.style.display = "block";
      let layoutDetalleHome = LayoutDetallado("home", data.juego._id);
      let layoutDetalleVisitante = LayoutDetallado("visitante", data.juego._id);
      contenedorLayoutHome.innerHTML = `${layoutDetalleHome}`;
      contenedorLayoutVisitante.innerHTML = `${layoutDetalleVisitante}`;
    }

    let btnResetTimeoutTimer = document.querySelector("#resetTimeoutTimer");
    btnResetTimeoutTimer.addEventListener("click", handleResetTimeoutTimer);

    Array.from(document.getElementsByClassName("ModificarPuntaje")).forEach(
      (btn) => {
        btn.addEventListener("click", handleModificarPuntaje);
      }
    );
    Array.from(document.getElementsByClassName("ModificarTimeout")).forEach(
      (btn) => {
        btn.addEventListener("click", handleModificarTimeout);
      }
    );
    Array.from(document.getElementsByClassName("ModificarFoul")).forEach(
      (btn) => {
        btn.addEventListener("click", handleModificarFoul);
      }
    );

    let totalPuntajeHome = document.getElementById("totalPuntajeHome");
    let totalPuntajeVisitante = document.getElementById(
      "totalPuntajeVisitante"
    );

    let totalTimeoutHome = document.getElementById("totalTimeoutHome");
    let totalTimeoutVisitante = document.getElementById(
      "totalTimeoutVisitante"
    );

    let totalFoulHome = document.getElementById("totalFoulHome");
    let totalFoulVisitante = document.getElementById("totalFoulVisitante");

    let actualizaPeriodo = document.getElementById("actualizaPeriodo");
    tituloHome.innerHTML = `${data.juego.home}`;
    tituloVisitante.innerHTML = `${data.juego.visitante}`;

    logoHome.src = data.juego.logoHome;
    logoVisitante.src = data.juego.logoVisitante;

    actualizaPeriodo.innerText = "";
    //
    let textoPeriodo = `${
      data.juego.enTiempoExtra === true ? "OVERTIME" : "PERIODO"
    } ${
      data.juego.enTiempoExtra === true
        ? data.juego.overtimeActual
        : data.juego.periodoActual
    }`;
    actualizaPeriodo.innerText = textoPeriodo;
    totalPuntajeHome.innerText =
      data.juego.puntajeHome < 10
        ? "00" + data.juego.puntajeHome
        : data.juego.puntajeHome > 9 && data.juego.puntajeHome < 100
        ? "0" + data.juego.puntajeHome
        : data.juego.puntajeHome;
    totalPuntajeVisitante.innerText =
      data.juego.puntajeVisitante < 10
        ? "00" + data.juego.puntajeVisitante
        : data.juego.puntajeVisitante > 9 && data.juego.puntajeVisitante < 100
        ? "0" + data.juego.puntajeVisitante
        : data.juego.puntajeVisitante;

    totalTimeoutHome.innerText =
      data.juego.tiempoFueraHome < 10
        ? "0" + data.juego.tiempoFueraHome
        : data.juego.tiempoFueraHome;

    // if (data.juego.tiempoFueraHome === 5) {
    //   Array.from(document.getElementsByClassName("ModificarTimeout")).forEach(
    //     (x) => {
    //       if (x.data.juegoset.tipo === "home") {
    //         x.setAttribute("disabled", true);
    //       }
    //     }
    //   );
    // }

    totalTimeoutVisitante.innerText =
      data.juego.tiempoFueraVisitante < 10
        ? "0" + data.juego.tiempoFueraVisitante
        : data.juego.tiempoFueraVisitante;

    // if (data.juego.tiempoFueraHome === 5) {
    //   Array.from(document.getElementsByClassName("ModificarTimeout")).forEach(
    //     (x) => {
    //       if (x.data.juegoset.tipo === "visitante") {
    //         x.setAttribute("disabled", true);
    //       }
    //     }
    //   );
    // }

    totalFoulHome.innerText =
      data.juego.faltasHome < 10
        ? "0" + data.juego.faltasHome
        : data.juego.faltasHome;

    totalFoulVisitante.innerText =
      data.juego.faltasVisitante < 10
        ? "0" + data.juego.faltasVisitante
        : data.juego.faltasVisitante;
  }
}

function LayoutDetallado(tipo, juego) {
  let layout = `
  <div
  id="ContenedorDefineListaEquipo${capitalize(tipo)}"
  style="display: none"
  class="row"
>
  <div
    class="col-lg-12"
    style="
      display: flex;
      align-items: center;
      justify-content: center;
    "
  >
    <button
      data-tipo="${tipo}"
      data-juego="${juego}"
      class="btn btn-primary btn-sm BtnDefineListaEquipo"
    >
      Definir lista de jugadores
    </button>
  </div>
</div>
<div class="row" id="contenedorTablaJugadores${capitalize(
    tipo
  )}" style="display:none;">
  <div class="col-lg-12">
    <table
      class="table table-borderless-table-sm table-hover mb-1"
    >
      <thead>
        <tr>
          <th
            class="text-center"
            style="width: 14%; padding: 0.25rem 0.5rem"
          >
            <small>Acc</small>
          </th>
          <th
            class="text-center"
            style="width: 29%; padding: 0.25rem 0.5rem"
          >
            <small>Jugadores en cancha</small>
          </th>
          <th
            class="text-center"
            style="width: 16%; padding: 0.25rem 0.5rem"
          >
            <small>Foul</small>
          </th>
          <th
            class="text-center"
            style="width: 41%; padding: 0.25rem 0.5rem"
          >
            <small>Puntos</small>
          </th>
        </tr>
      </thead>
      <tbody id="contenedorJugadores${capitalize(tipo)}">
        
      </tbody>
      <tfoot>
        <tr>
          <td
            class="text-center"
            style="width: 14%; padding: 0.25rem 0.5rem"
          ></td>
          <td
            class="text-center"
            style="width: 29%; padding: 0.25rem 0.5rem"
          >
            <button
              class="btn btm-sm btn-outline-danger ModificarFoul"
              data-tipo="${tipo}"
              data-amount="1"
              data-action="adicionar"
            >
              <small>Foul técnico (+1)</small>
            </button>
          </td>
          <td
            class="text-left"
            style="width: 16%; padding: 0.25rem 0.5rem"
          >
            <div
              class="alert alert-danger text-danger mb-0"
              style="padding: 0rem"
            >
              <strong
                id="totalFoul${capitalize(tipo)}"
                style="margin-left: 6px;font-size: 2.3rem;"
                >00</strong
              >
            </div>
          </td>
          <td
            class="text-center"
            style="width: 41%; padding: 0.25rem 0.5rem"
          >
            <div
              class="alert alert-dark mb-0"
              style="padding: 0rem"
            >
              <strong
                id="totalPuntaje${capitalize(tipo)}"
                style="margin-left: -12px;font-size: 2.3rem;"
                >00</strong
              >
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>
  `;

  return layout;
}

function handleObtenerJugadoresJuego(jugadores) {
  let contenedorTablaJugadoresHome = document.getElementById(
    "contenedorTablaJugadoresHome"
  );
  let contenedorTablaJugadoresVisitante = document.getElementById(
    "contenedorTablaJugadoresVisitante"
  );
  let ContenedorDefineListaEquipoHome = document.getElementById(
    "ContenedorDefineListaEquipoHome"
  );
  let ContenedorDefineListaEquipoVisitante = document.getElementById(
    "ContenedorDefineListaEquipoVisitante"
  );
  if (jugadores.length > 0) {
    let jugadoresHome = jugadores.filter((x) => x.posicionEquipo === "home");
    let jugadoresVisitante = jugadores.filter(
      (x) => x.posicionEquipo === "visitante"
    );

    if (jugadoresHome.length < 5) {
      ContenedorDefineListaEquipoHome.style.display = "flex";
      contenedorLayoutTiempoCouch.style.display = "none";
    } else {
      //Pobler lista home
      poblarListaJugadores("home", jugadoresHome);
      ContenedorDefineListaEquipoHome.style.display = "none";
      contenedorTablaJugadoresHome.style.display = "flex";
    }

    if (jugadoresVisitante.length < 5) {
      ContenedorDefineListaEquipoVisitante.style.display = "flex";
      contenedorLayoutTiempoCouch.style.display = "none";
    } else {
      //poblar lista visitante
      poblarListaJugadores("visitante", jugadoresVisitante);
      ContenedorDefineListaEquipoVisitante.style.display = "none";
      contenedorTablaJugadoresVisitante.style.display = "flex";
    }

    if (jugadoresHome.length === 5 && jugadoresVisitante.length === 5) {
      ContenedorDefineListaEquipoHome.style.display = "none";
      ContenedorDefineListaEquipoVisitante.style.display = "none";
      contenedorLayoutTiempoCouch.style.display = "flex";
    }
  } else {
    ContenedorDefineListaEquipoHome.style.display = "flex";
    ContenedorDefineListaEquipoVisitante.style.display = "flex";
    contenedorLayoutTiempoCouch.style.display = "none";
  }

  Array.from(document.getElementsByClassName("BtnDefineListaEquipo")).forEach(
    (btn) => {
      btn.addEventListener("click", handleBtnDefineListaEquipo);
    }
  );
}

function poblarListaJugadores(tipo, jugadores) {
  let elemento;
  if (tipo === "home") {
    elemento = document.getElementById("contenedorJugadoresHome");
  } else {
    elemento = document.getElementById("contenedorJugadoresVisitante");
  }
  elemento.innerHTML = "";
  let tbody = "";
  jugadores.forEach((jugador) => {
    tbody += `
<tr>
          <td style="width: 14%; padding: 0.25rem 0.5rem">
            <div class="btn-group">
              <button
                class="btn btn-sm btn-outline-secondary BtnSustitucionJugador"
                data-jugador="${jugador.idJugador}"
                data-juego="${jugador.idJuego}"
                data-equipo="${jugador.posicionEquipo}"
                title="Sustituir"
              >
                <small>S</small>
              </button>
              <button
                class="btn btn-sm btn-outline-danger BtnRetiroJugador"
                title="Retirar"
                data-jugador="${jugador.idJugador}"
                data-juego="${jugador.idJuego}"
                data-equipo="${jugador.posicionEquipo}"
              >
                <small>R</small>
              </button>
            </div>
          </td>
          <td style="width: 29%; padding: 0.25rem 0.5rem">
            <span class="text-left text-uppercase">
              <small
                ><strong> ${jugador.numeroJugador} - ${
      jugador.nombreJugador.split(" ")[1]
    } </strong></small
              >
            </span>
          </td>
          <td style="width: 16%; padding: 0.25rem 0.5rem">
            <div class="input-group input-group-sm">
              <input
                size="10"
                type="text"
                readonly
                class="form-control text-center"
                id="FoulJugador-${jugador.idJugador}"
                value="${
                  jugador.faltasJugador < 9
                    ? "0" + jugador.faltasJugador
                    : jugador.faltasJugador
                }"
              />
              <div class="input-group-append">
                <button
                  class="btn btn-outline-danger BtnAgregarFoulJugador"
                  type="button"
                  data-jugador="${jugador.idJugador}"
                data-juego="${jugador.idJuego}"
                data-equipo="${jugador.posicionEquipo}"
                >
                  <small>+1</small>
                </button>
              </div>
            </div>
          </td>
          <td style="width: 41%; padding: 0.25rem 0.5rem">
            <div class="input-group input-group-sm">
              <div class="input-group-prepend">
                <button
                  class="btn btn-outline-danger ModificarPuntajeJugador"
                  type="button"
                  data-jugador="${jugador.idJugador}"
                data-juego="${jugador.idJuego}"
                data-equipo="${jugador.posicionEquipo}"
                  data-amount="1"
                  data-action="sustraer"
                >
                  <small>-1</small>
                </button>
                <button
                  class="btn btn-outline-danger ModificarPuntajeJugador"
                  type="button"
                  data-jugador="${jugador.idJugador}"
                data-juego="${jugador.idJuego}"
                data-equipo="${jugador.posicionEquipo}"
                  data-amount="2"
                  data-action="sustraer"
                >
                  <small>-2</small>
                </button>
                <button
                  class="btn btn-outline-danger ModificarPuntajeJugador"
                  type="button"
                  data-jugador="${jugador.idJugador}"
                data-juego="${jugador.idJuego}"
                data-equipo="${jugador.posicionEquipo}"
                  data-amount="3"
                  data-action="sustraer"
                >
                  <small>-3</small>
                </button>
              </div>

              <input
                type="text"
                readonly
                class="form-control text-center"
                id="JuntajeJugador-${jugador.idJugador}"
                value="${
                  jugador.puntajeJugador < 9
                    ? "0" + jugador.puntajeJugador
                    : jugador.puntajeJugador
                }"
              />
              <div class="input-group-append">
                <button
                  class="btn btn-outline-success ModificarPuntajeJugador"
                  type="button"
                  data-jugador="${jugador.idJugador}"
                data-juego="${jugador.idJuego}"
                data-equipo="${jugador.posicionEquipo}"
                  data-amount="1"
                  data-action="adicionar"
                >
                  <small>+1</small>
                </button>
                <button
                  class="btn btn-outline-success ModificarPuntajeJugador"
                  type="button"
                  data-jugador="${jugador.idJugador}"
                data-juego="${jugador.idJuego}"
                data-equipo="${jugador.posicionEquipo}"
                  data-amount="2"
                  data-action="adicionar"
                >
                  <small>+2</small>
                </button>
                <button
                  class="btn btn-outline-success ModificarPuntajeJugador"
                  type="button"
                  data-jugador="${jugador.idJugador}"
                data-juego="${jugador.idJuego}"
                data-equipo="${jugador.posicionEquipo}"
                  data-amount="3"
                  data-action="adicionar"
                >
                  <small>+3</small>
                </button>
              </div>
            </div>
          </td>
        </tr>
`;
  });
  elemento.innerHTML = tbody;

  agregarEventosClasesListaJugadores();
}

function agregarEventosClasesListaJugadores() {
  Array.from(document.getElementsByClassName("BtnSustitucionJugador")).forEach(
    (btn) => {
      btn.addEventListener("click", handleBtnSustitucionJugador);
    }
  );

  Array.from(document.getElementsByClassName("BtnRetiroJugador")).forEach(
    (btn) => {
      btn.addEventListener("click", handleBtnRetiroJugador);
    }
  );

  Array.from(document.getElementsByClassName("BtnAgregarFoulJugador")).forEach(
    (btn) => {
      btn.addEventListener("click", handleBtnAgregarFoulJugador);
    }
  );

  Array.from(
    document.getElementsByClassName("ModificarPuntajeJugador")
  ).forEach((btn) => {
    btn.addEventListener("click", handleModificarPuntajeJugador);
  });
}

function handleBtnSustitucionJugador(e) {
  let jugador = this.dataset.jugador;
  let equipo = this.dataset.equipo;

  let msg = {
    accion: "lista_jugadores_open_window",
    data: { tipo: equipo, modo: "sustitucion", jugador },
  };
  window.api.send("toMain", msg);
}

function handleBtnRetiroJugador(e) {
  let jugador = this.dataset.jugador;
  let equipo = this.dataset.equipo;

  let msg = {
    accion: "lista_jugadores_open_window",
    data: { tipo: equipo, modo: "retiro", jugador },
  };
  window.api.send("toMain", msg);
}

function handleBtnAgregarFoulJugador(e) {
  let jugador = this.dataset.jugador;
  let juego = this.dataset.juego;
  let equipo = this.dataset.equipo;

  // ----------------
  let tipo = equipo;
  let amount = 1;
  let action = "adicionar";

  amount = parseInt(amount, 10);

  let msg = {
    accion: "modificarFoulJugador",
    data: {
      jugador,
      id: juego,
      tipo,
      action,
      amount,
    },
  };
  window.api.send("toMain", msg);
}

function handleModificarPuntajeJugador(e) {
  let jugador = this.dataset.jugador;
  let juego = this.dataset.juego;
  let equipo = this.dataset.equipo;
  let amount = this.dataset.amount;
  let action = this.dataset.action;

  // ---------------
  if (action === "sustraer") {
    amount = parseInt(amount, 10) * -1;
  } else {
    amount = parseInt(amount, 10);
  }

  let msg = {
    accion: "modificarPuntajeJugador",
    data: {
      jugador,
      id: juego,
      tipo: equipo,
      action,
      amount,
    },
  };
  window.api.send("toMain", msg);
}
