import { registerEditorContribution } from "../../../../editor/browser/editorExtensions.js";
import { wrapInHotClass1 } from "../../../../platform/observable/common/wrapInHotClass.js";
import { InlineCompletionLanguageStatusBarContribution } from "./inlineCompletionLanguageStatusBarContribution.js";
registerEditorContribution(
  InlineCompletionLanguageStatusBarContribution.Id,
  wrapInHotClass1(InlineCompletionLanguageStatusBarContribution.hot),
  3
  /* EditorContributionInstantiation.Eventually */
);
//# sourceMappingURL=inlineCompletions.contribution.js.map
