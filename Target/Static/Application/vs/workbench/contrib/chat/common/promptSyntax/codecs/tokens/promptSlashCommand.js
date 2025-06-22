var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { PromptToken } from "./promptToken.js";
const START_CHARACTER = "/";
class PromptSlashCommand extends PromptToken {
  static {
    __name(this, "PromptSlashCommand");
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
export {
  PromptSlashCommand
};
//# sourceMappingURL=promptSlashCommand.js.map
