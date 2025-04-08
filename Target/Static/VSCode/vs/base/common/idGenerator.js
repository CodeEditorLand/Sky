var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class IdGenerator {
  static {
    __name(this, "IdGenerator");
  }
  _prefix;
  _lastId;
  constructor(prefix) {
    this._prefix = prefix;
    this._lastId = 0;
  }
  nextId() {
    return this._prefix + ++this._lastId;
  }
}
const defaultGenerator = new IdGenerator("id#");
export {
  IdGenerator,
  defaultGenerator
};
//# sourceMappingURL=idGenerator.js.map
