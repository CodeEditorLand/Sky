var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ISettableObservable, ObservablePromise } from "../../../../../../base/common/observable.js";
import { IDocumentDiff } from "../../../../../../editor/common/diff/documentDiffProvider.js";
import { DetailedLineRangeMapping } from "../../../../../../editor/common/diff/rangeMapping.js";
import { ITextModel } from "../../../../../../editor/common/model.js";
function countChanges(changes) {
  return changes.reduce((count, change) => {
    const diff = change.diff.get();
    if (diff.identical) {
      return count;
    }
    switch (change.type) {
      case "delete":
        return count + 1;
      // We want to see 1 deleted entry in the pill for navigation
      case "insert":
        return count + 1;
      // We want to see 1 new entry in the pill for navigation
      case "modified":
        return count + diff.changes.length;
      default:
        return count;
    }
  }, 0);
}
__name(countChanges, "countChanges");
function sortCellChanges(changes) {
  return [...changes].sort((a, b) => {
    if ((a.type === "unchanged" || a.type === "modified") && (b.type === "unchanged" || b.type === "modified")) {
      return a.modifiedCellIndex - b.modifiedCellIndex;
    }
    if (a.type === "delete" && b.type === "delete") {
      return a.originalCellIndex - b.originalCellIndex;
    }
    if (a.type === "insert" && b.type === "insert") {
      return a.modifiedCellIndex - b.modifiedCellIndex;
    }
    if (a.type === "delete" && b.type === "insert") {
      return -1;
    }
    if (a.type === "insert" && b.type === "delete") {
      return 1;
    }
    if (a.type === "delete" && b.type !== "insert" || a.type !== "insert" && b.type === "delete") {
      return a.originalCellIndex - b.originalCellIndex;
    }
    const aIndex = a.type === "delete" ? a.originalCellIndex : a.type === "insert" ? a.modifiedCellIndex : a.modifiedCellIndex;
    const bIndex = b.type === "delete" ? b.originalCellIndex : b.type === "insert" ? b.modifiedCellIndex : b.modifiedCellIndex;
    return aIndex - bIndex;
  });
}
__name(sortCellChanges, "sortCellChanges");
export {
  countChanges,
  sortCellChanges
};
//# sourceMappingURL=notebookCellChanges.js.map
