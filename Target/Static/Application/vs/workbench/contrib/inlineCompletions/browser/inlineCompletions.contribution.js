import { wrapInHotClass1 } from "../../../../platform/observable/common/wrapInHotClass.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { InlineCompletionLanguageStatusBarContribution } from "./inlineCompletionLanguageStatusBarContribution.js";
registerWorkbenchContribution2(
  InlineCompletionLanguageStatusBarContribution.Id,
  wrapInHotClass1(InlineCompletionLanguageStatusBarContribution.hot),
  4
  /* WorkbenchPhase.Eventually */
);
//# sourceMappingURL=inlineCompletions.contribution.js.map
