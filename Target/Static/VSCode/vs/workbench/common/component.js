var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Memento, MementoObject } from "./memento.js";
import { IThemeService, Themable } from "../../platform/theme/common/themeService.js";
import { IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget } from "../../platform/storage/common/storage.js";
import { DisposableStore } from "../../base/common/lifecycle.js";
import { Event } from "../../base/common/event.js";
class Component extends Themable {
  constructor(id, themeService, storageService) {
    super(themeService);
    this.id = id;
    this.memento = new Memento(this.id, storageService);
    this._register(storageService.onWillSaveState(() => {
      this.saveState();
      this.memento.saveMemento();
    }));
  }
  static {
    __name(this, "Component");
  }
  memento;
  getId() {
    return this.id;
  }
  getMemento(scope, target) {
    return this.memento.getMemento(scope, target);
  }
  reloadMemento(scope) {
    return this.memento.reloadMemento(scope);
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
