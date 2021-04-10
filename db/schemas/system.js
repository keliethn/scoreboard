const systemSchema = {
  type: "object",
  properties: {
    organizacion: {
      type: "string",
    },
    logotipo: {
      type: "string",
    },
    dispositivo: {
      type: "string",
    },
    licencia: {
      type: "string",
    },
    unidadOrganizacional: {
      type: "string",
    },
    provincia: {
      type: "string",
    },
    pais: {
      type: "string",
    },
    correo: {
      type: "string",
    },
    fechaAlta: {
      type: "number",
    },
    estado: {
      type: "number", //0 - Pendiente, 1 - Activo
    },
  },
};

module.exports = systemSchema;
