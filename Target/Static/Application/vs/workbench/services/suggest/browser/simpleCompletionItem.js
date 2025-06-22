var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FuzzyScore } from "../../../../base/common/filters.js";
class SimpleCompletionItem {
  static {
    __name(this, "SimpleCompletionItem");
  }
  constructor(completion) {
    this.completion = completion;
    this.score = FuzzyScore.Default;
    this.isInvalid = false;
    this.textLabel = typeof completion.label === "string" ? completion.label : completion.label?.label;
    this.labelLow = this.textLabel.toLowerCase();
  }
}
export {
  SimpleCompletionItem
};
//# sourceMappingURL=simpleCompletionItem.js.map
