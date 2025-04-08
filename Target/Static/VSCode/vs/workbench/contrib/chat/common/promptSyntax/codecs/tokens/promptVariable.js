var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./promptToken.js";
import { assert } from "../../../../../../../base/common/assert.js";
import { IRange, Range } from "../../../../../../../editor/common/core/range.js";
import { BaseToken } from "../../../../../../../editor/common/codecs/baseToken.js";
import { INVALID_NAME_CHARACTERS, STOP_CHARACTERS } from "../parsers/promptVariableParser.js";
const START_CHARACTER = "#";
const DATA_SEPARATOR = ":";
class PromptVariable extends PromptToken {
  constructor(range, name) {
    for (const character of name) {
      assert(
        INVALID_NAME_CHARACTERS.includes(character) === false && STOP_CHARACTERS.includes(character) === false,
        `Variable 'name' cannot contain character '${character}', got '${name}'.`
      );
    }
    super(range);
    this.name = name;
  }
  static {
    __name(this, "PromptVariable");
  }
  /**
   * Get full text of the token.
   */
  get text() {
    return `${START_CHARACTER}${this.name}`;
  }
  /**
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (!super.sameRange(other.range)) {
      return false;
    }
    if (other instanceof PromptVariable === false) {
      return false;
    }
    if (this.text.length !== other.text.length) {
      return false;
    }
    return this.text === other.text;
  }
  /**
   * Return a string representation of the token.
   */
  toString() {
    return `${this.text}${this.range}`;
  }
}
class PromptVariableWithData extends PromptVariable {
  constructor(fullRange, name, data) {
    super(fullRange, name);
    this.data = data;
    for (const character of data) {
      assert(
        STOP_CHARACTERS.includes(character) === false,
        `Variable 'data' cannot contain character '${character}', got '${data}'.`
      );
    }
  }
  static {
    __name(this, "PromptVariableWithData");
  }
  /**
   * Get full text of the token.
   */
  get text() {
    return `${START_CHARACTER}${this.name}${DATA_SEPARATOR}${this.data}`;
  }
  /**
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (other instanceof PromptVariableWithData === false) {
      return false;
    }
    return super.equals(other);
  }
  /**
   * Range of the `data` part of the variable.
   */
  get dataRange() {
    const { range } = this;
    const dataStartColumn = range.startColumn + START_CHARACTER.length + this.name.length + DATA_SEPARATOR.length;
    const result = new Range(
      range.startLineNumber,
      dataStartColumn,
      range.endLineNumber,
      range.endColumn
    );
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
