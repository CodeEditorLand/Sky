var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
var NotebookDiffViewEventType;
(function(NotebookDiffViewEventType2) {
  NotebookDiffViewEventType2[NotebookDiffViewEventType2["LayoutChanged"] = 1] = "LayoutChanged";
  NotebookDiffViewEventType2[NotebookDiffViewEventType2["CellLayoutChanged"] = 2] = "CellLayoutChanged";
})(NotebookDiffViewEventType || (NotebookDiffViewEventType = {}));
class NotebookDiffLayoutChangedEvent {
  static {
    __name(this, "NotebookDiffLayoutChangedEvent");
  }
  constructor(source, value) {
    this.source = source;
    this.value = value;
    this.type = NotebookDiffViewEventType.LayoutChanged;
  }
}
class NotebookCellLayoutChangedEvent {
  static {
    __name(this, "NotebookCellLayoutChangedEvent");
  }
  constructor(source) {
    this.source = source;
    this.type = NotebookDiffViewEventType.CellLayoutChanged;
  }
}
class NotebookDiffEditorEventDispatcher extends Disposable {
  static {
    __name(this, "NotebookDiffEditorEventDispatcher");
  }
  constructor() {
    super(...arguments);
    this._onDidChangeLayout = this._register(new Emitter());
    this.onDidChangeLayout = this._onDidChangeLayout.event;
    this._onDidChangeCellLayout = this._register(new Emitter());
    this.onDidChangeCellLayout = this._onDidChangeCellLayout.event;
  }
  emit(events) {
    for (let i = 0, len = events.length; i < len; i++) {
      const e = events[i];
      switch (e.type) {
        case NotebookDiffViewEventType.LayoutChanged:
          this._onDidChangeLayout.fire(e);
          break;
        case NotebookDiffViewEventType.CellLayoutChanged:
          this._onDidChangeCellLayout.fire(e);
          break;
      }
    }
  }
}
export {
  NotebookCellLayoutChangedEvent,
  NotebookDiffEditorEventDispatcher,
  NotebookDiffLayoutChangedEvent,
  NotebookDiffViewEventType
};
//# sourceMappingURL=eventDispatcher.js.map
