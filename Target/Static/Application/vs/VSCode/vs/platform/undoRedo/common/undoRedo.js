var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../instantiation/common/instantiation.js";
const IUndoRedoService = createDecorator("undoRedoService");
var UndoRedoElementType;
(function(UndoRedoElementType2) {
  UndoRedoElementType2[UndoRedoElementType2["Resource"] = 0] = "Resource";
  UndoRedoElementType2[UndoRedoElementType2["Workspace"] = 1] = "Workspace";
})(UndoRedoElementType || (UndoRedoElementType = {}));
class ResourceEditStackSnapshot {
  static {
    __name(this, "ResourceEditStackSnapshot");
  }
  constructor(resource, elements) {
    this.resource = resource;
    this.elements = elements;
  }
}
class UndoRedoGroup {
  static {
    __name(this, "UndoRedoGroup");
  }
  static {
    this._ID = 0;
  }
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
  static {
    this.None = new UndoRedoGroup();
  }
}
class UndoRedoSource {
  static {
    __name(this, "UndoRedoSource");
  }
  static {
    this._ID = 0;
  }
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
  static {
    this.None = new UndoRedoSource();
  }
}
export {
  IUndoRedoService,
  ResourceEditStackSnapshot,
  UndoRedoElementType,
  UndoRedoGroup,
  UndoRedoSource
};
//# sourceMappingURL=undoRedo.js.map
