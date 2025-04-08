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
import * as nls from "../../../../nls.js";
import { IAction } from "../../../../base/common/actions.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import * as dom from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { SelectBox, ISelectOptionItem } from "../../../../base/browser/ui/selectBox/selectBox.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IDebugService, IDebugSession, IDebugConfiguration, IConfig, ILaunch, State } from "../common/debug.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { selectBorder, selectBackground, asCssVariable } from "../../../../platform/theme/common/colorRegistry.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IWorkspaceContextService, WorkbenchState } from "../../../../platform/workspace/common/workspace.js";
import { IDisposable, dispose } from "../../../../base/common/lifecycle.js";
import { ADD_CONFIGURATION_ID } from "./debugCommands.js";
import { BaseActionViewItem, IBaseActionViewItemOptions, SelectActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { debugStart } from "./debugIcons.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { defaultSelectBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { AccessibilityVerbositySettingId } from "../../accessibility/browser/accessibilityConfiguration.js";
import { AccessibilityCommandId } from "../../accessibility/common/accessibilityCommands.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
const $ = dom.$;
let StartDebugActionViewItem = class extends BaseActionViewItem {
  constructor(context, action, options, debugService, configurationService, commandService, contextService, contextViewService, keybindingService, hoverService, contextKeyService) {
    super(context, action, options);
    this.context = context;
    this.debugService = debugService;
    this.configurationService = configurationService;
    this.commandService = commandService;
    this.contextService = contextService;
    this.keybindingService = keybindingService;
    this.hoverService = hoverService;
    this.contextKeyService = contextKeyService;
    this.toDispose = [];
    this.selectBox = new SelectBox([], -1, contextViewService, defaultSelectBoxStyles, { ariaLabel: nls.localize("debugLaunchConfigurations", "Debug Launch Configurations") });
    this.selectBox.setFocusable(false);
    this.toDispose.push(this.selectBox);
    this.registerListeners();
  }
  static {
    __name(this, "StartDebugActionViewItem");
  }
  static SEPARATOR = "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500";
  container;
  start;
  selectBox;
  debugOptions = [];
  toDispose;
  selected = 0;
  providers = [];
  registerListeners() {
    this.toDispose.push(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("launch")) {
        this.updateOptions();
      }
    }));
    this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration(() => {
      this.updateOptions();
    }));
  }
  render(container) {
    this.container = container;
    container.classList.add("start-debug-action-item");
    this.start = dom.append(container, $(ThemeIcon.asCSSSelector(debugStart)));
    const keybinding = this.keybindingService.lookupKeybinding(this.action.id)?.getLabel();
    const keybindingLabel = keybinding ? ` (${keybinding})` : "";
    const title = this.action.label + keybindingLabel;
    this.toDispose.push(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.start, title));
    this.start.setAttribute("role", "button");
    this._setAriaLabel(title);
    this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.CLICK, () => {
      this.start.blur();
      if (this.debugService.state !== State.Initializing) {
        this.actionRunner.run(this.action, this.context);
      }
    }));
    this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_DOWN, (e) => {
      if (this.action.enabled && e.button === 0) {
        this.start.classList.add("active");
      }
    }));
    this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_UP, () => {
      this.start.classList.remove("active");
    }));
    this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.MOUSE_OUT, () => {
      this.start.classList.remove("active");
    }));
    this.toDispose.push(dom.addDisposableListener(this.start, dom.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(KeyCode.RightArrow)) {
        this.start.tabIndex = -1;
        this.selectBox.focus();
        event.stopPropagation();
      }
    }));
    this.toDispose.push(this.selectBox.onDidSelect(async (e) => {
      const target = this.debugOptions[e.index];
      const shouldBeSelected = target.handler ? await target.handler() : false;
      if (shouldBeSelected) {
        this.selected = e.index;
      } else {
        this.selectBox.select(this.selected);
      }
    }));
    const selectBoxContainer = $(".configuration");
    this.selectBox.render(dom.append(container, selectBoxContainer));
    this.toDispose.push(dom.addDisposableListener(selectBoxContainer, dom.EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(KeyCode.LeftArrow)) {
        this.selectBox.setFocusable(false);
        this.start.tabIndex = 0;
        this.start.focus();
        event.stopPropagation();
        event.preventDefault();
      }
    }));
    this.container.style.border = `1px solid ${asCssVariable(selectBorder)}`;
    selectBoxContainer.style.borderLeft = `1px solid ${asCssVariable(selectBorder)}`;
    this.container.style.backgroundColor = asCssVariable(selectBackground);
    const configManager = this.debugService.getConfigurationManager();
    const updateDynamicConfigs = /* @__PURE__ */ __name(() => configManager.getDynamicProviders().then((providers) => {
      if (providers.length !== this.providers.length) {
        this.providers = providers;
        this.updateOptions();
      }
    }), "updateDynamicConfigs");
    this.toDispose.push(configManager.onDidChangeConfigurationProviders(updateDynamicConfigs));
    updateDynamicConfigs();
    this.updateOptions();
  }
  setActionContext(context) {
    this.context = context;
  }
  isEnabled() {
    return true;
  }
  focus(fromRight) {
    if (fromRight) {
      this.selectBox.focus();
    } else {
      this.start.tabIndex = 0;
      this.start.focus();
    }
  }
  blur() {
    this.start.tabIndex = -1;
    this.selectBox.blur();
    this.container.blur();
  }
  setFocusable(focusable) {
    if (focusable) {
      this.start.tabIndex = 0;
    } else {
      this.start.tabIndex = -1;
      this.selectBox.setFocusable(false);
    }
  }
  dispose() {
    this.toDispose = dispose(this.toDispose);
    super.dispose();
  }
  updateOptions() {
    this.selected = 0;
    this.debugOptions = [];
    const manager = this.debugService.getConfigurationManager();
    const inWorkspace = this.contextService.getWorkbenchState() === WorkbenchState.WORKSPACE;
    let lastGroup;
    const disabledIdxs = [];
    manager.getAllConfigurations().forEach(({ launch, name, presentation }) => {
      if (lastGroup !== presentation?.group) {
        lastGroup = presentation?.group;
        if (this.debugOptions.length) {
          this.debugOptions.push({ label: StartDebugActionViewItem.SEPARATOR, handler: /* @__PURE__ */ __name(() => Promise.resolve(false), "handler") });
          disabledIdxs.push(this.debugOptions.length - 1);
        }
      }
      if (name === manager.selectedConfiguration.name && launch === manager.selectedConfiguration.launch) {
        this.selected = this.debugOptions.length;
      }
      const label = inWorkspace ? `${name} (${launch.name})` : name;
      this.debugOptions.push({
        label,
        handler: /* @__PURE__ */ __name(async () => {
          await manager.selectConfiguration(launch, name);
          return true;
        }, "handler")
      });
    });
    manager.getRecentDynamicConfigurations().slice(0, 3).forEach(({ name, type }) => {
      if (type === manager.selectedConfiguration.type && manager.selectedConfiguration.name === name) {
        this.selected = this.debugOptions.length;
      }
      this.debugOptions.push({
        label: name,
        handler: /* @__PURE__ */ __name(async () => {
          await manager.selectConfiguration(void 0, name, void 0, { type });
          return true;
        }, "handler")
      });
    });
    if (this.debugOptions.length === 0) {
      this.debugOptions.push({ label: nls.localize("noConfigurations", "No Configurations"), handler: /* @__PURE__ */ __name(async () => false, "handler") });
    }
    this.debugOptions.push({ label: StartDebugActionViewItem.SEPARATOR, handler: /* @__PURE__ */ __name(() => Promise.resolve(false), "handler") });
    disabledIdxs.push(this.debugOptions.length - 1);
    this.providers.forEach((p) => {
      this.debugOptions.push({
        label: `${p.label}...`,
        handler: /* @__PURE__ */ __name(async () => {
          const picked = await p.pick();
          if (picked) {
            await manager.selectConfiguration(picked.launch, picked.config.name, picked.config, { type: p.type });
            return true;
          }
          return false;
        }, "handler")
      });
    });
    manager.getLaunches().filter((l) => !l.hidden).forEach((l) => {
      const label = inWorkspace ? nls.localize("addConfigTo", "Add Config ({0})...", l.name) : nls.localize("addConfiguration", "Add Configuration...");
      this.debugOptions.push({
        label,
        handler: /* @__PURE__ */ __name(async () => {
          await this.commandService.executeCommand(ADD_CONFIGURATION_ID, l.uri.toString());
          return false;
        }, "handler")
      });
    });
    this.selectBox.setOptions(this.debugOptions.map((data, index) => ({ text: data.label, isDisabled: disabledIdxs.indexOf(index) !== -1 })), this.selected);
  }
  _setAriaLabel(title) {
    let ariaLabel = title;
    let keybinding;
    const verbose = this.configurationService.getValue(AccessibilityVerbositySettingId.Debug);
    if (verbose) {
      keybinding = this.keybindingService.lookupKeybinding(AccessibilityCommandId.OpenAccessibilityHelp, this.contextKeyService)?.getLabel() ?? void 0;
    }
    if (keybinding) {
      ariaLabel = nls.localize("commentLabelWithKeybinding", "{0}, use ({1}) for accessibility help", ariaLabel, keybinding);
    } else {
      ariaLabel = nls.localize("commentLabelWithKeybindingNoKeybinding", "{0}, run the command Open Accessibility Help which is currently not triggerable via keybinding.", ariaLabel);
    }
    this.start.ariaLabel = ariaLabel;
  }
};
StartDebugActionViewItem = __decorateClass([
  __decorateParam(3, IDebugService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IContextViewService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IContextKeyService)
], StartDebugActionViewItem);
let FocusSessionActionViewItem = class extends SelectActionViewItem {
  constructor(action, session, debugService, contextViewService, configurationService) {
    super(null, action, [], -1, contextViewService, defaultSelectBoxStyles, { ariaLabel: nls.localize("debugSession", "Debug Session") });
    this.debugService = debugService;
    this.configurationService = configurationService;
    this._register(this.debugService.getViewModel().onDidFocusSession(() => {
      const session2 = this.getSelectedSession();
      if (session2) {
        const index = this.getSessions().indexOf(session2);
        this.select(index);
      }
    }));
    this._register(this.debugService.onDidNewSession((session2) => {
      const sessionListeners = [];
      sessionListeners.push(session2.onDidChangeName(() => this.update()));
      sessionListeners.push(session2.onDidEndAdapter(() => dispose(sessionListeners)));
      this.update();
    }));
    this.getSessions().forEach((session2) => {
      this._register(session2.onDidChangeName(() => this.update()));
    });
    this._register(this.debugService.onDidEndSession(() => this.update()));
    const selectedSession = session ? this.mapFocusedSessionToSelected(session) : void 0;
    this.update(selectedSession);
  }
  static {
    __name(this, "FocusSessionActionViewItem");
  }
  getActionContext(_, index) {
    return this.getSessions()[index];
  }
  update(session) {
    if (!session) {
      session = this.getSelectedSession();
    }
    const sessions = this.getSessions();
    const names = sessions.map((s) => {
      const label = s.getLabel();
      if (s.parentSession) {
        return `\xA0\xA0${label}`;
      }
      return label;
    });
    this.setOptions(names.map((data) => ({ text: data })), session ? sessions.indexOf(session) : void 0);
  }
  getSelectedSession() {
    const session = this.debugService.getViewModel().focusedSession;
    return session ? this.mapFocusedSessionToSelected(session) : void 0;
  }
  getSessions() {
    const showSubSessions = this.configurationService.getValue("debug").showSubSessionsInToolBar;
    const sessions = this.debugService.getModel().getSessions();
    return showSubSessions ? sessions : sessions.filter((s) => !s.parentSession);
  }
  mapFocusedSessionToSelected(focusedSession) {
    const showSubSessions = this.configurationService.getValue("debug").showSubSessionsInToolBar;
    while (focusedSession.parentSession && !showSubSessions) {
      focusedSession = focusedSession.parentSession;
    }
    return focusedSession;
  }
};
FocusSessionActionViewItem = __decorateClass([
  __decorateParam(2, IDebugService),
  __decorateParam(3, IContextViewService),
  __decorateParam(4, IConfigurationService)
], FocusSessionActionViewItem);
export {
  FocusSessionActionViewItem,
  StartDebugActionViewItem
};
//# sourceMappingURL=debugActionViewItems.js.map
