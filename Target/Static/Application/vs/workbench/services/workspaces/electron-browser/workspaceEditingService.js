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
import { localize } from "../../../../nls.js";
import { IWorkspaceEditingService } from "../common/workspaceEditing.js";
import { URI } from "../../../../base/common/uri.js";
import { hasWorkspaceFileExtension, isUntitledWorkspace, isWorkspaceIdentifier, IWorkspaceContextService, toWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
import { IJSONEditingService } from "../../configuration/common/jsonEditing.js";
import { IWorkspacesService } from "../../../../platform/workspaces/common/workspaces.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { IWorkingCopyBackupService } from "../../workingCopy/common/workingCopyBackup.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { basename } from "../../../../base/common/resources.js";
import { INotificationService, Severity } from "../../../../platform/notification/common/notification.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-browser/environmentService.js";
import { ILifecycleService } from "../../lifecycle/common/lifecycle.js";
import { IFileDialogService, IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ITextFileService } from "../../textfile/common/textfiles.js";
import { IHostService } from "../../host/browser/host.js";
import { AbstractWorkspaceEditingService } from "../browser/abstractWorkspaceEditingService.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { WorkingCopyBackupService } from "../../workingCopy/common/workingCopyBackupService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { IWorkbenchConfigurationService } from "../../configuration/common/configuration.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let NativeWorkspaceEditingService = class NativeWorkspaceEditingService2 extends AbstractWorkspaceEditingService {
  static {
    __name(this, "NativeWorkspaceEditingService");
  }
  constructor(jsonEditingService, contextService, nativeHostService, configurationService, storageService, extensionService, workingCopyBackupService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, lifecycleService, labelService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService, logService) {
    super(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService, logService);
    this.nativeHostService = nativeHostService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.workingCopyBackupService = workingCopyBackupService;
    this.lifecycleService = lifecycleService;
    this.labelService = labelService;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.lifecycleService.onBeforeShutdown((e) => {
      const saveOperation = this.saveUntitledBeforeShutdown(e.reason);
      e.veto(saveOperation, "veto.untitledWorkspace");
    }));
  }
  async saveUntitledBeforeShutdown(reason) {
    if (reason !== 4 && reason !== 1) {
      return false;
    }
    const workspaceIdentifier = this.getCurrentWorkspaceIdentifier();
    if (!workspaceIdentifier || !isUntitledWorkspace(workspaceIdentifier.configPath, this.environmentService)) {
      return false;
    }
    const windowCount = await this.nativeHostService.getWindowCount();
    if (reason === 1 && !isMacintosh && windowCount === 1) {
      return false;
    }
    const confirmSaveUntitledWorkspace = this.configurationService.getValue("window.confirmSaveUntitledWorkspace") !== false;
    if (!confirmSaveUntitledWorkspace) {
      await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
      return false;
    }
    let canceled = false;
    const { result, checkboxChecked } = await this.dialogService.prompt({
      type: Severity.Warning,
      message: localize("saveWorkspaceMessage", "Do you want to save your workspace configuration as a file?"),
      detail: localize("saveWorkspaceDetail", "Save your workspace if you plan to open it again."),
      buttons: [
        {
          label: localize({ key: "save", comment: ["&& denotes a mnemonic"] }, "&&Save"),
          run: /* @__PURE__ */ __name(async () => {
            const newWorkspacePath = await this.pickNewWorkspacePath();
            if (!newWorkspacePath || !hasWorkspaceFileExtension(newWorkspacePath)) {
              return true;
            }
            try {
              await this.saveWorkspaceAs(workspaceIdentifier, newWorkspacePath);
              const newWorkspaceIdentifier = await this.workspacesService.getWorkspaceIdentifier(newWorkspacePath);
              await this.workspacesService.addRecentlyOpened([{
                label: this.labelService.getWorkspaceLabel(newWorkspaceIdentifier, {
                  verbose: 2
                  /* Verbosity.LONG */
                }),
                workspace: newWorkspaceIdentifier,
                remoteAuthority: this.environmentService.remoteAuthority
                // remember whether this was a remote window
              }]);
              await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
            } catch (error) {
            }
            return false;
          }, "run")
        },
        {
          label: localize({ key: "doNotSave", comment: ["&& denotes a mnemonic"] }, "Do&&n't Save"),
          run: /* @__PURE__ */ __name(async () => {
            await this.workspacesService.deleteUntitledWorkspace(workspaceIdentifier);
            return false;
          }, "run")
        }
      ],
      cancelButton: {
        run: /* @__PURE__ */ __name(() => {
          canceled = true;
          return true;
        }, "run")
      },
      checkbox: {
        label: localize("doNotAskAgain", "Always discard untitled workspaces without asking")
      }
    });
    if (!canceled && checkboxChecked) {
      await this.configurationService.updateValue(
        "window.confirmSaveUntitledWorkspace",
        false,
        2
        /* ConfigurationTarget.USER */
      );
    }
    return result;
  }
  async isValidTargetWorkspacePath(workspaceUri) {
    const windows = await this.nativeHostService.getWindows({ includeAuxiliaryWindows: false });
    if (windows.some((window) => isWorkspaceIdentifier(window.workspace) && this.uriIdentityService.extUri.isEqual(window.workspace.configPath, workspaceUri))) {
      await this.dialogService.info(localize("workspaceOpenedMessage", "Unable to save workspace '{0}'", basename(workspaceUri)), localize("workspaceOpenedDetail", "The workspace is already opened in another window. Please close that window first and then try again."));
      return false;
    }
    return true;
  }
  async enterWorkspace(workspaceUri) {
    const stopped = await this.extensionService.stopExtensionHosts(localize("restartExtensionHost.reason", "Opening a multi-root workspace"));
    if (!stopped) {
      return;
    }
    const oldWorkspace = toWorkspaceIdentifier(this.contextService.getWorkspace());
    const result = await this.doEnterWorkspace(workspaceUri);
    if (result) {
      await this.storageService.switch(
        result.workspace,
        true
        /* preserve data */
      );
      if (this.workingCopyBackupService instanceof WorkingCopyBackupService) {
        const newBackupWorkspaceHome = result.backupPath ? URI.file(result.backupPath).with({ scheme: this.environmentService.userRoamingDataHome.scheme }) : void 0;
        this.workingCopyBackupService.reinitialize(newBackupWorkspaceHome);
      }
      await this.fireDidEnterWorkspace(oldWorkspace, result.workspace);
    }
    if (this.environmentService.remoteAuthority) {
      this.hostService.reload();
    } else {
      this.extensionService.startExtensionHosts();
    }
  }
};
NativeWorkspaceEditingService = __decorate([
  __param(0, IJSONEditingService),
  __param(1, IWorkspaceContextService),
  __param(2, INativeHostService),
  __param(3, IWorkbenchConfigurationService),
  __param(4, IStorageService),
  __param(5, IExtensionService),
  __param(6, IWorkingCopyBackupService),
  __param(7, INotificationService),
  __param(8, ICommandService),
  __param(9, IFileService),
  __param(10, ITextFileService),
  __param(11, IWorkspacesService),
  __param(12, INativeWorkbenchEnvironmentService),
  __param(13, IFileDialogService),
  __param(14, IDialogService),
  __param(15, ILifecycleService),
  __param(16, ILabelService),
  __param(17, IHostService),
  __param(18, IUriIdentityService),
  __param(19, IWorkspaceTrustManagementService),
  __param(20, IUserDataProfilesService),
  __param(21, IUserDataProfileService),
  __param(22, ILogService)
], NativeWorkspaceEditingService);
registerSingleton(
  IWorkspaceEditingService,
  NativeWorkspaceEditingService,
  1
  /* InstantiationType.Delayed */
);
export {
  NativeWorkspaceEditingService
};
//# sourceMappingURL=workspaceEditingService.js.map
