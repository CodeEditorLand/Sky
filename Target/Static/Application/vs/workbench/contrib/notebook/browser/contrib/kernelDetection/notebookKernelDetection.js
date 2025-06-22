var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { Registry } from "../../../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions } from "../../../../../common/contributions.js";
import { INotebookKernelService } from "../../../common/notebookKernelService.js";
import { INotebookLoggingService } from "../../../common/notebookLoggingService.js";
import { IExtensionService } from "../../../../../services/extensions/common/extensions.js";
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
let NotebookKernelDetection = class NotebookKernelDetection2 extends Disposable {
  static {
    __name(this, "NotebookKernelDetection");
  }
  constructor(_notebookKernelService, _extensionService, _notebookLoggingService) {
    super();
    this._notebookKernelService = _notebookKernelService;
    this._extensionService = _extensionService;
    this._notebookLoggingService = _notebookLoggingService;
    this._detectionMap = /* @__PURE__ */ new Map();
    this._localDisposableStore = this._register(new DisposableStore());
    this._registerListeners();
  }
  _registerListeners() {
    this._localDisposableStore.clear();
    this._localDisposableStore.add(this._extensionService.onWillActivateByEvent((e) => {
      if (e.event.startsWith("onNotebook:")) {
        if (this._extensionService.activationEventIsDone(e.event)) {
          return;
        }
        const notebookType = e.event.substring("onNotebook:".length);
        if (notebookType === "*") {
          return;
        }
        let shouldStartDetection = false;
        const extensionStatus = this._extensionService.getExtensionsStatus();
        this._extensionService.extensions.forEach((extension) => {
          if (extensionStatus[extension.identifier.value].activationTimes) {
            return;
          }
          if (extension.activationEvents?.includes(e.event)) {
            shouldStartDetection = true;
          }
        });
        if (shouldStartDetection && !this._detectionMap.has(notebookType)) {
          this._notebookLoggingService.debug("KernelDetection", `start extension activation for ${notebookType}`);
          const task = this._notebookKernelService.registerNotebookKernelDetectionTask({
            notebookType
          });
          this._detectionMap.set(notebookType, task);
        }
      }
    }));
    let timer = null;
    this._localDisposableStore.add(this._extensionService.onDidChangeExtensionsStatus(() => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        const taskToDelete = [];
        for (const [notebookType, task] of this._detectionMap) {
          if (this._extensionService.activationEventIsDone(`onNotebook:${notebookType}`)) {
            this._notebookLoggingService.debug("KernelDetection", `finish extension activation for ${notebookType}`);
            taskToDelete.push(notebookType);
            task.dispose();
          }
        }
        taskToDelete.forEach((notebookType) => {
          this._detectionMap.delete(notebookType);
        });
      });
    }));
    this._localDisposableStore.add({
      dispose: /* @__PURE__ */ __name(() => {
        if (timer) {
          clearTimeout(timer);
        }
      }, "dispose")
    });
  }
};
NotebookKernelDetection = __decorate([
  __param(0, INotebookKernelService),
  __param(1, IExtensionService),
  __param(2, INotebookLoggingService)
], NotebookKernelDetection);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  NotebookKernelDetection,
  3
  /* LifecyclePhase.Restored */
);
//# sourceMappingURL=notebookKernelDetection.js.map
