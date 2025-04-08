var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ICellRange } from "../../common/notebookRange.js";
function rangesEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].start !== b[i].start || a[i].end !== b[i].end) {
      return false;
    }
  }
  return true;
}
__name(rangesEqual, "rangesEqual");
class NotebookCellSelectionCollection extends Disposable {
  static {
    __name(this, "NotebookCellSelectionCollection");
  }
  _onDidChangeSelection = this._register(new Emitter());
  get onDidChangeSelection() {
    return this._onDidChangeSelection.event;
  }
  _primary = null;
  _selections = [];
  get selections() {
    return this._selections;
  }
  get focus() {
    return this._primary ?? { start: 0, end: 0 };
  }
  setState(primary, selections, forceEventEmit, source) {
    const changed = primary !== this._primary || !rangesEqual(this._selections, selections);
    this._primary = primary;
    this._selections = selections;
    if (changed || forceEventEmit) {
      this._onDidChangeSelection.fire(source);
    }
  }
  setSelections(selections, forceEventEmit, source) {
    this.setState(this._primary, selections, forceEventEmit, source);
  }
}
export {
  NotebookCellSelectionCollection
};
//# sourceMappingURL=cellSelectionCollection.js.map
