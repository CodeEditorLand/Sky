import { registerWorkbenchContribution2 } from "../../../../workbench/common/contributions.js";
import { WorkspaceFolderManagementContribution } from "./workspaceFolderManagement.js";
registerWorkbenchContribution2(
  WorkspaceFolderManagementContribution.ID,
  WorkspaceFolderManagementContribution,
  3
  /* WorkbenchPhase.AfterRestored */
);
//# sourceMappingURL=workspace.contribution.js.map
