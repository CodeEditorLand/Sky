var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../nls.js";
import { MenuId, Action2, registerAction2 } from "../../../platform/actions/common/actions.js";
import { KeybindingsRegistry } from "../../../platform/keybinding/common/keybindingsRegistry.js";
import { IQuickInputService, ItemActivation, QuickInputHideReason } from "../../../platform/quickinput/common/quickInput.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import { CommandsRegistry } from "../../../platform/commands/common/commands.js";
import { inQuickPickContext, defaultQuickAccessContext, getQuickNavigateHandler } from "../quickaccess.js";
import { Codicon } from "../../../base/common/codicons.js";
const globalQuickAccessKeybinding = {
  primary: 2048 | 46,
  secondary: [
    2048 | 35
    /* KeyCode.KeyE */
  ],
  mac: { primary: 2048 | 46, secondary: void 0 }
};
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.closeQuickOpen",
  weight: 200,
  when: inQuickPickContext,
  primary: 9,
  secondary: [
    1024 | 9
    /* KeyCode.Escape */
  ],
  handler: /* @__PURE__ */ __name((accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    return quickInputService.cancel(QuickInputHideReason.Gesture);
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.acceptSelectedQuickOpenItem",
  weight: 200,
  when: inQuickPickContext,
  primary: 0,
  handler: /* @__PURE__ */ __name((accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    return quickInputService.accept();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.alternativeAcceptSelectedQuickOpenItem",
  weight: 200,
  when: inQuickPickContext,
  primary: 0,
  handler: /* @__PURE__ */ __name((accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    return quickInputService.accept({ ctrlCmd: true, alt: false });
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.focusQuickOpen",
  weight: 200,
  when: inQuickPickContext,
  primary: 0,
  handler: /* @__PURE__ */ __name((accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.focus();
  }, "handler")
});
const quickAccessNavigateNextInFilePickerId = "workbench.action.quickOpenNavigateNextInFilePicker";
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigateNextInFilePickerId,
  weight: 200 + 50,
  handler: getQuickNavigateHandler(quickAccessNavigateNextInFilePickerId, true),
  when: defaultQuickAccessContext,
  primary: globalQuickAccessKeybinding.primary,
  secondary: globalQuickAccessKeybinding.secondary,
  mac: globalQuickAccessKeybinding.mac
});
const quickAccessNavigatePreviousInFilePickerId = "workbench.action.quickOpenNavigatePreviousInFilePicker";
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigatePreviousInFilePickerId,
  weight: 200 + 50,
  handler: getQuickNavigateHandler(quickAccessNavigatePreviousInFilePickerId, false),
  when: defaultQuickAccessContext,
  primary: globalQuickAccessKeybinding.primary | 1024,
  secondary: [
    globalQuickAccessKeybinding.secondary[0] | 1024
    /* KeyMod.Shift */
  ],
  mac: {
    primary: globalQuickAccessKeybinding.mac.primary | 1024,
    secondary: void 0
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.quickPickManyToggle",
  weight: 200,
  when: inQuickPickContext,
  primary: 0,
  handler: /* @__PURE__ */ __name((accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.toggle();
  }, "handler")
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.quickInputBack",
  weight: 200 + 50,
  when: inQuickPickContext,
  primary: 0,
  win: {
    primary: 512 | 15
    /* KeyCode.LeftArrow */
  },
  mac: {
    primary: 256 | 88
    /* KeyCode.Minus */
  },
  linux: {
    primary: 2048 | 512 | 88
    /* KeyCode.Minus */
  },
  handler: /* @__PURE__ */ __name((accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.back();
  }, "handler")
});
registerAction2(class QuickAccessAction extends Action2 {
  static {
    __name(this, "QuickAccessAction");
  }
  constructor() {
    super({
      id: "workbench.action.quickOpen",
      title: localize2("quickOpen", "Go to File..."),
      metadata: {
        description: `Quick access`,
        args: [{
          name: "prefix",
          schema: {
            "type": "string"
          }
        }]
      },
      keybinding: {
        weight: 200,
        primary: globalQuickAccessKeybinding.primary,
        secondary: globalQuickAccessKeybinding.secondary,
        mac: globalQuickAccessKeybinding.mac
      },
      f1: true
    });
  }
  run(accessor, prefix) {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.quickAccess.show(typeof prefix === "string" ? prefix : void 0, {
      preserveValue: typeof prefix === "string"
      /* preserve as is if provided */
    });
  }
});
registerAction2(class QuickAccessAction2 extends Action2 {
  static {
    __name(this, "QuickAccessAction");
  }
  constructor() {
    super({
      id: "workbench.action.quickOpenWithModes",
      title: localize("quickOpenWithModes", "Quick Open"),
      icon: Codicon.search,
      menu: {
        id: MenuId.CommandCenterCenter,
        order: 100
      }
    });
  }
  run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const providerOptions = {
      includeHelp: true,
      from: "commandCenter"
    };
    quickInputService.quickAccess.show(void 0, {
      preserveValue: true,
      providerOptions
    });
  }
});
CommandsRegistry.registerCommand("workbench.action.quickOpenPreviousEditor", async (accessor) => {
  const quickInputService = accessor.get(IQuickInputService);
  quickInputService.quickAccess.show("", { itemActivation: ItemActivation.SECOND });
});
class BaseQuickAccessNavigateAction extends Action2 {
  static {
    __name(this, "BaseQuickAccessNavigateAction");
  }
  constructor(id, title, next, quickNavigate, keybinding) {
    super({ id, title, f1: true, keybinding });
    this.id = id;
    this.next = next;
    this.quickNavigate = quickNavigate;
  }
  async run(accessor) {
    const keybindingService = accessor.get(IKeybindingService);
    const quickInputService = accessor.get(IQuickInputService);
    const keys = keybindingService.lookupKeybindings(this.id);
    const quickNavigate = this.quickNavigate ? { keybindings: keys } : void 0;
    quickInputService.navigate(this.next, quickNavigate);
  }
}
class QuickAccessNavigateNextAction extends BaseQuickAccessNavigateAction {
  static {
    __name(this, "QuickAccessNavigateNextAction");
  }
  constructor() {
    super("workbench.action.quickOpenNavigateNext", localize2("quickNavigateNext", "Navigate Next in Quick Open"), true, true);
  }
}
class QuickAccessNavigatePreviousAction extends BaseQuickAccessNavigateAction {
  static {
    __name(this, "QuickAccessNavigatePreviousAction");
  }
  constructor() {
    super("workbench.action.quickOpenNavigatePrevious", localize2("quickNavigatePrevious", "Navigate Previous in Quick Open"), false, true);
  }
}
class QuickAccessSelectNextAction extends BaseQuickAccessNavigateAction {
  static {
    __name(this, "QuickAccessSelectNextAction");
  }
  constructor() {
    super("workbench.action.quickOpenSelectNext", localize2("quickSelectNext", "Select Next in Quick Open"), true, false, {
      weight: 200 + 50,
      when: inQuickPickContext,
      primary: 0,
      mac: {
        primary: 256 | 44
        /* KeyCode.KeyN */
      }
    });
  }
}
class QuickAccessSelectPreviousAction extends BaseQuickAccessNavigateAction {
  static {
    __name(this, "QuickAccessSelectPreviousAction");
  }
  constructor() {
    super("workbench.action.quickOpenSelectPrevious", localize2("quickSelectPrevious", "Select Previous in Quick Open"), false, false, {
      weight: 200 + 50,
      when: inQuickPickContext,
      primary: 0,
      mac: {
        primary: 256 | 46
        /* KeyCode.KeyP */
      }
    });
  }
}
registerAction2(QuickAccessSelectNextAction);
registerAction2(QuickAccessSelectPreviousAction);
registerAction2(QuickAccessNavigateNextAction);
registerAction2(QuickAccessNavigatePreviousAction);
//# sourceMappingURL=quickAccessActions.js.map
