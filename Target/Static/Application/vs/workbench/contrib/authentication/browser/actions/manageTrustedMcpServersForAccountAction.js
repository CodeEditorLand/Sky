var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../../base/common/codicons.js";
import { fromNow } from "../../../../../base/common/date.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Action2 } from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IAuthenticationMcpAccessService } from "../../../../services/authentication/browser/authenticationMcpAccessService.js";
import { IAuthenticationMcpUsageService } from "../../../../services/authentication/browser/authenticationMcpUsageService.js";
import { IAuthenticationService } from "../../../../services/authentication/common/authentication.js";
import { IMcpService } from "../../../mcp/common/mcpTypes.js";
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
class ManageTrustedMcpServersForAccountAction extends Action2 {
  static {
    __name(this, "ManageTrustedMcpServersForAccountAction");
  }
  constructor() {
    super({
      id: "_manageTrustedMCPServersForAccount",
      title: localize2("manageTrustedMcpServersForAccount", "Manage Trusted MCP Servers For Account"),
      category: localize2("accounts", "Accounts"),
      f1: true
    });
  }
  run(accessor, options) {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(ManageTrustedMcpServersForAccountActionImpl).run(options);
  }
}
let ManageTrustedMcpServersForAccountActionImpl = class ManageTrustedMcpServersForAccountActionImpl2 {
  static {
    __name(this, "ManageTrustedMcpServersForAccountActionImpl");
  }
  constructor(_productService, _mcpServerService, _dialogService, _quickInputService, _mcpServerAuthenticationService, _mcpServerAuthenticationUsageService, _mcpServerAuthenticationAccessService, _commandService) {
    this._productService = _productService;
    this._mcpServerService = _mcpServerService;
    this._dialogService = _dialogService;
    this._quickInputService = _quickInputService;
    this._mcpServerAuthenticationService = _mcpServerAuthenticationService;
    this._mcpServerAuthenticationUsageService = _mcpServerAuthenticationUsageService;
    this._mcpServerAuthenticationAccessService = _mcpServerAuthenticationAccessService;
    this._commandService = _commandService;
  }
  async run(options) {
    const { providerId, accountLabel } = await this._resolveProviderAndAccountLabel(options?.providerId, options?.accountLabel);
    if (!providerId || !accountLabel) {
      return;
    }
    const items = await this._getItems(providerId, accountLabel);
    if (!items.length) {
      return;
    }
    const disposables = new DisposableStore();
    const picker = this._createQuickPick(disposables, providerId, accountLabel);
    picker.items = items;
    picker.selectedItems = items.filter((i) => i.type !== "separator" && !!i.picked);
    picker.show();
  }
  async _resolveProviderAndAccountLabel(providerId, accountLabel) {
    if (!providerId || !accountLabel) {
      const accounts = new Array();
      for (const id of this._mcpServerAuthenticationService.getProviderIds()) {
        const providerLabel = this._mcpServerAuthenticationService.getProvider(id).label;
        const sessions = await this._mcpServerAuthenticationService.getSessions(id);
        const uniqueAccountLabels = /* @__PURE__ */ new Set();
        for (const session of sessions) {
          if (!uniqueAccountLabels.has(session.account.label)) {
            uniqueAccountLabels.add(session.account.label);
            accounts.push({ providerId: id, providerLabel, accountLabel: session.account.label });
          }
        }
      }
      const pick = await this._quickInputService.pick(accounts.map((account) => ({
        providerId: account.providerId,
        label: account.accountLabel,
        description: account.providerLabel
      })), {
        placeHolder: localize("pickAccount", "Pick an account to manage trusted MCP servers for"),
        matchOnDescription: true
      });
      if (pick) {
        providerId = pick.providerId;
        accountLabel = pick.label;
      } else {
        return { providerId: void 0, accountLabel: void 0 };
      }
    }
    return { providerId, accountLabel };
  }
  async _getItems(providerId, accountLabel) {
    let allowedMcpServers = this._mcpServerAuthenticationAccessService.readAllowedMcpServers(providerId, accountLabel);
    const resolvedMcpServers = await Promise.all(allowedMcpServers.map((server) => this._mcpServerService.servers.get().find((s) => s.definition.id === server.id)));
    allowedMcpServers = resolvedMcpServers.map((server, i) => server ? allowedMcpServers[i] : void 0).filter((server) => !!server);
    const trustedMcpServerAuthAccess = this._productService.trustedMcpAuthAccess;
    const trustedMcpServerIds = (
      // Case 1: trustedMcpServerAuthAccess is an array
      Array.isArray(trustedMcpServerAuthAccess) ? trustedMcpServerAuthAccess : typeof trustedMcpServerAuthAccess === "object" ? trustedMcpServerAuthAccess[providerId] ?? [] : []
    );
    for (const mcpServerId of trustedMcpServerIds) {
      const allowedMcpServer = allowedMcpServers.find((server) => server.id === mcpServerId);
      if (!allowedMcpServer) {
        const mcpServer = this._mcpServerService.servers.get().find((s) => s.definition.id === mcpServerId);
        if (mcpServer) {
          allowedMcpServers.push({
            id: mcpServerId,
            name: mcpServer.definition.label,
            allowed: true,
            trusted: true
          });
        }
      } else {
        allowedMcpServer.allowed = true;
        allowedMcpServer.trusted = true;
      }
    }
    if (!allowedMcpServers.length) {
      this._dialogService.info(localize("noTrustedMcpServers", "This account has not been used by any MCP servers."));
      return [];
    }
    const usages = this._mcpServerAuthenticationUsageService.readAccountUsages(providerId, accountLabel);
    const trustedMcpServers = [];
    const otherMcpServers = [];
    for (const mcpServer of allowedMcpServers) {
      const usage = usages.find((usage2) => mcpServer.id === usage2.mcpServerId);
      mcpServer.lastUsed = usage?.lastUsed;
      if (mcpServer.trusted) {
        trustedMcpServers.push(mcpServer);
      } else {
        otherMcpServers.push(mcpServer);
      }
    }
    const sortByLastUsed = /* @__PURE__ */ __name((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0), "sortByLastUsed");
    const items = [
      ...otherMcpServers.sort(sortByLastUsed).map(this._toQuickPickItem),
      { type: "separator", label: localize("trustedMcpServers", "Trusted by Microsoft") },
      ...trustedMcpServers.sort(sortByLastUsed).map(this._toQuickPickItem)
    ];
    return items;
  }
  _toQuickPickItem(mcpServer) {
    const lastUsed = mcpServer.lastUsed;
    const description = lastUsed ? localize({ key: "accountLastUsedDate", comment: ['The placeholder {0} is a string with time information, such as "3 days ago"'] }, "Last used this account {0}", fromNow(lastUsed, true)) : localize("notUsed", "Has not used this account");
    let tooltip;
    let disabled;
    if (mcpServer.trusted) {
      tooltip = localize("trustedMcpServerTooltip", "This MCP server is trusted by Microsoft and\nalways has access to this account");
      disabled = true;
    }
    return {
      label: mcpServer.name,
      mcpServer,
      description,
      tooltip,
      disabled,
      buttons: [{
        tooltip: localize("accountPreferences", "Manage account preferences for this MCP server"),
        iconClass: ThemeIcon.asClassName(Codicon.settingsGear)
      }],
      picked: mcpServer.allowed === void 0 || mcpServer.allowed
    };
  }
  _createQuickPick(disposableStore, providerId, accountLabel) {
    const quickPick = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    quickPick.canSelectMany = true;
    quickPick.customButton = true;
    quickPick.customLabel = localize("manageTrustedMcpServers.cancel", "Cancel");
    quickPick.title = localize("manageTrustedMcpServers", "Manage Trusted MCP Servers");
    quickPick.placeholder = localize("manageMcpServers", "Choose which MCP servers can access this account");
    disposableStore.add(quickPick.onDidAccept(() => {
      const updatedAllowedList = quickPick.items.filter((item) => item.type !== "separator").map((i) => i.mcpServer);
      const allowedMcpServersSet = new Set(quickPick.selectedItems.map((i) => i.mcpServer));
      updatedAllowedList.forEach((mcpServer) => {
        mcpServer.allowed = allowedMcpServersSet.has(mcpServer);
      });
      this._mcpServerAuthenticationAccessService.updateAllowedMcpServers(providerId, accountLabel, updatedAllowedList);
      quickPick.hide();
    }));
    disposableStore.add(quickPick.onDidHide(() => {
      disposableStore.dispose();
    }));
    disposableStore.add(quickPick.onDidCustom(() => {
      quickPick.hide();
    }));
    disposableStore.add(quickPick.onDidTriggerItemButton((e) => this._commandService.executeCommand("_manageAccountPreferencesForMcpServer", e.item.mcpServer.id, providerId)));
    return quickPick;
  }
};
ManageTrustedMcpServersForAccountActionImpl = __decorate([
  __param(0, IProductService),
  __param(1, IMcpService),
  __param(2, IDialogService),
  __param(3, IQuickInputService),
  __param(4, IAuthenticationService),
  __param(5, IAuthenticationMcpUsageService),
  __param(6, IAuthenticationMcpAccessService),
  __param(7, ICommandService)
], ManageTrustedMcpServersForAccountActionImpl);
export {
  ManageTrustedMcpServersForAccountAction
};
//# sourceMappingURL=manageTrustedMcpServersForAccountAction.js.map
