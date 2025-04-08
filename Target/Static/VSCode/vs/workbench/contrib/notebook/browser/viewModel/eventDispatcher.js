var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { NotebookCellStateChangedEvent, NotebookLayoutChangedEvent, NotebookMetadataChangedEvent, NotebookViewEvent, NotebookViewEventType } from "../notebookViewEvents.js";
class NotebookEventDispatcher extends Disposable {
  static {
    __name(this, "NotebookEventDispatcher");
  }
  _onDidChangeLayout = this._register(new Emitter());
  onDidChangeLayout = this._onDidChangeLayout.event;
  _onDidChangeMetadata = this._register(new Emitter());
  onDidChangeMetadata = this._onDidChangeMetadata.event;
  _onDidChangeCellState = this._register(new Emitter());
  onDidChangeCellState = this._onDidChangeCellState.event;
  emit(events) {
    for (let i = 0, len = events.length; i < len; i++) {
      const e = events[i];
      switch (e.type) {
        case NotebookViewEventType.LayoutChanged:
          this._onDidChangeLayout.fire(e);
          break;
        case NotebookViewEventType.MetadataChanged:
          this._onDidChangeMetadata.fire(e);
          break;
        case NotebookViewEventType.CellStateChanged:
          this._onDidChangeCellState.fire(e);
          break;
      }
    }
  }
}
export {
  NotebookEventDispatcher
};
//# sourceMappingURL=eventDispatcher.js.map
