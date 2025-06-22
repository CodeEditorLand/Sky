var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import * as arrays from "../../../../base/common/arrays.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { IWorkspaceContextService, UNKNOWN_EMPTY_WINDOW_WORKSPACE } from "../../../../platform/workspace/common/workspace.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IWorkingCopyBackupService } from "../../../services/workingCopy/common/workingCopyBackup.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { joinPath } from "../../../../base/common/resources.js";
import { IWorkbenchLayoutService } from "../../../services/layout/browser/layoutService.js";
import { GettingStartedInput, gettingStartedInputTypeId } from "./gettingStartedInput.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { getTelemetryLevel } from "../../../../platform/telemetry/common/telemetryUtils.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { localize } from "../../../../nls.js";
import { IEditorResolverService, RegisteredEditorPriority } from "../../../services/editor/common/editorResolverService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
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
const restoreWalkthroughsConfigurationKey = "workbench.welcomePage.restorableWalkthroughs";
const configurationKey = "workbench.startupEditor";
const oldConfigurationKey = "workbench.welcome.enabled";
const telemetryOptOutStorageKey = "workbench.telemetryOptOutShown";
let StartupPageEditorResolverContribution = class StartupPageEditorResolverContribution2 extends Disposable {
  static {
    __name(this, "StartupPageEditorResolverContribution");
  }
  static {
    this.ID = "workbench.contrib.startupPageEditorResolver";
  }
  constructor(instantiationService, editorResolverService) {
    super();
    this.instantiationService = instantiationService;
    const disposables = new DisposableStore();
    this._register(disposables);
    editorResolverService.registerEditor(`${GettingStartedInput.RESOURCE.scheme}:/**`, {
      id: GettingStartedInput.ID,
      label: localize("welcome.displayName", "Welcome Page"),
      priority: RegisteredEditorPriority.builtin
    }, {
      singlePerResource: false,
      canSupportResource: /* @__PURE__ */ __name((uri) => uri.scheme === GettingStartedInput.RESOURCE.scheme, "canSupportResource")
    }, {
      createEditorInput: /* @__PURE__ */ __name(({ resource, options }) => {
        return {
          editor: disposables.add(this.instantiationService.createInstance(GettingStartedInput, options)),
          options: {
            ...options,
            pinned: false
          }
        };
      }, "createEditorInput")
    });
  }
};
StartupPageEditorResolverContribution = __decorate([
  __param(0, IInstantiationService),
  __param(1, IEditorResolverService)
], StartupPageEditorResolverContribution);
let StartupPageRunnerContribution = class StartupPageRunnerContribution2 extends Disposable {
  static {
    __name(this, "StartupPageRunnerContribution");
  }
  static {
    this.ID = "workbench.contrib.startupPageRunner";
  }
  constructor(configurationService, editorService, workingCopyBackupService, fileService, contextService, lifecycleService, layoutService, productService, commandService, environmentService, storageService, logService, notificationService) {
    super();
    this.configurationService = configurationService;
    this.editorService = editorService;
    this.workingCopyBackupService = workingCopyBackupService;
    this.fileService = fileService;
    this.contextService = contextService;
    this.lifecycleService = lifecycleService;
    this.layoutService = layoutService;
    this.productService = productService;
    this.commandService = commandService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.run().then(void 0, onUnexpectedError);
    this._register(this.editorService.onDidCloseEditor((e) => {
      if (e.editor instanceof GettingStartedInput) {
        e.editor.selectedCategory = void 0;
        e.editor.selectedStep = void 0;
      }
    }));
  }
  async run() {
    await this.lifecycleService.when(
      3
      /* LifecyclePhase.Restored */
    );
    if (this.productService.enableTelemetry && this.productService.showTelemetryOptOut && getTelemetryLevel(this.configurationService) !== 0 && !this.environmentService.skipWelcome && !this.storageService.get(
      telemetryOptOutStorageKey,
      0
      /* StorageScope.PROFILE */
    )) {
      this.storageService.store(
        telemetryOptOutStorageKey,
        true,
        0,
        0
        /* StorageTarget.USER */
      );
    }
    if (this.tryOpenWalkthroughForFolder()) {
      return;
    }
    const enabled = isStartupPageEnabled(this.configurationService, this.contextService, this.environmentService, this.logService);
    if (enabled && this.lifecycleService.startupKind !== 3) {
      const hasBackups = await this.workingCopyBackupService.hasBackups();
      if (hasBackups) {
        return;
      }
      if (!this.editorService.activeEditor || this.layoutService.openedDefaultEditors) {
        const startupEditorSetting = this.configurationService.inspect(configurationKey);
        if (startupEditorSetting.value === "readme") {
          await this.openReadme();
        } else if (startupEditorSetting.value === "welcomePage" || startupEditorSetting.value === "welcomePageInEmptyWorkbench") {
          await this.openGettingStarted(true);
        } else if (startupEditorSetting.value === "terminal") {
          this.commandService.executeCommand(
            "workbench.action.createTerminalEditor"
            /* TerminalCommandId.CreateTerminalEditor */
          );
        }
      }
    }
  }
  tryOpenWalkthroughForFolder() {
    const toRestore = this.storageService.get(
      restoreWalkthroughsConfigurationKey,
      0
      /* StorageScope.PROFILE */
    );
    if (!toRestore) {
      return false;
    } else {
      const restoreData = JSON.parse(toRestore);
      const currentWorkspace = this.contextService.getWorkspace();
      if (restoreData.folder === UNKNOWN_EMPTY_WINDOW_WORKSPACE.id || restoreData.folder === currentWorkspace.folders[0].uri.toString()) {
        const options = { selectedCategory: restoreData.category, selectedStep: restoreData.step, pinned: false };
        this.editorService.openEditor({
          resource: GettingStartedInput.RESOURCE,
          options
        });
        this.storageService.remove(
          restoreWalkthroughsConfigurationKey,
          0
          /* StorageScope.PROFILE */
        );
        return true;
      }
    }
    return false;
  }
  async openReadme() {
    const readmes = arrays.coalesce(await Promise.all(this.contextService.getWorkspace().folders.map(async (folder) => {
      const folderUri = folder.uri;
      const folderStat = await this.fileService.resolve(folderUri).catch(onUnexpectedError);
      const files = folderStat?.children ? folderStat.children.map((child) => child.name).sort() : [];
      const file = files.find((file2) => file2.toLowerCase() === "readme.md") || files.find((file2) => file2.toLowerCase().startsWith("readme"));
      if (file) {
        return joinPath(folderUri, file);
      } else {
        return void 0;
      }
    })));
    if (!this.editorService.activeEditor) {
      if (readmes.length) {
        const isMarkDown = /* @__PURE__ */ __name((readme) => readme.path.toLowerCase().endsWith(".md"), "isMarkDown");
        await Promise.all([
          this.commandService.executeCommand("markdown.showPreview", null, readmes.filter(isMarkDown), { locked: true }).catch((error) => {
            this.notificationService.error(localize("startupPage.markdownPreviewError", "Could not open markdown preview: {0}.\n\nPlease make sure the markdown extension is enabled.", error.message));
          }),
          this.editorService.openEditors(readmes.filter((readme) => !isMarkDown(readme)).map((readme) => ({ resource: readme })))
        ]);
      } else {
        await this.openGettingStarted();
      }
    }
  }
  async openGettingStarted(showTelemetryNotice) {
    const startupEditorTypeID = gettingStartedInputTypeId;
    const editor = this.editorService.activeEditor;
    if (editor?.typeId === startupEditorTypeID || this.editorService.editors.some((e) => e.typeId === startupEditorTypeID)) {
      return;
    }
    const options = editor ? { pinned: false, index: 0, showTelemetryNotice } : { pinned: false, showTelemetryNotice };
    if (startupEditorTypeID === gettingStartedInputTypeId) {
      this.editorService.openEditor({
        resource: GettingStartedInput.RESOURCE,
        options
      });
    }
  }
};
StartupPageRunnerContribution = __decorate([
  __param(0, IConfigurationService),
  __param(1, IEditorService),
  __param(2, IWorkingCopyBackupService),
  __param(3, IFileService),
  __param(4, IWorkspaceContextService),
  __param(5, ILifecycleService),
  __param(6, IWorkbenchLayoutService),
  __param(7, IProductService),
  __param(8, ICommandService),
  __param(9, IWorkbenchEnvironmentService),
  __param(10, IStorageService),
  __param(11, ILogService),
  __param(12, INotificationService)
], StartupPageRunnerContribution);
function isStartupPageEnabled(configurationService, contextService, environmentService, logService) {
  if (environmentService.skipWelcome) {
    return false;
  }
  const startupEditor = configurationService.inspect(configurationKey);
  if (!startupEditor.userValue && !startupEditor.workspaceValue) {
    const welcomeEnabled = configurationService.inspect(oldConfigurationKey);
    if (welcomeEnabled.value !== void 0 && welcomeEnabled.value !== null) {
      return welcomeEnabled.value;
    }
  }
  return startupEditor.value === "welcomePage" || startupEditor.value === "readme" || contextService.getWorkbenchState() === 1 && startupEditor.value === "welcomePageInEmptyWorkbench" || startupEditor.value === "terminal";
}
__name(isStartupPageEnabled, "isStartupPageEnabled");
export {
  StartupPageEditorResolverContribution,
  StartupPageRunnerContribution,
  restoreWalkthroughsConfigurationKey
};
//# sourceMappingURL=startupPage.js.map
