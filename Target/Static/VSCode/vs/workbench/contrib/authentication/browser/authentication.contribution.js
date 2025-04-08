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
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { MenuId, MenuRegistry, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IExtensionManifest } from "../../../../platform/extensions/common/extensions.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { SignOutOfAccountAction } from "./actions/signOutOfAccountAction.js";
import { IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { Extensions, IExtensionFeatureTableRenderer, IExtensionFeaturesRegistry, IRenderedData, IRowData, ITableData } from "../../../services/extensionManagement/common/extensionFeatures.js";
import { ManageTrustedExtensionsForAccountAction } from "./actions/manageTrustedExtensionsForAccountAction.js";
import { ManageAccountPreferencesForExtensionAction } from "./actions/manageAccountPreferencesForExtensionAction.js";
import { IAuthenticationUsageService } from "../../../services/authentication/browser/authenticationUsageService.js";
const codeExchangeProxyCommand = CommandsRegistry.registerCommand("workbench.getCodeExchangeProxyEndpoints", function(accessor, _) {
  const environmentService = accessor.get(IBrowserWorkbenchEnvironmentService);
  return environmentService.options?.codeExchangeProxyEndpoints;
});
class AuthenticationDataRenderer extends Disposable {
  static {
    __name(this, "AuthenticationDataRenderer");
  }
  type = "table";
  shouldRender(manifest) {
    return !!manifest.contributes?.authentication;
  }
  render(manifest) {
    const authentication = manifest.contributes?.authentication || [];
    if (!authentication.length) {
      return { data: { headers: [], rows: [] }, dispose: /* @__PURE__ */ __name(() => {
      }, "dispose") };
    }
    const headers = [
      localize("authenticationlabel", "Label"),
      localize("authenticationid", "ID")
    ];
    const rows = authentication.sort((a, b) => a.label.localeCompare(b.label)).map((auth) => {
      return [
        auth.label,
        auth.id
      ];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: /* @__PURE__ */ __name(() => {
      }, "dispose")
    };
  }
}
const extensionFeature = Registry.as(Extensions.ExtensionFeaturesRegistry).registerExtensionFeature({
  id: "authentication",
  label: localize("authentication", "Authentication"),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(AuthenticationDataRenderer)
});
let AuthenticationContribution = class extends Disposable {
  constructor(_authenticationService) {
    super();
    this._authenticationService = _authenticationService;
    this._register(codeExchangeProxyCommand);
    this._register(extensionFeature);
    if (_authenticationService.getProviderIds().length) {
      this._clearPlaceholderMenuItem();
    }
    this._registerHandlers();
    this._registerActions();
  }
  static {
    __name(this, "AuthenticationContribution");
  }
  static ID = "workbench.contrib.authentication";
  _placeholderMenuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
    command: {
      id: "noAuthenticationProviders",
      title: localize("authentication.Placeholder", "No accounts requested yet..."),
      precondition: ContextKeyExpr.false()
    }
  });
  _registerHandlers() {
    this._register(this._authenticationService.onDidRegisterAuthenticationProvider((_e) => {
      this._clearPlaceholderMenuItem();
    }));
    this._register(this._authenticationService.onDidUnregisterAuthenticationProvider((_e) => {
      if (!this._authenticationService.getProviderIds().length) {
        this._placeholderMenuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
          command: {
            id: "noAuthenticationProviders",
            title: localize("loading", "Loading..."),
            precondition: ContextKeyExpr.false()
          }
        });
      }
    }));
  }
  _registerActions() {
    this._register(registerAction2(SignOutOfAccountAction));
    this._register(registerAction2(ManageTrustedExtensionsForAccountAction));
    this._register(registerAction2(ManageAccountPreferencesForExtensionAction));
  }
  _clearPlaceholderMenuItem() {
    this._placeholderMenuItem?.dispose();
    this._placeholderMenuItem = void 0;
  }
};
AuthenticationContribution = __decorateClass([
  __decorateParam(0, IAuthenticationService)
], AuthenticationContribution);
let AuthenticationUsageContribution = class {
  constructor(_authenticationUsageService) {
    this._authenticationUsageService = _authenticationUsageService;
    this._initializeExtensionUsageCache();
  }
  static {
    __name(this, "AuthenticationUsageContribution");
  }
  static ID = "workbench.contrib.authenticationUsage";
  async _initializeExtensionUsageCache() {
    await this._authenticationUsageService.initializeExtensionUsageCache();
  }
};
AuthenticationUsageContribution = __decorateClass([
  __decorateParam(0, IAuthenticationUsageService)
], AuthenticationUsageContribution);
registerWorkbenchContribution2(AuthenticationContribution.ID, AuthenticationContribution, WorkbenchPhase.AfterRestored);
registerWorkbenchContribution2(AuthenticationUsageContribution.ID, AuthenticationUsageContribution, WorkbenchPhase.Eventually);
//# sourceMappingURL=authentication.contribution.js.map
