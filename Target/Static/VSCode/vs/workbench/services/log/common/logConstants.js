import { localize } from "../../../../nls.js";
import { LoggerGroup } from "../../../../platform/log/common/log.js";
const windowLogId = "rendererLog";
const windowLogGroup = { id: windowLogId, name: localize("window", "Window") };
const showWindowLogActionId = "workbench.action.showWindowLog";
export {
  showWindowLogActionId,
  windowLogGroup,
  windowLogId
};
//# sourceMappingURL=logConstants.js.map
