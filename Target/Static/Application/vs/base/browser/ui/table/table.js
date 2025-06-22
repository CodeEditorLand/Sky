var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class TableError extends Error {
  static {
    __name(this, "TableError");
  }
  constructor(user, message) {
    super(`TableError [${user}] ${message}`);
  }
}
export {
  TableError
};
//# sourceMappingURL=table.js.map
