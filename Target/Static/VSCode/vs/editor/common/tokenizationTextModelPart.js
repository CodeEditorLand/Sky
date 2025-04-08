import { Range } from "./core/range.js";
import { StandardTokenType } from "./encodedTokenAttributes.js";
import { LineTokens } from "./tokens/lineTokens.js";
import { SparseMultilineTokens } from "./tokens/sparseMultilineTokens.js";
var BackgroundTokenizationState = /* @__PURE__ */ ((BackgroundTokenizationState2) => {
  BackgroundTokenizationState2[BackgroundTokenizationState2["InProgress"] = 1] = "InProgress";
  BackgroundTokenizationState2[BackgroundTokenizationState2["Completed"] = 2] = "Completed";
  return BackgroundTokenizationState2;
})(BackgroundTokenizationState || {});
export {
  BackgroundTokenizationState
};
//# sourceMappingURL=tokenizationTextModelPart.js.map
