import "./workbench.common.main.js";
import "./browser/parts/dialogs/dialog.web.contribution.js";
import "./browser/web.main.js";
import "./services/integrity/browser/integrityService.js";
import "./services/search/browser/searchService.js";
import "./services/textfile/browser/browserTextFileService.js";
import "./services/keybinding/browser/keyboardLayoutService.js";
import "./services/extensions/browser/extensionService.js";
import "./services/extensionManagement/browser/extensionsProfileScannerService.js";
import "./services/extensions/browser/extensionsScannerService.js";
import "./services/extensionManagement/browser/webExtensionsScannerService.js";
import "./services/extensionManagement/common/extensionManagementServerService.js";
import "./services/extensionManagement/browser/extensionGalleryManifestService.js";
import "./services/telemetry/browser/telemetryService.js";
import "./services/url/browser/urlService.js";
import "./services/update/browser/updateService.js";
import "./services/workspaces/browser/workspacesService.js";
import "./services/workspaces/browser/workspaceEditingService.js";
import "./services/dialogs/browser/fileDialogService.js";
import "./services/host/browser/browserHostService.js";
import "./services/lifecycle/browser/lifecycleService.js";
import "./services/clipboard/browser/clipboardService.js";
import "./services/localization/browser/localeService.js";
import "./services/path/browser/pathService.js";
import "./services/themes/browser/browserHostColorSchemeService.js";
import "./services/encryption/browser/encryptionService.js";
import "./services/secrets/browser/secretStorageService.js";
import "./services/workingCopy/browser/workingCopyBackupService.js";
import "./services/tunnel/browser/tunnelService.js";
import "./services/files/browser/elevatedFileService.js";
import "./services/workingCopy/browser/workingCopyHistoryService.js";
import "./services/userDataSync/browser/webUserDataSyncEnablementService.js";
import "./services/userDataProfile/browser/userDataProfileStorageService.js";
import "./services/configurationResolver/browser/configurationResolverService.js";
import "../platform/extensionResourceLoader/browser/extensionResourceLoaderService.js";
import "./services/auxiliaryWindow/browser/auxiliaryWindowService.js";
import "./services/browserElements/browser/webBrowserElementsService.js";
import { registerSingleton } from "../platform/instantiation/common/extensions.js";
import { IAccessibilityService } from "../platform/accessibility/common/accessibility.js";
import { IContextMenuService } from "../platform/contextview/browser/contextView.js";
import { ContextMenuService } from "../platform/contextview/browser/contextMenuService.js";
import { IExtensionTipsService } from "../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionTipsService } from "../platform/extensionManagement/common/extensionTipsService.js";
import { IWorkbenchExtensionManagementService } from "./services/extensionManagement/common/extensionManagement.js";
import { ExtensionManagementService } from "./services/extensionManagement/common/extensionManagementService.js";
import { LogLevel } from "../platform/log/common/log.js";
import { UserDataSyncMachinesService, IUserDataSyncMachinesService } from "../platform/userDataSync/common/userDataSyncMachines.js";
import { IUserDataSyncStoreService, IUserDataSyncService, IUserDataAutoSyncService, IUserDataSyncLocalStoreService, IUserDataSyncResourceProviderService } from "../platform/userDataSync/common/userDataSync.js";
import { UserDataSyncStoreService } from "../platform/userDataSync/common/userDataSyncStoreService.js";
import { UserDataSyncLocalStoreService } from "../platform/userDataSync/common/userDataSyncLocalStoreService.js";
import { UserDataSyncService } from "../platform/userDataSync/common/userDataSyncService.js";
import { IUserDataSyncAccountService, UserDataSyncAccountService } from "../platform/userDataSync/common/userDataSyncAccount.js";
import { UserDataAutoSyncService } from "../platform/userDataSync/common/userDataAutoSyncService.js";
import { AccessibilityService } from "../platform/accessibility/browser/accessibilityService.js";
import { ICustomEndpointTelemetryService } from "../platform/telemetry/common/telemetry.js";
import { NullEndpointTelemetryService } from "../platform/telemetry/common/telemetryUtils.js";
import { ITitleService } from "./services/title/browser/titleService.js";
import { BrowserTitleService } from "./browser/parts/titlebar/titlebarPart.js";
import { ITimerService, TimerService } from "./services/timer/browser/timerService.js";
import { IDiagnosticsService, NullDiagnosticsService } from "../platform/diagnostics/common/diagnostics.js";
import { ILanguagePackService } from "../platform/languagePacks/common/languagePacks.js";
import { WebLanguagePacksService } from "../platform/languagePacks/browser/languagePacks.js";
import { IWebContentExtractorService, NullWebContentExtractorService, ISharedWebContentExtractorService, NullSharedWebContentExtractorService } from "../platform/webContentExtractor/common/webContentExtractor.js";
import { IDefaultAccountService, NullDefaultAccountService } from "./services/accounts/common/defaultAccount.js";
import "./contrib/logs/browser/logs.contribution.js";
import "./contrib/localization/browser/localization.contribution.js";
import "./contrib/performance/browser/performance.web.contribution.js";
import "./contrib/preferences/browser/keyboardLayoutPicker.js";
import "./contrib/debug/browser/extensionHostDebugService.js";
import "./contrib/welcomeBanner/browser/welcomeBanner.contribution.js";
import "./contrib/webview/browser/webview.web.contribution.js";
import "./contrib/extensions/browser/extensions.web.contribution.js";
import "./contrib/terminal/browser/terminal.web.contribution.js";
import "./contrib/externalTerminal/browser/externalTerminal.contribution.js";
import "./contrib/terminal/browser/terminalInstanceService.js";
import "./contrib/tasks/browser/taskService.js";
import "./contrib/tags/browser/workspaceTagsService.js";
import "./contrib/issue/browser/issue.contribution.js";
import "./contrib/splash/browser/splash.contribution.js";
import "./contrib/remote/browser/remoteStartEntry.contribution.js";
import "./contrib/processExplorer/browser/processExplorer.web.contribution.js";
import { create, commands, env, window, workspace, logger } from "./browser/web.factory.js";
import { Menu } from "./browser/web.api.js";
import { URI } from "../base/common/uri.js";
import { Event, Emitter } from "../base/common/event.js";
import { Disposable } from "../base/common/lifecycle.js";
import { GroupOrientation } from "./services/editor/common/editorGroupsService.js";
import { UserDataSyncResourceProviderService } from "../platform/userDataSync/common/userDataSyncResourceProvider.js";
import { RemoteAuthorityResolverError, RemoteAuthorityResolverErrorCode } from "../platform/remote/common/remoteAuthorityResolver.js";
registerSingleton(
  IWorkbenchExtensionManagementService,
  ExtensionManagementService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IAccessibilityService,
  AccessibilityService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IContextMenuService,
  ContextMenuService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IUserDataSyncStoreService,
  UserDataSyncStoreService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IUserDataSyncMachinesService,
  UserDataSyncMachinesService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IUserDataSyncLocalStoreService,
  UserDataSyncLocalStoreService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IUserDataSyncAccountService,
  UserDataSyncAccountService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IUserDataSyncService,
  UserDataSyncService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IUserDataSyncResourceProviderService,
  UserDataSyncResourceProviderService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IUserDataAutoSyncService,
  UserDataAutoSyncService,
  0
  /* InstantiationType.Eager */
);
registerSingleton(
  ITitleService,
  BrowserTitleService,
  0
  /* InstantiationType.Eager */
);
registerSingleton(
  IExtensionTipsService,
  ExtensionTipsService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ITimerService,
  TimerService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ICustomEndpointTelemetryService,
  NullEndpointTelemetryService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IDiagnosticsService,
  NullDiagnosticsService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ILanguagePackService,
  WebLanguagePacksService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IWebContentExtractorService,
  NullWebContentExtractorService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  ISharedWebContentExtractorService,
  NullSharedWebContentExtractorService,
  1
  /* InstantiationType.Delayed */
);
registerSingleton(
  IDefaultAccountService,
  NullDefaultAccountService,
  1
  /* InstantiationType.Delayed */
);
if (globalThis.__VSCODE_WEB_ESM_PROMISE) {
  const exports = {
    // Factory
    create,
    // Basic Types
    URI,
    Event,
    Emitter,
    Disposable,
    // GroupOrientation,
    LogLevel,
    RemoteAuthorityResolverError,
    RemoteAuthorityResolverErrorCode,
    // Facade API
    env,
    window,
    workspace,
    commands,
    logger,
    Menu
  };
  globalThis.__VSCODE_WEB_ESM_PROMISE(exports);
  delete globalThis.__VSCODE_WEB_ESM_PROMISE;
}
export {
  Disposable,
  Emitter,
  Event,
  GroupOrientation,
  LogLevel,
  Menu,
  RemoteAuthorityResolverError,
  RemoteAuthorityResolverErrorCode,
  URI,
  commands,
  create,
  env,
  logger,
  window,
  workspace
};
//# sourceMappingURL=workbench.web.main.internal.js.map
