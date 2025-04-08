var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { StandardMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { ActionRunner, IAction } from "../../../../base/common/actions.js";
import { asArray } from "../../../../base/common/arrays.js";
import { MarshalledId } from "../../../../base/common/marshallingIds.js";
import { SingleOrMany } from "../../../../base/common/types.js";
import { getFlatContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenu } from "../../../../platform/actions/common/actions.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { ITerminalInstance } from "./terminal.js";
import { ISerializedTerminalInstanceContext } from "../common/terminal.js";
class InstanceContext {
  static {
    __name(this, "InstanceContext");
  }
  instanceId;
  constructor(instance) {
    this.instanceId = instance.instanceId;
  }
  toJSON() {
    return {
      $mid: MarshalledId.TerminalContext,
      instanceId: this.instanceId
    };
  }
}
class TerminalContextActionRunner extends ActionRunner {
  static {
    __name(this, "TerminalContextActionRunner");
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  async runAction(action, context) {
    if (Array.isArray(context) && context.every((e) => e instanceof InstanceContext)) {
      await action.run(context?.[0], context);
      return;
    }
    return super.runAction(action, context);
  }
}
function openContextMenu(targetWindow, event, contextInstances, menu, contextMenuService, extraActions) {
  const standardEvent = new StandardMouseEvent(targetWindow, event);
  const actions = getFlatContextMenuActions(menu.getActions({ shouldForwardArgs: true }));
  if (extraActions) {
    actions.push(...extraActions);
  }
  const context = contextInstances ? asArray(contextInstances).map((e) => new InstanceContext(e)) : [];
  const actionRunner = new TerminalContextActionRunner();
  contextMenuService.showContextMenu({
    actionRunner,
    getAnchor: /* @__PURE__ */ __name(() => standardEvent, "getAnchor"),
    getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
    getActionsContext: /* @__PURE__ */ __name(() => context, "getActionsContext"),
    onHide: /* @__PURE__ */ __name(() => actionRunner.dispose(), "onHide")
  });
}
__name(openContextMenu, "openContextMenu");
export {
  InstanceContext,
  TerminalContextActionRunner,
  openContextMenu
};
//# sourceMappingURL=terminalContextMenu.js.map
