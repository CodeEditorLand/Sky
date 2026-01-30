var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { sumBy } from "../../../../base/common/arrays.js";
import { LineEdit } from "../../../../editor/common/core/edits/lineEdit.js";
class ArcTracker {
  static {
    __name(this, "ArcTracker");
  }
  constructor(_valueBeforeTrackedEdit, trackedEdit) {
    this._valueBeforeTrackedEdit = _valueBeforeTrackedEdit;
    this._trackedEdit = trackedEdit.removeCommonSuffixPrefix(_valueBeforeTrackedEdit.getValue());
    this._updatedTrackedEdit = this._trackedEdit.mapData(() => new IsTrackedEditData(true));
  }
  getOriginalCharacterCount() {
    return sumBy(this._trackedEdit.replacements, (e) => e.getNewLength());
  }
  /**
   * edit must apply to _updatedTrackedEdit.apply(_valueBeforeTrackedEdit)
  */
  handleEdits(edit) {
    const e = edit.mapData((_d) => new IsTrackedEditData(false));
    const composedEdit = this._updatedTrackedEdit.compose(e);
    this._updatedTrackedEdit = composedEdit;
  }
  getAcceptedRestrainedCharactersCount() {
    const s = sumBy(this._updatedTrackedEdit.replacements, (e) => e.data.isTrackedEdit ? e.getNewLength() : 0);
    return s;
  }
  getDebugState() {
    return {
      edits: this._updatedTrackedEdit.replacements.map((e) => ({
        range: e.replaceRange.toString(),
        newText: e.newText,
        isTrackedEdit: e.data.isTrackedEdit
      }))
    };
  }
  getLineCountInfo() {
    const e = this._updatedTrackedEdit.toStringEdit((r) => r.data.isTrackedEdit);
    const le = LineEdit.fromStringEdit(e, this._valueBeforeTrackedEdit);
    const deletedLineCount = sumBy(le.replacements, (r) => r.lineRange.length);
    const insertedLineCount = sumBy(le.getNewLineRanges(), (r) => r.length);
    return {
      deletedLineCounts: deletedLineCount,
      insertedLineCounts: insertedLineCount
    };
  }
  getValues() {
    return {
      arc: this.getAcceptedRestrainedCharactersCount(),
      ...this.getLineCountInfo()
    };
  }
}
class IsTrackedEditData {
  static {
    __name(this, "IsTrackedEditData");
  }
  constructor(isTrackedEdit) {
    this.isTrackedEdit = isTrackedEdit;
  }
  join(data) {
    if (this.isTrackedEdit !== data.isTrackedEdit) {
      return void 0;
    }
    return this;
  }
}
export {
  ArcTracker,
  IsTrackedEditData
};
//# sourceMappingURL=arcTracker.js.map
