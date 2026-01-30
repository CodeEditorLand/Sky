import { registerEditorContribution } from "../../../browser/editorExtensions.js";
import { MiddleScrollController } from "./middleScrollController.js";
registerEditorContribution(
  MiddleScrollController.ID,
  MiddleScrollController,
  2
  /* EditorContributionInstantiation.BeforeFirstInteraction */
);
//# sourceMappingURL=middleScroll.contribution.js.map
