var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FontInfo } from "../../../../editor/common/config/fontInfo.js";
import { NotebookCellTextModel } from "../common/model/notebookCellTextModel.js";
import { NotebookDocumentMetadata } from "../common/notebookCommon.js";
var NotebookViewEventType = /* @__PURE__ */ ((NotebookViewEventType2) => {
  NotebookViewEventType2[NotebookViewEventType2["LayoutChanged"] = 1] = "LayoutChanged";
  NotebookViewEventType2[NotebookViewEventType2["MetadataChanged"] = 2] = "MetadataChanged";
  NotebookViewEventType2[NotebookViewEventType2["CellStateChanged"] = 3] = "CellStateChanged";
  return NotebookViewEventType2;
})(NotebookViewEventType || {});
class NotebookLayoutChangedEvent {
  constructor(source, value) {
    this.source = source;
    this.value = value;
  }
  static {
    __name(this, "NotebookLayoutChangedEvent");
  }
  type = 1 /* LayoutChanged */;
}
class NotebookMetadataChangedEvent {
  constructor(source) {
    this.source = source;
  }
  static {
    __name(this, "NotebookMetadataChangedEvent");
  }
  type = 2 /* MetadataChanged */;
}
class NotebookCellStateChangedEvent {
  constructor(source, cell) {
    this.source = source;
    this.cell = cell;
  }
  static {
    __name(this, "NotebookCellStateChangedEvent");
  }
  type = 3 /* CellStateChanged */;
}
export {
  NotebookCellStateChangedEvent,
  NotebookLayoutChangedEvent,
  NotebookMetadataChangedEvent,
  NotebookViewEventType
};
//# sourceMappingURL=notebookViewEvents.js.map
