var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var NotebookViewEventType;
(function(NotebookViewEventType2) {
  NotebookViewEventType2[NotebookViewEventType2["LayoutChanged"] = 1] = "LayoutChanged";
  NotebookViewEventType2[NotebookViewEventType2["MetadataChanged"] = 2] = "MetadataChanged";
  NotebookViewEventType2[NotebookViewEventType2["CellStateChanged"] = 3] = "CellStateChanged";
})(NotebookViewEventType || (NotebookViewEventType = {}));
class NotebookLayoutChangedEvent {
  static {
    __name(this, "NotebookLayoutChangedEvent");
  }
  constructor(source, value) {
    this.source = source;
    this.value = value;
    this.type = NotebookViewEventType.LayoutChanged;
  }
}
class NotebookMetadataChangedEvent {
  static {
    __name(this, "NotebookMetadataChangedEvent");
  }
  constructor(source) {
    this.source = source;
    this.type = NotebookViewEventType.MetadataChanged;
  }
}
class NotebookCellStateChangedEvent {
  static {
    __name(this, "NotebookCellStateChangedEvent");
  }
  constructor(source, cell) {
    this.source = source;
    this.cell = cell;
    this.type = NotebookViewEventType.CellStateChanged;
  }
}
export {
  NotebookCellStateChangedEvent,
  NotebookLayoutChangedEvent,
  NotebookMetadataChangedEvent,
  NotebookViewEventType
};
//# sourceMappingURL=notebookViewEvents.js.map
