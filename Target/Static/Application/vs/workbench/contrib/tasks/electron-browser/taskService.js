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
import * as nls from "../../../../nls.js";
import * as semver from "../../../../base/common/semver/semver.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { ExecutionEngine } from "../common/tasks.js";
import { AbstractTaskService } from "../browser/abstractTaskService.js";
import { ITaskService } from "../common/taskService.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { TerminalTaskSystem } from "../browser/terminalTaskSystem.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IOutputService } from "../../../services/output/common/output.js";
import { ITerminalGroupService, ITerminalService } from "../../terminal/browser/terminal.js";
import { IConfigurationResolverService } from "../../../services/configurationResolver/common/configurationResolver.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { IPathService } from "../../../services/path/common/pathService.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { ITerminalProfileResolverService } from "../../terminal/common/terminal.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IChatService } from "../../chat/common/chatService/chatService.js";
import { IChatAgentService } from "../../chat/common/participants/chatAgents.js";
import { IHostService } from "../../../services/host/browser/host.js";
let TaskService = class TaskService2 extends AbstractTaskService {
  static {
    __name(this, "TaskService");
  }
  constructor(configurationService, markerService, outputService, paneCompositeService, viewsService, commandService, editorService, fileService, contextService, telemetryService, textFileService, lifecycleService, modelService, extensionService, quickInputService, configurationResolverService, terminalService, terminalGroupService, storageService, progressService, openerService, dialogService, notificationService, contextKeyService, environmentService, terminalProfileResolverService, pathService, textModelResolverService, preferencesService, viewDescriptorService, workspaceTrustRequestService, workspaceTrustManagementService, logService, themeService, instantiationService, remoteAgentService, accessibilitySignalService, _chatService, _chatAgentService, _hostService) {
    super(configurationService, markerService, outputService, paneCompositeService, viewsService, commandService, editorService, fileService, contextService, telemetryService, textFileService, modelService, extensionService, quickInputService, configurationResolverService, terminalService, terminalGroupService, storageService, progressService, openerService, dialogService, notificationService, contextKeyService, environmentService, terminalProfileResolverService, pathService, textModelResolverService, preferencesService, viewDescriptorService, workspaceTrustRequestService, workspaceTrustManagementService, logService, themeService, lifecycleService, remoteAgentService, instantiationService, _chatService, _chatAgentService, _hostService);
    this._register(lifecycleService.onBeforeShutdown((event) => event.veto(this.beforeShutdown(), "veto.tasks")));
  }
  _getTaskSystem() {
    if (this._taskSystem) {
      return this._taskSystem;
    }
    const taskSystem = this._createTerminalTaskSystem();
    this._taskSystem = taskSystem;
    this._taskSystemListeners = [
      this._taskSystem.onDidStateChange((event) => {
        this._taskRunningState.set(this._taskSystem.isActiveSync());
        this._onDidStateChange.fire(event);
      })
    ];
    return this._taskSystem;
  }
  _computeLegacyConfiguration(workspaceFolder) {
    const { config, hasParseErrors } = this._getConfiguration(workspaceFolder);
    if (hasParseErrors) {
      return Promise.resolve({ workspaceFolder, hasErrors: true, config: void 0 });
    }
    if (config) {
      return Promise.resolve({ workspaceFolder, config, hasErrors: false });
    } else {
      return Promise.resolve({ workspaceFolder, hasErrors: true, config: void 0 });
    }
  }
  _versionAndEngineCompatible(filter) {
    const range = filter && filter.version ? filter.version : void 0;
    const engine = this.executionEngine;
    return range === void 0 || (semver.satisfies("0.1.0", range) && engine === ExecutionEngine.Process || semver.satisfies("2.0.0", range) && engine === ExecutionEngine.Terminal);
  }
  beforeShutdown() {
    if (!this._taskSystem) {
      return false;
    }
    if (!this._taskSystem.isActiveSync()) {
      return false;
    }
    if (this._taskSystem instanceof TerminalTaskSystem) {
      return false;
    }
    let terminatePromise;
    if (this._taskSystem.canAutoTerminate()) {
      terminatePromise = Promise.resolve({ confirmed: true });
    } else {
      terminatePromise = this._dialogService.confirm({
        message: nls.localize("TaskSystem.runningTask", "There is a task running. Do you want to terminate it?"),
        primaryButton: nls.localize({ key: "TaskSystem.terminateTask", comment: ["&& denotes a mnemonic"] }, "&&Terminate Task")
      });
    }
    return terminatePromise.then((res) => {
      if (res.confirmed) {
        return this._taskSystem.terminateAll().then((responses) => {
          let success = true;
          let code = void 0;
          for (const response of responses) {
            success = success && response.success;
            if (code === void 0 && response.code !== void 0) {
              code = response.code;
            }
          }
          if (success) {
            this._taskSystem = void 0;
            this._disposeTaskSystemListeners();
            return false;
          } else if (code && code === 3) {
            return this._dialogService.confirm({
              message: nls.localize("TaskSystem.noProcess", "The launched task doesn't exist anymore. If the task spawned background processes exiting VS Code might result in orphaned processes. To avoid this start the last background process with a wait flag."),
              primaryButton: nls.localize({ key: "TaskSystem.exitAnyways", comment: ["&& denotes a mnemonic"] }, "&&Exit Anyways"),
              type: "info"
            }).then((res2) => !res2.confirmed);
          }
          return true;
        }, (err) => {
          return true;
        });
      }
      return true;
    });
  }
};
TaskService = __decorate([
  __param(0, IConfigurationService),
  __param(1, IMarkerService),
  __param(2, IOutputService),
  __param(3, IPaneCompositePartService),
  __param(4, IViewsService),
  __param(5, ICommandService),
  __param(6, IEditorService),
  __param(7, IFileService),
  __param(8, IWorkspaceContextService),
  __param(9, ITelemetryService),
  __param(10, ITextFileService),
  __param(11, ILifecycleService),
  __param(12, IModelService),
  __param(13, IExtensionService),
  __param(14, IQuickInputService),
  __param(15, IConfigurationResolverService),
  __param(16, ITerminalService),
  __param(17, ITerminalGroupService),
  __param(18, IStorageService),
  __param(19, IProgressService),
  __param(20, IOpenerService),
  __param(21, IDialogService),
  __param(22, INotificationService),
  __param(23, IContextKeyService),
  __param(24, IWorkbenchEnvironmentService),
  __param(25, ITerminalProfileResolverService),
  __param(26, IPathService),
  __param(27, ITextModelService),
  __param(28, IPreferencesService),
  __param(29, IViewDescriptorService),
  __param(30, IWorkspaceTrustRequestService),
  __param(31, IWorkspaceTrustManagementService),
  __param(32, ILogService),
  __param(33, IThemeService),
  __param(34, IInstantiationService),
  __param(35, IRemoteAgentService),
  __param(36, IAccessibilitySignalService),
  __param(37, IChatService),
  __param(38, IChatAgentService),
  __param(39, IHostService)
], TaskService);
registerSingleton(
  ITaskService,
  TaskService,
  1
  /* InstantiationType.Delayed */
);
export {
  TaskService
};
//# sourceMappingURL=taskService.js.map
