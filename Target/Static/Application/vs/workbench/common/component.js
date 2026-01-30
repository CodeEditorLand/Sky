var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Memento } from "./memento.js";
import { Themable } from "../../platform/theme/common/themeService.js";
class Component extends Themable {
  static {
    __name(this, "Component");
  }
  constructor(id, themeService, storageService) {
    super(themeService);
    this.id = id;
    this.memento = new Memento(this.id, storageService);
    this._register(storageService.onWillSaveState(() => {
      this.saveState();
      this.memento.saveMemento();
    }));
  }
  getId() {
    return this.id;
  }
  getMemento(scope, target) {
    return this.memento.getMemento(scope, target);
  }
  reloadMemento(scope) {
    this.memento.reloadMemento(scope);
  }
  onDidChangeMementoValue(scope, disposables) {
    return this.memento.onDidChangeValue(scope, disposables);
  }
  saveState() {
  }
}
export {
  Component
};
//# sourceMappingURL=component.js.map
