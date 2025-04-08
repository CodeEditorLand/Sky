var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Permutation, compareBy } from "../../../../base/common/arrays.js";
import { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { IObservable, observableValue, ISettableObservable, autorun, transaction, IReader } from "../../../../base/common/observable.js";
import { ContextKeyValue, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { bindContextKey } from "../../../../platform/observable/common/platformObservableUtils.js";
import { Position } from "../../../common/core/position.js";
import { PositionOffsetTransformer } from "../../../common/core/positionToOffset.js";
import { Range } from "../../../common/core/range.js";
import { SingleTextEdit, TextEdit } from "../../../common/core/textEdit.js";
const array = [];
function getReadonlyEmptyArray() {
  return array;
}
__name(getReadonlyEmptyArray, "getReadonlyEmptyArray");
function addPositions(pos1, pos2) {
  return new Position(pos1.lineNumber + pos2.lineNumber - 1, pos2.lineNumber === 1 ? pos1.column + pos2.column - 1 : pos2.column);
}
__name(addPositions, "addPositions");
function subtractPositions(pos1, pos2) {
  return new Position(pos1.lineNumber - pos2.lineNumber + 1, pos1.lineNumber - pos2.lineNumber === 0 ? pos1.column - pos2.column + 1 : pos1.column);
}
__name(subtractPositions, "subtractPositions");
function substringPos(text, pos) {
  const transformer = new PositionOffsetTransformer(text);
  const offset = transformer.getOffset(pos);
  return text.substring(offset);
}
__name(substringPos, "substringPos");
function getEndPositionsAfterApplying(edits) {
  const newRanges = getModifiedRangesAfterApplying(edits);
  return newRanges.map((range) => range.getEndPosition());
}
__name(getEndPositionsAfterApplying, "getEndPositionsAfterApplying");
function getModifiedRangesAfterApplying(edits) {
  const sortPerm = Permutation.createSortPermutation(edits, compareBy((e) => e.range, Range.compareRangesUsingStarts));
  const edit = new TextEdit(sortPerm.apply(edits));
  const sortedNewRanges = edit.getNewRanges();
  return sortPerm.inverse().apply(sortedNewRanges);
}
__name(getModifiedRangesAfterApplying, "getModifiedRangesAfterApplying");
function convertItemsToStableObservables(items, store) {
  const result = observableValue("result", []);
  const innerObservables = [];
  store.add(autorun((reader) => {
    const itemsValue = items.read(reader);
    transaction((tx) => {
      if (itemsValue.length !== innerObservables.length) {
        innerObservables.length = itemsValue.length;
        for (let i = 0; i < innerObservables.length; i++) {
          if (!innerObservables[i]) {
            innerObservables[i] = observableValue("item", itemsValue[i]);
          }
        }
        result.set([...innerObservables], tx);
      }
      innerObservables.forEach((o, i) => o.set(itemsValue[i], tx));
    });
  }));
  return result;
}
__name(convertItemsToStableObservables, "convertItemsToStableObservables");
class ObservableContextKeyService {
  constructor(_contextKeyService) {
    this._contextKeyService = _contextKeyService;
  }
  static {
    __name(this, "ObservableContextKeyService");
  }
  bind(key, obs) {
    return bindContextKey(key, this._contextKeyService, obs instanceof Function ? obs : (reader) => obs.read(reader));
  }
}
export {
  ObservableContextKeyService,
  addPositions,
  convertItemsToStableObservables,
  getEndPositionsAfterApplying,
  getModifiedRangesAfterApplying,
  getReadonlyEmptyArray,
  substringPos,
  subtractPositions
};
//# sourceMappingURL=utils.js.map
