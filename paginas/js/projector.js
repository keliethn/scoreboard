let slideActual = 0;
let slideUltimo = 0;
let interval = null;
let intervalTabla = null;
let intervalMinutosParaIniciar = null;
let timerMinutosParaIniciar = null;
let posicionPantallaHome = null;
let posicionPantallaVisitante = null;
let equipoTabla = "home";
window.api.receive("fromMain", (data) => {
  switch (data.accion) {
    case "mostrar_msg_bonus":
      mostrarMsgBonus(data.data);
      break;
    case "ocultar_msg_bonus":
      Array.from(document.getElementsByClassName("Bonus")).forEach((x) => {
        x.style.display = "none";
      });
      break;
    case "juego_obtener_resp":
      if (data.data !== null) {
        posicionPantallaVisitante = data.data.visitantePosicionPantalla;
        posicionPantallaHome = data.data.homePosicionPantalla;
      }

      handleAgregarJuegoActivo(data.data);
      let msg1 = {
        accion: "obtenerTextoTimer",
        data: {},
      };
      window.api.send("toMain", msg1);
      break;
    case "publicidad_obtener_resp":
      handleAgregarPublicidad(data.data);
      let msg2 = {
        accion: "obtenerTextoTimer",
        data: {},
      };
      window.api.send("toMain", msg2);
      break;
    case "juego_obtener_resp_modif":
      if (data.data !== null) {
        posicionPantallaVisitante = data.data.visitantePosicionPantalla;
        posicionPantallaHome = data.data.homePosicionPantalla;
      }

      handleAgregarJuegoActivo(data.data);
      break;
    case "projector_logo_open":
      handleLogoProyector();
      break;
    case "projector_blank_open":
      handleOscurecerProyector();
      break;
    case "projector_publicidad_open":
      let msg3 = {
        accion: "obtenerImagenesPublicidad",
        data: { ventana: "projector" },
      };
      window.api.send("toMain", msg3);
      //handlePublicidadProyector();
      break;
    case "obtener_publicidad_resp":
      handlePublicidadProyector(data.data, data.minutos, data.tipo);
      break;
    case "projector_pizarra_open":
      handlePizarraProyector(data.data);
      break;
    case "projector_tabla_open":
      handleTablaProyector(data.data);
      break;
    case "actualizarTimer":
      let timerElement = document.getElementById("timer");
      timerElement.innerText = data.data;
      break;
    case "actualizarTextoPeriodo":
      let periodoActualElement = document.getElementById("actualizaPeriodo");
      periodoActualElement.innerText = "";
      let textoPeriodo = `${
        data.data.overtime === true ? "OVERTIME" : "PERIODO"
      } ${data.data.periodo}`;
      periodoActualElement.innerText = textoPeriodo;
      break;
    case "actualizarTextoTimer":
      let timerEl = document.getElementById("timer");
      timerEl.innerText = data.data;
      break;
    case "minutos_inicio_obtener_resp":
      let elemento;
      if (data.data.minutos <= 0) {
        let publicidad = document.getElementById("publicidad");
        // let contenedor = document.getElementById("publicidad");
        elemento = document.getElementById("pizarra");
        elemento.style.display = "block";
        publicidad.style.display = "none";
      }

      break;
  }
});

window.onload = function () {
  let msg = {
    accion: "juego_obtener_activo",
    data: {},
  };
  window.api.send("toMain", msg);
  let msg2 = {
    accion: "minutos_inicio_obtener",
    data: {},
  };
  window.api.send("toMain", msg2);
};

function startTimer(duration, display) {
  var timer = duration,
    minutes,
    seconds;
  const interval = setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = minutes + ":" + seconds;

    if (--timer < 0) {
      timer = duration;
      clearInterval(interval);
    }
  }, 1000);
}

function handleLogoProyector() {
  let pizarra = document.getElementById("pizarra");
  let blank = document.getElementById("blank");
  let logo = document.getElementById("logo");
  let publicidad = document.getElementById("publicidad");
  let tabla = document.getElementById("tabla");
  publicidad.style.display = "none";
  pizarra.style.display = "none";
  blank.style.display = "none";
  tabla.style.display = "none";
  logo.style.display = "block";
  pausarPublicidad();
  pausarTabla();
}

function handleOscurecerProyector() {
  let pizarra = document.getElementById("pizarra");
  let blank = document.getElementById("blank");
  let logo = document.getElementById("logo");
  let publicidad = document.getElementById("publicidad");
  let tabla = document.getElementById("tabla");
  publicidad.style.display = "none";
  pizarra.style.display = "none";
  logo.style.display = "none";
  tabla.style.display = "none";
  blank.style.display = "block";
  pausarPublicidad();
  pausarTabla();
}

function handlePublicidadProyector(imagenes, minutos, tipo) {
  let pizarra = document.getElementById("pizarra");
  let blank = document.getElementById("blank");
  let logo = document.getElementById("logo");
  let publicidad = document.getElementById("publicidad");
  let tabla = document.getElementById("tabla");
  pausarTabla();
  let contenedorPublicidad = document.getElementById("contenedorPublicidad");
  slideUltimo = imagenes.length - 1;
  contenedorPublicidad.innerHTML = "";
  slides = "";
  imagenes.forEach((imagen, index) => {
    let display = "display:none;";
    if (index === 0) {
      display = "display:flex";
    }
    slides += `<div class='ContenedorSlide' id='ContenedorSlide-${index}' style='width:100%;height:100%;${display};align-items:center;justify-content:center'>
  <img src="${imagen}" style="height:100%" />
  </div>`;
  });

  let divMinutosParaIniciarPublicidad = document.getElementById(
    "minutosParaIniciarPublicidad"
  );
  if (minutos > 0) {
    if (tipo !== "previo") {
      setTimeout(() => {
        contenedorPublicidad.innerHTML = slides;
        publicidad.style.display = "flex";
        pizarra.style.display = "none";
        logo.style.display = "none";
        blank.style.display = "none";
        tabla.style.display = "none";
        timerSlidesPublicidad();
        divMinutosParaIniciarPublicidad.style.display = "block";
        contenedorPublicidad.style.height = "85%";
        let texto = textoPublicidad(minutos, tipo);
        divMinutosParaIniciarPublicidad.innerText = texto;
        timerTextoPublicidad(minutos, tipo);
      }, 10000);
    } else {
      contenedorPublicidad.innerHTML = slides;
      publicidad.style.display = "flex";
      pizarra.style.display = "none";
      logo.style.display = "none";
      blank.style.display = "none";
      tabla.style.display = "none";
      timerSlidesPublicidad();
      divMinutosParaIniciarPublicidad.style.display = "block";
      contenedorPublicidad.style.height = "85%";
      let texto = textoPublicidad(minutos, tipo);
      divMinutosParaIniciarPublicidad.innerText = texto;
      timerTextoPublicidad(minutos, tipo);
    }
  } else {
    contenedorPublicidad.innerHTML = slides;
    publicidad.style.display = "flex";
    pizarra.style.display = "none";
    logo.style.display = "none";
    blank.style.display = "none";
    tabla.style.display = "none";
    timerSlidesPublicidad();
    divMinutosParaIniciarPublicidad.style.display = "none";
    contenedorPublicidad.style.height = "100%";
  }
}

function handlePizarraProyector() {
  let pizarra = document.getElementById("pizarra");
  let blank = document.getElementById("blank");
  let logo = document.getElementById("logo");
  let publicidad = document.getElementById("publicidad");
  let tabla = document.getElementById("tabla");
  publicidad.style.display = "none";
  blank.style.display = "none";
  logo.style.display = "none";
  tabla.style.display = "none";
  pizarra.style.display = "block";
  pausarPublicidad();
  pausarTabla();
}
function handleTablaProyector(data) {
  let pizarra = document.getElementById("pizarra");
  let blank = document.getElementById("blank");
  let logo = document.getElementById("logo");
  let publicidad = document.getElementById("publicidad");
  let tabla = document.getElementById("tabla");
  publicidad.style.display = "none";
  blank.style.display = "none";
  logo.style.display = "none";
  pizarra.style.display = "none";
  tabla.style.display = "flex";
  pausarPublicidad();
  iniciarTimerTabla(data);
}

function handleAgregarJuegoActivo(data) {
  if (data !== null) {
    let logoHome = document.getElementById("logoHome");
    let logoVisitante = document.getElementById("logoVisitante");
    let tituloHome = document.getElementById("nombreEquipoHome");
    let tituloVisitante = document.getElementById("nombreEquipoVisitante");
    let actualizaPeriodo = document.getElementById("actualizaPeriodo");
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

    tituloHome.innerHTML =
      data.homePosicionPantalla === "izquierda" ? data.home : data.visitante;
    tituloVisitante.innerHTML =
      data.visitantePosicionPantalla === "derecha" ? data.visitante : data.home;

    logoHome.src =
      data.homePosicionPantalla === "izquierda"
        ? data.logoHome
        : data.logoVisitante;
    logoVisitante.src =
      data.visitantePosicionPantalla === "derecha"
        ? data.logoVisitante
        : data.logoHome;
    //
    let textoPeriodo = `${
      data.enTiempoExtra === true ? "OVERTIME" : "PERIODO"
    } ${
      data.enTiempoExtra === true ? data.overtimeActual : data.periodoActual
    }`;
    actualizaPeriodo.innerText = textoPeriodo;

    //

    let puntajeHome =
      data.homePosicionPantalla === "izquierda"
        ? data.puntajeHome
        : data.puntajeVisitante;
    let puntajeVisitante =
      data.visitantePosicionPantalla === "derecha"
        ? data.puntajeVisitante
        : data.puntajeHome;

    totalPuntajeHome.innerText =
      puntajeHome < 10
        ? "00" + puntajeHome
        : puntajeHome > 9 && puntajeHome < 100
        ? "0" + puntajeHome
        : puntajeHome;
    totalPuntajeVisitante.innerText =
      puntajeVisitante < 10
        ? "00" + puntajeVisitante
        : puntajeVisitante > 9 && puntajeVisitante < 100
        ? "0" + puntajeVisitante
        : puntajeVisitante;

    let timeoutHome =
      data.homePosicionPantalla === "izquierda"
        ? data.tiempoFueraHome
        : data.tiempoFueraVisitante;
    let timeoutVisitante =
      data.visitantePosicionPantalla === "derecha"
        ? data.tiempoFueraVisitante
        : data.tiempoFueraHome;

    totalTimeoutHome.innerText =
      timeoutHome < 10 ? "0" + timeoutHome : timeoutHome;

    totalTimeoutVisitante.innerText =
      timeoutVisitante < 10 ? "0" + timeoutVisitante : timeoutVisitante;

    let faltasHome =
      data.homePosicionPantalla === "izquierda"
        ? data.faltasHome
        : data.faltasVisitante;
    let faltasVisitante =
      data.visitantePosicionPantalla === "derecha"
        ? data.faltasVisitante
        : data.faltasHome;

    totalFoulHome.innerText = faltasHome < 10 ? "0" + faltasHome : faltasHome;

    totalFoulVisitante.innerText =
      faltasVisitante < 10 ? "0" + faltasVisitante : faltasVisitante;
  }
}

function pausarPublicidad() {
  clearInterval(interval);
  clearInterval(intervalMinutosParaIniciar);
}

function pausarTabla() {
  clearInterval(intervalTabla);
}

function timerSlidesPublicidad() {
  interval = setInterval(() => {
    Array.from(document.getElementsByClassName("ContenedorSlide")).forEach(
      (item) => {
        item.style.display = "none";
      }
    );
    let indexSiguienteItem = slideActual + 1;
    if (indexSiguienteItem > slideUltimo) {
      indexSiguienteItem = 0;
    }
    let idElementoMostrar = `ContenedorSlide-${indexSiguienteItem}`;
    let elementoAMostrar = document.getElementById(idElementoMostrar);
    elementoAMostrar.style.display = "flex";
    slideActual = indexSiguienteItem;
  }, 10000);
}

function iniciarTimerTabla(data) {
  let logoHomeTabla = document.getElementById("logoHomeTabla");
  let nombreEquipoHomeTabla = document.getElementById("nombreEquipoHomeTabla");
  let totalPuntajeHomeTabla = document.getElementById("totalPuntajeHomeTabla");
  let totalFoulHomeTabla = document.getElementById("totalFoulHomeTabla");
  let totalTimeoutHomeTabla = document.getElementById("totalTimeoutHomeTabla");
  let equipoInicial = data.find((x) => x.tipo === equipoTabla);

  logoHomeTabla.src = equipoInicial.logotipo;
  nombreEquipoHomeTabla.innerText = equipoInicial.nombre;
  totalPuntajeHomeTabla.innerText = equipoInicial.puntaje;
  totalFoulHomeTabla.innerText = equipoInicial.faltas;
  totalTimeoutHomeTabla.innerText = equipoInicial.timeouts;

  setTablaJugadores(equipoInicial.jugadores);

  intervalTabla = setInterval(() => {
    equipoTabla = equipoTabla === "home" ? "visitante" : "home";
    let equipo = data.find((x) => x.tipo === equipoTabla);

    logoHomeTabla.src = equipo.logotipo;
    nombreEquipoHomeTabla.innerText = equipo.nombre;
    totalPuntajeHomeTabla.innerText = equipo.puntaje;
    totalFoulHomeTabla.innerText = equipo.faltas;
    totalTimeoutHomeTabla.innerText = equipo.timeouts;
    setTablaJugadores(equipo.jugadores);
  }, 30000);
}

function setTablaJugadores(jugadores) {
  let ContenedorJugadoresTabla = document.getElementById(
    "ContenedorJugadoresTabla"
  );

  ContenedorJugadoresTabla.innerHTML = "";

  let tbody = "";

  jugadores.forEach((j) => {
    tbody += ` <tr>
    <td>
      <h1 class="display-5 font-weight-bold text-uppercase">
       ${j.numeroJugador}- ${j.nombreJugador}
      </h1>
    </td>
    <td>
      <h1 class="display-5 font-weight-bold text-center text-danger text-uppercase"> ${
        j.faltasJugador < 0 ? "---" : j.faltasJugador
      }</h1>
    </td>
    <td>
      <h1 class="display-5 font-weight-bold text-center text-uppercase"> ${
        j.puntajeJugador < 0 ? "---" : j.puntajeJugador
      }</h1>
    </td>
  </tr>`;
  });
  ContenedorJugadoresTabla.innerHTML = tbody;
}

function timerTextoPublicidad(minutos, tipo) {
  timerMinutosParaIniciar =
    tipo !== "previo" ? minutos * 60 - 10 : minutos * 60;
  var hours, minutes;

  intervalMinutosParaIniciar = setInterval(() => {
    minutes = parseInt(timerMinutosParaIniciar / 60, 10);
    seconds = parseInt(timerMinutosParaIniciar % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    let timeText = minutes + ":" + seconds;

    let divMinutosParaIniciarPublicidad = document.getElementById(
      "minutosParaIniciarPublicidad"
    );

    let encabezado = "";
    if (tipo === "previo") {
      encabezado = "El juego inicia en";
    } else if (tipo === "descanso") {
      encabezado = "Descanso termina en";
    } else if (tipo === "medio") {
      encabezado = "Medio tiempo termina en";
    }
    //return `${encabezado} ${timeText}`;

    divMinutosParaIniciarPublicidad.innerText = `${encabezado} ${timeText}`;
    //updateTime(timeText);

    if (--timerMinutosParaIniciar < 0) {
      clearInterval(intervalMinutosParaIniciar);

      let msg2 = {
        accion: "minutos_inicio_obtener",
        data: {},
      };
      window.api.send("toMain", msg2);
      // setTimeout(() => {
      //   obtenerJuegoActivo();
      // }, 4000);
    }
  }, 1000);
}

function textoPublicidad(minutos, tipo) {
  let timerAds = tipo !== "previo" ? minutos * 60 - 10 : minutos * 60;
  var seconds, minutes;
  minutes = parseInt(timerAds / 60, 10);
  seconds = parseInt(timerAds % 60, 10);

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  let timeText = minutes + ":" + seconds;
  let encabezado = "";
  if (tipo === "previo") {
    encabezado = "El juego inicia en";
  } else if (tipo === "descanso") {
    encabezado = "Descanso termina en";
  } else if (tipo === "medio") {
    encabezado = "Medio tiempo termina en";
  }
  return `${encabezado} ${timeText}`;
}

function mostrarMsgBonus(data) {
  let bonusHome = document.getElementById("bonusHome");
  let bonusVisitante = document.getElementById("bonusVisitante");

  if (data.tipo === "home") {
    if (posicionPantallaHome === "izquierda") {
      bonusHome.style.display = "block";
    } else {
      bonusVisitante.style.display = "block";
    }
  } else if (data.tipo === "visitante") {
    if (posicionPantallaVisitante === "derecha") {
      bonusVisitante.style.display = "block";
    } else {
      bonusHome.style.display = "block";
    }
  }
}
