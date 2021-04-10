const playerSchema = {
  type: "object",
  properties: {
    nombre: {
      type: "string",
    },
    apellido: {
      type: "string",
    },
    numero: {
      type: "string",
    },
    equipo: {
      type: "string",
    },
  },
};

module.exports = playerSchema;
