var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./promptToken.js";
import { Range } from "../../../../../../../editor/common/core/range.js";
const START_CHARACTER = "#";
const DATA_SEPARATOR = ":";
class PromptVariable extends PromptToken {
  static {
    __name(this, "PromptVariable");
  }
  constructor(range, name) {
    super(range);
    this.name = name;
  }
  /**
   * Get full text of the token.
   */
  get text() {
    return `${START_CHARACTER}${this.name}`;
  }
  /**
   * Return a string representation of the token.
   */
  toString() {
    return `${this.text}${this.range}`;
  }
}
class PromptVariableWithData extends PromptVariable {
  static {
    __name(this, "PromptVariableWithData");
  }
  constructor(fullRange, name, data) {
    super(fullRange, name);
    this.data = data;
  }
  /**
   * Get full text of the token.
   */
  get text() {
    return `${START_CHARACTER}${this.name}${DATA_SEPARATOR}${this.data}`;
  }
  /**
   * Range of the `data` part of the variable.
   */
  get dataRange() {
    const { range } = this;
    const dataStartColumn = range.startColumn + START_CHARACTER.length + this.name.length + DATA_SEPARATOR.length;
    const result = new Range(range.startLineNumber, dataStartColumn, range.endLineNumber, range.endColumn);
    if (result.isEmpty()) {
      return void 0;
    }
    return result;
  }
}
export {
  PromptVariable,
  PromptVariableWithData
};
//# sourceMappingURL=promptVariable.js.map
