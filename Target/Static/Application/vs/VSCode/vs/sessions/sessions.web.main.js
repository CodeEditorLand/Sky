import "./sessions.common.main.js";
import "../workbench/browser/parts/dialogs/dialog.web.contribution.js";
import "./browser/web.main.js";
import "../workbench/services/integrity/browser/integrityService.js";
import "../workbench/services/search/browser/searchService.js";
import "../workbench/services/textfile/browser/browserTextFileService.js";
import "../workbench/services/keybinding/browser/keyboardLayoutService.js";
import "../workbench/services/extensions/browser/extensionService.js";
import "../workbench/services/extensionManagement/browser/extensionsProfileScannerService.js";
import "../workbench/services/extensions/browser/extensionsScannerService.js";
import "../workbench/services/extensionManagement/browser/webExtensionsScannerService.js";
import "../workbench/services/extensionManagement/common/extensionManagementServerService.js";
import "../workbench/services/mcp/browser/mcpWorkbenchManagementService.js";
import "../workbench/services/extensionManagement/browser/extensionGalleryManifestService.js";
import "../workbench/services/telemetry/browser/telemetryService.js";
import "../workbench/services/url/browser/urlService.js";
import "../workbench/services/update/browser/updateService.js";
import "../workbench/services/workspaces/browser/workspacesService.js";
import "../workbench/services/workspaces/browser/workspaceEditingService.js";
import "../workbench/services/dialogs/browser/fileDialogService.js";
import "../workbench/services/host/browser/browserHostService.js";
import "../platform/meteredConnection/browser/meteredConnectionService.js";
import "../workbench/services/lifecycle/browser/lifecycleService.js";
import "../workbench/services/clipboard/browser/clipboardService.js";
import "../workbench/services/localization/browser/localeService.js";
import "../workbench/services/path/browser/pathService.js";
import "../workbench/services/themes/browser/browserHostColorSchemeService.js";
import "../workbench/services/encryption/browser/encryptionService.js";
import "../workbench/services/imageResize/browser/imageResizeService.js";
import "../workbench/services/secrets/browser/secretStorageService.js";
import "../workbench/services/workingCopy/browser/workingCopyBackupService.js";
import "../workbench/services/tunnel/browser/tunnelService.js";
import "../workbench/services/files/browser/elevatedFileService.js";
import "../workbench/services/workingCopy/browser/workingCopyHistoryService.js";
import "../workbench/services/userDataSync/browser/webUserDataSyncEnablementService.js";
import "../workbench/services/userDataProfile/browser/userDataProfileStorageService.js";
import "../workbench/services/configurationResolver/browser/configurationResolverService.js";
import "../platform/extensionResourceLoader/browser/extensionResourceLoaderService.js";
import "../workbench/services/auxiliaryWindow/browser/auxiliaryWindowService.js";
import "../workbench/services/browserElements/browser/webBrowserElementsService.js";
import "../workbench/services/power/browser/powerService.js";
import { registerSingleton } from "../platform/instantiation/common/extensions.js";
import { IAccessibilityService } from "../platform/accessibility/common/accessibility.js";
import { IContextMenuService } from "../platform/contextview/browser/contextView.js";
import { ContextMenuService } from "../platform/contextview/browser/contextMenuService.js";
import { IExtensionTipsService } from "../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionTipsService } from "../platform/extensionManagement/common/extensionTipsService.js";
import { IWorkbenchExtensionManagementService } from "../workbench/services/extensionManagement/common/extensionManagement.js";
import { ExtensionManagementService } from "../workbench/services/extensionManagement/common/extensionManagementService.js";
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
import { ITitleService } from "../workbench/services/title/browser/titleService.js";
import { BrowserTitleService } from "../workbench/browser/parts/titlebar/titlebarPart.js";
import { ITimerService, TimerService } from "../workbench/services/timer/browser/timerService.js";
import { IDiagnosticsService, NullDiagnosticsService } from "../platform/diagnostics/common/diagnostics.js";
import { ILanguagePackService } from "../platform/languagePacks/common/languagePacks.js";
import { WebLanguagePacksService } from "../platform/languagePacks/browser/languagePacks.js";
import { IWebContentExtractorService, NullWebContentExtractorService, ISharedWebContentExtractorService, NullSharedWebContentExtractorService } from "../platform/webContentExtractor/common/webContentExtractor.js";
import { IMcpGalleryManifestService } from "../platform/mcp/common/mcpGalleryManifest.js";
import { WorkbenchMcpGalleryManifestService } from "../workbench/services/mcp/browser/mcpGalleryManifestService.js";
import { UserDataSyncResourceProviderService } from "../platform/userDataSync/common/userDataSyncResourceProvider.js";
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
  IMcpGalleryManifestService,
  WorkbenchMcpGalleryManifestService,
  1
  /* InstantiationType.Delayed */
);
import "../workbench/contrib/logs/browser/logs.contribution.js";
import "../workbench/contrib/localization/browser/localization.contribution.js";
import "../workbench/contrib/performance/browser/performance.web.contribution.js";
import "../workbench/contrib/preferences/browser/keyboardLayoutPicker.js";
import "../workbench/contrib/debug/browser/extensionHostDebugService.js";
import "../workbench/contrib/welcomeBanner/browser/welcomeBanner.contribution.js";
import "../workbench/contrib/webview/browser/webview.web.contribution.js";
import "../workbench/contrib/extensions/browser/extensions.web.contribution.js";
import "../workbench/contrib/terminal/browser/terminal.web.contribution.js";
import "../workbench/contrib/externalTerminal/browser/externalTerminal.contribution.js";
import "../workbench/contrib/terminal/browser/terminalInstanceService.js";
import "../workbench/contrib/tasks/browser/taskService.js";
import "../workbench/contrib/tags/browser/workspaceTagsService.js";
import "../workbench/contrib/issue/browser/issue.contribution.js";
import "../workbench/contrib/splash/browser/splash.contribution.js";
import "../workbench/contrib/remote/browser/remoteStartEntry.contribution.js";
import "../workbench/contrib/processExplorer/browser/processExplorer.web.contribution.js";
import "./browser/paneCompositePartService.js";
import "./browser/layoutActions.js";
import "./contrib/accountMenu/browser/account.contribution.js";
import "./contrib/aiCustomizationTreeView/browser/aiCustomizationTreeView.contribution.js";
import "./contrib/chat/browser/chat.contribution.js";
import "./contrib/sessions/browser/sessions.contribution.js";
import "./contrib/sessions/browser/customizationsToolbar.contribution.js";
import "./contrib/changes/browser/changesView.contribution.js";
import "./contrib/codeReview/browser/codeReview.contributions.js";
import "./contrib/github/browser/github.contribution.js";
import "./contrib/fileTreeView/browser/fileTreeView.contribution.js";
import "./contrib/configuration/browser/configuration.contribution.js";
import "./contrib/welcome/browser/welcome.contribution.js";
//# sourceMappingURL=sessions.web.main.js.map
