const electron = require("electron");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
if (require("electron-squirrel-startup")) {
  return app.quit();
}

const equipos = require("./db/stores/team");
const juegos = require("./db/stores/game");
const ads = require("./db/stores/ads");
const ligas = require("./db/stores/leagues");
const jugadores = require("./db/stores/players");
const sistema = require("./db/stores/system");
const estadistica = require("./db/stores/stats");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const _ = require("lodash");
const moment = require("moment");
moment.locale("es");
const os = require("os");
const crypto = require("crypto-js");
const stats = require("./db/stores/stats");

//#region Variables Globales
//------------------- Ventanas ------------------- //
let winOperador;
let winProjector;
let winEquipos;
let winJuego;
let winEditTimer;
let winEditarEquipo;
let winPublicidad;
let winLigas;
let winReportes;
let winLicencia;
let winJugadores;
let winEditarJugador;
let winJugadoresJuego;

//------------------- Juego / Equipo / Jugadores ------------------- //
let idEquipoEditar = null;
let juegoActivo = null;

let equipoSeleccionado = null;
let idJugadorEditar = null;
let tipoListaJugadores = null;
let modoListaJugadores = "apertura";
let jugadorSustitucion = null;
let jugadorRetiro = null;

//------------------- Cronometros ------------------- //
let interval = null;
let duracion = null;
let timer = 0;
//#endregion

//#region Ventanas
function crearVentanaOperador() {
  winOperador = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winOperador.loadFile("./paginas/inicio.html");

  winOperador.setMenu(null);

  //
  winOperador.maximize();
}

function crearVentanaEquipos() {
  winEquipos = new BrowserWindow({
    width: 950,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winEquipos.loadFile("./paginas/manejador_equipos.html");

  winEquipos.setMenu(null);

  //

  equipos.obtenerTodos().then((equipos) => {
    winEquipos.webContents.send("fromMain", {
      accion: "equipos_obtener_todos",
      data: equipos,
    });
  });
}

function crearVentanaLigas() {
  winLigas = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winLigas.loadFile("./paginas/admin_ligas.html");

  winLigas.setMenu(null);

  ligas.obtenerTodos().then((ligas) => {
    winLigas.webContents.send("fromMain", {
      accion: "ligas_obtener_todos",
      data: ligas,
    });
  });
}

function crearVentanaAgregarJuego() {
  winJuego = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winJuego.loadFile("./paginas/agregar_juego.html");

  winJuego.setMenu(null);

  //
  equipos.obtenerTodos().then((equipos) => {
    winJuego.webContents.send("fromMain", {
      accion: "equipos_obtener_todos",
      data: equipos,
    });
  });
}

function crearVentanaEditarTimer() {
  winEditTimer = new BrowserWindow({
    width: 280,
    height: 400,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winEditTimer.loadFile("./paginas/editar_timer.html");

  winEditTimer.setMenu(null);
}

function crearVentanaManejoLicencia() {
  winLicencia = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winLicencia.loadFile("./paginas/admin_licencia.html");

  winLicencia.setMenu(null);
}

function crearVentanaManejoJugadores() {
  winJugadores = new BrowserWindow({
    width: 950,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });
  winJugadores.loadFile("./paginas/admin_jugadores.html");
  winJugadores.setMenu(null);
}

function crearVentanaListaJugadoresJuego() {
  winJugadoresJuego = new BrowserWindow({
    width: 950,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });
  winJugadoresJuego.loadFile("./paginas/admin_jugadores_juego.html");
  winJugadoresJuego.setMenu(null);
}

function crearVentanaPublicidad() {
  winPublicidad = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winPublicidad.loadFile("./paginas/admin_publicidad.html");

  winPublicidad.setMenu(null);
}

function crearVentanaEditarEquipo() {
  winEditarEquipo = new BrowserWindow({
    width: 400,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winEditarEquipo.loadFile("./paginas/editar_equipo.html");

  winEditarEquipo.setMenu(null);
}

function crearVentanaEditarJugador() {
  winEditarJugador = new BrowserWindow({
    width: 400,
    height: 550,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winEditarJugador.loadFile("./paginas/editar_jugador.html");

  winEditarJugador.setMenu(null);
}

function crearVentanaProyector() {
  let displays = electron.screen.getAllDisplays();
  let externalDisplay = displays.find((display) => display.bounds.x !== 0);

  if (externalDisplay) {
    winProjector = new BrowserWindow({
      width: 800,
      height: 700,
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      kiosk: true,
      fullscreen: true,
      webPreferences: {
        nodeIntegration: false, // is default value after Electron v5
        contextIsolation: true, // protect against prototype pollution
        enableRemoteModule: false, // turn off remote
        preload: path.join(__dirname, "preload.js"), // use a preload script
      },
    });

    winProjector.loadFile("./paginas/projector.html");

    winProjector.setMenu(null);

    winProjector.maximize();
  } else {
    winOperador.webContents.send("fromMain", {
      accion: "no_external_screen",
      data: {},
    });
  }
}

function crearVentanaReportes() {
  winReportes = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
    },
  });

  winReportes.loadFile("./paginas/reportes.html");

  winReportes.setMenu(null);

  winReportes.maximize();
}

//#endregion

//#region Eventos App y Ventanas
app.whenReady().then(() => {
  getSystemData().then((data) => {
    if (data === null) {
      crearVentanaManejoLicencia();
    } else {
      let jitid = getDeviceId(data);
      if (data.licencia === jitid) {
        crearVentanaOperador();
      } else {
        crearVentanaManejoLicencia();
      }
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    crearVentanaOperador();
  }
});

//#endregion

//#region Comunicación entre procesos ipc
ipcMain.on("toMain", (event, args) => {
  switch (args.accion) {
    case "generales_obtener":
      obtenerGenerales();
      break;
    //Projector
    case "projector_open_window":
      crearVentanaProyector();
      break;
    case "projector_close_window":
      if (winProjector !== undefined) {
        winProjector.close();
      }

      break;
    case "projector_logo_open":
      if (winProjector) {
        winProjector.webContents.send("fromMain", args);
      } else {
        winOperador.webContents.send("fromMain", {
          accion: "projector_screen_not_found",
        });
      }
      break;
    case "projector_publicidad_open":
      if (winProjector) {
        winProjector.webContents.send("fromMain", args);
      } else {
        winOperador.webContents.send("fromMain", {
          accion: "projector_screen_not_found",
        });
      }

      break;
    case "projector_blank_open":
      if (winProjector) {
        // winProjector.webContents.send("fromMain", args);
        winProjector.webContents.send("fromMain", args);
      } else {
        winOperador.webContents.send("fromMain", {
          accion: "projector_screen_not_found",
        });
      }
      break;
    case "projector_pizarra_open":
      if (winProjector) {
        // winProjector.webContents.send("fromMain", args);
        winProjector.webContents.send("fromMain", {
          accion: "projector_pizarra_open",
          data: args.data,
        });
      } else {
        winOperador.webContents.send("fromMain", {
          accion: "projector_screen_not_found",
        });
      }
      break;
    case "projector_tabla_open":
      juegos.obtenerUno({ estado: "activo" }).then((juego) => {
        if (juego !== null && juego.tipoNotacion !== "general") {
          estadistica
            .obtenerDonde({ idJuego: juego._id })
            .then((jEstadistica) => {
              jugadores
                .obtenerDonde({ equipo: juego.homeId })
                .then((jugadoresHome) => {
                  jugadores
                    .obtenerDonde({ equipo: juego.visitanteId })
                    .then((jugadoresVisitante) => {
                      let jEquipoHome = [];
                      let jEquipoVisitante = [];

                      jugadoresHome.forEach((jh) => {
                        let enJuegoHome = jEstadistica.find(
                          (x) => x.idJugador === jh._id
                        );
                        if (enJuegoHome !== undefined) {
                          jEquipoHome.push(enJuegoHome);
                        } else {
                          jEquipoHome.push({
                            idJuego: juego._id,
                            posicionEquipo: "home",
                            idJugador: jh._id,
                            numeroJugador: jh.numero,
                            nombreJugador: `${jh.nombre} ${jh.apellido}`,
                            puntajeJugador: -1,
                            faltasJugador: -1,
                            estadoJugador: 1,
                          });
                        }
                      });

                      jugadoresVisitante.forEach((jv) => {
                        let enJuegoVisitante = jEstadistica.find(
                          (x) => x.idJugador === jv._id
                        );
                        if (enJuegoVisitante !== undefined) {
                          jEquipoVisitante.push(enJuegoVisitante);
                        } else {
                          jEquipoVisitante.push({
                            idJuego: juego._id,
                            posicionEquipo: "visitante",
                            idJugador: jv._id,
                            numeroJugador: jv.numero,
                            nombreJugador: `${jv.nombre} ${jv.apellido}`,
                            puntajeJugador: -1,
                            faltasJugador: -1,
                            estadoJugador: 1,
                          });
                        }
                      });

                      // ---------------------

                      let respuesta = [];
                      respuesta.push({
                        tipo: "home",
                        logotipo: juego.logoHome,
                        nombre: juego.home,
                        puntaje: juego.puntajeHome,
                        faltas: juego.totalFaltasHome,
                        timeouts: juego.tiempoFueraHome,
                        jugadores: _.orderBy(
                          jEquipoHome,
                          ["numeroJugador"],
                          ["asc"]
                        ),
                      });

                      respuesta.push({
                        tipo: "visitante",
                        logotipo: juego.logoVisitante,
                        nombre: juego.visitante,
                        puntaje: juego.puntajeVisitante,
                        faltas: juego.totalFaltasVisitante,
                        timeouts: juego.tiempoFueraVisitante,
                        jugadores: _.orderBy(
                          jEquipoVisitante,
                          ["numeroJugador"],
                          ["asc"]
                        ),
                      });

                      if (winProjector) {
                        // winProjector.webContents.send("fromMain", args);
                        winProjector.webContents.send("fromMain", {
                          accion: "projector_tabla_open",
                          data: respuesta,
                        });
                      } else {
                        winOperador.webContents.send("fromMain", {
                          accion: "projector_screen_not_found",
                        });
                      }

                      // ---------------------
                    });
                });
            });
        }
      });

      break;
    //Equipo
    case "equipos_open_window":
      crearVentanaEquipos();

      break;
    case "equipos_agregar":
      agregarEquipo(args.data);
      break;
    case "equipo_eliminar":
      eliminarEquipo(args.data);
      break;
    case "equipo_edit_window":
      idEquipoEditar = args.data.id;
      crearVentanaEditarEquipo();
      break;
    case "equipo_editar":
      editarEquipo(args.data);
      break;
    case "equipo_obtener_editar":
      equipos.obtener(idEquipoEditar).then((equipo) => {
        winEditarEquipo.webContents.send("fromMain", {
          accion: "equipo_editar_obtener_resp",
          data: equipo,
        });
      });
      break;
    case "equipos_obtener":
      equiposObtener();

      break;
    case "equipos_obtener_juego":
      equipos.obtenerDonde({ liga: args.data.liga }).then((equipos) => {
        if (args.data.ventana === "juego") {
          winJuego.webContents.send("fromMain", {
            accion: "equipos_obtener_resp",
            data: equipos,
          });
        }

        if (args.data.ventana === "reporte") {
          winReportes.webContents.send("fromMain", {
            accion: "equipos_obtener_resp",
            data: equipos,
          });
        }
      });
      break;
    case "seleccionar_logo_dialogo":
      dialog
        .showOpenDialog(winEquipos, {
          title: "Seleccionar logotipo",
          buttonLabel: "Cargar logo",
          properties: ["openFile"],
        })
        .then((paths) => {
          if (paths.canceled !== true) {
            if (args.data.tipo === "admin") {
              winEquipos.webContents.send("fromMain", {
                accion: "logo_obtener_resp",
                data: paths.filePaths[0],
              });
            } else {
              winEditarEquipo.webContents.send("fromMain", {
                accion: "logo_obtener_resp",
                data: paths.filePaths[0],
              });
            }
          }
        });

      break;
    //Ligas
    case "ligas_open_window":
      crearVentanaLigas();

      break;
    case "ligas_agregar":
      agregarLiga(args.data);
      break;
    case "liga_eliminar":
      eliminarLiga(args.data);
      break;
    case "ligas_obtener":
      ligas.obtenerTodos().then((ligas) => {
        if (args.data.tipo == "liga") {
          winLigas.webContents.send("fromMain", {
            accion: "ligas_obtener_resp",
            data: ligas,
          });
        } else if (args.data.tipo == "equipo") {
          winEquipos.webContents.send("fromMain", {
            accion: "ligas_obtener_resp",
            data: ligas,
          });
        } else if (args.data.tipo == "juego") {
          winJuego.webContents.send("fromMain", {
            accion: "ligas_obtener_resp",
            data: ligas,
          });
        } else if (args.data.tipo == "reporte") {
          if (winReportes) {
            winReportes.webContents.send("fromMain", {
              accion: "ligas_obtener_resp",
              data: ligas,
            });
          }
        }
      });
      break;
    //Juegos
    case "juego_eliminar":
      eliminarJuego(args.data);
      break;
    case "juego_agregar_window":
      crearVentanaAgregarJuego();

      break;
    case "juego_agregar":
      agregarJuego(args.data);
      break;
    case "juego_terminar":
      terminarJuego();
      break;
    case "juego_obtener_activo":
      obtenerJuegoActivo(args.data);
      break;
    //Publicidad
    case "publicidad_open_window":
      crearVentanaPublicidad();

      break;
    case "eliminar_publicidad":
      eliminarPublicidad(args.data);
      break;
    case "seleccionar_publicidad_dialogo":
      dialog
        .showOpenDialog(winPublicidad, {
          title: "Cargar publicidad",
          buttonLabel: "Cargar publicidad",
          properties: ["openFile", "multiSelections"],
        })
        .then((paths) => {
          if (paths.canceled !== true) {
            let appPath = app.getAppPath();
            paths.filePaths.forEach((f) => {
              const anuncio = fs.readFileSync(f);
              let anuncioExt = f.split(".")[1];
              let nombreArchivo = f.replace(/^\D+/g, "").split(".")[0];
              let anuncioPath = path.join(
                appPath,
                `/assets/ads/ad_${nombreArchivo}.${anuncioExt}`
              );
              fsExtra.outputFileSync(anuncioPath, anuncio);
              ads
                .agregar({
                  ubicacion: anuncioPath,
                  nombre: `ad_${nombreArchivo}`,
                })
                .then((resp) => {});
            });
            obtenerImagenesPublicidad("admin", 0, "");
            obtenerImagenesPublicidad("projector", 0, "");
            //  winPublicidad.webContents.send("fromMain", {
            //   accion: "publicidad_obtener_resp",
            //   data: paths.filePaths,
            // });
          }
        });

      break;
    case "obtenerImagenesPublicidad":
      let minutos_ = minutosParaIniciar();

      if (minutos_ > 0) {
        if (winProjector) {
          winProjector.webContents.send("fromMain", {
            accion: "minutos_inicio_obtener_resp",
            data: { minutos: minutos_, tipo: "previo" }, //previo,descanso,medio
          });
        }
        obtenerImagenesPublicidad("projector", minutos_, "previo");
      } else {
        obtenerImagenesPublicidad(args.data.ventana, 0, "");
      }

      break;
    case "minutos_inicio_obtener":
      let minutos = minutosParaIniciar();
      if (winProjector) {
        winProjector.webContents.send("fromMain", {
          accion: "minutos_inicio_obtener_resp",
          data: { minutos, tipo: "previo" }, //previo,descanso,medio
        });
        if (minutos > 0) {
          obtenerImagenesPublicidad("projector", minutos, "previo");
        }
      }

      break;
    //Cronometro principal
    case "timer_edit_window":
      crearVentanaEditarTimer();
      break;
    case "editar_duracion":
      duracion = args.data;
      actualizarTextoTimer(duracion);
      winEditTimer.close();
      break;
    case "obtenerTextoTimer":
      actualizarTextoTimer(duracion);
      break;
    case "timer_obtener_duracion":
      winEditTimer.webContents.send("fromMain", {
        accion: "duration_obtener_resp",
        data: duracion,
      });
      break;
    case "timer_play":
      playTimer(args.data.pause);
      break;
    case "respuestaOvertime":
      respuestaOvertime(args.data);
      break;
    // Acciones en juego activo
    case "modificarPuntaje":
      modificarPuntaje(args.data);
      break;
    case "modificarPuntajeJugador":
      modificarPuntajeJugador(args.data);
      break;
    case "modificarTimeout":
      modificarTimeout(args.data);
      break;
    case "modificarFoul":
      modificarFoul(args.data);
      break;
    case "modificarFoulJugador":
      modificarFoulJugador(args.data);
      break;
    case "cambiarPosicionPantalla":
      cambiarPosicionPantalla(args.data.id);
      break;
    // Reportes
    case "reportes_open_window":
      crearVentanaReportes();
      break;
    case "buscar_juegos":
      buscarJuegos(args.data);
      break;
    case "guardar_reporte":
      guardarReporte();
      break;
    //Licencia
    case "licencia_obtener":
      let response = {
        msg: "",
        data: {},
      };
      getSystemData().then((data) => {
        if (data === null) {
          response.msg = "solicitud";
          response.data = {};
        } else {
          if (data.estado === 0) {
            response.msg = "confirmacion";
            response.data = {};
          } else if (data.estado === 1) {
            let jitid = getDeviceId(data);
            if (jitid === data.licencia) {
              response.msg = "info";
              response.data = data;
            } else {
              response.msg = "error";
              response.data = {};
            }
          }
        }
        winLicencia.webContents.send("fromMain", {
          accion: "licencia_obtener_resp",
          data: response,
        });
      });

      break;
    case "licencia_solicitar":
      solicitarLicencia(args.data);
      break;
    case "licencia_regenerar":
      regenerarLicencia();
      break;
    case "licencia_instalar":
      instalarLicencia();
      break;
    case "licencia_open_window":
      crearVentanaManejoLicencia();
      break;
    //Jugadores
    case "jugador_sustituir_juego":
      sustituirJugador(args.data);
      break;
    case "jugador_retirar_juego":
      retirarJugador(args.data);
      break;
    case "obtenerJugadoresActivos":
      obtenerJugadoresActivos();

      break;
    case "jugadores_agregar_lista_juego":
      let listaJugadoresJuegoAgregar = args.data;
      listaJugadoresJuegoAgregar = listaJugadoresJuegoAgregar.map((x) => {
        x.idJuego = juegoActivo._id;
        x.posicionEquipo = tipoListaJugadores;
        x.puntajeJugador = 0;
        x.faltasJugador = 0;
        x.estadoJugador = 1;
        return x;
      });
      estadistica.agregar(listaJugadoresJuegoAgregar).then(() => {
        obtenerJugadoresActivos();
        if (winJugadoresJuego) {
          winJugadoresJuego.close();
        }
      });
      break;
    case "jugadores_obtener_disponible":
      let lista = [];
      let idJuego = null;
      let idEquipo = null;
      let nombreEquipo = null;
      idJuego = juegoActivo._id;
      idEquipo =
        tipoListaJugadores === "home"
          ? juegoActivo.homeId
          : juegoActivo.visitanteId;
      nombreEquipo =
        tipoListaJugadores === "home"
          ? juegoActivo.home
          : juegoActivo.visitante;
      jugadores.obtenerDonde({ equipo: idEquipo }).then((jugadores) => {
        if (jugadores.length === 0) {
          winJugadoresJuego.webContents.send("fromMain", {
            accion: "no_jugadores_equipo",
            data: {},
          });
        } else if (jugadores.length < 5) {
          winJugadoresJuego.webContents.send("fromMain", {
            accion: "no_jugadores_completo",
            data: {},
          });
        } else {
          stats
            .obtenerDonde({
              posicionEquipo: tipoListaJugadores,
              idJuego: idJuego,
            })
            .then((enJuego) => {
              if (enJuego.length === 0) {
                lista = jugadores;
              } else {
                let noDisponibles = enJuego.filter(
                  (x) => x.estadoJugador !== 2
                );

                noDisponibles = noDisponibles.map((x) => {
                  return x.idJugador;
                });

                jugadores.forEach((x) => {
                  if (noDisponibles.find((n) => n === x._id) === undefined) {
                    lista.push(x);
                  }
                });
              }
              winJugadoresJuego.webContents.send("fromMain", {
                accion: "jugadores_disponibles_resp",
                data: {
                  lista: _.orderBy(lista, ["numero"], ["asc"]),
                  nombreEquipo: nombreEquipo,
                  modo: modoListaJugadores,
                },
              });
            });
        }
      });

      break;
    case "lista_jugadores_open_window":
      tipoListaJugadores = args.data.tipo;
      modoListaJugadores = args.data.modo;
      if (modoListaJugadores === "sustitucion") {
        jugadorSustitucion = args.data.jugador;
      } else if (modoListaJugadores === "retiro") {
        jugadorRetiro = args.data.jugador;
      }
      crearVentanaListaJugadoresJuego();
      break;
    case "jugador_edit_window":
      idJugadorEditar = args.data.id;
      crearVentanaEditarJugador();
      break;
    case "jugador_editar":
      editarJugador(args.data);
      break;
    case "jugador_eliminar":
      eliminarJugador(args.data);
      break;
    case "equipo_jugadores_window":
      equipoSeleccionado = args.data.id;
      crearVentanaManejoJugadores();
      break;
    case "jugadores_equipo_obtener":
      JugadoresEquiposObtener();

      break;
    case "jugador_agregar":
      agregarJugador(args.data);
      break;
    case "jugador_obtener_editar":
      jugadores.obtener(idJugadorEditar).then((equipo) => {
        winEditarJugador.webContents.send("fromMain", {
          accion: "jugador_editar_obtener_resp",
          data: equipo,
        });
      });
      break;
      break;
  }
});
//#endregion

//------------------- Manejadores ------------------- //
function obtenerGenerales() {
  sistema.obtenerDonde({ estado: 1 }).then((resultado) => {
    let toSend = {
      titular: "Scoreboard Baloncesto",
    };
    if (resultado.length === 1) {
      toSend.titular = `Scoreboard Baloncesto | ${resultado[0].organizacion}`;
    }
    winOperador.webContents.send("fromMain", {
      accion: "generales_obtener_resp",
      data: toSend,
    });
  });
}
//#region Equipos
function equiposObtener() {
  equipos.obtenerTodos().then((equipos) => {
    winEquipos.webContents.send("fromMain", {
      accion: "equipos_obtener_resp",
      data: _.orderBy(equipos, ["nombre"], ["asc"]),
    });
  });
}
function agregarEquipo(data) {
  if (data.logo !== "") {
    const logo = fs.readFileSync(data.logo);
    let appPath = app.getAppPath();
    let logoExt = data.logo.split(".")[1];
    let slug = data.nombre.replace(/ /g, "_");
    let logoPath = path.join(
      appPath,
      `/assets/equipos/logo_${slug}.${logoExt}`
    );
    fsExtra.outputFileSync(logoPath, logo);
    data.logo = logoPath;
  }
  data.totalJugadores = 0;
  equipos.agregar(data).then((resp) => {
    equipos.obtenerTodos().then((equipos) => {
      winEquipos.webContents.send("fromMain", {
        accion: "equipos_obtener_resp",
        data: equipos,
      });
      winEquipos.webContents.send("fromMain", {
        accion: "equipos_agregar_resp",
        data: resp,
      });
    });
  });
}

function eliminarEquipo(data) {
  equipos.eliminar(data.id).then((resp) => {
    equipos.obtenerTodos().then((equipos) => {
      winEquipos.webContents.send("fromMain", {
        accion: "equipos_obtener_resp",
        data: equipos,
      });
      winEquipos.webContents.send("fromMain", {
        accion: "equipos_eliminar_resp",
        data: resp,
      });
    });
  });
}

function editarEquipo(equipo) {
  let logo = "";
  let logoPath = "";
  if (equipo.logo !== "") {
    fs.readFileSync(equipo.logo);
    let appPath = app.getAppPath();
    let logoExt = equipo.logo.split(".")[1];
    let slug = equipo.nombre.replace(/ /g, "_");
    logoPath = path.join(appPath, `/assets/equipos/logo_${slug}.${logoExt}`);
  }

  equipos.obtener(idEquipoEditar).then((eq) => {
    if (logoPath !== "") {
      fsExtra.outputFileSync(logoPath, logo);
      equipo.logo = logoPath;
    }

    equipos.actualizar(idEquipoEditar, equipo).then((resp) => {
      juegos.actualizaDonde(
        { homeId: idEquipoEditar },
        { home: equipo.nombre, logoHome: equipo.logo }
      );
      juegos.actualizaDonde(
        { visitanteId: idEquipoEditar },
        { visitante: equipo.nombre, logoVisitante: equipo.logo }
      );
      equipos.obtenerTodos().then((equipos) => {
        idEquipoEditar = null;
        winEquipos.webContents.send("fromMain", {
          accion: "equipos_obtener_resp",
          data: equipos,
        });
        winEquipos.webContents.send("fromMain", {
          accion: "equipo_editar_resp",
          data: resp,
        });
        obtenerJuegoActivo(true);
        winEditarEquipo.close();
      });
    });
  });
}

//#endregion

//#region Ligas

function agregarLiga(data) {
  ligas.agregar(data).then((resp) => {
    ligas.obtenerTodos().then((ligas) => {
      winLigas.webContents.send("fromMain", {
        accion: "ligas_obtener_resp",
        data: ligas,
      });
      winLigas.webContents.send("fromMain", {
        accion: "ligas_agregar_resp",
        data: ligas,
      });
    });
  });
}

function eliminarLiga(data) {
  ligas.eliminar(data.id).then((resp) => {
    ligas.obtenerTodos().then((ligas) => {
      winLigas.webContents.send("fromMain", {
        accion: "ligas_obtener_resp",
        data: ligas,
      });
      winLigas.webContents.send("fromMain", {
        accion: "ligas_eliminar_resp",
        data: resp,
      });
    });
  });
}
//#endregion

//#region Juegos
function eliminarJuego(data) {
  juegos.eliminar(data.id).then((resp) => {
    winReportes.webContents.send("fromMain", {
      accion: "juego_eliminar_resp",
      data: resp,
    });
  });
}
function agregarJuego(data) {
  let ahora = moment();
  data.fecha = moment(
    `${ahora.format("DD/MM/YYYY")} ${data.fecha}`,
    "DD/MM/YYYY hh:mm"
  ).valueOf();
  juegos.agregar(data).then((resp) => {
    obtenerJuegoActivo(true);
    winJuego.close();
  });
}
function terminarJuego() {
  juegos
    .actualizar(juegoActivo._id, {
      estado: "inactivo",
    })
    .then(() => {
      obtenerJuegoActivo(null);
    });
}
function obtenerJuegoActivo(inicial = null) {
  juegos.obtenerUno({ estado: "activo" }).then((juego) => {
    if (juego !== null) {
      juegoActivo = juego;
      // if (juego.tipoNotacion === "detallada") {
      //   estadistica
      //     .obtenerDonde({ idJuego: juego._id, estadoJugador: 1 })
      //     .then((jugadores) => {
      //       jugadoresEnJuego = jugadores;
      //       winOperador.webContents.send("fromMain", {
      //         accion: "jugadores_obtener_resp",
      //         data: { jugadores: jugadoresEnJuego },
      //       });
      //     });
      // }

      duracion =
        juego.enTiempoExtra === false
          ? juego.duracionPeriodo * 60
          : juego.duracionOvertime * 60;
      duracionOvertime = juego.duracionOvertime * 60;
      timer = duracion;
      if (inicial !== null) {
        actualizarTextoTimer(duracion);
      }
      if (juegoActivo.enTiempoExtra === false) {
        actualizarPeriodoActual(null, inicial);
      } else {
        actualizarPeriodoActual(juego.enTiempoExtra, inicial);
      }
      winOperador.webContents.send("fromMain", {
        accion: "juego_obtener_resp",
        data: { juego },
      });
      if (winProjector) {
        winProjector.webContents.send("fromMain", {
          accion: "juego_obtener_resp",
          data: juego,
        });
      }
    } else {
      winOperador.webContents.send("fromMain", {
        accion: "juego_obtener_resp",
        data: { juego },
      });
      if (winProjector) {
        obtenerImagenesPublicidad("projector", 0, "");
      }
    }
  });
}

function buscarJuegos(data) {
  let query = {};
  Object.keys(data).forEach((key) => {
    if (key !== "fechaInicio" && key !== "fechaFinal") {
      if (data[key] !== null && data[key] !== "") {
        query[key] = data[key];
      }
    } else {
      if (key === "fechaInicio" && data[key] !== null && data[key] !== "") {
        let fInicio = moment(data[key], "YYYY-MM-DD").startOf("day").valueOf();
        query["fecha"] = { $gte: fInicio };
      } else if (
        key === "fechaFinal" &&
        data[key] !== null &&
        data[key] !== ""
      ) {
        let fFin = moment(data[key], "YYYY-MM-DD").endOf("day").valueOf();
        query["fecha"] = { $lte: fFin };
      }
    }

    juegos.obtenerDonde(query).then((juegos) => {
      juegos = juegos.map((j) => {
        j.fechaTexto = moment(j.fecha).format("DD MMM YYYY");
        return j;
      });
      winReportes.webContents.send("fromMain", {
        accion: "buscar_juegos_resp",
        data: juegos,
      });
    });
  });
}
//#endregion

//#region Publicidad

function eliminarPublicidad(data) {
  ads.eliminar(data.id).then(() => {
    obtenerImagenesPublicidad("admin", 0, "");
    obtenerImagenesPublicidad("projector", 0, "");
  });
}

function obtenerImagenesPublicidad(ventana, minutos = 0, tipo = "") {
  ads.obtenerTodos().then((anuncios) => {
    let imagenes = [];
    let ads = _.orderBy(anuncios, ["nombre"], ["asc"]);
    ads.forEach((a) => {
      imagenes.push(a.ubicacion);
    });

    if (ventana === "projector") {
      if (winProjector) {
        winProjector.webContents.send("fromMain", {
          accion: "obtener_publicidad_resp",
          data: imagenes,
          minutos,
          tipo,
        });
      }
    } else {
      winPublicidad.webContents.send("fromMain", {
        accion: "obtener_publicidad_resp",
        data: ads,
        minutos,
        tipo,
      });
    }
  });
}

function minutosParaIniciar() {
  let minutosParaIniciar = 0;
  if (juegoActivo !== null) {
    let ahora = moment();
    let horaInicio = moment(juegoActivo.fecha);
    let duration = moment.duration(horaInicio.diff(ahora));
    minutosParaIniciar = duration.asMinutes();
  }
  return minutosParaIniciar;
}
//#endregion

//#region Cronometro Principal

function playTimer(pausado) {
  if (pausado === true) {
    if (interval !== null) {
      clearInterval(interval);
      duracion = timer;
    } else {
      return;
    }
  } else {
    ocultarMsgBonus();
    timer = duracion;
    var minutes, seconds;

    interval = setInterval(() => {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      let timeText = minutes + ":" + seconds;
      updateTime(timeText);

      if (--timer < 0) {
        //timer = duracion;
        clearInterval(interval);
        if (juegoActivo.periodoActual < juegoActivo.totalPeriodos) {
          iniciarPublicidad();
        }

        reiniciarFaltas();
        setTimeout(() => {
          obtenerJuegoActivo();
        }, 4000);
      }
    }, 1000);
  }
}

function updateTime(t) {
  winOperador.webContents.send("fromMain", {
    accion: "actualizarTimer",
    data: t,
  });
  if (winProjector) {
    winProjector.webContents.send("fromMain", {
      accion: "actualizarTimer",
      data: t,
    });
  }
}

function actualizarTextoTimer(d) {
  let response = secondsToText(d);
  winOperador.webContents.send("fromMain", {
    accion: "actualizarTextoTimer",
    data: response,
  });
  if (winProjector) {
    winProjector.webContents.send("fromMain", {
      accion: "actualizarTextoTimer",
      data: response,
    });
  }
}

function actualizarPeriodoActual(overtime, inicial) {
  if (overtime === null) {
    let periodo = juegoActivo.periodoActual;
    if (periodo < juegoActivo.totalPeriodos) {
      if (inicial === null) {
        periodo += 1;
      } else {
        periodo = juegoActivo.periodoActual;
      }

      juegos
        .actualizar(juegoActivo._id, {
          periodoActual: periodo,
          periodoConcluido: juegoActivo.periodoActual,
        })
        .then(() => {
          juegoActivo.periodoActual = periodo;
          winOperador.webContents.send("fromMain", {
            accion: "actualizarTextoPeriodo",
            data: { periodo: periodo, overtime: juegoActivo.enTiempoExtra },
          });
          if (winProjector) {
            winProjector.webContents.send("fromMain", {
              accion: "actualizarTextoPeriodo",
              data: { periodo: periodo, overtime: juegoActivo.enTiempoExtra },
            });
          }
        });
    } else {
      winOperador.webContents.send("fromMain", {
        accion: "preguntarOvertime",
        data: {},
      });
    }
  } else {
    if (overtime === true) {
      let periodo = juegoActivo.overtimeActual;
      if (inicial === null) {
        periodo += 1;
      } else {
        periodo = juegoActivo.overtimeActual;
      }
      //periodo += 1;
      juegos
        .actualizar(juegoActivo._id, {
          overtimeActual: periodo,
          periodoConcluido: periodo === 1 ? 0 : juegoActivo.overtimeActual,
        })
        .then(() => {
          juegoActivo.overtimeActual = periodo;
          winOperador.webContents.send("fromMain", {
            accion: "actualizarTextoPeriodo",
            data: { periodo: periodo, overtime: juegoActivo.enTiempoExtra },
          });
          if (winProjector) {
            winProjector.webContents.send("fromMain", {
              accion: "actualizarTextoPeriodo",
              data: { periodo: periodo, overtime: juegoActivo.enTiempoExtra },
            });
          }
        });
    } else {
      juegos.actualizar(juegoActivo._id, { estado: "inactivo" }).then(() => {
        obtenerJuegoActivo(null);
      });
    }
  }
}

function secondsToText(duracion) {
  let timer = duracion;
  let minutes, seconds;
  minutes = parseInt(timer / 60, 10);
  seconds = parseInt(timer % 60, 10);

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  let timeText = minutes + ":" + seconds;
  return timeText;
}

function respuestaOvertime(overtime) {
  if (overtime === true) {
    juegos.actualizar(juegoActivo._id, { enTiempoExtra: overtime }).then(() => {
      juegoActivo.enTiempoExtra = true;
      obtenerJuegoActivo(null);
    });
  } else {
    //Todo: Suspender juego
    //terminarJuego();
  }
}
//#endregion

//#region Acciones en juego activo

function modificarPuntaje(data) {
  let dataActualizacion = {
    puntajeHome: 0,
    puntajeVisitante: 0,
  };
  let puntaje =
    data.tipo === "home"
      ? juegoActivo.puntajeHome
      : juegoActivo.puntajeVisitante;
  let nuevoPuntaje = puntaje + data.amount;

  nuevoPuntaje = nuevoPuntaje > 0 ? nuevoPuntaje : 0;
  if (data.tipo === "home") {
    dataActualizacion.puntajeHome = nuevoPuntaje;
    dataActualizacion.puntajeVisitante = juegoActivo.puntajeVisitante;
  } else {
    dataActualizacion.puntajeVisitante = nuevoPuntaje;
    dataActualizacion.puntajeHome = juegoActivo.puntajeHome;
  }
  juegos.actualizar(data.id, dataActualizacion).then(() => {
    juegos.obtenerUno({ estado: "activo" }).then((juego) => {
      if (juego !== null) {
        juegoActivo = juego;
        //totalPeriodos = juego.totalPeriodos;
      }
      winOperador.webContents.send("fromMain", {
        accion: "juego_obtener_resp_modif",
        data: { juego },
      });
      if (winProjector) {
        winProjector.webContents.send("fromMain", {
          accion: "juego_obtener_resp_modif",
          data: juego,
        });
      }
    });
  });
}
function modificarPuntajeJugador(data) {
  let dataActualizacion = {
    puntajeHome: 0,
    puntajeVisitante: 0,
  };
  let puntaje =
    data.tipo === "home"
      ? juegoActivo.puntajeHome
      : juegoActivo.puntajeVisitante;
  let nuevoPuntaje = puntaje + data.amount;

  nuevoPuntaje = nuevoPuntaje > 0 ? nuevoPuntaje : 0;
  if (data.tipo === "home") {
    dataActualizacion.puntajeHome = nuevoPuntaje;
    dataActualizacion.puntajeVisitante = juegoActivo.puntajeVisitante;
  } else {
    dataActualizacion.puntajeVisitante = nuevoPuntaje;
    dataActualizacion.puntajeHome = juegoActivo.puntajeHome;
  }

  estadistica
    .obtenerUno({
      idJugador: data.jugador,
      idJuego: data.id,
      posicionEquipo: data.tipo,
    })
    .then((jugador) => {
      if (jugador !== null) {
        let puntosAcumulados = jugador.puntajeJugador;
        let nuevoValorJugador = puntosAcumulados + data.amount;
        nuevoValorJugador = nuevoValorJugador > 0 ? nuevoValorJugador : 0;
        estadistica.actualizar(jugador._id, {
          puntajeJugador: nuevoValorJugador,
        });
      }
    });

  juegos.actualizar(data.id, dataActualizacion).then(() => {
    juegos.obtenerUno({ estado: "activo" }).then((juego) => {
      if (juego !== null) {
        juegoActivo = juego;
        //totalPeriodos = juego.totalPeriodos;
      }
      winOperador.webContents.send("fromMain", {
        accion: "juego_obtener_resp_modif",
        data: { juego },
      });
      if (winProjector) {
        winProjector.webContents.send("fromMain", {
          accion: "juego_obtener_resp_modif",
          data: juego,
        });
      }
    });
  });
}

function modificarTimeout(data) {
  let dataActualizacion = {
    tiempoFueraHome: 0,
    tiempoFueraVisitante: 0,
  };
  let puntaje =
    data.tipo === "home"
      ? juegoActivo.tiempoFueraHome
      : juegoActivo.tiempoFueraVisitante;
  let nuevoValor = puntaje + data.amount;

  nuevoValor = nuevoValor > 0 ? nuevoValor : 0;
  if (data.tipo === "home") {
    dataActualizacion.tiempoFueraHome = nuevoValor;
    dataActualizacion.tiempoFueraVisitante = juegoActivo.tiempoFueraVisitante;
  } else {
    dataActualizacion.tiempoFueraVisitante = nuevoValor;
    dataActualizacion.tiempoFueraHome = juegoActivo.tiempoFueraHome;
  }
  juegos.actualizar(data.id, dataActualizacion).then(() => {
    juegos.obtenerUno({ estado: "activo" }).then((juego) => {
      if (juego !== null) {
        juegoActivo = juego;
        //totalPeriodos = juego.totalPeriodos;
      }
      winOperador.webContents.send("fromMain", {
        accion: "juego_obtener_resp_modif",
        data: { juego },
      });
      if (winProjector) {
        winProjector.webContents.send("fromMain", {
          accion: "juego_obtener_resp_modif",
          data: juego,
        });
      }
    });
  });
}

function modificarFoul(data) {
  let dataActualizacion = {
    faltasHome: 0,
    faltasVisitante: 0,
  };
  let puntaje =
    data.tipo === "home" ? juegoActivo.faltasHome : juegoActivo.faltasVisitante;
  let nuevoValor = puntaje + data.amount;

  nuevoValor = nuevoValor > 0 ? nuevoValor : 0;
  if (data.tipo === "home") {
    dataActualizacion.faltasHome = nuevoValor;
    dataActualizacion.faltasVisitante = juegoActivo.faltasVisitante;
    dataActualizacion.totalFaltasHome = juegoActivo.totalFaltasHome + 1;
  } else {
    dataActualizacion.faltasVisitante = nuevoValor;
    dataActualizacion.faltasHome = juegoActivo.faltasHome;
    dataActualizacion.totalFaltasVisitante =
      juegoActivo.totalFaltasVisitante + 1;
  }
  juegos.actualizar(data.id, dataActualizacion).then(() => {
    juegos.obtenerUno({ estado: "activo" }).then((juego) => {
      if (juego !== null) {
        juegoActivo = juego;
      }
      winOperador.webContents.send("fromMain", {
        accion: "juego_obtener_resp_modif",
        data: { juego },
      });

      if (winProjector) {
        winProjector.webContents.send("fromMain", {
          accion: "juego_obtener_resp_modif",
          data: juego,
        });
      }

      if (nuevoValor >= 5) {
        winOperador.webContents.send("fromMain", {
          accion: "mostrar_msg_bonus",
          data: { tipo: data.tipo === "home" ? "visitante" : "home" },
        });
        if (winProjector) {
          winProjector.webContents.send("fromMain", {
            accion: "mostrar_msg_bonus",
            data: { tipo: data.tipo === "home" ? "visitante" : "home" },
          });
        }
      }
    });
  });
}

function modificarFoulJugador(data) {
  let dataActualizacion = {
    faltasHome: 0,
    faltasVisitante: 0,
  };
  let puntaje =
    data.tipo === "home" ? juegoActivo.faltasHome : juegoActivo.faltasVisitante;
  let nuevoValor = puntaje + data.amount;

  nuevoValor = nuevoValor > 0 ? nuevoValor : 0;
  if (data.tipo === "home") {
    dataActualizacion.faltasHome = nuevoValor;
    dataActualizacion.faltasVisitante = juegoActivo.faltasVisitante;
    dataActualizacion.totalFaltasHome = juegoActivo.totalFaltasHome + 1;
  } else {
    dataActualizacion.faltasVisitante = nuevoValor;
    dataActualizacion.faltasHome = juegoActivo.faltasHome;
    dataActualizacion.totalFaltasVisitante =
      juegoActivo.totalFaltasVisitante + 1;
  }

  estadistica
    .obtenerUno({
      idJugador: data.jugador,
      idJuego: data.id,
      posicionEquipo: data.tipo,
    })
    .then((jugador) => {
      if (jugador !== null) {
        let faltasAcumuladas = jugador.faltasJugador;
        let nuevoValorJugador = faltasAcumuladas + data.amount;
        nuevoValorJugador = nuevoValorJugador > 0 ? nuevoValorJugador : 0;
        estadistica.actualizar(jugador._id, {
          faltasJugador: nuevoValorJugador,
        });
      }
    });

  juegos.actualizar(data.id, dataActualizacion).then(() => {
    juegos.obtenerUno({ estado: "activo" }).then((juego) => {
      if (juego !== null) {
        juegoActivo = juego;
      }
      winOperador.webContents.send("fromMain", {
        accion: "juego_obtener_resp_modif",
        data: { juego },
      });

      if (winProjector) {
        winProjector.webContents.send("fromMain", {
          accion: "juego_obtener_resp_modif",
          data: juego,
        });
      }

      if (nuevoValor >= 5) {
        winOperador.webContents.send("fromMain", {
          accion: "mostrar_msg_bonus",
          data: { tipo: data.tipo === "home" ? "visitante" : "home" },
        });
        if (winProjector) {
          winProjector.webContents.send("fromMain", {
            accion: "mostrar_msg_bonus",
            data: { tipo: data.tipo === "home" ? "visitante" : "home" },
          });
        }
      }
    });
  });
}

function cambiarPosicionPantalla(id) {
  let nuevaPosicionHome =
    juegoActivo.homePosicionPantalla === "izquierda" ? "derecha" : "izquierda";
  let nuevaPosicionVisitante =
    juegoActivo.visitantePosicionPantalla === "izquierda"
      ? "derecha"
      : "izquierda";
  let dataActualizacion = {
    homePosicionPantalla: nuevaPosicionHome,
    visitantePosicionPantalla: nuevaPosicionVisitante,
  };
  juegos.actualizar(id, dataActualizacion).then(() => {
    juegos.obtenerUno({ _id: id }).then((juego) => {
      if (juego !== null) {
        juegoActivo = juego;
      }
      winOperador.webContents.send("fromMain", {
        accion: "juego_obtener_resp_modif",
        data: { juego },
      });
      if (winProjector) {
        winProjector.webContents.send("fromMain", {
          accion: "juego_obtener_resp_modif",
          data: juego,
        });
      }
    });
  });
}

function reiniciarFaltas() {
  juegos.actualizar(juegoActivo._id, { faltasHome: 0, faltasVisitante: 0 });
}

function ocultarMsgBonus() {
  winOperador.webContents.send("fromMain", {
    accion: "ocultar_msg_bonus",
    data: {},
  });
  if (winProjector) {
    winProjector.webContents.send("fromMain", {
      accion: "ocultar_msg_bonus",
      data: {},
    });
  }
}

//#endregion

//#region Cronometro Descansos
function iniciarPublicidad() {
  let mitadPartido = parseInt(juegoActivo.totalPeriodos / 2, 10);
  if (winProjector) {
    let minutos = 0;
    let tipo = "";
    if (juegoActivo.enTiempoExtra === false) {
      if (juegoActivo.periodoActual === mitadPartido) {
        // Medio tiempo
        minutos = juegoActivo.descansoMedioTiempo;
        tipo = "medio";
      } else {
        // Descanso entre periodos
        minutos = juegoActivo.descansoPeriodo;
        tipo = "descanso";
      }
    } else {
      // Descanso entre periodos
      minutos = juegoActivo.descansoPeriodo;
      tipo = "descanso";
    }
    winProjector.webContents.send("fromMain", {
      accion: "minutos_inicio_obtener_resp",
      data: { minutos, tipo }, //previo,descanso,medio
    });
    if (minutos > 0) {
      obtenerImagenesPublicidad("projector", minutos, tipo);
    }
  }
}
//#endregion

//#region Reportes
function guardarReporte() {
  dialog
    .showSaveDialog(winReportes, {
      title: "Guardar reporte de partidos",
      buttonLabel: "Guardar reporte",
      nameFieldLabel: "Reporte de partidos",
    })
    .then((response) => {
      if (response.canceled === false) {
        var options = {
          marginsType: 1,
          pageSize: "A4",
          printBackground: false,
          printSelectionOnly: false,
          landscape: false,
        };
        winReportes.webContents.printToPDF(options).then((data) => {
          fs.writeFile(response.filePath, data, function (err) {
            let msg;
            if (err) {
              msg = err;
            } else {
              msg = "Reporte generado con éxito";
            }
            winReportes.webContents.send("fromMain", {
              accion: "guardar_reporte_resp",
              data: msg, //previo,descanso,medio
            });
          });
        });
      }
    });
}
//#endregion

//#region Licencia
function getDeviceId(d) {
  let id = "";
  let data = [];

  let nombreTitular = null;

  nombreTitular = d.organizacion;

  nombreTitular = nombreTitular.replace(/[^A-Z0-9]/gi, "_");

  let cpus = os.cpus();
  let cpuNameList = [];
  cpus.forEach((cpu) => {
    cpuNameList.push(`${cpu.model.replace(/[^A-Z0-9]/gi, "_")}`);
  });
  let host = os.hostname();
  let osType = os.type();
  let osPlatform = os.platform();
  let arch = os.arch();
  let totalMemory = os.totalmem();

  let md5Titular = crypto.MD5(nombreTitular);
  let md5Host = crypto.MD5(host);
  let md5OsType = crypto.MD5(osType);
  let md5OsPlatform = crypto.MD5(osPlatform);
  let md5OArch = crypto.MD5(arch);
  let md5Cpu = crypto.MD5(cpuNameList.join("&"));
  let md5Memory = crypto.MD5(totalMemory.toString());

  data[0] = { s: host, h: md5Host.toString() };
  data[1] = { s: osType, h: md5OsType.toString() };
  data[2] = { s: osPlatform, h: md5OsPlatform.toString() };
  data[3] = { s: arch, h: md5OArch.toString() };
  data[4] = { s: cpuNameList.join("&"), h: md5Cpu.toString() };
  data[5] = { s: totalMemory.toString(), h: md5Memory.toString() };

  let s = [];
  let n = [];
  let i = 0;
  for (let index = 5; index < 32; index += 5) {
    let item = data[i];
    let start = index - 5;
    let end = index;
    let segment = item.h.substring(start, end);
    s.push(segment);
    n.push(item.s);
    //
    i++;
  }

  id = crypto
    .SHA256(
      `${s.join("")}${md5Titular.toString()}${n.join(";")};${nombreTitular}`
    )
    .toString();

  // let verificador = crypto.AES.encrypt(
  //   n.join("_"),
  //   md5OsType.toString()
  // ).toString();
  // let header = `data:${osType}/${osPlatform};base64`;

  return id;
}

async function getSystemData() {
  let d = null;
  let data = await sistema.obtenerTodos();
  if (data.length === 1) {
    d = data[0];
  }

  return d;
}

function solicitarLicencia(d) {
  let nombreTitular = null;

  nombreTitular = d.organizacion;

  nombreTitular = nombreTitular.replace(/[^A-Z0-9]/gi, "_");
  d.esRegeneracion = false;
  let cpus = os.cpus();
  let cpuNameList = [];
  cpus.forEach((cpu) => {
    cpuNameList.push(`${cpu.model.replace(/[^A-Z0-9]/gi, "_")}`);
  });
  let host = os.hostname();
  let osType = os.type();
  let osPlatform = os.platform();
  let arch = os.arch();
  let totalMemory = os.totalmem().toString();

  let md5OsType = crypto.MD5(osType);

  let header = `data:${osType}/${osPlatform};base64`;
  let solicitud = `${host};${osType};${osPlatform};${arch};${cpuNameList.join(
    "&"
  )};${totalMemory};${JSON.stringify(d)}`;
  let h = crypto.AES.encrypt(solicitud, md5OsType.toString()).toString();

  let fileData = `${header},${h}`;
  dialog
    .showSaveDialog(winLicencia, {
      title: "Guardar solicitud licencia",
      defaultPath: "SolicitudLicencia.slr",
      buttonLabel: "Guardar archivo",
      nameFieldLabel: "SolicitudLicencia",
    })
    .then((response) => {
      if (response.canceled === false) {
        fs.writeFile(response.filePath, fileData, function (err) {
          let msg;
          if (err) {
            msg = err;
          } else {
            msg = "Solicitud de licencia generada con exito";
            sistema.agregar(d);
          }
          winLicencia.webContents.send("fromMain", {
            accion: "solicitar_licencia_resp",
            data: msg, //previo,descanso,medio
          });
        });
      }
    });
}

function regenerarLicencia() {
  getSystemData().then((d) => {
    let nombreTitular = null;
    nombreTitular = d.organizacion;
    nombreTitular = nombreTitular.replace(/[^A-Z0-9]/gi, "_");
    d.esRegeneracion = true;
    let cpus = os.cpus();
    let cpuNameList = [];
    cpus.forEach((cpu) => {
      cpuNameList.push(`${cpu.model.replace(/[^A-Z0-9]/gi, "_")}`);
    });
    let host = os.hostname();
    let osType = os.type();
    let osPlatform = os.platform();
    let arch = os.arch();
    let totalMemory = os.totalmem().toString();
    let md5OsType = crypto.MD5(osType);
    let header = `data:${osType}/${osPlatform};base64`;
    let solicitud = `${host};${osType};${osPlatform};${arch};${cpuNameList.join(
      "&"
    )};${totalMemory};${JSON.stringify(d)}`;
    let h = crypto.AES.encrypt(solicitud, md5OsType.toString()).toString();
    let fileData = `${header},${h}`;
    dialog
      .showSaveDialog(winLicencia, {
        title: "Guardar regeneración de licencia",
        defaultPath: "SolicitudLicencia.slr",
        buttonLabel: "Guardar archivo",
        nameFieldLabel: "SolicitudLicencia",
      })
      .then((response) => {
        if (response.canceled === false) {
          fs.writeFile(response.filePath, fileData, function (err) {
            let msg;
            if (err) {
              msg = err;
            } else {
              msg = "Solicitud de licencia generada con exito";
            }
            winLicencia.webContents.send("fromMain", {
              accion: "solicitar_licencia_resp",
              data: msg, //previo,descanso,medio
            });
          });
        }
      });
  });
}

function instalarLicencia() {
  dialog
    .showOpenDialog(winLicencia, {
      title: "Cargar archivo de licencia",
      buttonLabel: "Cargar licencia",
      filters: [
        { name: "Archivos de Licencia Scoreboards", extensions: ["slf"] },
      ],
    })
    .then((result) => {
      if (result.canceled === false) {
        let file = result.filePaths[0];
        agregarLicencia(file);
      }
    });
}

function agregarLicencia(file) {
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    let rawSegments = data.split(",");
    let header = rawSegments[0];
    let hash = rawSegments[1];
    let os = header.split(";")[0].split("/")[0].split(":")[1];
    let _osType = crypto.MD5(os).toString();

    let decriptedString = crypto.AES.decrypt(hash, _osType).toString(
      crypto.enc.Utf8
    );
    let systemObj = JSON.parse(decriptedString);
    let estadoLicencia = 0;
    if (systemObj.esRegeneracion === true) {
      estadoLicencia = 1;
    }
    sistema.obtenerDonde({ estado: estadoLicencia }).then((conf) => {
      let idConf = conf[0]._id;

      sistema
        .actualizaDonde(
          { _id: idConf },
          {
            dispositivo: systemObj.dispositivo,
            licencia: systemObj.licencia,
            fechaAlta: systemObj.fechaAlta,
            estado: systemObj.estado,
          }
        )
        .then((x) => {
          crearVentanaOperador();
          winLicencia.webContents.send("fromMain", {
            accion: "solicitar_licencia_resp",
            data: "Licencia instalada exitosamente",
          });
        });
    });
  });
}

//#endregion

//#region Jugadores
function sustituirJugador(jugador) {
  estadistica
    .obtenerUno({ idJuego: juegoActivo._id, idJugador: jugadorSustitucion })
    .then((aSustituir) => {
      if (aSustituir !== null) {
        estadistica.actualizar(aSustituir._id, { estadoJugador: 2 });

        estadistica
          .obtenerUno({
            idJuego: juegoActivo._id,
            idJugador: jugador.idJugador,
          })
          .then((j) => {
            if (j !== null) {
              estadistica.actualizar(j._id, { estadoJugador: 1 }).then((n) => {
                obtenerJugadoresActivos();
                jugadorSustitucion = null;
                if (winJugadoresJuego) {
                  winJugadoresJuego.close();
                }
              });
            } else {
              jugador.idJuego = juegoActivo._id;
              jugador.posicionEquipo = tipoListaJugadores;
              jugador.puntajeJugador = 0;
              jugador.faltasJugador = 0;
              jugador.estadoJugador = 1;
              estadistica.agregar(jugador).then(() => {
                obtenerJugadoresActivos();
                jugadorSustitucion = null;
                if (winJugadoresJuego) {
                  winJugadoresJuego.close();
                }
              });
            }
          });
      }
    });
}

function retirarJugador(jugador) {
  estadistica
    .obtenerUno({ idJuego: juegoActivo._id, idJugador: jugadorRetiro })
    .then((aRetirar) => {
      if (aRetirar !== null) {
        estadistica.actualizar(aRetirar._id, { estadoJugador: 0 });
        jugador.idJuego = juegoActivo._id;
        jugador.posicionEquipo = tipoListaJugadores;
        jugador.puntajeJugador = 0;
        jugador.faltasJugador = 0;
        jugador.estadoJugador = 1;
        estadistica.agregar(jugador).then(() => {
          obtenerJugadoresActivos();
          jugadorRetiro = null;
          if (winJugadoresJuego) {
            winJugadoresJuego.close();
          }
        });
      }
    });
}

function obtenerJugadoresActivos() {
  estadistica
    .obtenerDonde({ idJuego: juegoActivo._id, estadoJugador: 1 })
    .then((jugadores) => {
      jugadoresEnJuego = jugadores;
      winOperador.webContents.send("fromMain", {
        accion: "jugadores_obtener_resp",
        data: jugadores,
      });
    });
}

function JugadoresEquiposObtener() {
  jugadores.obtenerDonde({ equipo: equipoSeleccionado }).then((jugadores) => {
    equipos.obtener(equipoSeleccionado).then((equipo) => {
      winJugadores.webContents.send("fromMain", {
        accion: "jugadores_equipo_obtener_resp",
        data: {
          jugadores: _.orderBy(jugadores, ["numero"], ["asc"]),
          idEquipo: equipoSeleccionado,
          nombreEquipo: equipo.nombre,
        },
      });
    });
  });
}

function agregarJugador(jugador) {
  jugadores.agregar(jugador).then((resp) => {
    jugadores.obtenerDonde({ equipo: jugador.equipo }).then((_jugadores) => {
      equipos
        .actualizar(jugador.equipo, { totalJugadores: _jugadores.length })
        .then(() => {
          equiposObtener();
          JugadoresEquiposObtener();
          winJugadores.webContents.send("fromMain", {
            accion: "jugador_agregar_resp",
            data: {},
          });
        });
    });
  });
}

function eliminarJugador(data) {
  jugadores.eliminar(data.id).then((resp) => {
    jugadores
      .obtenerDonde({ equipo: equipoSeleccionado })
      .then((_jugadores) => {
        equipos
          .actualizar(equipoSeleccionado, { totalJugadores: _jugadores.length })
          .then(() => {
            equiposObtener();
            JugadoresEquiposObtener();
            winJugadores.webContents.send("fromMain", {
              accion: "jugador_eliminar_resp",
              data: {},
            });
          });
      });
  });
}

function editarJugador(jugador) {
  jugadores.actualizar(idJugadorEditar, jugador).then((resp) => {
    // juegos.actualizaDonde(
    //   { homeId: idEquipoEditar },
    //   { home: equipo.nombre, logoHome: equipo.logo }
    // );
    // juegos.actualizaDonde(
    //   { visitanteId: idEquipoEditar },
    //   { visitante: equipo.nombre, logoVisitante: equipo.logo }
    // );
    equiposObtener();
    JugadoresEquiposObtener();
    winJugadores.webContents.send("fromMain", {
      accion: "jugador_editar_resp",
      data: {},
    });

    winEditarJugador.close();
  });
}
//#endregion
