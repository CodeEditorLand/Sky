import "./localHistoryCommands.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { LocalHistoryTimeline } from "./localHistoryTimeline.js";
registerWorkbenchContribution2(
  LocalHistoryTimeline.ID,
  LocalHistoryTimeline,
  2
  /* WorkbenchPhase.BlockRestore */
);
//# sourceMappingURL=localHistory.contribution.js.map
