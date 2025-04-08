var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IEditorAction } from "./editorCommon.js";
import { ICommandMetadata } from "../../platform/commands/common/commands.js";
import { ContextKeyExpression, IContextKeyService } from "../../platform/contextkey/common/contextkey.js";
class InternalEditorAction {
  constructor(id, label, alias, metadata, _precondition, _run, _contextKeyService) {
    this.id = id;
    this.label = label;
    this.alias = alias;
    this.metadata = metadata;
    this._precondition = _precondition;
    this._run = _run;
    this._contextKeyService = _contextKeyService;
  }
  static {
    __name(this, "InternalEditorAction");
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
