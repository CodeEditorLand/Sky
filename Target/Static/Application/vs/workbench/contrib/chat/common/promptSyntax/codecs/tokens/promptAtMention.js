var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./promptToken.js";
import { assert } from "../../../../../../../base/common/assert.js";
import { INVALID_NAME_CHARACTERS, STOP_CHARACTERS } from "../parsers/promptVariableParser.js";
const START_CHARACTER = "@";
class PromptAtMention extends PromptToken {
  static {
    __name(this, "PromptAtMention");
  }
  constructor(range, name) {
    for (const character of name) {
      assert(INVALID_NAME_CHARACTERS.includes(character) === false && STOP_CHARACTERS.includes(character) === false, `Mention 'name' cannot contain character '${character}', got '${name}'.`);
    }
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
export {
  PromptAtMention
};
//# sourceMappingURL=promptAtMention.js.map
