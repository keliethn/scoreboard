const gameSchema = {
  type: "object",
  properties: {
    idLiga: {
      type: "string",
    },
    fecha: {
      type: "number",
    },
    estado: {
      type: "string",
      default: "activo",
    },
    periodoActual: {
      type: "number",
      default: 1,
    },
    overtimeActual: {
      type: "number",
      default: 1,
    },
    visitante: {
      type: "string",
    },
    visitanteId: {
      type: "string",
    },
    logoVisitante: {
      type: "string",
    },
    visitantePosicionPantalla: {
      type: "string",
    },
    puntajeVisitante: {
      type: "number",
      default: 0,
    },
    faltasVisitante: {
      type: "number",
      default: 0,
    },
    totalFaltasVisitante: {
      type: "number",
      default: 0,
    },
    tiempoFueraVisitante: {
      type: "number",
      default: 0,
    },
    home: {
      type: "string",
    },
    homeId: {
      type: "string",
    },
    logoHome: {
      type: "string",
    },
    homePosicionPantalla: {
      type: "string",
    },
    puntajeHome: {
      type: "number",
      default: 0,
    },
    totalFaltasHome: {
      type: "number",
      default: 0,
    },
    faltasHome: {
      type: "number",
      default: 0,
    },
    tiempoFueraHome: {
      type: "number",
      default: 0,
    },
    totalPeriodos: {
      type: "number",
      default: 0,
    },
    duracionPeriodo: {
      type: "number",
      default: 0,
    },
    duracionOvertime: {
      type: "number",
      default: 0,
    },
    enTiempoExtra: {
      type: "boolean",
      default: false,
    },
    tiempoCouch: {
      type: "number",
    },
    descansoPeriodo: {
      type: "number",
    },
    descansoMedioTiempo: {
      type: "number",
    },
    periodoConcluido: {
      type: "number",
    },
    tipoNotacion: {
      type: "string",
    },
  },
};

module.exports = gameSchema;
