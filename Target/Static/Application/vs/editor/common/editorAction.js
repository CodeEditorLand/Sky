var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class InternalEditorAction {
  static {
    __name(this, "InternalEditorAction");
  }
  constructor(id, label, alias, metadata, _precondition, _run, _contextKeyService) {
    this.id = id;
    this.label = label;
    this.alias = alias;
    this.metadata = metadata;
    this._precondition = _precondition;
    this._run = _run;
    this._contextKeyService = _contextKeyService;
  }
  isSupported() {
    return this._contextKeyService.contextMatchesRules(this._precondition);
  }
  run(args) {
    if (!this.isSupported()) {
      return Promise.resolve(void 0);
    }
    return this._run(args);
  }
}
export {
  InternalEditorAction
};
//# sourceMappingURL=editorAction.js.map
