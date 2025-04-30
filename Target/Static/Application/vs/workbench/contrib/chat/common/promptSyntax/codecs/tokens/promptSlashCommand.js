var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./promptToken.js";
import { assert } from "../../../../../../../base/common/assert.js";
import { INVALID_NAME_CHARACTERS, STOP_CHARACTERS } from "../parsers/promptSlashCommandParser.js";
const START_CHARACTER = "/";
class PromptSlashCommand extends PromptToken {
  static {
    __name(this, "PromptSlashCommand");
  }
  constructor(range, name) {
    for (const character of name) {
      assert(INVALID_NAME_CHARACTERS.includes(character) === false && STOP_CHARACTERS.includes(character) === false, `Slash command 'name' cannot contain character '${character}', got '${name}'.`);
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
   * Check if this token is equal to another one.
   */
  equals(other) {
    if (!super.sameRange(other.range)) {
      return false;
    }
    if (other instanceof PromptSlashCommand === false) {
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
export {
  PromptSlashCommand
};
//# sourceMappingURL=promptSlashCommand.js.map
