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
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { isDefined } from "../../../../base/common/types.js";
import { localize } from "../../../../nls.js";
import { ConfigurationTarget, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from "../../../common/contributions.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { EnablementState } from "../../../services/extensionManagement/common/extensionManagement.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
let DeprecatedExtensionMigratorContribution = class {
  constructor(configurationService, extensionsWorkbenchService, storageService, notificationService, openerService) {
    this.configurationService = configurationService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.storageService = storageService;
    this.notificationService = notificationService;
    this.openerService = openerService;
    this.init().catch(onUnexpectedError);
  }
  static {
    __name(this, "DeprecatedExtensionMigratorContribution");
  }
  async init() {
    const bracketPairColorizerId = "coenraads.bracket-pair-colorizer";
    await this.extensionsWorkbenchService.queryLocal();
    const extension = this.extensionsWorkbenchService.installed.find((e) => e.identifier.id === bracketPairColorizerId);
    if (!extension || extension.enablementState !== EnablementState.EnabledGlobally && extension.enablementState !== EnablementState.EnabledWorkspace) {
      return;
    }
    const state = await this.getState();
    const disablementLogEntry = state.disablementLog.some((d) => d.extensionId === bracketPairColorizerId);
    if (disablementLogEntry) {
      return;
    }
    state.disablementLog.push({ extensionId: bracketPairColorizerId, disablementDateTime: (/* @__PURE__ */ new Date()).getTime() });
    await this.setState(state);
    await this.extensionsWorkbenchService.setEnablement(extension, EnablementState.DisabledGlobally);
    const nativeBracketPairColorizationEnabledKey = "editor.bracketPairColorization.enabled";
    const bracketPairColorizationEnabled = !!this.configurationService.inspect(nativeBracketPairColorizationEnabledKey).user;
    this.notificationService.notify({
      message: localize("bracketPairColorizer.notification", "The extension 'Bracket pair Colorizer' got disabled because it was deprecated."),
      severity: Severity.Info,
      actions: {
        primary: [
          new Action("", localize("bracketPairColorizer.notification.action.uninstall", "Uninstall Extension"), void 0, void 0, () => {
            this.extensionsWorkbenchService.uninstall(extension);
          })
        ],
        secondary: [
          !bracketPairColorizationEnabled ? new Action("", localize("bracketPairColorizer.notification.action.enableNative", "Enable Native Bracket Pair Colorization"), void 0, void 0, () => {
            this.configurationService.updateValue(nativeBracketPairColorizationEnabledKey, true, ConfigurationTarget.USER);
          }) : void 0,
          new Action("", localize("bracketPairColorizer.notification.action.showMoreInfo", "More Info"), void 0, void 0, () => {
            this.openerService.open("https://github.com/microsoft/vscode/issues/155179");
          })
        ].filter(isDefined)
      }
    });
  }
  storageKey = "deprecatedExtensionMigrator.state";
  async getState() {
    const jsonStr = await this.storageService.get(this.storageKey, StorageScope.APPLICATION, "");
    if (jsonStr === "") {
      return { disablementLog: [] };
    }
    return JSON.parse(jsonStr);
  }
  async setState(state) {
    const json = JSON.stringify(state);
    await this.storageService.store(this.storageKey, json, StorageScope.APPLICATION, StorageTarget.USER);
  }
};
DeprecatedExtensionMigratorContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IExtensionsWorkbenchService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IOpenerService)
], DeprecatedExtensionMigratorContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(DeprecatedExtensionMigratorContribution, LifecyclePhase.Restored);
//# sourceMappingURL=deprecatedExtensionMigrator.contribution.js.map
