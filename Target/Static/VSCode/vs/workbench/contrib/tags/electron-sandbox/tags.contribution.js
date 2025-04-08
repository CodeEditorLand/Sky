import { Registry } from "../../../../platform/registry/common/platform.js";
import { IWorkbenchContributionsRegistry, Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { WorkspaceTags } from "./workspaceTags.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WorkspaceTags, LifecyclePhase.Eventually);
//# sourceMappingURL=tags.contribution.js.map
