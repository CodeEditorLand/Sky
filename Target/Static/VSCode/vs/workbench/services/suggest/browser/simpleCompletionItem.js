var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { FuzzyScore } from "../../../../base/common/filters.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
class SimpleCompletionItem {
  constructor(completion) {
    this.completion = completion;
    this.textLabel = typeof completion.label === "string" ? completion.label : completion.label?.label;
    this.labelLow = this.textLabel.toLowerCase();
  }
  static {
    __name(this, "SimpleCompletionItem");
  }
  /**
   * The lowercase label, normalized to `\` path separators on Windows.
   */
  labelLow;
  textLabel;
  // sorting, filtering
  score = FuzzyScore.Default;
  idx;
  word;
  // validation
  isInvalid = false;
}
export {
  SimpleCompletionItem
};
//# sourceMappingURL=simpleCompletionItem.js.map
