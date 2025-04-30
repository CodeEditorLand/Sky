var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert } from "../../../../base/common/assert.js";
class ParserBase {
  static {
    __name(this, "ParserBase");
  }
  /**
   * Whether the parser object was "consumed" hence must not be used anymore.
   */
  get consumed() {
    return this.isConsumed;
  }
  constructor(currentTokens = []) {
    this.currentTokens = currentTokens;
    this.isConsumed = false;
    this.startTokensCount = this.currentTokens.length;
  }
  /**
   * Get the tokens that were accumulated so far.
   */
  get tokens() {
    return this.currentTokens;
  }
  /**
   * A helper method that validates that the current parser object was not yet consumed,
   * hence can still be used to accept new tokens in the parsing process.
   *
   * @throws if the parser object is already consumed.
   */
  assertNotConsumed() {
    assert(this.isConsumed === false, `The parser object is already consumed and should not be used anymore.`);
  }
}
function assertNotConsumed(_target, propertyKey, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    assert(this.isConsumed === false, `The parser object is already consumed and should not be used anymore.`);
    return originalMethod.apply(this, args);
  };
  return descriptor;
}
__name(assertNotConsumed, "assertNotConsumed");
export {
  ParserBase,
  assertNotConsumed
};
//# sourceMappingURL=parserBase.js.map
