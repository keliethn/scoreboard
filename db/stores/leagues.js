const Datastore = require("nedb-promises");
const Ajv = require("ajv");
const leagueSchema = require("../schemas/league");

class LeagueStore {
  constructor() {
    const ajv = new Ajv.default({ allErrors: true });

    this.schemaValidator = ajv.compile(leagueSchema);
    const dbPath = `${process.cwd()}/leagues.db`;
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

  obtenerUno(data) {
    return this.db.findOne(data).exec();
  }

  obtenerTodos() {
    return this.db.find();
  }

  obtenerHomeClub() {
    return this.db.find({ isDone: false }).exec();
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

module.exports = new LeagueStore();
