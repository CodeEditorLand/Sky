var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { observableSignal, runOnChange } from "../../../../../base/common/observable.js";
import { AnnotatedStringEdit } from "../../../../../editor/common/core/edits/stringEdit.js";
class DocumentEditSourceTracker extends Disposable {
  static {
    __name(this, "DocumentEditSourceTracker");
  }
  constructor(_doc, data) {
    super();
    this._doc = _doc;
    this.data = data;
    this._edits = AnnotatedStringEdit.empty;
    this._pendingExternalEdits = AnnotatedStringEdit.empty;
    this._update = observableSignal(this);
    this._representativePerKey = /* @__PURE__ */ new Map();
    this._sumAddedCharactersPerKey = /* @__PURE__ */ new Map();
    this._register(runOnChange(this._doc.value, (_val, _prevVal, edits) => {
      const eComposed = AnnotatedStringEdit.compose(edits.map((e) => e.edit));
      if (eComposed.replacements.every((e) => e.data.source.category === "external")) {
        if (this._edits.isEmpty()) {
        } else {
          this._pendingExternalEdits = this._pendingExternalEdits.compose(eComposed);
        }
      } else {
        if (!this._pendingExternalEdits.isEmpty()) {
          this._applyEdit(this._pendingExternalEdits);
          this._pendingExternalEdits = AnnotatedStringEdit.empty;
        }
        this._applyEdit(eComposed);
      }
      this._update.trigger(void 0);
    }));
  }
  _applyEdit(e) {
    for (const r of e.replacements) {
      let existing = this._sumAddedCharactersPerKey.get(r.data.key);
      if (existing === void 0) {
        existing = 0;
        this._representativePerKey.set(r.data.key, r.data.representative);
      }
      const newCount = existing + r.getNewLength();
      this._sumAddedCharactersPerKey.set(r.data.key, newCount);
    }
    this._edits = this._edits.compose(e);
  }
  async waitForQueue() {
    await this._doc.waitForQueue();
  }
  getTotalInsertedCharactersCount(key) {
    const val = this._sumAddedCharactersPerKey.get(key);
    return val ?? 0;
  }
  getAllKeys() {
    return Array.from(this._sumAddedCharactersPerKey.keys());
  }
  getRepresentative(key) {
    return this._representativePerKey.get(key);
  }
  getTrackedRanges(reader) {
    this._update.read(reader);
    const ranges = this._edits.getNewRanges();
    return ranges.map((r, idx) => {
      const e = this._edits.replacements[idx];
      const te = new TrackedEdit(e.replaceRange, r, e.data.key, e.data.source, e.data.representative);
      return te;
    });
  }
  isEmpty() {
    return this._edits.isEmpty();
  }
  _getDebugVisualization() {
    const ranges = this.getTrackedRanges();
    const txt = this._doc.value.get().value;
    return {
      ...{ $fileExtension: "text.w" },
      "value": txt,
      "decorations": ranges.map((r) => {
        return {
          range: [r.range.start, r.range.endExclusive],
          color: r.source.getColor()
        };
      })
    };
  }
}
class TrackedEdit {
  static {
    __name(this, "TrackedEdit");
  }
  constructor(originalRange, range, sourceKey, source, sourceRepresentative) {
    this.originalRange = originalRange;
    this.range = range;
    this.sourceKey = sourceKey;
    this.source = source;
    this.sourceRepresentative = sourceRepresentative;
  }
}
export {
  DocumentEditSourceTracker,
  TrackedEdit
};
//# sourceMappingURL=editTracker.js.map
