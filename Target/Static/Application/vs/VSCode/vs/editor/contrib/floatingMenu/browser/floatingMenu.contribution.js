import "./floatingMenu.css";
import { registerEditorContribution } from "../../../browser/editorExtensions.js";
import { FloatingEditorToolbar } from "./floatingMenu.js";
registerEditorContribution(
  FloatingEditorToolbar.ID,
  FloatingEditorToolbar,
  1
  /* EditorContributionInstantiation.AfterFirstRender */
);
//# sourceMappingURL=floatingMenu.contribution.js.map
