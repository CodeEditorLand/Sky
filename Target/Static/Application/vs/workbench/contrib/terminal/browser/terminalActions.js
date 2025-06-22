var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { isKeyboardEvent, isMouseEvent, isPointerEvent } from "../../../../base/browser/dom.js";
import { Action } from "../../../../base/common/actions.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { KeyChord } from "../../../../base/common/keyCodes.js";
import { Schemas } from "../../../../base/common/network.js";
import { isAbsolute } from "../../../../base/common/path.js";
import { isWindows } from "../../../../base/common/platform.js";
import { dirname } from "../../../../base/common/resources.js";
import { isObject, isString } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { getIconClasses } from "../../../../editor/common/services/getIconClasses.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize, localize2 } from "../../../../nls.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../platform/accessibility/common/accessibility.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { TerminalExitReason, TerminalLocation } from "../../../../platform/terminal/common/terminal.js";
import { createProfileSchemaEnums } from "../../../../platform/terminal/common/terminalProfiles.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from "../../../browser/actions/workspaceCommands.js";
import { CLOSE_EDITOR_COMMAND_ID } from "../../../browser/parts/editor/editorCommands.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { ConfigurationResolverExpression } from "../../../services/configurationResolver/common/configurationResolverExpression.js";
import { editorGroupToColumn } from "../../../services/editor/common/editorGroupColumn.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { accessibleViewCurrentProviderId, accessibleViewIsShown, accessibleViewOnLastLine } from "../../accessibility/browser/accessibilityConfiguration.js";
import { ITerminalProfileResolverService, ITerminalProfileService, TERMINAL_VIEW_ID } from "../common/terminal.js";
import { TerminalContextKeys } from "../common/terminalContextKey.js";
import { terminalStrings } from "../common/terminalStrings.js";
import { ITerminalConfigurationService, ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService } from "./terminal.js";
import { InstanceContext } from "./terminalContextMenu.js";
import { getColorClass, getIconId, getUriClasses } from "./terminalIcon.js";
import { killTerminalIcon, newTerminalIcon } from "./terminalIcons.js";
import { TerminalTabList } from "./terminalTabsList.js";
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
const switchTerminalActionViewItemSeparator = "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500";
const switchTerminalShowTabsTitle = localize("showTerminalTabs", "Show Tabs");
const category = terminalStrings.actionCategory;
const sharedWhenClause = (() => {
  const terminalAvailable = ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated);
  return {
    terminalAvailable,
    terminalAvailable_and_opened: ContextKeyExpr.and(terminalAvailable, TerminalContextKeys.isOpen),
    terminalAvailable_and_editorActive: ContextKeyExpr.and(terminalAvailable, TerminalContextKeys.terminalEditorActive),
    terminalAvailable_and_singularSelection: ContextKeyExpr.and(terminalAvailable, TerminalContextKeys.tabsSingularSelection),
    focusInAny_and_normalBuffer: ContextKeyExpr.and(TerminalContextKeys.focusInAny, TerminalContextKeys.altBufferActive.negate())
  };
})();
async function getCwdForSplit(instance, folders, commandService, configService) {
  switch (configService.config.splitCwd) {
    case "workspaceRoot":
      if (folders !== void 0 && commandService !== void 0) {
        if (folders.length === 1) {
          return folders[0].uri;
        } else if (folders.length > 1) {
          const options = {
            placeHolder: localize("workbench.action.terminal.newWorkspacePlaceholder", "Select current working directory for new terminal")
          };
          const workspace = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, [options]);
          if (!workspace) {
            return void 0;
          }
          return Promise.resolve(workspace.uri);
        }
      }
      return "";
    case "initial":
      return instance.getInitialCwd();
    case "inherited":
      return instance.getCwd();
  }
}
__name(getCwdForSplit, "getCwdForSplit");
let TerminalLaunchHelpAction = class TerminalLaunchHelpAction2 extends Action {
  static {
    __name(this, "TerminalLaunchHelpAction");
  }
  constructor(_openerService) {
    super("workbench.action.terminal.launchHelp", localize("terminalLaunchHelp", "Open Help"));
    this._openerService = _openerService;
  }
  async run() {
    this._openerService.open("https://aka.ms/vscode-troubleshoot-terminal-launch");
  }
};
TerminalLaunchHelpAction = __decorate([
  __param(0, IOpenerService)
], TerminalLaunchHelpAction);
function registerTerminalAction(options) {
  options.f1 = options.f1 ?? true;
  options.category = options.category ?? category;
  options.precondition = options.precondition ?? TerminalContextKeys.processSupported;
  const runFunc = options.run;
  const strictOptions = options;
  delete strictOptions["run"];
  return registerAction2(class extends Action2 {
    constructor() {
      super(strictOptions);
    }
    run(accessor, args, args2) {
      return runFunc(getTerminalServices(accessor), accessor, args, args2);
    }
  });
}
__name(registerTerminalAction, "registerTerminalAction");
function parseActionArgs(args) {
  if (Array.isArray(args)) {
    if (args.every((e) => e instanceof InstanceContext)) {
      return args;
    }
  } else if (args instanceof InstanceContext) {
    return [args];
  }
  return void 0;
}
__name(parseActionArgs, "parseActionArgs");
function registerContextualInstanceAction(options) {
  const originalRun = options.run;
  return registerTerminalAction({
    ...options,
    run: /* @__PURE__ */ __name(async (c, accessor, focusedInstanceArgs, allInstanceArgs) => {
      let instances = getSelectedInstances2(accessor, allInstanceArgs);
      if (!instances) {
        const activeInstance = (options.activeInstanceType === "view" ? c.groupService : options.activeInstanceType === "editor" ? c.editorService : c.service).activeInstance;
        if (!activeInstance) {
          return;
        }
        instances = [activeInstance];
      }
      const results = [];
      for (const instance of instances) {
        results.push(originalRun(instance, c, accessor, focusedInstanceArgs));
      }
      await Promise.all(results);
      if (options.runAfter) {
        options.runAfter(instances, c, accessor, focusedInstanceArgs);
      }
    }, "run")
  });
}
__name(registerContextualInstanceAction, "registerContextualInstanceAction");
function registerActiveInstanceAction(options) {
  const originalRun = options.run;
  return registerTerminalAction({
    ...options,
    run: /* @__PURE__ */ __name((c, accessor, args) => {
      const activeInstance = c.service.activeInstance;
      if (activeInstance) {
        return originalRun(activeInstance, c, accessor, args);
      }
    }, "run")
  });
}
__name(registerActiveInstanceAction, "registerActiveInstanceAction");
function registerActiveXtermAction(options) {
  const originalRun = options.run;
  return registerTerminalAction({
    ...options,
    run: /* @__PURE__ */ __name((c, accessor, args) => {
      const activeDetached = Iterable.find(c.service.detachedInstances, (d) => d.xterm.isFocused);
      if (activeDetached) {
        return originalRun(activeDetached.xterm, accessor, activeDetached, args);
      }
      const activeInstance = c.service.activeInstance;
      if (activeInstance?.xterm) {
        return originalRun(activeInstance.xterm, accessor, activeInstance, args);
      }
    }, "run")
  });
}
__name(registerActiveXtermAction, "registerActiveXtermAction");
function getTerminalServices(accessor) {
  return {
    service: accessor.get(ITerminalService),
    configService: accessor.get(ITerminalConfigurationService),
    groupService: accessor.get(ITerminalGroupService),
    instanceService: accessor.get(ITerminalInstanceService),
    editorService: accessor.get(ITerminalEditorService),
    profileService: accessor.get(ITerminalProfileService),
    profileResolverService: accessor.get(ITerminalProfileResolverService)
  };
}
__name(getTerminalServices, "getTerminalServices");
function registerTerminalActions() {
  registerTerminalAction({
    id: "workbench.action.terminal.newInActiveWorkspace",
    title: localize2("workbench.action.terminal.newInActiveWorkspace", "Create New Terminal (In Active Workspace)"),
    run: /* @__PURE__ */ __name(async (c) => {
      if (c.service.isProcessSupportRegistered) {
        const instance = await c.service.createTerminal({ location: c.service.defaultLocation });
        if (!instance) {
          return;
        }
        c.service.setActiveInstance(instance);
        await focusActiveTerminal(instance, c);
      }
    }, "run")
  });
  refreshTerminalActions([]);
  registerTerminalAction({
    id: "workbench.action.createTerminalEditor",
    title: localize2("workbench.action.terminal.createTerminalEditor", "Create New Terminal in Editor Area"),
    run: /* @__PURE__ */ __name(async (c, _, args) => {
      const options = isObject(args) && "location" in args ? args : { location: TerminalLocation.Editor };
      const instance = await c.service.createTerminal(options);
      await instance.focusWhenReady();
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.createTerminalEditorSameGroup",
    title: localize2("workbench.action.terminal.createTerminalEditor", "Create New Terminal in Editor Area"),
    f1: false,
    run: /* @__PURE__ */ __name(async (c, accessor, args) => {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const instance = await c.service.createTerminal({
        location: { viewColumn: editorGroupToColumn(editorGroupsService, editorGroupsService.activeGroup) }
      });
      await instance.focusWhenReady();
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.createTerminalEditorSide",
    title: localize2("workbench.action.terminal.createTerminalEditorSide", "Create New Terminal in Editor Area to the Side"),
    run: /* @__PURE__ */ __name(async (c) => {
      const instance = await c.service.createTerminal({
        location: { viewColumn: SIDE_GROUP }
      });
      await instance.focusWhenReady();
    }, "run")
  });
  registerContextualInstanceAction({
    id: "workbench.action.terminal.moveToEditor",
    title: terminalStrings.moveToEditor,
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    activeInstanceType: "view",
    run: /* @__PURE__ */ __name((instance, c) => c.service.moveToEditor(instance), "run"),
    runAfter: /* @__PURE__ */ __name((instances) => instances.at(-1)?.focus(), "runAfter")
  });
  registerContextualInstanceAction({
    id: "workbench.action.terminal.moveIntoNewWindow",
    title: terminalStrings.moveIntoNewWindow,
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    run: /* @__PURE__ */ __name((instance, c) => c.service.moveIntoNewEditor(instance), "run"),
    runAfter: /* @__PURE__ */ __name((instances) => instances.at(-1)?.focus(), "runAfter")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.moveToTerminalPanel",
    title: terminalStrings.moveToTerminalPanel,
    precondition: sharedWhenClause.terminalAvailable_and_editorActive,
    run: /* @__PURE__ */ __name((c, _, args) => {
      const source = toOptionalUri(args) ?? c.editorService.activeInstance;
      if (source) {
        c.service.moveToTerminalView(source);
      }
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusPreviousPane",
    title: localize2("workbench.action.terminal.focusPreviousPane", "Focus Previous Terminal in Terminal Group"),
    keybinding: {
      primary: 512 | 15,
      secondary: [
        512 | 16
        /* KeyCode.UpArrow */
      ],
      mac: {
        primary: 512 | 2048 | 15,
        secondary: [
          512 | 2048 | 16
          /* KeyCode.UpArrow */
        ]
      },
      when: TerminalContextKeys.focus,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (c) => {
      c.groupService.activeGroup?.focusPreviousPane();
      await c.groupService.showPanel(true);
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusNextPane",
    title: localize2("workbench.action.terminal.focusNextPane", "Focus Next Terminal in Terminal Group"),
    keybinding: {
      primary: 512 | 17,
      secondary: [
        512 | 18
        /* KeyCode.DownArrow */
      ],
      mac: {
        primary: 512 | 2048 | 17,
        secondary: [
          512 | 2048 | 18
          /* KeyCode.DownArrow */
        ]
      },
      when: TerminalContextKeys.focus,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (c) => {
      c.groupService.activeGroup?.focusNextPane();
      await c.groupService.showPanel(true);
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.resizePaneLeft",
    title: localize2("workbench.action.terminal.resizePaneLeft", "Resize Terminal Left"),
    keybinding: {
      linux: {
        primary: 2048 | 1024 | 15
        /* KeyCode.LeftArrow */
      },
      mac: {
        primary: 2048 | 256 | 15
        /* KeyCode.LeftArrow */
      },
      when: TerminalContextKeys.focus,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.activeGroup?.resizePane(
      0
      /* Direction.Left */
    ), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.resizePaneRight",
    title: localize2("workbench.action.terminal.resizePaneRight", "Resize Terminal Right"),
    keybinding: {
      linux: {
        primary: 2048 | 1024 | 17
        /* KeyCode.RightArrow */
      },
      mac: {
        primary: 2048 | 256 | 17
        /* KeyCode.RightArrow */
      },
      when: TerminalContextKeys.focus,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.activeGroup?.resizePane(
      1
      /* Direction.Right */
    ), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.resizePaneUp",
    title: localize2("workbench.action.terminal.resizePaneUp", "Resize Terminal Up"),
    keybinding: {
      mac: {
        primary: 2048 | 256 | 16
        /* KeyCode.UpArrow */
      },
      when: TerminalContextKeys.focus,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.activeGroup?.resizePane(
      2
      /* Direction.Up */
    ), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.resizePaneDown",
    title: localize2("workbench.action.terminal.resizePaneDown", "Resize Terminal Down"),
    keybinding: {
      mac: {
        primary: 2048 | 256 | 18
        /* KeyCode.DownArrow */
      },
      when: TerminalContextKeys.focus,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.activeGroup?.resizePane(
      3
      /* Direction.Down */
    ), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focus",
    title: terminalStrings.focus,
    keybinding: {
      when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibleViewOnLastLine, accessibleViewCurrentProviderId.isEqualTo(
        "terminal"
        /* AccessibleViewProviderId.Terminal */
      )),
      primary: 2048 | 18,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (c) => {
      const instance = c.service.activeInstance || await c.service.createTerminal({ location: TerminalLocation.Panel });
      if (!instance) {
        return;
      }
      c.service.setActiveInstance(instance);
      focusActiveTerminal(instance, c);
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusTabs",
    title: localize2("workbench.action.terminal.focus.tabsView", "Focus Terminal Tabs View"),
    keybinding: {
      primary: 2048 | 1024 | 93,
      weight: 200,
      when: ContextKeyExpr.or(TerminalContextKeys.tabsFocus, TerminalContextKeys.focus)
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.focusTabs(), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusNext",
    title: localize2("workbench.action.terminal.focusNext", "Focus Next Terminal Group"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: 2048 | 12,
      mac: {
        primary: 2048 | 1024 | 94
        /* KeyCode.BracketRight */
      },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    run: /* @__PURE__ */ __name(async (c) => {
      c.groupService.setActiveGroupToNext();
      await c.groupService.showPanel(true);
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusPrevious",
    title: localize2("workbench.action.terminal.focusPrevious", "Focus Previous Terminal Group"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: 2048 | 11,
      mac: {
        primary: 2048 | 1024 | 92
        /* KeyCode.BracketLeft */
      },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    run: /* @__PURE__ */ __name(async (c) => {
      c.groupService.setActiveGroupToPrevious();
      await c.groupService.showPanel(true);
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.runSelectedText",
    title: localize2("workbench.action.terminal.runSelectedText", "Run Selected Text In Active Terminal"),
    run: /* @__PURE__ */ __name(async (c, accessor) => {
      const codeEditorService = accessor.get(ICodeEditorService);
      const editor = codeEditorService.getActiveCodeEditor();
      if (!editor || !editor.hasModel()) {
        return;
      }
      const instance = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
      const selection = editor.getSelection();
      let text;
      if (selection.isEmpty()) {
        text = editor.getModel().getLineContent(selection.selectionStartLineNumber).trim();
      } else {
        const endOfLinePreference = isWindows ? 1 : 2;
        text = editor.getModel().getValueInRange(selection, endOfLinePreference);
      }
      instance.sendText(text, true, true);
      await c.service.revealActiveTerminal(true);
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.runActiveFile",
    title: localize2("workbench.action.terminal.runActiveFile", "Run Active File In Active Terminal"),
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (c, accessor) => {
      const codeEditorService = accessor.get(ICodeEditorService);
      const notificationService = accessor.get(INotificationService);
      const workbenchEnvironmentService = accessor.get(IWorkbenchEnvironmentService);
      const editor = codeEditorService.getActiveCodeEditor();
      if (!editor || !editor.hasModel()) {
        return;
      }
      const instance = await c.service.getActiveOrCreateInstance({ acceptsInput: true });
      const isRemote = instance ? instance.isRemote : workbenchEnvironmentService.remoteAuthority ? true : false;
      const uri = editor.getModel().uri;
      if (!isRemote && uri.scheme !== Schemas.file && uri.scheme !== Schemas.vscodeUserData || isRemote && uri.scheme !== Schemas.vscodeRemote) {
        notificationService.warn(localize("workbench.action.terminal.runActiveFile.noFile", "Only files on disk can be run in the terminal"));
        return;
      }
      await instance.sendPath(uri, true);
      return c.groupService.showPanel();
    }, "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollDown",
    title: localize2("workbench.action.terminal.scrollDown", "Scroll Down (Line)"),
    keybinding: {
      primary: 2048 | 512 | 12,
      linux: {
        primary: 2048 | 1024 | 18
        /* KeyCode.DownArrow */
      },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollDownLine(), "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollDownPage",
    title: localize2("workbench.action.terminal.scrollDownPage", "Scroll Down (Page)"),
    keybinding: {
      primary: 1024 | 12,
      mac: {
        primary: 12
        /* KeyCode.PageDown */
      },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollDownPage(), "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollToBottom",
    title: localize2("workbench.action.terminal.scrollToBottom", "Scroll to Bottom"),
    keybinding: {
      primary: 2048 | 13,
      linux: {
        primary: 1024 | 13
        /* KeyCode.End */
      },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollToBottom(), "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollUp",
    title: localize2("workbench.action.terminal.scrollUp", "Scroll Up (Line)"),
    keybinding: {
      primary: 2048 | 512 | 11,
      linux: {
        primary: 2048 | 1024 | 16
        /* KeyCode.UpArrow */
      },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollUpLine(), "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollUpPage",
    title: localize2("workbench.action.terminal.scrollUpPage", "Scroll Up (Page)"),
    f1: true,
    keybinding: {
      primary: 1024 | 11,
      mac: {
        primary: 11
        /* KeyCode.PageUp */
      },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollUpPage(), "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.scrollToTop",
    title: localize2("workbench.action.terminal.scrollToTop", "Scroll to Top"),
    keybinding: {
      primary: 2048 | 14,
      linux: {
        primary: 1024 | 14
        /* KeyCode.Home */
      },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollToTop(), "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.clearSelection",
    title: localize2("workbench.action.terminal.clearSelection", "Clear Selection"),
    keybinding: {
      primary: 9,
      when: ContextKeyExpr.and(TerminalContextKeys.focusInAny, TerminalContextKeys.textSelected, TerminalContextKeys.notFindVisible),
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => {
      if (xterm.hasSelection()) {
        xterm.clearSelection();
      }
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.changeIcon",
    title: terminalStrings.changeIcon,
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c, _, args) => getResourceOrActiveInstance(c, args)?.changeIcon(), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.changeIconActiveTab",
    title: terminalStrings.changeIcon,
    f1: false,
    precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
    run: /* @__PURE__ */ __name(async (c, accessor, args) => {
      let icon;
      if (c.groupService.lastAccessedMenu === "inline-tab") {
        getResourceOrActiveInstance(c, args)?.changeIcon();
        return;
      }
      for (const terminal of getSelectedInstances(accessor) ?? []) {
        icon = await terminal.changeIcon(icon);
      }
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.changeColor",
    title: terminalStrings.changeColor,
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c, _, args) => getResourceOrActiveInstance(c, args)?.changeColor(), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.changeColorActiveTab",
    title: terminalStrings.changeColor,
    f1: false,
    precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
    run: /* @__PURE__ */ __name(async (c, accessor, args) => {
      let color;
      let i = 0;
      if (c.groupService.lastAccessedMenu === "inline-tab") {
        getResourceOrActiveInstance(c, args)?.changeColor();
        return;
      }
      for (const terminal of getSelectedInstances(accessor) ?? []) {
        const skipQuickPick = i !== 0;
        color = await terminal.changeColor(color, skipQuickPick);
        i++;
      }
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.rename",
    title: terminalStrings.rename,
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c, accessor, args) => renameWithQuickPick(c, accessor, args), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.renameActiveTab",
    title: terminalStrings.rename,
    f1: false,
    keybinding: {
      primary: 60,
      mac: {
        primary: 3
        /* KeyCode.Enter */
      },
      when: ContextKeyExpr.and(TerminalContextKeys.tabsFocus),
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable_and_singularSelection,
    run: /* @__PURE__ */ __name(async (c, accessor) => {
      const terminalGroupService = accessor.get(ITerminalGroupService);
      const notificationService = accessor.get(INotificationService);
      const instances = getSelectedInstances(accessor);
      const firstInstance = instances?.[0];
      if (!firstInstance) {
        return;
      }
      if (terminalGroupService.lastAccessedMenu === "inline-tab") {
        return renameWithQuickPick(c, accessor, firstInstance);
      }
      c.service.setEditingTerminal(firstInstance);
      c.service.setEditable(firstInstance, {
        validationMessage: /* @__PURE__ */ __name((value) => validateTerminalName(value), "validationMessage"),
        onFinish: /* @__PURE__ */ __name(async (value, success) => {
          c.service.setEditable(firstInstance, null);
          c.service.setEditingTerminal(void 0);
          if (success) {
            const promises = [];
            for (const instance of instances) {
              promises.push((async () => {
                await instance.rename(value);
              })());
            }
            try {
              await Promise.all(promises);
            } catch (e) {
              notificationService.error(e);
            }
          }
        }, "onFinish")
      });
    }, "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.detachSession",
    title: localize2("workbench.action.terminal.detachSession", "Detach Session"),
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.detachProcessAndDispose(TerminalExitReason.User), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.attachToSession",
    title: localize2("workbench.action.terminal.attachToSession", "Attach to Session"),
    run: /* @__PURE__ */ __name(async (c, accessor) => {
      const quickInputService = accessor.get(IQuickInputService);
      const labelService = accessor.get(ILabelService);
      const remoteAgentService = accessor.get(IRemoteAgentService);
      const notificationService = accessor.get(INotificationService);
      const remoteAuthority = remoteAgentService.getConnection()?.remoteAuthority ?? void 0;
      const backend = await accessor.get(ITerminalInstanceService).getBackend(remoteAuthority);
      if (!backend) {
        throw new Error(`No backend registered for remote authority '${remoteAuthority}'`);
      }
      const terms = await backend.listProcesses();
      backend.reduceConnectionGraceTime();
      const unattachedTerms = terms.filter((term) => !c.service.isAttachedToTerminal(term));
      const items = unattachedTerms.map((term) => {
        const cwdLabel = labelService.getUriLabel(URI.file(term.cwd));
        return {
          label: term.title,
          detail: term.workspaceName ? `${term.workspaceName} \u2E31 ${cwdLabel}` : cwdLabel,
          description: term.pid ? String(term.pid) : "",
          term
        };
      });
      if (items.length === 0) {
        notificationService.info(localize("noUnattachedTerminals", "There are no unattached terminals to attach to"));
        return;
      }
      const selected = await quickInputService.pick(items, { canPickMany: false });
      if (selected) {
        const instance = await c.service.createTerminal({
          config: { attachPersistentProcess: selected.term }
        });
        c.service.setActiveInstance(instance);
        await focusActiveTerminal(instance, c);
      }
    }, "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.scrollToPreviousCommand",
    title: terminalStrings.scrollToPreviousCommand,
    keybinding: {
      primary: 2048 | 16,
      when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    icon: Codicon.arrowUp,
    menu: [
      {
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 4,
        when: ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
        isHiddenByDefault: true
      }
    ],
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.xterm?.markTracker.scrollToPreviousMark(void 0, void 0, activeInstance.capabilities.has(
      2
      /* TerminalCapability.CommandDetection */
    )), "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.scrollToNextCommand",
    title: terminalStrings.scrollToNextCommand,
    keybinding: {
      primary: 2048 | 18,
      when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    icon: Codicon.arrowDown,
    menu: [
      {
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 5,
        when: ContextKeyExpr.equals("view", TERMINAL_VIEW_ID),
        isHiddenByDefault: true
      }
    ],
    run: /* @__PURE__ */ __name((activeInstance) => {
      activeInstance.xterm?.markTracker.scrollToNextMark();
      activeInstance.focus();
    }, "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.selectToPreviousCommand",
    title: localize2("workbench.action.terminal.selectToPreviousCommand", "Select to Previous Command"),
    keybinding: {
      primary: 2048 | 1024 | 16,
      when: TerminalContextKeys.focus,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((activeInstance) => {
      activeInstance.xterm?.markTracker.selectToPreviousMark();
      activeInstance.focus();
    }, "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.selectToNextCommand",
    title: localize2("workbench.action.terminal.selectToNextCommand", "Select to Next Command"),
    keybinding: {
      primary: 2048 | 1024 | 18,
      when: TerminalContextKeys.focus,
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((activeInstance) => {
      activeInstance.xterm?.markTracker.selectToNextMark();
      activeInstance.focus();
    }, "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.selectToPreviousLine",
    title: localize2("workbench.action.terminal.selectToPreviousLine", "Select to Previous Line"),
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (xterm, _, instance) => {
      xterm.markTracker.selectToPreviousLine();
      (instance || xterm).focus();
    }, "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.selectToNextLine",
    title: localize2("workbench.action.terminal.selectToNextLine", "Select to Next Line"),
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (xterm, _, instance) => {
      xterm.markTracker.selectToNextLine();
      (instance || xterm).focus();
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.newWithCwd",
    title: terminalStrings.newWithCwd,
    metadata: {
      description: terminalStrings.newWithCwd.value,
      args: [{
        name: "args",
        schema: {
          type: "object",
          required: ["cwd"],
          properties: {
            cwd: {
              description: localize("workbench.action.terminal.newWithCwd.cwd", "The directory to start the terminal at"),
              type: "string"
            }
          }
        }
      }]
    },
    run: /* @__PURE__ */ __name(async (c, _, args) => {
      const cwd = isObject(args) && "cwd" in args ? toOptionalString(args.cwd) : void 0;
      const instance = await c.service.createTerminal({ cwd });
      if (!instance) {
        return;
      }
      c.service.setActiveInstance(instance);
      await focusActiveTerminal(instance, c);
    }, "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.renameWithArg",
    title: terminalStrings.renameWithArgs,
    metadata: {
      description: terminalStrings.renameWithArgs.value,
      args: [{
        name: "args",
        schema: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              description: localize("workbench.action.terminal.renameWithArg.name", "The new name for the terminal"),
              type: "string",
              minLength: 1
            }
          }
        }
      }]
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (activeInstance, c, accessor, args) => {
      const notificationService = accessor.get(INotificationService);
      const name = isObject(args) && "name" in args ? toOptionalString(args.name) : void 0;
      if (!name) {
        notificationService.warn(localize("workbench.action.terminal.renameWithArg.noName", "No name argument provided"));
        return;
      }
      activeInstance.rename(name);
    }, "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.relaunch",
    title: localize2("workbench.action.terminal.relaunch", "Relaunch Active Terminal"),
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.relaunch(), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.split",
    title: terminalStrings.split,
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
    keybinding: {
      primary: 2048 | 1024 | 26,
      weight: 200,
      mac: {
        primary: 2048 | 93,
        secondary: [
          256 | 1024 | 26
          /* KeyCode.Digit5 */
        ]
      },
      when: TerminalContextKeys.focus
    },
    icon: Codicon.splitHorizontal,
    run: /* @__PURE__ */ __name(async (c, accessor, args) => {
      const optionsOrProfile = isObject(args) ? args : void 0;
      const commandService = accessor.get(ICommandService);
      const workspaceContextService = accessor.get(IWorkspaceContextService);
      const options = convertOptionsOrProfileToOptions(optionsOrProfile);
      const activeInstance = (await c.service.getInstanceHost(options?.location)).activeInstance;
      if (!activeInstance) {
        return;
      }
      const cwd = await getCwdForSplit(activeInstance, workspaceContextService.getWorkspace().folders, commandService, c.configService);
      if (cwd === void 0) {
        return;
      }
      const instance = await c.service.createTerminal({ location: { parentTerminal: activeInstance }, config: options?.config, cwd });
      await focusActiveTerminal(instance, c);
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.splitActiveTab",
    title: terminalStrings.split,
    f1: false,
    keybinding: {
      primary: 2048 | 1024 | 26,
      mac: {
        primary: 2048 | 93,
        secondary: [
          256 | 1024 | 26
          /* KeyCode.Digit5 */
        ]
      },
      weight: 200,
      when: TerminalContextKeys.tabsFocus
    },
    run: /* @__PURE__ */ __name(async (c, accessor) => {
      const instances = getSelectedInstances(accessor);
      if (instances) {
        const promises = [];
        for (const t of instances) {
          promises.push((async () => {
            await c.service.createTerminal({ location: { parentTerminal: t } });
            await c.groupService.showPanel(true);
          })());
        }
        await Promise.all(promises);
      }
    }, "run")
  });
  registerContextualInstanceAction({
    id: "workbench.action.terminal.unsplit",
    title: terminalStrings.unsplit,
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (instance, c) => {
      const group = c.groupService.getGroupForInstance(instance);
      if (group && group?.terminalInstances.length > 1) {
        c.groupService.unsplitInstance(instance);
      }
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.joinActiveTab",
    title: localize2("workbench.action.terminal.joinInstance", "Join Terminals"),
    precondition: ContextKeyExpr.and(sharedWhenClause.terminalAvailable, TerminalContextKeys.tabsSingularSelection.toNegated()),
    run: /* @__PURE__ */ __name(async (c, accessor) => {
      const instances = getSelectedInstances(accessor);
      if (instances && instances.length > 1) {
        c.groupService.joinInstances(instances);
      }
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.join",
    title: localize2("workbench.action.terminal.join", "Join Terminals..."),
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (c, accessor) => {
      const themeService = accessor.get(IThemeService);
      const notificationService = accessor.get(INotificationService);
      const quickInputService = accessor.get(IQuickInputService);
      const picks = [];
      if (c.groupService.instances.length <= 1) {
        notificationService.warn(localize("workbench.action.terminal.join.insufficientTerminals", "Insufficient terminals for the join action"));
        return;
      }
      const otherInstances = c.groupService.instances.filter((i) => i.instanceId !== c.groupService.activeInstance?.instanceId);
      for (const terminal of otherInstances) {
        const group = c.groupService.getGroupForInstance(terminal);
        if (group?.terminalInstances.length === 1) {
          const iconId = getIconId(accessor, terminal);
          const label = `$(${iconId}): ${terminal.title}`;
          const iconClasses = [];
          const colorClass = getColorClass(terminal);
          if (colorClass) {
            iconClasses.push(colorClass);
          }
          const uriClasses = getUriClasses(terminal, themeService.getColorTheme().type);
          if (uriClasses) {
            iconClasses.push(...uriClasses);
          }
          picks.push({
            terminal,
            label,
            iconClasses
          });
        }
      }
      if (picks.length === 0) {
        notificationService.warn(localize("workbench.action.terminal.join.onlySplits", "All terminals are joined already"));
        return;
      }
      const result = await quickInputService.pick(picks, {});
      if (result) {
        c.groupService.joinInstances([result.terminal, c.groupService.activeInstance]);
      }
    }, "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.splitInActiveWorkspace",
    title: localize2("workbench.action.terminal.splitInActiveWorkspace", "Split Terminal (In Active Workspace)"),
    run: /* @__PURE__ */ __name(async (instance, c) => {
      const newInstance = await c.service.createTerminal({ location: { parentTerminal: instance } });
      if (newInstance?.target !== TerminalLocation.Editor) {
        await c.groupService.showPanel(true);
      }
    }, "run")
  });
  registerActiveXtermAction({
    id: "workbench.action.terminal.selectAll",
    title: localize2("workbench.action.terminal.selectAll", "Select All"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: [{
      // Don't use ctrl+a by default as that would override the common go to start
      // of prompt shell binding
      primary: 0,
      // Technically this doesn't need to be here as it will fall back to this
      // behavior anyway when handed to xterm.js, having this handled by VS Code
      // makes it easier for users to see how it works though.
      mac: {
        primary: 2048 | 31
        /* KeyCode.KeyA */
      },
      weight: 200,
      when: TerminalContextKeys.focusInAny
    }],
    run: /* @__PURE__ */ __name((xterm) => xterm.selectAll(), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.new",
    title: localize2("workbench.action.terminal.new", "Create New Terminal"),
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
    icon: newTerminalIcon,
    keybinding: {
      primary: 2048 | 1024 | 91,
      mac: {
        primary: 256 | 1024 | 91
        /* KeyCode.Backquote */
      },
      weight: 200
      /* KeybindingWeight.WorkbenchContrib */
    },
    run: /* @__PURE__ */ __name(async (c, accessor, args) => {
      let eventOrOptions = isObject(args) ? args : void 0;
      const workspaceContextService = accessor.get(IWorkspaceContextService);
      const commandService = accessor.get(ICommandService);
      const folders = workspaceContextService.getWorkspace().folders;
      if (eventOrOptions && isMouseEvent(eventOrOptions) && (eventOrOptions.altKey || eventOrOptions.ctrlKey)) {
        await c.service.createTerminal({ location: { splitActiveTerminal: true } });
        return;
      }
      if (c.service.isProcessSupportRegistered) {
        eventOrOptions = !eventOrOptions || isMouseEvent(eventOrOptions) ? {} : eventOrOptions;
        let instance;
        if (folders.length <= 1) {
          instance = await c.service.createTerminal(eventOrOptions);
        } else {
          const cwd = (await pickTerminalCwd(accessor))?.cwd;
          if (!cwd) {
            return;
          }
          eventOrOptions.cwd = cwd;
          instance = await c.service.createTerminal(eventOrOptions);
        }
        c.service.setActiveInstance(instance);
        await focusActiveTerminal(instance, c);
      } else {
        if (c.profileService.contributedProfiles.length > 0) {
          commandService.executeCommand(
            "workbench.action.terminal.newWithProfile"
            /* TerminalCommandId.NewWithProfile */
          );
        } else {
          commandService.executeCommand(
            "workbench.action.terminal.toggleTerminal"
            /* TerminalCommandId.Toggle */
          );
        }
      }
    }, "run")
  });
  async function killInstance(c, instance) {
    if (!instance) {
      return;
    }
    await c.service.safeDisposeTerminal(instance);
    if (c.groupService.instances.length > 0) {
      await c.groupService.showPanel(true);
    }
  }
  __name(killInstance, "killInstance");
  registerTerminalAction({
    id: "workbench.action.terminal.kill",
    title: localize2("workbench.action.terminal.kill", "Kill the Active Terminal Instance"),
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    icon: killTerminalIcon,
    run: /* @__PURE__ */ __name(async (c) => killInstance(c, c.groupService.activeInstance), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.killViewOrEditor",
    title: terminalStrings.kill,
    f1: false,
    // This is an internal command used for context menus
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    run: /* @__PURE__ */ __name(async (c) => killInstance(c, c.service.activeInstance), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.killAll",
    title: localize2("workbench.action.terminal.killAll", "Kill All Terminals"),
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    icon: Codicon.trash,
    run: /* @__PURE__ */ __name(async (c) => {
      const disposePromises = [];
      for (const instance of c.service.instances) {
        disposePromises.push(c.service.safeDisposeTerminal(instance));
      }
      await Promise.all(disposePromises);
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.killEditor",
    title: localize2("workbench.action.terminal.killEditor", "Kill the Active Terminal in Editor Area"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: 2048 | 53,
      win: { primary: 2048 | 62, secondary: [
        2048 | 53
        /* KeyCode.KeyW */
      ] },
      weight: 200,
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus)
    },
    run: /* @__PURE__ */ __name((c, accessor) => accessor.get(ICommandService).executeCommand(CLOSE_EDITOR_COMMAND_ID), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.killActiveTab",
    title: terminalStrings.kill,
    f1: false,
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    keybinding: {
      primary: 20,
      mac: {
        primary: 2048 | 1,
        secondary: [
          20
          /* KeyCode.Delete */
        ]
      },
      weight: 200,
      when: TerminalContextKeys.tabsFocus
    },
    run: /* @__PURE__ */ __name(async (c, accessor) => {
      const disposePromises = [];
      for (const terminal of getSelectedInstances(accessor, true) ?? []) {
        disposePromises.push(c.service.safeDisposeTerminal(terminal));
      }
      await Promise.all(disposePromises);
      c.groupService.focusTabs();
    }, "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.focusHover",
    title: terminalStrings.focusHover,
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    keybinding: {
      primary: KeyChord(
        2048 | 41,
        2048 | 39
        /* KeyCode.KeyI */
      ),
      weight: 200,
      when: ContextKeyExpr.or(TerminalContextKeys.tabsFocus, TerminalContextKeys.focus)
    },
    run: /* @__PURE__ */ __name((c) => c.groupService.focusHover(), "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.clear",
    title: localize2("workbench.action.terminal.clear", "Clear"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: [{
      primary: 0,
      mac: {
        primary: 2048 | 41
        /* KeyCode.KeyK */
      },
      // Weight is higher than work workbench contributions so the keybinding remains
      // highest priority when chords are registered afterwards
      weight: 200 + 1,
      // Disable the keybinding when accessibility mode is enabled as chords include
      // important screen reader keybindings such as cmd+k, cmd+i to show the hover
      when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()), ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibleViewIsShown, accessibleViewCurrentProviderId.isEqualTo(
        "terminal"
        /* AccessibleViewProviderId.Terminal */
      )))
    }],
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.clearBuffer(), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.selectDefaultShell",
    title: localize2("workbench.action.terminal.selectDefaultShell", "Select Default Profile"),
    run: /* @__PURE__ */ __name((c) => c.service.showProfileQuickPick("setDefault"), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.openSettings",
    title: localize2("workbench.action.terminal.openSettings", "Configure Terminal Settings"),
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c, accessor) => accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@feature:terminal" }), "run")
  });
  registerActiveInstanceAction({
    id: "workbench.action.terminal.setDimensions",
    title: localize2("workbench.action.terminal.setFixedDimensions", "Set Fixed Dimensions"),
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.setFixedDimensions(), "run")
  });
  registerContextualInstanceAction({
    id: "workbench.action.terminal.sizeToContentWidth",
    title: terminalStrings.toggleSizeToContentWidth,
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    keybinding: {
      primary: 512 | 56,
      weight: 200,
      when: TerminalContextKeys.focus
    },
    run: /* @__PURE__ */ __name((instance) => instance.toggleSizeToContentWidth(), "run")
  });
  registerTerminalAction({
    id: "workbench.action.terminal.switchTerminal",
    title: localize2("workbench.action.terminal.switchTerminal", "Switch Terminal"),
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (c, accessor, args) => {
      const item = toOptionalString(args);
      if (!item) {
        return;
      }
      if (item === switchTerminalActionViewItemSeparator) {
        c.service.refreshActiveGroup();
        return;
      }
      if (item === switchTerminalShowTabsTitle) {
        accessor.get(IConfigurationService).updateValue("terminal.integrated.tabs.enabled", true);
        return;
      }
      const terminalIndexRe = /^([0-9]+): /;
      const indexMatches = terminalIndexRe.exec(item);
      if (indexMatches) {
        c.groupService.setActiveGroupByIndex(Number(indexMatches[1]) - 1);
        return c.groupService.showPanel(true);
      }
      const quickSelectProfiles = c.profileService.availableProfiles;
      const profileSelection = item.substring(4);
      if (quickSelectProfiles) {
        const profile = quickSelectProfiles.find((profile2) => profile2.profileName === profileSelection);
        if (profile) {
          const instance = await c.service.createTerminal({
            config: profile
          });
          c.service.setActiveInstance(instance);
        } else {
          console.warn(`No profile with name "${profileSelection}"`);
        }
      } else {
        console.warn(`Unmatched terminal item: "${item}"`);
      }
    }, "run")
  });
}
__name(registerTerminalActions, "registerTerminalActions");
function getSelectedInstances2(accessor, args) {
  const terminalService = accessor.get(ITerminalService);
  const result = [];
  const context = parseActionArgs(args);
  if (context && context.length > 0) {
    for (const instanceContext of context) {
      const instance = terminalService.getInstanceFromId(instanceContext.instanceId);
      if (instance) {
        result.push(instance);
      }
    }
    if (result.length > 0) {
      return result;
    }
  }
  return void 0;
}
__name(getSelectedInstances2, "getSelectedInstances2");
function getSelectedInstances(accessor, args, args2) {
  const listService = accessor.get(IListService);
  const terminalService = accessor.get(ITerminalService);
  const terminalGroupService = accessor.get(ITerminalGroupService);
  const result = [];
  const list = listService.lastFocusedList instanceof TerminalTabList ? listService.lastFocusedList : void 0;
  const selections = list?.getSelection();
  if (terminalGroupService.lastAccessedMenu === "inline-tab" && !selections?.length) {
    const instance = terminalGroupService.activeInstance;
    return instance ? [terminalGroupService.activeInstance] : void 0;
  }
  if (!list || !selections) {
    return void 0;
  }
  const focused = list.getFocus();
  if (focused.length === 1 && !selections.includes(focused[0])) {
    result.push(terminalService.getInstanceFromIndex(focused[0]));
    return result;
  }
  for (const selection of selections) {
    result.push(terminalService.getInstanceFromIndex(selection));
  }
  return result.filter((r) => !!r);
}
__name(getSelectedInstances, "getSelectedInstances");
function validateTerminalName(name) {
  if (!name || name.trim().length === 0) {
    return {
      content: localize("emptyTerminalNameInfo", "Providing no name will reset it to the default value"),
      severity: Severity.Info
    };
  }
  return null;
}
__name(validateTerminalName, "validateTerminalName");
function convertOptionsOrProfileToOptions(optionsOrProfile) {
  if (isObject(optionsOrProfile) && "profileName" in optionsOrProfile) {
    return { config: optionsOrProfile, location: optionsOrProfile.location };
  }
  return optionsOrProfile;
}
__name(convertOptionsOrProfileToOptions, "convertOptionsOrProfileToOptions");
let newWithProfileAction;
function refreshTerminalActions(detectedProfiles) {
  const profileEnum = createProfileSchemaEnums(detectedProfiles);
  newWithProfileAction?.dispose();
  newWithProfileAction = registerAction2(class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.terminal.newWithProfile",
        title: localize2("workbench.action.terminal.newWithProfile", "Create New Terminal (With Profile)"),
        f1: true,
        precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
        metadata: {
          description: "workbench.action.terminal.newWithProfile",
          args: [{
            name: "args",
            schema: {
              type: "object",
              required: ["profileName"],
              properties: {
                profileName: {
                  description: localize("workbench.action.terminal.newWithProfile.profileName", "The name of the profile to create"),
                  type: "string",
                  enum: profileEnum.values,
                  markdownEnumDescriptions: profileEnum.markdownDescriptions
                },
                location: {
                  description: localize("newWithProfile.location", "Where to create the terminal"),
                  type: "string",
                  enum: ["view", "editor"],
                  enumDescriptions: [
                    localize("newWithProfile.location.view", "Create the terminal in the terminal view"),
                    localize("newWithProfile.location.editor", "Create the terminal in the editor")
                  ]
                }
              }
            }
          }]
        }
      });
    }
    async run(accessor, eventOrOptionsOrProfile, profile) {
      const c = getTerminalServices(accessor);
      const workspaceContextService = accessor.get(IWorkspaceContextService);
      const commandService = accessor.get(ICommandService);
      let event;
      let options;
      let instance;
      let cwd;
      if (isObject(eventOrOptionsOrProfile) && eventOrOptionsOrProfile && "profileName" in eventOrOptionsOrProfile) {
        const config = c.profileService.availableProfiles.find((profile2) => profile2.profileName === eventOrOptionsOrProfile.profileName);
        if (!config) {
          throw new Error(`Could not find terminal profile "${eventOrOptionsOrProfile.profileName}"`);
        }
        options = { config };
        if ("location" in eventOrOptionsOrProfile) {
          switch (eventOrOptionsOrProfile.location) {
            case "editor":
              options.location = TerminalLocation.Editor;
              break;
            case "view":
              options.location = TerminalLocation.Panel;
              break;
          }
        }
      } else if (isMouseEvent(eventOrOptionsOrProfile) || isPointerEvent(eventOrOptionsOrProfile) || isKeyboardEvent(eventOrOptionsOrProfile)) {
        event = eventOrOptionsOrProfile;
        options = profile ? { config: profile } : void 0;
      } else {
        options = convertOptionsOrProfileToOptions(eventOrOptionsOrProfile);
      }
      if (event && (event.altKey || event.ctrlKey)) {
        const parentTerminal = c.service.activeInstance;
        if (parentTerminal) {
          await c.service.createTerminal({ location: { parentTerminal }, config: options?.config });
          return;
        }
      }
      const folders = workspaceContextService.getWorkspace().folders;
      if (folders.length > 1) {
        const options2 = {
          placeHolder: localize("workbench.action.terminal.newWorkspacePlaceholder", "Select current working directory for new terminal")
        };
        const workspace = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, [options2]);
        if (!workspace) {
          return;
        }
        cwd = workspace.uri;
      }
      if (options) {
        options.cwd = cwd;
        instance = await c.service.createTerminal(options);
      } else {
        instance = await c.service.showProfileQuickPick("createInstance", cwd);
      }
      if (instance) {
        c.service.setActiveInstance(instance);
        await focusActiveTerminal(instance, c);
      }
    }
  });
  return newWithProfileAction;
}
__name(refreshTerminalActions, "refreshTerminalActions");
function getResourceOrActiveInstance(c, resource) {
  return c.service.getInstanceFromResource(toOptionalUri(resource)) || c.service.activeInstance;
}
__name(getResourceOrActiveInstance, "getResourceOrActiveInstance");
async function pickTerminalCwd(accessor, cancel) {
  const quickInputService = accessor.get(IQuickInputService);
  const labelService = accessor.get(ILabelService);
  const contextService = accessor.get(IWorkspaceContextService);
  const modelService = accessor.get(IModelService);
  const languageService = accessor.get(ILanguageService);
  const configurationService = accessor.get(IConfigurationService);
  const configurationResolverService = accessor.get(IConfigurationResolverService);
  const folders = contextService.getWorkspace().folders;
  if (!folders.length) {
    return;
  }
  const folderCwdPairs = await Promise.all(folders.map((e) => resolveWorkspaceFolderCwd(e, configurationService, configurationResolverService)));
  const shrinkedPairs = shrinkWorkspaceFolderCwdPairs(folderCwdPairs);
  if (shrinkedPairs.length === 1) {
    return shrinkedPairs[0];
  }
  const folderPicks = shrinkedPairs.map((pair) => {
    const label = pair.folder.name;
    const description = pair.isOverridden ? localize("workbench.action.terminal.overriddenCwdDescription", "(Overriden) {0}", labelService.getUriLabel(pair.cwd, { relative: !pair.isAbsolute })) : labelService.getUriLabel(dirname(pair.cwd), { relative: true });
    return {
      label,
      description: description !== label ? description : void 0,
      pair,
      iconClasses: getIconClasses(modelService, languageService, pair.cwd, FileKind.ROOT_FOLDER)
    };
  });
  const options = {
    placeHolder: localize("workbench.action.terminal.newWorkspacePlaceholder", "Select current working directory for new terminal"),
    matchOnDescription: true,
    canPickMany: false
  };
  const token = cancel || CancellationToken.None;
  const pick = await quickInputService.pick(folderPicks, options, token);
  return pick?.pair;
}
__name(pickTerminalCwd, "pickTerminalCwd");
async function resolveWorkspaceFolderCwd(folder, configurationService, configurationResolverService) {
  const cwdConfig = configurationService.getValue("terminal.integrated.cwd", { resource: folder.uri });
  if (!isString(cwdConfig) || cwdConfig.length === 0) {
    return { folder, cwd: folder.uri, isAbsolute: false, isOverridden: false };
  }
  const resolvedCwdConfig = await configurationResolverService.resolveAsync(folder, cwdConfig);
  return isAbsolute(resolvedCwdConfig) || resolvedCwdConfig.startsWith(ConfigurationResolverExpression.VARIABLE_LHS) ? { folder, isAbsolute: true, isOverridden: true, cwd: URI.from({ ...folder.uri, path: resolvedCwdConfig }) } : { folder, isAbsolute: false, isOverridden: true, cwd: URI.joinPath(folder.uri, resolvedCwdConfig) };
}
__name(resolveWorkspaceFolderCwd, "resolveWorkspaceFolderCwd");
function shrinkWorkspaceFolderCwdPairs(pairs) {
  const map = /* @__PURE__ */ new Map();
  for (const pair of pairs) {
    const key = pair.cwd.toString();
    const value = map.get(key);
    if (!value || key === pair.folder.uri.toString()) {
      map.set(key, pair);
    }
  }
  const selectedPairs = new Set(map.values());
  const selectedPairsInOrder = pairs.filter((x) => selectedPairs.has(x));
  return selectedPairsInOrder;
}
__name(shrinkWorkspaceFolderCwdPairs, "shrinkWorkspaceFolderCwdPairs");
async function focusActiveTerminal(instance, c) {
  if (instance.target === TerminalLocation.Editor) {
    await c.editorService.revealActiveEditor();
    await instance.focusWhenReady(true);
  } else {
    await c.groupService.showPanel(true);
  }
}
__name(focusActiveTerminal, "focusActiveTerminal");
async function renameWithQuickPick(c, accessor, resource) {
  let instance = resource;
  if (!instance || !instance?.rename) {
    instance = getResourceOrActiveInstance(c, resource);
  }
  if (instance) {
    const title = await accessor.get(IQuickInputService).input({
      value: instance.title,
      prompt: localize("workbench.action.terminal.rename.prompt", "Enter terminal name")
    });
    if (title) {
      instance.rename(title);
    }
  }
}
__name(renameWithQuickPick, "renameWithQuickPick");
function toOptionalUri(obj) {
  return URI.isUri(obj) ? obj : void 0;
}
__name(toOptionalUri, "toOptionalUri");
function toOptionalString(obj) {
  return isString(obj) ? obj : void 0;
}
__name(toOptionalString, "toOptionalString");
export {
  TerminalLaunchHelpAction,
  getCwdForSplit,
  refreshTerminalActions,
  registerActiveInstanceAction,
  registerActiveXtermAction,
  registerContextualInstanceAction,
  registerTerminalAction,
  registerTerminalActions,
  shrinkWorkspaceFolderCwdPairs,
  switchTerminalActionViewItemSeparator,
  switchTerminalShowTabsTitle,
  validateTerminalName
};
//# sourceMappingURL=terminalActions.js.map
