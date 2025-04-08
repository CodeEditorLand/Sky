var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IUndoRedoService = createDecorator("undoRedoService");
var UndoRedoElementType = /* @__PURE__ */ ((UndoRedoElementType2) => {
  UndoRedoElementType2[UndoRedoElementType2["Resource"] = 0] = "Resource";
  UndoRedoElementType2[UndoRedoElementType2["Workspace"] = 1] = "Workspace";
  return UndoRedoElementType2;
})(UndoRedoElementType || {});
class ResourceEditStackSnapshot {
  constructor(resource, elements) {
    this.resource = resource;
    this.elements = elements;
  }
  static {
    __name(this, "ResourceEditStackSnapshot");
  }
}
class UndoRedoGroup {
  static {
    __name(this, "UndoRedoGroup");
  }
  static _ID = 0;
  id;
  order;
  constructor() {
    this.id = UndoRedoGroup._ID++;
    this.order = 1;
  }
  nextOrder() {
    if (this.id === 0) {
      return 0;
    }
    return this.order++;
  }
  static None = new UndoRedoGroup();
}
class UndoRedoSource {
  static {
    __name(this, "UndoRedoSource");
  }
  static _ID = 0;
  id;
  order;
  constructor() {
    this.id = UndoRedoSource._ID++;
    this.order = 1;
  }
  nextOrder() {
    if (this.id === 0) {
      return 0;
    }
    return this.order++;
  }
  static None = new UndoRedoSource();
}
export {
  IUndoRedoService,
  ResourceEditStackSnapshot,
  UndoRedoElementType,
  UndoRedoGroup,
  UndoRedoSource
};
//# sourceMappingURL=undoRedo.js.map
