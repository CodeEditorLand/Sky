var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Action } from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { Schemas } from "../../../../base/common/network.js";
import { isWindows } from "../../../../base/common/platform.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { isObject, isString } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { EndOfLinePreference } from "../../../../editor/common/model.js";
import { localize, localize2 } from "../../../../nls.js";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "../../../../platform/accessibility/common/accessibility.js";
import { Action2, registerAction2, IAction2Options, MenuId } from "../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IListService } from "../../../../platform/list/browser/listService.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IPickOptions, IQuickInputService, IQuickPickItem } from "../../../../platform/quickinput/common/quickInput.js";
import { ITerminalProfile, TerminalExitReason, TerminalIcon, TerminalLocation, TerminalSettingId } from "../../../../platform/terminal/common/terminal.js";
import { IWorkspaceContextService, IWorkspaceFolder } from "../../../../platform/workspace/common/workspace.js";
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from "../../../browser/actions/workspaceCommands.js";
import { CLOSE_EDITOR_COMMAND_ID } from "../../../browser/parts/editor/editorCommands.js";
import { Direction, ICreateTerminalOptions, IDetachedTerminalInstance, ITerminalConfigurationService, ITerminalEditorService, ITerminalGroupService, ITerminalInstance, ITerminalInstanceService, ITerminalService, IXtermTerminal } from "./terminal.js";
import { IRemoteTerminalAttachTarget, ITerminalProfileResolverService, ITerminalProfileService, TERMINAL_VIEW_ID, TerminalCommandId } from "../common/terminal.js";
import { TerminalContextKeys } from "../common/terminalContextKey.js";
import { createProfileSchemaEnums } from "../../../../platform/terminal/common/terminalProfiles.js";
import { terminalStrings } from "../common/terminalStrings.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IHistoryService } from "../../../services/history/common/history.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { isAbsolute } from "../../../../base/common/path.js";
import { ITerminalQuickPickItem } from "./terminalProfileQuickpick.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { getIconId, getColorClass, getUriClasses } from "./terminalIcon.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { dirname } from "../../../../base/common/resources.js";
import { getIconClasses } from "../../../../editor/common/services/getIconClasses.js";
import { FileKind } from "../../../../platform/files/common/files.js";
import { TerminalCapability } from "../../../../platform/terminal/common/capabilities/capabilities.js";
import { killTerminalIcon, newTerminalIcon } from "./terminalIcons.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { Iterable } from "../../../../base/common/iterator.js";
import { accessibleViewCurrentProviderId, accessibleViewIsShown, accessibleViewOnLastLine } from "../../accessibility/browser/accessibilityConfiguration.js";
import { isKeyboardEvent, isMouseEvent, isPointerEvent } from "../../../../base/browser/dom.js";
import { editorGroupToColumn } from "../../../services/editor/common/editorGroupColumn.js";
import { InstanceContext } from "./terminalContextMenu.js";
import { AccessibleViewProviderId } from "../../../../platform/accessibility/browser/accessibleView.js";
import { TerminalTabList } from "./terminalTabsList.js";
import { ConfigurationResolverExpression } from "../../../services/configurationResolver/common/configurationResolverExpression.js";
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
const terminalSendSequenceCommand = /* @__PURE__ */ __name(async (accessor, args) => {
  const instance = accessor.get(ITerminalService).activeInstance;
  if (instance) {
    const text = isObject(args) && "text" in args ? toOptionalString(args.text) : void 0;
    if (!text) {
      return;
    }
    const configurationResolverService = accessor.get(IConfigurationResolverService);
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const historyService = accessor.get(IHistoryService);
    const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(instance.isRemote ? Schemas.vscodeRemote : Schemas.file);
    const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? void 0 : void 0;
    const resolvedText = await configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, text);
    instance.sendText(resolvedText, false);
  }
}, "terminalSendSequenceCommand");
let TerminalLaunchHelpAction = class extends Action {
  constructor(_openerService) {
    super("workbench.action.terminal.launchHelp", localize("terminalLaunchHelp", "Open Help"));
    this._openerService = _openerService;
  }
  static {
    __name(this, "TerminalLaunchHelpAction");
  }
  async run() {
    this._openerService.open("https://aka.ms/vscode-troubleshoot-terminal-launch");
  }
};
TerminalLaunchHelpAction = __decorateClass([
  __decorateParam(0, IOpenerService)
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
    id: TerminalCommandId.NewInActiveWorkspace,
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
    id: TerminalCommandId.CreateTerminalEditor,
    title: localize2("workbench.action.terminal.createTerminalEditor", "Create New Terminal in Editor Area"),
    run: /* @__PURE__ */ __name(async (c, _, args) => {
      const options = isObject(args) && "location" in args ? args : { location: TerminalLocation.Editor };
      const instance = await c.service.createTerminal(options);
      await instance.focusWhenReady();
    }, "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.CreateTerminalEditorSameGroup,
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
    id: TerminalCommandId.CreateTerminalEditorSide,
    title: localize2("workbench.action.terminal.createTerminalEditorSide", "Create New Terminal in Editor Area to the Side"),
    run: /* @__PURE__ */ __name(async (c) => {
      const instance = await c.service.createTerminal({
        location: { viewColumn: SIDE_GROUP }
      });
      await instance.focusWhenReady();
    }, "run")
  });
  registerContextualInstanceAction({
    id: TerminalCommandId.MoveToEditor,
    title: terminalStrings.moveToEditor,
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    activeInstanceType: "view",
    run: /* @__PURE__ */ __name((instance, c) => c.service.moveToEditor(instance), "run"),
    runAfter: /* @__PURE__ */ __name((instances) => instances.at(-1)?.focus(), "runAfter")
  });
  registerContextualInstanceAction({
    id: TerminalCommandId.MoveIntoNewWindow,
    title: terminalStrings.moveIntoNewWindow,
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    run: /* @__PURE__ */ __name((instance, c) => c.service.moveIntoNewEditor(instance), "run"),
    runAfter: /* @__PURE__ */ __name((instances) => instances.at(-1)?.focus(), "runAfter")
  });
  registerTerminalAction({
    id: TerminalCommandId.MoveToTerminalPanel,
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
    id: TerminalCommandId.FocusPreviousPane,
    title: localize2("workbench.action.terminal.focusPreviousPane", "Focus Previous Terminal in Terminal Group"),
    keybinding: {
      primary: KeyMod.Alt | KeyCode.LeftArrow,
      secondary: [KeyMod.Alt | KeyCode.UpArrow],
      mac: {
        primary: KeyMod.Alt | KeyMod.CtrlCmd | KeyCode.LeftArrow,
        secondary: [KeyMod.Alt | KeyMod.CtrlCmd | KeyCode.UpArrow]
      },
      when: TerminalContextKeys.focus,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (c) => {
      c.groupService.activeGroup?.focusPreviousPane();
      await c.groupService.showPanel(true);
    }, "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.FocusNextPane,
    title: localize2("workbench.action.terminal.focusNextPane", "Focus Next Terminal in Terminal Group"),
    keybinding: {
      primary: KeyMod.Alt | KeyCode.RightArrow,
      secondary: [KeyMod.Alt | KeyCode.DownArrow],
      mac: {
        primary: KeyMod.Alt | KeyMod.CtrlCmd | KeyCode.RightArrow,
        secondary: [KeyMod.Alt | KeyMod.CtrlCmd | KeyCode.DownArrow]
      },
      when: TerminalContextKeys.focus,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (c) => {
      c.groupService.activeGroup?.focusNextPane();
      await c.groupService.showPanel(true);
    }, "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.ResizePaneLeft,
    title: localize2("workbench.action.terminal.resizePaneLeft", "Resize Terminal Left"),
    keybinding: {
      linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.LeftArrow },
      mac: { primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyCode.LeftArrow },
      when: TerminalContextKeys.focus,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.activeGroup?.resizePane(Direction.Left), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.ResizePaneRight,
    title: localize2("workbench.action.terminal.resizePaneRight", "Resize Terminal Right"),
    keybinding: {
      linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.RightArrow },
      mac: { primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyCode.RightArrow },
      when: TerminalContextKeys.focus,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.activeGroup?.resizePane(Direction.Right), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.ResizePaneUp,
    title: localize2("workbench.action.terminal.resizePaneUp", "Resize Terminal Up"),
    keybinding: {
      mac: { primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyCode.UpArrow },
      when: TerminalContextKeys.focus,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.activeGroup?.resizePane(Direction.Up), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.ResizePaneDown,
    title: localize2("workbench.action.terminal.resizePaneDown", "Resize Terminal Down"),
    keybinding: {
      mac: { primary: KeyMod.CtrlCmd | KeyMod.WinCtrl | KeyCode.DownArrow },
      when: TerminalContextKeys.focus,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.activeGroup?.resizePane(Direction.Down), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.Focus,
    title: terminalStrings.focus,
    keybinding: {
      when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibleViewOnLastLine, accessibleViewCurrentProviderId.isEqualTo(AccessibleViewProviderId.Terminal)),
      primary: KeyMod.CtrlCmd | KeyCode.DownArrow,
      weight: KeybindingWeight.WorkbenchContrib
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
    id: TerminalCommandId.FocusTabs,
    title: localize2("workbench.action.terminal.focus.tabsView", "Focus Terminal Tabs View"),
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Backslash,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.or(TerminalContextKeys.tabsFocus, TerminalContextKeys.focus)
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c) => c.groupService.focusTabs(), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.FocusNext,
    title: localize2("workbench.action.terminal.focusNext", "Focus Next Terminal Group"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyCode.PageDown,
      mac: {
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.BracketRight
      },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
      weight: KeybindingWeight.WorkbenchContrib
    },
    run: /* @__PURE__ */ __name(async (c) => {
      c.groupService.setActiveGroupToNext();
      await c.groupService.showPanel(true);
    }, "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.FocusPrevious,
    title: localize2("workbench.action.terminal.focusPrevious", "Focus Previous Terminal Group"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyCode.PageUp,
      mac: {
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.BracketLeft
      },
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus.negate()),
      weight: KeybindingWeight.WorkbenchContrib
    },
    run: /* @__PURE__ */ __name(async (c) => {
      c.groupService.setActiveGroupToPrevious();
      await c.groupService.showPanel(true);
    }, "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.RunSelectedText,
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
        const endOfLinePreference = isWindows ? EndOfLinePreference.LF : EndOfLinePreference.CRLF;
        text = editor.getModel().getValueInRange(selection, endOfLinePreference);
      }
      instance.sendText(text, true, true);
      await c.service.revealActiveTerminal(true);
    }, "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.RunActiveFile,
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
    id: TerminalCommandId.ScrollDownLine,
    title: localize2("workbench.action.terminal.scrollDown", "Scroll Down (Line)"),
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.PageDown,
      linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.DownArrow },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollDownLine(), "run")
  });
  registerActiveXtermAction({
    id: TerminalCommandId.ScrollDownPage,
    title: localize2("workbench.action.terminal.scrollDownPage", "Scroll Down (Page)"),
    keybinding: {
      primary: KeyMod.Shift | KeyCode.PageDown,
      mac: { primary: KeyCode.PageDown },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollDownPage(), "run")
  });
  registerActiveXtermAction({
    id: TerminalCommandId.ScrollToBottom,
    title: localize2("workbench.action.terminal.scrollToBottom", "Scroll to Bottom"),
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyCode.End,
      linux: { primary: KeyMod.Shift | KeyCode.End },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollToBottom(), "run")
  });
  registerActiveXtermAction({
    id: TerminalCommandId.ScrollUpLine,
    title: localize2("workbench.action.terminal.scrollUp", "Scroll Up (Line)"),
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.PageUp,
      linux: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.UpArrow },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollUpLine(), "run")
  });
  registerActiveXtermAction({
    id: TerminalCommandId.ScrollUpPage,
    title: localize2("workbench.action.terminal.scrollUpPage", "Scroll Up (Page)"),
    f1: true,
    keybinding: {
      primary: KeyMod.Shift | KeyCode.PageUp,
      mac: { primary: KeyCode.PageUp },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollUpPage(), "run")
  });
  registerActiveXtermAction({
    id: TerminalCommandId.ScrollToTop,
    title: localize2("workbench.action.terminal.scrollToTop", "Scroll to Top"),
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyCode.Home,
      linux: { primary: KeyMod.Shift | KeyCode.Home },
      when: sharedWhenClause.focusInAny_and_normalBuffer,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => xterm.scrollToTop(), "run")
  });
  registerActiveXtermAction({
    id: TerminalCommandId.ClearSelection,
    title: localize2("workbench.action.terminal.clearSelection", "Clear Selection"),
    keybinding: {
      primary: KeyCode.Escape,
      when: ContextKeyExpr.and(TerminalContextKeys.focusInAny, TerminalContextKeys.textSelected, TerminalContextKeys.notFindVisible),
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((xterm) => {
      if (xterm.hasSelection()) {
        xterm.clearSelection();
      }
    }, "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.ChangeIcon,
    title: terminalStrings.changeIcon,
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c, _, args) => getResourceOrActiveInstance(c, args)?.changeIcon(), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.ChangeIconActiveTab,
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
    id: TerminalCommandId.ChangeColor,
    title: terminalStrings.changeColor,
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c, _, args) => getResourceOrActiveInstance(c, args)?.changeColor(), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.ChangeColorActiveTab,
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
    id: TerminalCommandId.Rename,
    title: terminalStrings.rename,
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c, accessor, args) => renameWithQuickPick(c, accessor, args), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.RenameActiveTab,
    title: terminalStrings.rename,
    f1: false,
    keybinding: {
      primary: KeyCode.F2,
      mac: {
        primary: KeyCode.Enter
      },
      when: ContextKeyExpr.and(TerminalContextKeys.tabsFocus),
      weight: KeybindingWeight.WorkbenchContrib
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
    id: TerminalCommandId.DetachSession,
    title: localize2("workbench.action.terminal.detachSession", "Detach Session"),
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.detachProcessAndDispose(TerminalExitReason.User), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.AttachToSession,
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
    id: TerminalCommandId.ScrollToPreviousCommand,
    title: terminalStrings.scrollToPreviousCommand,
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyCode.UpArrow,
      when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      weight: KeybindingWeight.WorkbenchContrib
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
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.xterm?.markTracker.scrollToPreviousMark(void 0, void 0, activeInstance.capabilities.has(TerminalCapability.CommandDetection)), "run")
  });
  registerActiveInstanceAction({
    id: TerminalCommandId.ScrollToNextCommand,
    title: terminalStrings.scrollToNextCommand,
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyCode.DownArrow,
      when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    icon: Codicon.arrowDown,
    menu: [
      {
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 4,
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
    id: TerminalCommandId.SelectToPreviousCommand,
    title: localize2("workbench.action.terminal.selectToPreviousCommand", "Select to Previous Command"),
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.UpArrow,
      when: TerminalContextKeys.focus,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((activeInstance) => {
      activeInstance.xterm?.markTracker.selectToPreviousMark();
      activeInstance.focus();
    }, "run")
  });
  registerActiveInstanceAction({
    id: TerminalCommandId.SelectToNextCommand,
    title: localize2("workbench.action.terminal.selectToNextCommand", "Select to Next Command"),
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.DownArrow,
      when: TerminalContextKeys.focus,
      weight: KeybindingWeight.WorkbenchContrib
    },
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((activeInstance) => {
      activeInstance.xterm?.markTracker.selectToNextMark();
      activeInstance.focus();
    }, "run")
  });
  registerActiveXtermAction({
    id: TerminalCommandId.SelectToPreviousLine,
    title: localize2("workbench.action.terminal.selectToPreviousLine", "Select to Previous Line"),
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (xterm, _, instance) => {
      xterm.markTracker.selectToPreviousLine();
      (instance || xterm).focus();
    }, "run")
  });
  registerActiveXtermAction({
    id: TerminalCommandId.SelectToNextLine,
    title: localize2("workbench.action.terminal.selectToNextLine", "Select to Next Line"),
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name(async (xterm, _, instance) => {
      xterm.markTracker.selectToNextLine();
      (instance || xterm).focus();
    }, "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.SendSequence,
    title: terminalStrings.sendSequence,
    f1: false,
    metadata: {
      description: terminalStrings.sendSequence.value,
      args: [{
        name: "args",
        schema: {
          type: "object",
          required: ["text"],
          properties: {
            text: {
              description: localize("sendSequence", "The sequence of text to send to the terminal"),
              type: "string"
            }
          }
        }
      }]
    },
    run: /* @__PURE__ */ __name((c, accessor, args) => terminalSendSequenceCommand(accessor, args), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.NewWithCwd,
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
    id: TerminalCommandId.RenameWithArgs,
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
    id: TerminalCommandId.Relaunch,
    title: localize2("workbench.action.terminal.relaunch", "Relaunch Active Terminal"),
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.relaunch(), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.Split,
    title: terminalStrings.split,
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Digit5,
      weight: KeybindingWeight.WorkbenchContrib,
      mac: {
        primary: KeyMod.CtrlCmd | KeyCode.Backslash,
        secondary: [KeyMod.WinCtrl | KeyMod.Shift | KeyCode.Digit5]
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
    id: TerminalCommandId.SplitActiveTab,
    title: terminalStrings.split,
    f1: false,
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Digit5,
      mac: {
        primary: KeyMod.CtrlCmd | KeyCode.Backslash,
        secondary: [KeyMod.WinCtrl | KeyMod.Shift | KeyCode.Digit5]
      },
      weight: KeybindingWeight.WorkbenchContrib,
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
    id: TerminalCommandId.Unsplit,
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
    id: TerminalCommandId.JoinActiveTab,
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
    id: TerminalCommandId.Join,
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
    id: TerminalCommandId.SplitInActiveWorkspace,
    title: localize2("workbench.action.terminal.splitInActiveWorkspace", "Split Terminal (In Active Workspace)"),
    run: /* @__PURE__ */ __name(async (instance, c) => {
      const newInstance = await c.service.createTerminal({ location: { parentTerminal: instance } });
      if (newInstance?.target !== TerminalLocation.Editor) {
        await c.groupService.showPanel(true);
      }
    }, "run")
  });
  registerActiveXtermAction({
    id: TerminalCommandId.SelectAll,
    title: localize2("workbench.action.terminal.selectAll", "Select All"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: [{
      // Don't use ctrl+a by default as that would override the common go to start
      // of prompt shell binding
      primary: 0,
      // Technically this doesn't need to be here as it will fall back to this
      // behavior anyway when handed to xterm.js, having this handled by VS Code
      // makes it easier for users to see how it works though.
      mac: { primary: KeyMod.CtrlCmd | KeyCode.KeyA },
      weight: KeybindingWeight.WorkbenchContrib,
      when: TerminalContextKeys.focusInAny
    }],
    run: /* @__PURE__ */ __name((xterm) => xterm.selectAll(), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.New,
    title: localize2("workbench.action.terminal.new", "Create New Terminal"),
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
    icon: newTerminalIcon,
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.Backquote,
      mac: { primary: KeyMod.WinCtrl | KeyMod.Shift | KeyCode.Backquote },
      weight: KeybindingWeight.WorkbenchContrib
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
          commandService.executeCommand(TerminalCommandId.NewWithProfile);
        } else {
          commandService.executeCommand(TerminalCommandId.Toggle);
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
    id: TerminalCommandId.Kill,
    title: localize2("workbench.action.terminal.kill", "Kill the Active Terminal Instance"),
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    icon: killTerminalIcon,
    run: /* @__PURE__ */ __name(async (c) => killInstance(c, c.groupService.activeInstance), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.KillViewOrEditor,
    title: terminalStrings.kill,
    f1: false,
    // This is an internal command used for context menus
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    run: /* @__PURE__ */ __name(async (c) => killInstance(c, c.service.activeInstance), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.KillAll,
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
    id: TerminalCommandId.KillEditor,
    title: localize2("workbench.action.terminal.killEditor", "Kill the Active Terminal in Editor Area"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: {
      primary: KeyMod.CtrlCmd | KeyCode.KeyW,
      win: { primary: KeyMod.CtrlCmd | KeyCode.F4, secondary: [KeyMod.CtrlCmd | KeyCode.KeyW] },
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(TerminalContextKeys.focus, TerminalContextKeys.editorFocus)
    },
    run: /* @__PURE__ */ __name((c, accessor) => accessor.get(ICommandService).executeCommand(CLOSE_EDITOR_COMMAND_ID), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.KillActiveTab,
    title: terminalStrings.kill,
    f1: false,
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    keybinding: {
      primary: KeyCode.Delete,
      mac: {
        primary: KeyMod.CtrlCmd | KeyCode.Backspace,
        secondary: [KeyCode.Delete]
      },
      weight: KeybindingWeight.WorkbenchContrib,
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
    id: TerminalCommandId.FocusHover,
    title: terminalStrings.focusHover,
    precondition: ContextKeyExpr.or(sharedWhenClause.terminalAvailable, TerminalContextKeys.isOpen),
    keybinding: {
      primary: KeyChord(KeyMod.CtrlCmd | KeyCode.KeyK, KeyMod.CtrlCmd | KeyCode.KeyI),
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.or(TerminalContextKeys.tabsFocus, TerminalContextKeys.focus)
    },
    run: /* @__PURE__ */ __name((c) => c.groupService.focusHover(), "run")
  });
  registerActiveInstanceAction({
    id: TerminalCommandId.Clear,
    title: localize2("workbench.action.terminal.clear", "Clear"),
    precondition: sharedWhenClause.terminalAvailable,
    keybinding: [{
      primary: 0,
      mac: { primary: KeyMod.CtrlCmd | KeyCode.KeyK },
      // Weight is higher than work workbench contributions so the keybinding remains
      // highest priority when chords are registered afterwards
      weight: KeybindingWeight.WorkbenchContrib + 1,
      // Disable the keybinding when accessibility mode is enabled as chords include
      // important screen reader keybindings such as cmd+k, cmd+i to show the hover
      when: ContextKeyExpr.or(ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()), ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, accessibleViewIsShown, accessibleViewCurrentProviderId.isEqualTo(AccessibleViewProviderId.Terminal)))
    }],
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.clearBuffer(), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.SelectDefaultProfile,
    title: localize2("workbench.action.terminal.selectDefaultShell", "Select Default Profile"),
    run: /* @__PURE__ */ __name((c) => c.service.showProfileQuickPick("setDefault"), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.ConfigureTerminalSettings,
    title: localize2("workbench.action.terminal.openSettings", "Configure Terminal Settings"),
    precondition: sharedWhenClause.terminalAvailable,
    run: /* @__PURE__ */ __name((c, accessor) => accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: "@feature:terminal" }), "run")
  });
  registerActiveInstanceAction({
    id: TerminalCommandId.SetDimensions,
    title: localize2("workbench.action.terminal.setFixedDimensions", "Set Fixed Dimensions"),
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    run: /* @__PURE__ */ __name((activeInstance) => activeInstance.setFixedDimensions(), "run")
  });
  registerContextualInstanceAction({
    id: TerminalCommandId.SizeToContentWidth,
    title: terminalStrings.toggleSizeToContentWidth,
    precondition: sharedWhenClause.terminalAvailable_and_opened,
    keybinding: {
      primary: KeyMod.Alt | KeyCode.KeyZ,
      weight: KeybindingWeight.WorkbenchContrib,
      when: TerminalContextKeys.focus
    },
    run: /* @__PURE__ */ __name((instance) => instance.toggleSizeToContentWidth(), "run")
  });
  registerTerminalAction({
    id: TerminalCommandId.SwitchTerminal,
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
        accessor.get(IConfigurationService).updateValue(TerminalSettingId.TabsEnabled, true);
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
        id: TerminalCommandId.NewWithProfile,
        title: localize2("workbench.action.terminal.newWithProfile", "Create New Terminal (With Profile)"),
        f1: true,
        precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.webExtensionContributedProfile),
        metadata: {
          description: TerminalCommandId.NewWithProfile,
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
  const cwdConfig = configurationService.getValue(TerminalSettingId.Cwd, { resource: folder.uri });
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
  terminalSendSequenceCommand,
  validateTerminalName
};
//# sourceMappingURL=terminalActions.js.map
