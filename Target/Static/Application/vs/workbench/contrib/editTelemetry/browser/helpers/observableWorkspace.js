var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { derivedHandleChanges, observableValue, runOnChange, autorun, derived } from "../../../../../base/common/observable.js";
import { StringEdit, StringReplacement } from "../../../../../editor/common/core/edits/stringEdit.js";
import { EditSources } from "../../../../../editor/common/textModelEditSource.js";
class ObservableWorkspace {
  static {
    __name(this, "ObservableWorkspace");
  }
  constructor() {
    this._version = 0;
    this.onDidOpenDocumentChange = derivedHandleChanges({
      owner: this,
      changeTracker: {
        createChangeSummary: /* @__PURE__ */ __name(() => ({ didChange: false }), "createChangeSummary"),
        handleChange: /* @__PURE__ */ __name((ctx, changeSummary) => {
          if (!ctx.didChange(this.documents)) {
            changeSummary.didChange = true;
          }
          return true;
        }, "handleChange")
      }
    }, (reader, changeSummary) => {
      const docs = this.documents.read(reader);
      for (const d of docs) {
        d.value.read(reader);
      }
      if (changeSummary.didChange) {
        this._version++;
      }
      return this._version;
    });
    this.lastActiveDocument = derived((reader) => {
      const obs = observableValue("lastActiveDocument", void 0);
      reader.store.add(autorun((reader2) => {
        const docs = this.documents.read(reader2);
        for (const d of docs) {
          reader2.store.add(runOnChange(d.value, () => {
            obs.set(d, void 0);
          }));
        }
      }));
      return obs;
    }).flatten();
  }
  getFirstOpenDocument() {
    return this.documents.get()[0];
  }
  getDocument(documentId) {
    return this.documents.get().find((d) => d.uri.toString() === documentId.toString());
  }
}
class StringEditWithReason extends StringEdit {
  static {
    __name(this, "StringEditWithReason");
  }
  static replace(range, newText, source = EditSources.unknown({})) {
    return new StringEditWithReason([new StringReplacement(range, newText)], source);
  }
  constructor(replacements, reason) {
    super(replacements);
    this.reason = reason;
  }
}
export {
  ObservableWorkspace,
  StringEditWithReason
};
//# sourceMappingURL=observableWorkspace.js.map
