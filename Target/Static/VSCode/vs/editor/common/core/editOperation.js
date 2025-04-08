var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Position } from "./position.js";
import { IRange, Range } from "./range.js";
class EditOperation {
  static {
    __name(this, "EditOperation");
  }
  static insert(position, text) {
    return {
      range: new Range(position.lineNumber, position.column, position.lineNumber, position.column),
      text,
      forceMoveMarkers: true
    };
  }
  static delete(range) {
    return {
      range,
      text: null
    };
  }
  static replace(range, text) {
    return {
      range,
      text
    };
  }
  static replaceMove(range, text) {
    return {
      range,
      text,
      forceMoveMarkers: true
    };
  }
}
export {
  EditOperation
};
//# sourceMappingURL=editOperation.js.map
