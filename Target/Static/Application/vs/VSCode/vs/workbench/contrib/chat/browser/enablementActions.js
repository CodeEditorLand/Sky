var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Action } from "../../../../base/common/actions.js";
import { localize } from "../../../../nls.js";
import { isContributionDisabled } from "../common/enablement.js";
function createEnablementActions(key, enablementModel, idPrefix) {
  return [
    new Action(`${idPrefix}.enable`, localize("enable", "Enable"), void 0, true, () => {
      enablementModel.setEnabled(
        key,
        2
        /* ContributionEnablementState.EnabledProfile */
      );
      return Promise.resolve();
    }),
    new Action(`${idPrefix}.enableForWorkspace`, localize("enableForWorkspace", "Enable (Workspace)"), void 0, true, () => {
      enablementModel.setEnabled(
        key,
        3
        /* ContributionEnablementState.EnabledWorkspace */
      );
      return Promise.resolve();
    }),
    new Action(`${idPrefix}.disable`, localize("disable", "Disable"), void 0, true, () => {
      enablementModel.setEnabled(
        key,
        0
        /* ContributionEnablementState.DisabledProfile */
      );
      return Promise.resolve();
    }),
    new Action(`${idPrefix}.disableForWorkspace`, localize("disableForWorkspace", "Disable (Workspace)"), void 0, true, () => {
      enablementModel.setEnabled(
        key,
        1
        /* ContributionEnablementState.DisabledWorkspace */
      );
      return Promise.resolve();
    })
  ];
}
__name(createEnablementActions, "createEnablementActions");
function buildEnablementContextMenuGroup(enablementState, key, enablementModel, workspaceContextService, idPrefix) {
  const hasWorkspace = workspaceContextService.getWorkbenchState() !== 1;
  const [enable, enableWorkspace, disable, disableWorkspace] = createEnablementActions(key, enablementModel, idPrefix);
  const actions = [];
  if (isContributionDisabled(enablementState)) {
    actions.push(enable);
    if (hasWorkspace) {
      actions.push(enableWorkspace);
    }
  } else {
    actions.push(disable);
    if (hasWorkspace) {
      actions.push(disableWorkspace);
    }
  }
  return actions;
}
__name(buildEnablementContextMenuGroup, "buildEnablementContextMenuGroup");
export {
  buildEnablementContextMenuGroup,
  createEnablementActions
};
//# sourceMappingURL=enablementActions.js.map
