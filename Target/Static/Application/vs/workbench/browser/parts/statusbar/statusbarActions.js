var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../../nls.js";
import { IStatusbarService } from "../../../services/statusbar/browser/statusbar.js";
import { Action } from "../../../../base/common/actions.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { StatusBarFocused } from "../../../common/contextkeys.js";
import { getActiveWindow } from "../../../../base/browser/dom.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
};
class ToggleStatusbarEntryVisibilityAction extends Action {
  static {
    __name(this, "ToggleStatusbarEntryVisibilityAction");
  }
  constructor(id, label, model) {
    super(id, label, void 0, true);
    this.model = model;
    this.checked = !model.isHidden(id);
  }
  async run() {
    if (this.model.isHidden(this.id)) {
      this.model.show(this.id);
    } else {
      this.model.hide(this.id);
    }
  }
}
class HideStatusbarEntryAction extends Action {
  static {
    __name(this, "HideStatusbarEntryAction");
  }
  constructor(id, name, model) {
    super(id, localize("hide", "Hide '{0}'", name), void 0, true);
    this.model = model;
  }
  async run() {
    this.model.hide(this.id);
  }
}
let ManageExtensionAction = class ManageExtensionAction2 extends Action {
  static {
    __name(this, "ManageExtensionAction");
  }
  constructor(extensionId, commandService) {
    super("statusbar.manage.extension", localize("manageExtension", "Manage Extension"));
    this.extensionId = extensionId;
    this.commandService = commandService;
  }
  run() {
    return this.commandService.executeCommand("_extensions.manage", this.extensionId);
  }
};
ManageExtensionAction = __decorate([
  __param(1, ICommandService)
], ManageExtensionAction);
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusPrevious",
  weight: 200,
  primary: 15,
  secondary: [
    16
    /* KeyCode.UpArrow */
  ],
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focusPreviousEntry();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusNext",
  weight: 200,
  primary: 17,
  secondary: [
    18
    /* KeyCode.DownArrow */
  ],
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focusNextEntry();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusFirst",
  weight: 200,
  primary: 14,
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focus(false);
    statusBarService.focusNextEntry();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.focusLast",
  weight: 200,
  primary: 13,
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    statusBarService.focus(false);
    statusBarService.focusPreviousEntry();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.statusBar.clearFocus",
  weight: 200,
  primary: 9,
  when: StatusBarFocused,
  handler: /* @__PURE__ */ __name((accessor) => {
    const statusBarService = accessor.get(IStatusbarService);
    const editorService = accessor.get(IEditorService);
    if (statusBarService.isEntryFocused()) {
      statusBarService.focus(false);
    } else if (editorService.activeEditorPane) {
      editorService.activeEditorPane.focus();
    }
  }, "handler")
});
class FocusStatusBarAction extends Action2 {
  static {
    __name(this, "FocusStatusBarAction");
  }
  constructor() {
    super({
      id: "workbench.action.focusStatusBar",
      title: localize2("focusStatusBar", "Focus Status Bar"),
      category: Categories.View,
      f1: true
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IWorkbenchLayoutService);
    layoutService.focusPart("workbench.parts.statusbar", getActiveWindow());
  }
}
registerAction2(FocusStatusBarAction);
export {
  HideStatusbarEntryAction,
  ManageExtensionAction,
  ToggleStatusbarEntryVisibilityAction
};
//# sourceMappingURL=statusbarActions.js.map
