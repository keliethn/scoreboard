const statSchema = {
  type: "object",
  properties: {
    idJuego: {
      type: "string",
    },
    posicionEquipo: {
      type: "string", // home o visitante
    },
    idJugador: {
      type: "string",
    },
    numeroJugador: {
      type: "string",
    },
    nombreJugador: {
      type: "string",
    },
    puntajeJugador: {
      type: "number",
    },
    faltasJugador: {
      type: "number",
    },
    estadoJugador: {
      type: "number", // 0 = retirado, 1=activo, 2=suspendido
    },
  },
};

module.exports = statSchema;
