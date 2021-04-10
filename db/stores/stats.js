const Datastore = require("nedb-promises");
const Ajv = require("ajv");
const statSchema = require("../schemas/stat");

class PlayerStore {
  constructor() {
    const ajv = new Ajv.default({ allErrors: true });

    this.schemaValidator = ajv.compile(statSchema);
    const dbPath = `${process.cwd()}/stats.db`;
    this.db = Datastore.create({
      filename: dbPath,
      timestampData: true,
    });
  }

  validar(data) {
    return this.schemaValidator(data);
  }

  agregar(data) {
    return this.db.insert(data);
  }

  obtener(_id) {
    return this.db.findOne({ _id }).exec();
  }

  obtenerUno(data) {
    return this.db.findOne(data).exec();
  }

  obtenerDonde(query) {
    return this.db.find(query).exec();
  }

  obtenerTodos() {
    return this.db.find();
  }

  eliminar(id) {
    return this.db.remove({ _id: id }, {});
  }

  actualizar(id, data) {
    return this.db.update({ _id: id }, { $set: data }, { multi: true });
  }

  actualizaDonde(condicion, data) {
    return this.db.update(condicion, { $set: data }, { multi: true });
  }
}

module.exports = new PlayerStore();
