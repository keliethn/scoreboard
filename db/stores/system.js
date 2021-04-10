const Datastore = require("nedb-promises");
const Ajv = require("ajv");
const systemSchema = require("../schemas/system");

class SystemStore {
  constructor() {
    const ajv = new Ajv.default({ allErrors: true });

    this.schemaValidator = ajv.compile(systemSchema);
    const dbPath = `${process.cwd()}/system.db`;
    this.db = Datastore.create({
      filename: dbPath,
      timestampData: true,
    });
  }

  validar(data) {
    return this.schemaValidator(data);
  }

  agregar(data) {
    const isValid = this.validar(data);
    if (isValid) {
      return this.db.insert(data);
    }
  }

  obtener(_id) {
    return this.db.findOne({ _id }).exec();
  }

  obtenerTodos() {
    return this.db.find();
  }

  obtenerDonde(data) {
    return this.db.find(data);
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

module.exports = new SystemStore();
