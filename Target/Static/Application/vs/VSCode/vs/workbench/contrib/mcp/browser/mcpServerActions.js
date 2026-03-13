var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
var InstallAction_1, InstallInWorkspaceAction_1, InstallInRemoteAction_1, UninstallAction_1, EnableMcpServerGloballyAction_1, EnableMcpServerForWorkspaceAction_1, DisableMcpServerGloballyAction_1, DisableMcpServerForWorkspaceAction_1, ManageMcpServerAction_1, StartServerAction_1, StopServerAction_1, RestartServerAction_1, AuthServerAction_1, ShowServerOutputAction_1, ShowServerConfigurationAction_1, ShowServerJsonConfigurationAction_1, ConfigureModelAccessAction_1, ShowSamplingRequestsAction_1, BrowseResourcesAction_1, McpServerStatusAction_1;
import { getDomNodePagePosition } from "../../../../base/browser/dom.js";
import { ActionViewItem } from "../../../../base/browser/ui/actionbar/actionViewItems.js";
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { Action, Separator } from "../../../../base/common/actions.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { disposeIfDisposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IAuthenticationQueryService } from "../../../services/authentication/common/authenticationQuery.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { errorIcon, infoIcon, manageExtensionIcon, trustIcon, warningIcon } from "../../extensions/browser/extensionsIcons.js";
import { IMcpRegistry } from "../common/mcpRegistryTypes.js";
import { IMcpSamplingService, IMcpService, IMcpWorkbenchService, McpConnectionState } from "../common/mcpTypes.js";
import { startServerByFilter } from "../common/mcpTypesUtils.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { Schemas } from "../../../../base/common/network.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ActionWithDropdownActionViewItem } from "../../../../base/browser/ui/dropdown/dropdownActionViewItem.js";
import Severity from "../../../../base/common/severity.js";
import { isContributionDisabled, isContributionEnabled } from "../../chat/common/enablement.js";
class McpServerAction extends Action {
  static {
    __name(this, "McpServerAction");
  }
  constructor() {
    super(...arguments);
    this._onDidChange = this._register(new Emitter());
    this._hidden = false;
    this.hideOnDisabled = true;
    this._mcpServer = null;
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  static {
    this.EXTENSION_ACTION_CLASS = "extension-action";
  }
  static {
    this.TEXT_ACTION_CLASS = `${McpServerAction.EXTENSION_ACTION_CLASS} text`;
  }
  static {
    this.LABEL_ACTION_CLASS = `${McpServerAction.EXTENSION_ACTION_CLASS} label`;
  }
  static {
    this.PROMINENT_LABEL_ACTION_CLASS = `${McpServerAction.LABEL_ACTION_CLASS} prominent`;
  }
  static {
    this.ICON_ACTION_CLASS = `${McpServerAction.EXTENSION_ACTION_CLASS} icon`;
  }
  get hidden() {
    return this._hidden;
  }
  set hidden(hidden) {
    if (this._hidden !== hidden) {
      this._hidden = hidden;
      this._onDidChange.fire({ hidden });
    }
  }
  _setEnabled(value) {
    super._setEnabled(value);
    if (this.hideOnDisabled) {
      this.hidden = !value;
    }
  }
  get mcpServer() {
    return this._mcpServer;
  }
  set mcpServer(mcpServer) {
    this._mcpServer = mcpServer;
    this.update();
  }
}
class ButtonWithDropDownExtensionAction extends McpServerAction {
  static {
    __name(this, "ButtonWithDropDownExtensionAction");
  }
  get menuActions() {
    return [...this._menuActions];
  }
  get mcpServer() {
    return super.mcpServer;
  }
  set mcpServer(mcpServer) {
    this.actions.forEach((a) => a.mcpServer = mcpServer);
    super.mcpServer = mcpServer;
  }
  constructor(id, clazz, actionsGroups) {
    clazz = `${clazz} action-dropdown`;
    super(id, void 0, clazz);
    this.actionsGroups = actionsGroups;
    this.menuActionClassNames = [];
    this._menuActions = [];
    this.menuActionClassNames = clazz.split(" ");
    this.hideOnDisabled = false;
    this.actions = actionsGroups.flat();
    this.update();
    this._register(Event.any(...this.actions.map((a) => a.onDidChange))(() => this.update(true)));
    this.actions.forEach((a) => this._register(a));
  }
  update(donotUpdateActions) {
    if (!donotUpdateActions) {
      this.actions.forEach((a) => a.update());
    }
    const actionsGroups = this.actionsGroups.map((actionsGroup) => actionsGroup.filter((a) => !a.hidden));
    let actions = [];
    for (const visibleActions of actionsGroups) {
      if (visibleActions.length) {
        actions = [...actions, ...visibleActions, new Separator()];
      }
    }
    actions = actions.length ? actions.slice(0, actions.length - 1) : actions;
    this.primaryAction = actions[0];
    this._menuActions = actions.length > 1 ? actions : [];
    this._onDidChange.fire({ menuActions: this._menuActions });
    if (this.primaryAction) {
      this.hidden = false;
      this.enabled = this.primaryAction.enabled;
      this.label = this.getLabel(this.primaryAction);
      this.tooltip = this.primaryAction.tooltip;
    } else {
      this.hidden = true;
      this.enabled = false;
    }
  }
  async run() {
    if (this.enabled) {
      await this.primaryAction?.run();
    }
  }
  getLabel(action) {
    return action.label;
  }
}
class ButtonWithDropdownExtensionActionViewItem extends ActionWithDropdownActionViewItem {
  static {
    __name(this, "ButtonWithDropdownExtensionActionViewItem");
  }
  constructor(action, options, contextMenuProvider) {
    super(null, action, options, contextMenuProvider);
    this._register(action.onDidChange((e) => {
      if (e.hidden !== void 0 || e.menuActions !== void 0) {
        this.updateClass();
      }
    }));
  }
  render(container) {
    super.render(container);
    this.updateClass();
  }
  updateClass() {
    super.updateClass();
    if (this.element && this.dropdownMenuActionViewItem?.element) {
      this.element.classList.toggle("hide", this._action.hidden);
      const isMenuEmpty = this._action.menuActions.length === 0;
      this.element.classList.toggle("empty", isMenuEmpty);
      this.dropdownMenuActionViewItem.element.classList.toggle("hide", isMenuEmpty);
    }
  }
}
let DropDownAction = class DropDownAction2 extends McpServerAction {
  static {
    __name(this, "DropDownAction");
  }
  constructor(id, label, cssClass, enabled, instantiationService) {
    super(id, label, cssClass, enabled);
    this.instantiationService = instantiationService;
    this._actionViewItem = null;
  }
  createActionViewItem(options) {
    this._actionViewItem = this.instantiationService.createInstance(DropDownExtensionActionViewItem, this, options);
    return this._actionViewItem;
  }
  run(actionGroups) {
    this._actionViewItem?.showMenu(actionGroups);
    return Promise.resolve();
  }
};
DropDownAction = __decorate([
  __param(4, IInstantiationService)
], DropDownAction);
let DropDownExtensionActionViewItem = class DropDownExtensionActionViewItem2 extends ActionViewItem {
  static {
    __name(this, "DropDownExtensionActionViewItem");
  }
  constructor(action, options, contextMenuService) {
    super(null, action, { ...options, icon: true, label: true });
    this.contextMenuService = contextMenuService;
  }
  showMenu(menuActionGroups) {
    if (this.element) {
      const actions = this.getActions(menuActionGroups);
      const elementPosition = getDomNodePagePosition(this.element);
      const anchor = { x: elementPosition.left, y: elementPosition.top + elementPosition.height + 10 };
      this.contextMenuService.showContextMenu({
        getAnchor: /* @__PURE__ */ __name(() => anchor, "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
        actionRunner: this.actionRunner,
        onHide: /* @__PURE__ */ __name(() => disposeIfDisposable(actions), "onHide")
      });
    }
  }
  getActions(menuActionGroups) {
    let actions = [];
    for (const menuActions of menuActionGroups) {
      actions = [...actions, ...menuActions, new Separator()];
    }
    return actions.length ? actions.slice(0, actions.length - 1) : actions;
  }
};
DropDownExtensionActionViewItem = __decorate([
  __param(2, IContextMenuService)
], DropDownExtensionActionViewItem);
let InstallAction = class InstallAction2 extends McpServerAction {
  static {
    __name(this, "InstallAction");
  }
  static {
    InstallAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent install`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(open, mcpWorkbenchService, telemetryService, mcpService) {
    super("extensions.install", localize("install", "Install"), InstallAction_1.CLASS, false);
    this.open = open;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.telemetryService = telemetryService;
    this.mcpService = mcpService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = InstallAction_1.HIDE;
    if (!this.mcpServer?.gallery && !this.mcpServer?.installable) {
      return;
    }
    if (this.mcpServer.installState !== 3) {
      return;
    }
    this.class = InstallAction_1.CLASS;
    this.enabled = this.mcpWorkbenchService.canInstall(this.mcpServer) === true;
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    if (this.open) {
      this.mcpWorkbenchService.open(this.mcpServer);
      alert(localize("mcpServerInstallation", "Installing MCP Server {0} started. An editor is now open with more details on this MCP Server", this.mcpServer.label));
    }
    this.telemetryService.publicLog2("mcp:action:install", { name: this.mcpServer.gallery?.name });
    const installed = await this.mcpWorkbenchService.install(this.mcpServer);
    await startServerByFilter(this.mcpService, (s) => {
      return s.definition.label === installed.name;
    });
  }
};
InstallAction = InstallAction_1 = __decorate([
  __param(1, IMcpWorkbenchService),
  __param(2, ITelemetryService),
  __param(3, IMcpService)
], InstallAction);
let InstallInWorkspaceAction = class InstallInWorkspaceAction2 extends McpServerAction {
  static {
    __name(this, "InstallInWorkspaceAction");
  }
  static {
    InstallInWorkspaceAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent install`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(open, mcpWorkbenchService, workspaceService, quickInputService, telemetryService, mcpService) {
    super("extensions.installWorkspace", localize("installInWorkspace", "Install in Workspace"), InstallAction.CLASS, false);
    this.open = open;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.workspaceService = workspaceService;
    this.quickInputService = quickInputService;
    this.telemetryService = telemetryService;
    this.mcpService = mcpService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = InstallInWorkspaceAction_1.HIDE;
    if (this.workspaceService.getWorkbenchState() === 1) {
      return;
    }
    if (!this.mcpServer?.gallery && !this.mcpServer?.installable) {
      return;
    }
    if (this.mcpServer.installState !== 3 && this.mcpServer.local?.scope === "workspace") {
      return;
    }
    this.class = InstallAction.CLASS;
    this.enabled = this.mcpWorkbenchService.canInstall(this.mcpServer) === true;
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    if (this.open) {
      this.mcpWorkbenchService.open(this.mcpServer, { preserveFocus: true });
      alert(localize("mcpServerInstallation", "Installing MCP Server {0} started. An editor is now open with more details on this MCP Server", this.mcpServer.label));
    }
    const target = await this.getConfigurationTarget();
    if (!target) {
      return;
    }
    this.telemetryService.publicLog2("mcp:action:install:workspace", { name: this.mcpServer.gallery?.name });
    const installed = await this.mcpWorkbenchService.install(this.mcpServer, { target });
    await startServerByFilter(this.mcpService, (s) => {
      return s.definition.label === installed.name;
    });
  }
  async getConfigurationTarget() {
    const options = [];
    for (const folder of this.workspaceService.getWorkspace().folders) {
      options.push({ target: folder, label: folder.name, description: localize("install in workspace folder", "Workspace Folder") });
    }
    if (this.workspaceService.getWorkbenchState() === 3) {
      if (options.length > 0) {
        options.push({ type: "separator" });
      }
      options.push({ target: 5, label: localize("mcp.target.workspace", "Workspace") });
    }
    if (options.length === 1) {
      return options[0].target;
    }
    const targetPick = await this.quickInputService.pick(options, {
      title: localize("mcp.target.title", "Choose where to install the MCP server")
    });
    return targetPick?.target;
  }
};
InstallInWorkspaceAction = InstallInWorkspaceAction_1 = __decorate([
  __param(1, IMcpWorkbenchService),
  __param(2, IWorkspaceContextService),
  __param(3, IQuickInputService),
  __param(4, ITelemetryService),
  __param(5, IMcpService)
], InstallInWorkspaceAction);
let InstallInRemoteAction = class InstallInRemoteAction2 extends McpServerAction {
  static {
    __name(this, "InstallInRemoteAction");
  }
  static {
    InstallInRemoteAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent install`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(open, mcpWorkbenchService, environmentService, telemetryService, labelService, mcpService) {
    super("extensions.installRemote", localize("installInRemote", "Install (Remote)"), InstallAction.CLASS, false);
    this.open = open;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.environmentService = environmentService;
    this.telemetryService = telemetryService;
    this.labelService = labelService;
    this.mcpService = mcpService;
    const remoteLabel = this.labelService.getHostLabel(Schemas.vscodeRemote, this.environmentService.remoteAuthority);
    this.label = localize("installInRemoteLabel", "Install in {0}", remoteLabel);
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = InstallInRemoteAction_1.HIDE;
    if (!this.environmentService.remoteAuthority) {
      return;
    }
    if (!this.mcpServer?.gallery && !this.mcpServer?.installable) {
      return;
    }
    if (this.mcpServer.installState !== 3) {
      if (this.mcpServer.local?.scope === "remoteUser") {
        return;
      }
      if (this.mcpWorkbenchService.local.find(
        (mcpServer) => mcpServer.name === this.mcpServer?.name && mcpServer.local?.scope === "remoteUser"
        /* LocalMcpServerScope.RemoteUser */
      )) {
        return;
      }
    }
    this.class = InstallAction.CLASS;
    this.enabled = this.mcpWorkbenchService.canInstall(this.mcpServer) === true;
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    if (this.open) {
      this.mcpWorkbenchService.open(this.mcpServer);
      alert(localize("mcpServerInstallation", "Installing MCP Server {0} started. An editor is now open with more details on this MCP Server", this.mcpServer.label));
    }
    this.telemetryService.publicLog2("mcp:action:install:remote", { name: this.mcpServer.gallery?.name });
    const installed = await this.mcpWorkbenchService.install(this.mcpServer, {
      target: 4
      /* ConfigurationTarget.USER_REMOTE */
    });
    await startServerByFilter(this.mcpService, (s) => {
      return s.definition.label === installed.name;
    });
  }
};
InstallInRemoteAction = InstallInRemoteAction_1 = __decorate([
  __param(1, IMcpWorkbenchService),
  __param(2, IWorkbenchEnvironmentService),
  __param(3, ITelemetryService),
  __param(4, ILabelService),
  __param(5, IMcpService)
], InstallInRemoteAction);
class InstallingLabelAction extends McpServerAction {
  static {
    __name(this, "InstallingLabelAction");
  }
  static {
    this.LABEL = localize("installing", "Installing");
  }
  static {
    this.CLASS = `${McpServerAction.LABEL_ACTION_CLASS} install installing`;
  }
  constructor() {
    super("extension.installing", InstallingLabelAction.LABEL, InstallingLabelAction.CLASS, false);
  }
  update() {
    this.class = `${InstallingLabelAction.CLASS}${this.mcpServer && this.mcpServer.installState === 0 ? "" : " hide"}`;
  }
}
let UninstallAction = class UninstallAction2 extends McpServerAction {
  static {
    __name(this, "UninstallAction");
  }
  static {
    UninstallAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent uninstall`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpWorkbenchService) {
    super("extensions.uninstall", localize("uninstall", "Uninstall"), UninstallAction_1.CLASS, false);
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = UninstallAction_1.HIDE;
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    if (this.mcpServer.installState !== 1) {
      this.enabled = false;
      return;
    }
    this.class = UninstallAction_1.CLASS;
    this.enabled = true;
    this.label = localize("uninstall", "Uninstall");
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    await this.mcpWorkbenchService.uninstall(this.mcpServer);
  }
};
UninstallAction = UninstallAction_1 = __decorate([
  __param(0, IMcpWorkbenchService)
], UninstallAction);
let EnableMcpServerGloballyAction = class EnableMcpServerGloballyAction2 extends McpServerAction {
  static {
    __name(this, "EnableMcpServerGloballyAction");
  }
  static {
    EnableMcpServerGloballyAction_1 = this;
  }
  static {
    this.ID = "mcpServer.enableGlobally";
  }
  constructor(mcpService) {
    super(EnableMcpServerGloballyAction_1.ID, localize("enableGlobally", "Enable"), McpServerAction.LABEL_ACTION_CLASS);
    this.mcpService = mcpService;
    this.tooltip = localize("enableGloballyTooltip", "Enable this MCP server");
    this.update();
  }
  update() {
    this.enabled = false;
    if (!this.mcpServer?.local) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
    if (!server) {
      return;
    }
    const enablement = server.enablement.get();
    this.enabled = isContributionDisabled(enablement);
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    this.mcpService.enablementModel.setEnabled(
      this.mcpServer.id,
      2
      /* ContributionEnablementState.EnabledProfile */
    );
  }
};
EnableMcpServerGloballyAction = EnableMcpServerGloballyAction_1 = __decorate([
  __param(0, IMcpService)
], EnableMcpServerGloballyAction);
let EnableMcpServerForWorkspaceAction = class EnableMcpServerForWorkspaceAction2 extends McpServerAction {
  static {
    __name(this, "EnableMcpServerForWorkspaceAction");
  }
  static {
    EnableMcpServerForWorkspaceAction_1 = this;
  }
  static {
    this.ID = "mcpServer.enableForWorkspace";
  }
  constructor(mcpService, workspaceService) {
    super(EnableMcpServerForWorkspaceAction_1.ID, localize("enableForWorkspace", "Enable (Workspace)"), McpServerAction.LABEL_ACTION_CLASS);
    this.mcpService = mcpService;
    this.workspaceService = workspaceService;
    this.tooltip = localize("enableForWorkspaceTooltip", "Enable this MCP server only in this workspace");
    this.update();
  }
  update() {
    this.enabled = false;
    if (!this.mcpServer?.local) {
      return;
    }
    if (this.workspaceService.getWorkbenchState() === 1) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
    if (!server) {
      return;
    }
    const enablement = server.enablement.get();
    this.enabled = isContributionDisabled(enablement);
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    this.mcpService.enablementModel.setEnabled(
      this.mcpServer.id,
      3
      /* ContributionEnablementState.EnabledWorkspace */
    );
  }
};
EnableMcpServerForWorkspaceAction = EnableMcpServerForWorkspaceAction_1 = __decorate([
  __param(0, IMcpService),
  __param(1, IWorkspaceContextService)
], EnableMcpServerForWorkspaceAction);
let DisableMcpServerGloballyAction = class DisableMcpServerGloballyAction2 extends McpServerAction {
  static {
    __name(this, "DisableMcpServerGloballyAction");
  }
  static {
    DisableMcpServerGloballyAction_1 = this;
  }
  static {
    this.ID = "mcpServer.disableGlobally";
  }
  constructor(mcpService) {
    super(DisableMcpServerGloballyAction_1.ID, localize("disableGlobally", "Disable"), McpServerAction.LABEL_ACTION_CLASS);
    this.mcpService = mcpService;
    this.tooltip = localize("disableGloballyTooltip", "Disable this MCP server");
    this.update();
  }
  update() {
    this.enabled = false;
    if (!this.mcpServer?.local) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
    if (!server) {
      return;
    }
    const enablement = server.enablement.get();
    this.enabled = isContributionEnabled(enablement);
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    this.mcpService.enablementModel.setEnabled(
      this.mcpServer.id,
      0
      /* ContributionEnablementState.DisabledProfile */
    );
  }
};
DisableMcpServerGloballyAction = DisableMcpServerGloballyAction_1 = __decorate([
  __param(0, IMcpService)
], DisableMcpServerGloballyAction);
let DisableMcpServerForWorkspaceAction = class DisableMcpServerForWorkspaceAction2 extends McpServerAction {
  static {
    __name(this, "DisableMcpServerForWorkspaceAction");
  }
  static {
    DisableMcpServerForWorkspaceAction_1 = this;
  }
  static {
    this.ID = "mcpServer.disableForWorkspace";
  }
  constructor(mcpService, workspaceService) {
    super(DisableMcpServerForWorkspaceAction_1.ID, localize("disableForWorkspace", "Disable (Workspace)"), McpServerAction.LABEL_ACTION_CLASS);
    this.mcpService = mcpService;
    this.workspaceService = workspaceService;
    this.tooltip = localize("disableForWorkspaceTooltip", "Disable this MCP server only in this workspace");
    this.update();
  }
  update() {
    this.enabled = false;
    if (!this.mcpServer?.local) {
      return;
    }
    if (this.workspaceService.getWorkbenchState() === 1) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
    if (!server) {
      return;
    }
    const enablement = server.enablement.get();
    this.enabled = isContributionEnabled(enablement);
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    this.mcpService.enablementModel.setEnabled(
      this.mcpServer.id,
      1
      /* ContributionEnablementState.DisabledWorkspace */
    );
  }
};
DisableMcpServerForWorkspaceAction = DisableMcpServerForWorkspaceAction_1 = __decorate([
  __param(0, IMcpService),
  __param(1, IWorkspaceContextService)
], DisableMcpServerForWorkspaceAction);
let EnableMcpDropDownAction = class EnableMcpDropDownAction2 extends ButtonWithDropDownExtensionAction {
  static {
    __name(this, "EnableMcpDropDownAction");
  }
  constructor(instantiationService) {
    super("mcpServer.enable", McpServerAction.LABEL_ACTION_CLASS, [
      [
        instantiationService.createInstance(EnableMcpServerGloballyAction),
        instantiationService.createInstance(EnableMcpServerForWorkspaceAction)
      ]
    ]);
  }
};
EnableMcpDropDownAction = __decorate([
  __param(0, IInstantiationService)
], EnableMcpDropDownAction);
let DisableMcpDropDownAction = class DisableMcpDropDownAction2 extends ButtonWithDropDownExtensionAction {
  static {
    __name(this, "DisableMcpDropDownAction");
  }
  constructor(instantiationService) {
    super("mcpServer.disable", McpServerAction.LABEL_ACTION_CLASS, [
      [
        instantiationService.createInstance(DisableMcpServerGloballyAction),
        instantiationService.createInstance(DisableMcpServerForWorkspaceAction)
      ]
    ]);
  }
};
DisableMcpDropDownAction = __decorate([
  __param(0, IInstantiationService)
], DisableMcpDropDownAction);
function getContextMenuActions(mcpServer, isEditorAction, instantiationService) {
  return instantiationService.invokeFunction((accessor) => {
    const workspaceService = accessor.get(IWorkspaceContextService);
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    const groups = [];
    const isInstalled = mcpServer.installState === 1;
    if (isInstalled) {
      groups.push([
        instantiationService.createInstance(StartServerAction)
      ]);
      groups.push([
        instantiationService.createInstance(StopServerAction),
        instantiationService.createInstance(RestartServerAction)
      ]);
      groups.push([
        instantiationService.createInstance(EnableMcpServerGloballyAction),
        instantiationService.createInstance(EnableMcpServerForWorkspaceAction),
        instantiationService.createInstance(DisableMcpServerGloballyAction),
        instantiationService.createInstance(DisableMcpServerForWorkspaceAction)
      ]);
      groups.push([
        instantiationService.createInstance(AuthServerAction)
      ]);
      groups.push([
        instantiationService.createInstance(ShowServerOutputAction),
        instantiationService.createInstance(ShowServerConfigurationAction),
        instantiationService.createInstance(ShowServerJsonConfigurationAction)
      ]);
      groups.push([
        instantiationService.createInstance(ConfigureModelAccessAction),
        instantiationService.createInstance(ShowSamplingRequestsAction)
      ]);
      groups.push([
        instantiationService.createInstance(BrowseResourcesAction)
      ]);
      if (!isEditorAction) {
        const installGroup = [instantiationService.createInstance(UninstallAction)];
        if (workspaceService.getWorkbenchState() !== 1) {
          installGroup.push(instantiationService.createInstance(InstallInWorkspaceAction, false));
        }
        if (environmentService.remoteAuthority && mcpServer.local?.scope !== "remoteUser") {
          installGroup.push(instantiationService.createInstance(InstallInRemoteAction, false));
        }
        groups.push(installGroup);
      }
    } else {
      const installGroup = [];
      if (workspaceService.getWorkbenchState() !== 1) {
        installGroup.push(instantiationService.createInstance(InstallInWorkspaceAction, !isEditorAction));
      }
      if (environmentService.remoteAuthority) {
        installGroup.push(instantiationService.createInstance(InstallInRemoteAction, !isEditorAction));
      }
      groups.push(installGroup);
    }
    groups.forEach((group) => group.forEach((extensionAction) => extensionAction.mcpServer = mcpServer));
    return groups;
  });
}
__name(getContextMenuActions, "getContextMenuActions");
let ManageMcpServerAction = class ManageMcpServerAction2 extends DropDownAction {
  static {
    __name(this, "ManageMcpServerAction");
  }
  static {
    ManageMcpServerAction_1 = this;
  }
  static {
    this.ID = "mcpServer.manage";
  }
  static {
    this.Class = `${McpServerAction.ICON_ACTION_CLASS} manage ` + ThemeIcon.asClassName(manageExtensionIcon);
  }
  static {
    this.HideManageExtensionClass = `${this.Class} hide`;
  }
  constructor(isEditorAction, instantiationService) {
    super(ManageMcpServerAction_1.ID, "", "", true, instantiationService);
    this.isEditorAction = isEditorAction;
    this.tooltip = localize("manage", "Manage");
    this.update();
  }
  async run() {
    return super.run(this.mcpServer ? getContextMenuActions(this.mcpServer, this.isEditorAction, this.instantiationService) : []);
  }
  update() {
    this.class = ManageMcpServerAction_1.HideManageExtensionClass;
    this.enabled = false;
    if (!this.mcpServer) {
      return;
    }
    if (this.isEditorAction) {
      this.enabled = true;
      this.class = ManageMcpServerAction_1.Class;
    } else {
      this.enabled = !!this.mcpServer.local;
      this.class = this.enabled ? ManageMcpServerAction_1.Class : ManageMcpServerAction_1.HideManageExtensionClass;
    }
  }
};
ManageMcpServerAction = ManageMcpServerAction_1 = __decorate([
  __param(1, IInstantiationService)
], ManageMcpServerAction);
let StartServerAction = class StartServerAction2 extends McpServerAction {
  static {
    __name(this, "StartServerAction");
  }
  static {
    StartServerAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent start`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpService) {
    super("extensions.start", localize("start", "Start Server"), StartServerAction_1.CLASS, false);
    this.mcpService = mcpService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = StartServerAction_1.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const serverState = server.connectionState.get();
    if (!McpConnectionState.canBeStarted(serverState.state)) {
      return;
    }
    this.class = StartServerAction_1.CLASS;
    this.enabled = true;
    this.label = localize("start", "Start Server");
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    await server.start({ promptType: "all-untrusted" });
    server.showOutput();
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};
StartServerAction = StartServerAction_1 = __decorate([
  __param(0, IMcpService)
], StartServerAction);
let StopServerAction = class StopServerAction2 extends McpServerAction {
  static {
    __name(this, "StopServerAction");
  }
  static {
    StopServerAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent stop`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpService) {
    super("extensions.stop", localize("stop", "Stop Server"), StopServerAction_1.CLASS, false);
    this.mcpService = mcpService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = StopServerAction_1.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const serverState = server.connectionState.get();
    if (McpConnectionState.canBeStarted(serverState.state)) {
      return;
    }
    this.class = StopServerAction_1.CLASS;
    this.enabled = true;
    this.label = localize("stop", "Stop Server");
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    await server.stop();
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};
StopServerAction = StopServerAction_1 = __decorate([
  __param(0, IMcpService)
], StopServerAction);
let RestartServerAction = class RestartServerAction2 extends McpServerAction {
  static {
    __name(this, "RestartServerAction");
  }
  static {
    RestartServerAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent restart`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpService) {
    super("extensions.restart", localize("restart", "Restart Server"), RestartServerAction_1.CLASS, false);
    this.mcpService = mcpService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = RestartServerAction_1.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const serverState = server.connectionState.get();
    if (McpConnectionState.canBeStarted(serverState.state)) {
      return;
    }
    this.class = RestartServerAction_1.CLASS;
    this.enabled = true;
    this.label = localize("restart", "Restart Server");
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    await server.stop();
    await server.start({ promptType: "all-untrusted" });
    server.showOutput();
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};
RestartServerAction = RestartServerAction_1 = __decorate([
  __param(0, IMcpService)
], RestartServerAction);
let AuthServerAction = class AuthServerAction2 extends McpServerAction {
  static {
    __name(this, "AuthServerAction");
  }
  static {
    AuthServerAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent account`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  static {
    this.SIGN_OUT = localize("mcp.signOut", "Sign Out");
  }
  static {
    this.DISCONNECT = localize("mcp.disconnect", "Disconnect Account");
  }
  constructor(mcpService, _authenticationQueryService, _authenticationService) {
    super("extensions.restart", localize("restart", "Restart Server"), RestartServerAction.CLASS, false);
    this.mcpService = mcpService;
    this._authenticationQueryService = _authenticationQueryService;
    this._authenticationService = _authenticationService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = AuthServerAction_1.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const accountQuery = this.getAccountQuery();
    if (!accountQuery) {
      return;
    }
    this._accountQuery = accountQuery;
    this.class = AuthServerAction_1.CLASS;
    this.enabled = true;
    let label = accountQuery.entities().getEntityCount().total > 1 ? AuthServerAction_1.DISCONNECT : AuthServerAction_1.SIGN_OUT;
    label += ` (${accountQuery.accountName})`;
    this.label = label;
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    const accountQuery = this.getAccountQuery();
    if (!accountQuery) {
      return;
    }
    await server.stop();
    const { providerId, accountName } = accountQuery;
    accountQuery.mcpServer(server.definition.id).setAccessAllowed(false, server.definition.label);
    if (this.label === AuthServerAction_1.SIGN_OUT) {
      const accounts = await this._authenticationService.getAccounts(providerId);
      const account = accounts.find((a) => a.label === accountName);
      if (account) {
        const sessions = await this._authenticationService.getSessions(providerId, void 0, { account });
        for (const session of sessions) {
          await this._authenticationService.removeSession(providerId, session.id);
        }
      }
    }
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
  getAccountQuery() {
    const server = this.getServer();
    if (!server) {
      return void 0;
    }
    if (this._accountQuery) {
      return this._accountQuery;
    }
    const serverId = server.definition.id;
    const preferences = this._authenticationQueryService.mcpServer(serverId).getAllAccountPreferences();
    if (!preferences.size) {
      return void 0;
    }
    for (const [providerId, accountName] of preferences) {
      const accountQuery = this._authenticationQueryService.provider(providerId).account(accountName);
      if (!accountQuery.mcpServer(serverId).isAccessAllowed()) {
        continue;
      }
      return accountQuery;
    }
    return void 0;
  }
};
AuthServerAction = AuthServerAction_1 = __decorate([
  __param(0, IMcpService),
  __param(1, IAuthenticationQueryService),
  __param(2, IAuthenticationService)
], AuthServerAction);
let ShowServerOutputAction = class ShowServerOutputAction2 extends McpServerAction {
  static {
    __name(this, "ShowServerOutputAction");
  }
  static {
    ShowServerOutputAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent output`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpService) {
    super("extensions.output", localize("output", "Show Output"), ShowServerOutputAction_1.CLASS, false);
    this.mcpService = mcpService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = ShowServerOutputAction_1.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    this.class = ShowServerOutputAction_1.CLASS;
    this.enabled = true;
    this.label = localize("output", "Show Output");
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    server.showOutput();
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};
ShowServerOutputAction = ShowServerOutputAction_1 = __decorate([
  __param(0, IMcpService)
], ShowServerOutputAction);
let ShowServerConfigurationAction = class ShowServerConfigurationAction2 extends McpServerAction {
  static {
    __name(this, "ShowServerConfigurationAction");
  }
  static {
    ShowServerConfigurationAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpWorkbenchService) {
    super("extensions.config", localize("config", "Show Configuration"), ShowServerConfigurationAction_1.CLASS, false);
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = ShowServerConfigurationAction_1.HIDE;
    if (!this.mcpServer?.local) {
      return;
    }
    this.class = ShowServerConfigurationAction_1.CLASS;
    this.enabled = true;
  }
  async run() {
    if (!this.mcpServer?.local) {
      return;
    }
    this.mcpWorkbenchService.open(this.mcpServer, {
      tab: "configuration"
      /* McpServerEditorTab.Configuration */
    });
  }
};
ShowServerConfigurationAction = ShowServerConfigurationAction_1 = __decorate([
  __param(0, IMcpWorkbenchService)
], ShowServerConfigurationAction);
let ShowServerJsonConfigurationAction = class ShowServerJsonConfigurationAction2 extends McpServerAction {
  static {
    __name(this, "ShowServerJsonConfigurationAction");
  }
  static {
    ShowServerJsonConfigurationAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpService, mcpRegistry, editorService) {
    super("extensions.jsonConfig", localize("configJson", "Show Configuration (JSON)"), ShowServerJsonConfigurationAction_1.CLASS, false);
    this.mcpService = mcpService;
    this.mcpRegistry = mcpRegistry;
    this.editorService = editorService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = ShowServerJsonConfigurationAction_1.HIDE;
    const configurationTarget = this.getConfigurationTarget();
    if (!configurationTarget) {
      return;
    }
    this.class = ShowServerConfigurationAction.CLASS;
    this.enabled = true;
  }
  async run() {
    const configurationTarget = this.getConfigurationTarget();
    if (!configurationTarget) {
      return;
    }
    this.editorService.openEditor({
      resource: URI.isUri(configurationTarget) ? configurationTarget : configurationTarget.uri,
      options: { selection: URI.isUri(configurationTarget) ? void 0 : configurationTarget.range }
    });
  }
  getConfigurationTarget() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.label === this.mcpServer?.name);
    if (!server) {
      return;
    }
    const collection = this.mcpRegistry.collections.get().find((c) => c.id === server.collection.id);
    const serverDefinition = collection?.serverDefinitions.get().find((s) => s.id === server.definition.id);
    return serverDefinition?.presentation?.origin || collection?.presentation?.origin;
  }
};
ShowServerJsonConfigurationAction = ShowServerJsonConfigurationAction_1 = __decorate([
  __param(0, IMcpService),
  __param(1, IMcpRegistry),
  __param(2, IEditorService)
], ShowServerJsonConfigurationAction);
let ConfigureModelAccessAction = class ConfigureModelAccessAction2 extends McpServerAction {
  static {
    __name(this, "ConfigureModelAccessAction");
  }
  static {
    ConfigureModelAccessAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpService, commandService) {
    super("extensions.config", localize("mcp.configAccess", "Configure Model Access"), ConfigureModelAccessAction_1.CLASS, false);
    this.mcpService = mcpService;
    this.commandService = commandService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = ConfigureModelAccessAction_1.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    this.class = ConfigureModelAccessAction_1.CLASS;
    this.enabled = true;
    this.label = localize("mcp.configAccess", "Configure Model Access");
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    this.commandService.executeCommand("workbench.mcp.configureSamplingModels", server);
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};
ConfigureModelAccessAction = ConfigureModelAccessAction_1 = __decorate([
  __param(0, IMcpService),
  __param(1, ICommandService)
], ConfigureModelAccessAction);
let ShowSamplingRequestsAction = class ShowSamplingRequestsAction2 extends McpServerAction {
  static {
    __name(this, "ShowSamplingRequestsAction");
  }
  static {
    ShowSamplingRequestsAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpService, samplingService, editorService) {
    super("extensions.config", localize("mcp.samplingLog", "Show Sampling Requests"), ShowSamplingRequestsAction_1.CLASS, false);
    this.mcpService = mcpService;
    this.samplingService = samplingService;
    this.editorService = editorService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = ShowSamplingRequestsAction_1.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    if (!this.samplingService.hasLogs(server)) {
      return;
    }
    this.class = ShowSamplingRequestsAction_1.CLASS;
    this.enabled = true;
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    if (!this.samplingService.hasLogs(server)) {
      return;
    }
    this.editorService.openEditor({
      resource: void 0,
      contents: this.samplingService.getLogText(server),
      label: localize("mcp.samplingLog.title", "MCP Sampling: {0}", server.definition.label)
    });
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};
ShowSamplingRequestsAction = ShowSamplingRequestsAction_1 = __decorate([
  __param(0, IMcpService),
  __param(1, IMcpSamplingService),
  __param(2, IEditorService)
], ShowSamplingRequestsAction);
let BrowseResourcesAction = class BrowseResourcesAction2 extends McpServerAction {
  static {
    __name(this, "BrowseResourcesAction");
  }
  static {
    BrowseResourcesAction_1 = this;
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  constructor(mcpService, commandService) {
    super("extensions.config", localize("mcp.resources", "Browse Resources"), BrowseResourcesAction_1.CLASS, false);
    this.mcpService = mcpService;
    this.commandService = commandService;
    this.update();
  }
  update() {
    this.enabled = false;
    this.class = BrowseResourcesAction_1.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const capabilities = server.capabilities.get();
    if (capabilities !== void 0 && !(capabilities & 16)) {
      return;
    }
    this.class = BrowseResourcesAction_1.CLASS;
    this.enabled = true;
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    const capabilities = server.capabilities.get();
    if (capabilities !== void 0 && !(capabilities & 16)) {
      return;
    }
    return this.commandService.executeCommand("workbench.mcp.browseResources", server);
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};
BrowseResourcesAction = BrowseResourcesAction_1 = __decorate([
  __param(0, IMcpService),
  __param(1, ICommandService)
], BrowseResourcesAction);
let McpServerStatusAction = class McpServerStatusAction2 extends McpServerAction {
  static {
    __name(this, "McpServerStatusAction");
  }
  static {
    McpServerStatusAction_1 = this;
  }
  static {
    this.CLASS = `${McpServerAction.ICON_ACTION_CLASS} extension-status`;
  }
  get status() {
    return this._status;
  }
  constructor(mcpWorkbenchService, commandService) {
    super("extensions.status", "", `${McpServerStatusAction_1.CLASS} hide`, false);
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.commandService = commandService;
    this._status = [];
    this._onDidChangeStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangeStatus.event;
    this.update();
  }
  update() {
    this.computeAndUpdateStatus();
  }
  computeAndUpdateStatus() {
    this.updateStatus(void 0, true);
    this.enabled = false;
    if (!this.mcpServer) {
      return;
    }
    if ((this.mcpServer.gallery || this.mcpServer.installable) && this.mcpServer.installState === 3) {
      const result = this.mcpWorkbenchService.canInstall(this.mcpServer);
      if (result !== true) {
        this.updateStatus({ icon: warningIcon, message: result }, true);
        return;
      }
    }
    const runtimeState = this.mcpServer.runtimeStatus;
    if (runtimeState?.message) {
      this.updateStatus({ icon: runtimeState.message.severity === Severity.Warning ? warningIcon : runtimeState.message.severity === Severity.Error ? errorIcon : infoIcon, message: runtimeState.message.text }, true);
    }
  }
  updateStatus(status, updateClass) {
    if (status) {
      if (this._status.some((s) => s.message.value === status.message.value && s.icon?.id === status.icon?.id)) {
        return;
      }
    } else {
      if (this._status.length === 0) {
        return;
      }
      this._status = [];
    }
    if (status) {
      this._status.push(status);
      this._status.sort((a, b) => b.icon === trustIcon ? -1 : a.icon === trustIcon ? 1 : b.icon === errorIcon ? -1 : a.icon === errorIcon ? 1 : b.icon === warningIcon ? -1 : a.icon === warningIcon ? 1 : b.icon === infoIcon ? -1 : a.icon === infoIcon ? 1 : 0);
    }
    if (updateClass) {
      if (status?.icon === errorIcon) {
        this.class = `${McpServerStatusAction_1.CLASS} extension-status-error ${ThemeIcon.asClassName(errorIcon)}`;
      } else if (status?.icon === warningIcon) {
        this.class = `${McpServerStatusAction_1.CLASS} extension-status-warning ${ThemeIcon.asClassName(warningIcon)}`;
      } else if (status?.icon === infoIcon) {
        this.class = `${McpServerStatusAction_1.CLASS} extension-status-info ${ThemeIcon.asClassName(infoIcon)}`;
      } else if (status?.icon === trustIcon) {
        this.class = `${McpServerStatusAction_1.CLASS} ${ThemeIcon.asClassName(trustIcon)}`;
      } else {
        this.class = `${McpServerStatusAction_1.CLASS} hide`;
      }
    }
    this._onDidChangeStatus.fire();
  }
  async run() {
    if (this._status[0]?.icon === trustIcon) {
      return this.commandService.executeCommand("workbench.trust.manage");
    }
  }
};
McpServerStatusAction = McpServerStatusAction_1 = __decorate([
  __param(0, IMcpWorkbenchService),
  __param(1, ICommandService)
], McpServerStatusAction);
export {
  AuthServerAction,
  BrowseResourcesAction,
  ButtonWithDropDownExtensionAction,
  ButtonWithDropdownExtensionActionViewItem,
  ConfigureModelAccessAction,
  DisableMcpDropDownAction,
  DisableMcpServerForWorkspaceAction,
  DisableMcpServerGloballyAction,
  DropDownAction,
  DropDownExtensionActionViewItem,
  EnableMcpDropDownAction,
  EnableMcpServerForWorkspaceAction,
  EnableMcpServerGloballyAction,
  InstallAction,
  InstallInRemoteAction,
  InstallInWorkspaceAction,
  InstallingLabelAction,
  ManageMcpServerAction,
  McpServerAction,
  McpServerStatusAction,
  RestartServerAction,
  ShowSamplingRequestsAction,
  ShowServerConfigurationAction,
  ShowServerJsonConfigurationAction,
  ShowServerOutputAction,
  StartServerAction,
  StopServerAction,
  UninstallAction,
  getContextMenuActions
};
//# sourceMappingURL=mcpServerActions.js.map
