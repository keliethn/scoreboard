const teamSchema = {
  type: "object",
  properties: {
    nombre: {
      type: "string",
    },
    liga: {
      type: "string",
    },
    logo: {
      type: "string",
    },
    totalJugadores: {
      type: "number",
    },
    esHomeClub: {
      type: "boolean",
      default: false,
    },
  },
};

module.exports = teamSchema;
