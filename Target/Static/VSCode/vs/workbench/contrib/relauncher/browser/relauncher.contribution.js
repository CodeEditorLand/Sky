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
import { IDisposable, dispose, Disposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { IWorkbenchContributionsRegistry, IWorkbenchContribution, Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IWindowsConfiguration, IWindowSettings, TitleBarSetting, TitlebarStyle } from "../../../../platform/window/common/window.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { ConfigurationTarget, IConfigurationChangeEvent, IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { localize } from "../../../../nls.js";
import { IWorkspaceContextService, WorkbenchState } from "../../../../platform/workspace/common/workspace.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { URI } from "../../../../base/common/uri.js";
import { isEqual } from "../../../../base/common/resources.js";
import { isMacintosh, isNative, isLinux } from "../../../../base/common/platform.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IUserDataSyncEnablementService, IUserDataSyncService, SyncStatus } from "../../../../platform/userDataSync/common/userDataSync.js";
import { IUserDataSyncWorkbenchService } from "../../../services/userDataSync/common/userDataSync.js";
import { ChatConfiguration } from "../../chat/common/constants.js";
let SettingsChangeRelauncher = class extends Disposable {
  constructor(hostService, configurationService, userDataSyncService, userDataSyncEnablementService, userDataSyncWorkbenchService, productService, dialogService) {
    super();
    this.hostService = hostService;
    this.configurationService = configurationService;
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.productService = productService;
    this.dialogService = dialogService;
    this.update(false);
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationChange(e)));
    this._register(userDataSyncWorkbenchService.onDidTurnOnSync((e) => this.update(true)));
  }
  static {
    __name(this, "SettingsChangeRelauncher");
  }
  static SETTINGS = [
    TitleBarSetting.TITLE_BAR_STYLE,
    "window.nativeTabs",
    "window.nativeFullScreen",
    "window.clickThroughInactive",
    "window.controlsStyle",
    "update.mode",
    "editor.accessibilitySupport",
    "security.workspace.trust.enabled",
    "workbench.enableExperiments",
    "_extensionsGallery.enablePPE",
    "security.restrictUNCAccess",
    "accessibility.verbosity.debug",
    ChatConfiguration.UseFileStorage,
    "telemetry.feedback.enabled"
  ];
  titleBarStyle = new ChangeObserver("string");
  nativeTabs = new ChangeObserver("boolean");
  nativeFullScreen = new ChangeObserver("boolean");
  clickThroughInactive = new ChangeObserver("boolean");
  controlsStyle = new ChangeObserver("string");
  updateMode = new ChangeObserver("string");
  accessibilitySupport;
  workspaceTrustEnabled = new ChangeObserver("boolean");
  experimentsEnabled = new ChangeObserver("boolean");
  enablePPEExtensionsGallery = new ChangeObserver("boolean");
  restrictUNCAccess = new ChangeObserver("boolean");
  accessibilityVerbosityDebug = new ChangeObserver("boolean");
  useFileStorage = new ChangeObserver("boolean");
  telemetryFeedbackEnabled = new ChangeObserver("boolean");
  onConfigurationChange(e) {
    if (e && !SettingsChangeRelauncher.SETTINGS.some((key) => e.affectsConfiguration(key))) {
      return;
    }
    if (this.isTurningOnSyncInProgress()) {
      return;
    }
    this.update(
      e.source !== ConfigurationTarget.DEFAULT
      /* do not ask to relaunch if defaults changed */
    );
  }
  isTurningOnSyncInProgress() {
    return !this.userDataSyncEnablementService.isEnabled() && this.userDataSyncService.status === SyncStatus.Syncing;
  }
  update(askToRelaunch) {
    let changed = false;
    function processChanged(didChange) {
      changed = changed || didChange;
    }
    __name(processChanged, "processChanged");
    const config = this.configurationService.getValue();
    if (isNative) {
      processChanged((config.window.titleBarStyle === TitlebarStyle.NATIVE || config.window.titleBarStyle === TitlebarStyle.CUSTOM) && this.titleBarStyle.handleChange(config.window?.titleBarStyle));
      processChanged(isMacintosh && this.nativeTabs.handleChange(config.window?.nativeTabs));
      processChanged(isMacintosh && this.nativeFullScreen.handleChange(config.window?.nativeFullScreen));
      processChanged(isMacintosh && this.clickThroughInactive.handleChange(config.window?.clickThroughInactive));
      processChanged(!isMacintosh && this.controlsStyle.handleChange(config.window?.controlsStyle));
      processChanged(this.updateMode.handleChange(config.update?.mode));
      if (isLinux && typeof config.editor?.accessibilitySupport === "string" && config.editor.accessibilitySupport !== this.accessibilitySupport) {
        this.accessibilitySupport = config.editor.accessibilitySupport;
        if (this.accessibilitySupport === "on") {
          changed = true;
        }
      }
      processChanged(this.workspaceTrustEnabled.handleChange(config?.security?.workspace?.trust?.enabled));
      processChanged(this.restrictUNCAccess.handleChange(config?.security?.restrictUNCAccess));
      processChanged(this.accessibilityVerbosityDebug.handleChange(config?.accessibility?.verbosity?.debug));
      processChanged(this.useFileStorage.handleChange(config.chat?.useFileStorage));
    }
    processChanged(this.experimentsEnabled.handleChange(config.workbench?.enableExperiments));
    processChanged(this.productService.quality !== "stable" && this.enablePPEExtensionsGallery.handleChange(config._extensionsGallery?.enablePPE));
    processChanged(this.telemetryFeedbackEnabled.handleChange(config.telemetry?.feedback?.enabled));
    if (askToRelaunch && changed && this.hostService.hasFocus) {
      this.doConfirm(
        isNative ? localize("relaunchSettingMessage", "A setting has changed that requires a restart to take effect.") : localize("relaunchSettingMessageWeb", "A setting has changed that requires a reload to take effect."),
        isNative ? localize("relaunchSettingDetail", "Press the restart button to restart {0} and enable the setting.", this.productService.nameLong) : localize("relaunchSettingDetailWeb", "Press the reload button to reload {0} and enable the setting.", this.productService.nameLong),
        isNative ? localize({ key: "restart", comment: ["&& denotes a mnemonic"] }, "&&Restart") : localize({ key: "restartWeb", comment: ["&& denotes a mnemonic"] }, "&&Reload"),
        () => this.hostService.restart()
      );
    }
  }
  async doConfirm(message, detail, primaryButton, confirmedFn) {
    const { confirmed } = await this.dialogService.confirm({ message, detail, primaryButton });
    if (confirmed) {
      confirmedFn();
    }
  }
};
SettingsChangeRelauncher = __decorateClass([
  __decorateParam(0, IHostService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IUserDataSyncService),
  __decorateParam(3, IUserDataSyncEnablementService),
  __decorateParam(4, IUserDataSyncWorkbenchService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IDialogService)
], SettingsChangeRelauncher);
class ChangeObserver {
  constructor(typeName) {
    this.typeName = typeName;
  }
  static {
    __name(this, "ChangeObserver");
  }
  static create(typeName) {
    return new ChangeObserver(typeName);
  }
  lastValue = void 0;
  /**
   * Returns if there was a change compared to the last value
   */
  handleChange(value) {
    if (typeof value === this.typeName && value !== this.lastValue) {
      this.lastValue = value;
      return true;
    }
    return false;
  }
}
let WorkspaceChangeExtHostRelauncher = class extends Disposable {
  constructor(contextService, extensionService, hostService, environmentService) {
    super();
    this.contextService = contextService;
    this.extensionHostRestarter = this._register(new RunOnceScheduler(async () => {
      if (!!environmentService.extensionTestsLocationURI) {
        return;
      }
      if (environmentService.remoteAuthority) {
        hostService.reload();
      } else if (isNative) {
        const stopped = await extensionService.stopExtensionHosts(localize("restartExtensionHost.reason", "Changing workspace folders"));
        if (stopped) {
          extensionService.startExtensionHosts();
        }
      }
    }, 10));
    this.contextService.getCompleteWorkspace().then((workspace) => {
      this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
      this.handleWorkbenchState();
      this._register(this.contextService.onDidChangeWorkbenchState(() => setTimeout(() => this.handleWorkbenchState())));
    });
    this._register(toDisposable(() => {
      this.onDidChangeWorkspaceFoldersUnbind?.dispose();
    }));
  }
  static {
    __name(this, "WorkspaceChangeExtHostRelauncher");
  }
  firstFolderResource;
  extensionHostRestarter;
  onDidChangeWorkspaceFoldersUnbind;
  handleWorkbenchState() {
    if (this.contextService.getWorkbenchState() === WorkbenchState.WORKSPACE) {
      const workspace = this.contextService.getWorkspace();
      this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
      if (!this.onDidChangeWorkspaceFoldersUnbind) {
        this.onDidChangeWorkspaceFoldersUnbind = this.contextService.onDidChangeWorkspaceFolders(() => this.onDidChangeWorkspaceFolders());
      }
    } else {
      dispose(this.onDidChangeWorkspaceFoldersUnbind);
      this.onDidChangeWorkspaceFoldersUnbind = void 0;
    }
  }
  onDidChangeWorkspaceFolders() {
    const workspace = this.contextService.getWorkspace();
    const newFirstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
    if (!isEqual(this.firstFolderResource, newFirstFolderResource)) {
      this.firstFolderResource = newFirstFolderResource;
      this.extensionHostRestarter.schedule();
    }
  }
};
WorkspaceChangeExtHostRelauncher = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IHostService),
  __decorateParam(3, IWorkbenchEnvironmentService)
], WorkspaceChangeExtHostRelauncher);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(SettingsChangeRelauncher, LifecyclePhase.Restored);
workbenchRegistry.registerWorkbenchContribution(WorkspaceChangeExtHostRelauncher, LifecyclePhase.Restored);
export {
  SettingsChangeRelauncher,
  WorkspaceChangeExtHostRelauncher
};
//# sourceMappingURL=relauncher.contribution.js.map
