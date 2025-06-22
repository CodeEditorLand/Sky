var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { randomPort } from "../../../../base/common/ports.js";
import * as nls from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import { Action2, MenuId } from "../../../../platform/actions/common/actions.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ActiveEditorContext } from "../../../common/contextkeys.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IDebugService } from "../../debug/common/debug.js";
import { RuntimeExtensionsEditor } from "./runtimeExtensionsEditor.js";
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
class DebugExtensionHostAction extends Action2 {
  static {
    __name(this, "DebugExtensionHostAction");
  }
  constructor() {
    super({
      id: "workbench.extensions.action.debugExtensionHost",
      title: { value: nls.localize("debugExtensionHost", "Start Debugging Extension Host In New Window"), original: "Start Debugging Extension Host In New Window" },
      category: Categories.Developer,
      f1: true,
      icon: Codicon.debugStart,
      menu: {
        id: MenuId.EditorTitle,
        when: ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID),
        group: "navigation"
      }
    });
  }
  run(accessor) {
    const nativeHostService = accessor.get(INativeHostService);
    const dialogService = accessor.get(IDialogService);
    const extensionService = accessor.get(IExtensionService);
    const productService = accessor.get(IProductService);
    const instantiationService = accessor.get(IInstantiationService);
    const hostService = accessor.get(IHostService);
    extensionService.getInspectPorts(1, false).then(async (inspectPorts) => {
      if (inspectPorts.length === 0) {
        const res = await dialogService.confirm({
          message: nls.localize("restart1", "Debug Extensions"),
          detail: nls.localize("restart2", "In order to debug extensions a restart is required. Do you want to restart '{0}' now?", productService.nameLong),
          primaryButton: nls.localize({ key: "restart3", comment: ["&& denotes a mnemonic"] }, "&&Restart")
        });
        if (res.confirmed) {
          await nativeHostService.relaunch({ addArgs: [`--inspect-extensions=${randomPort()}`] });
        }
        return;
      }
      if (inspectPorts.length > 1) {
        console.warn(`There are multiple extension hosts available for debugging. Picking the first one...`);
      }
      const s = instantiationService.createInstance(Storage);
      s.storeDebugOnNewWindow(inspectPorts[0].port);
      hostService.openWindow();
    });
  }
}
let Storage = class Storage2 {
  static {
    __name(this, "Storage");
  }
  constructor(_storageService) {
    this._storageService = _storageService;
  }
  storeDebugOnNewWindow(targetPort) {
    this._storageService.store(
      "debugExtensionHost.debugPort",
      targetPort,
      -1,
      1
      /* StorageTarget.MACHINE */
    );
  }
  getAndDeleteDebugPortIfSet() {
    const port = this._storageService.getNumber(
      "debugExtensionHost.debugPort",
      -1
      /* StorageScope.APPLICATION */
    );
    if (port !== void 0) {
      this._storageService.remove(
        "debugExtensionHost.debugPort",
        -1
        /* StorageScope.APPLICATION */
      );
    }
    return port;
  }
};
Storage = __decorate([
  __param(0, IStorageService)
], Storage);
let DebugExtensionsContribution = class DebugExtensionsContribution2 extends Disposable {
  static {
    __name(this, "DebugExtensionsContribution");
  }
  constructor(_debugService, _instantiationService, _progressService) {
    super();
    this._debugService = _debugService;
    this._instantiationService = _instantiationService;
    const storage = this._instantiationService.createInstance(Storage);
    const port = storage.getAndDeleteDebugPortIfSet();
    if (port !== void 0) {
      _progressService.withProgress({
        location: 15,
        title: nls.localize("debugExtensionHost.progress", "Attaching Debugger To Extension Host")
      }, async (p) => {
        await this._debugService.startDebugging(void 0, {
          type: "node",
          name: nls.localize("debugExtensionHost.launch.name", "Attach Extension Host"),
          request: "attach",
          port,
          trace: true,
          // resolve source maps everywhere:
          resolveSourceMapLocations: null,
          // announces sources eagerly for the loaded scripts view:
          eagerSources: true,
          // source maps of published VS Code are on the CDN and can take a while to load
          timeouts: {
            sourceMapMinPause: 3e4,
            sourceMapCumulativePause: 3e5
          }
        });
      });
    }
  }
};
DebugExtensionsContribution = __decorate([
  __param(0, IDebugService),
  __param(1, IInstantiationService),
  __param(2, IProgressService)
], DebugExtensionsContribution);
export {
  DebugExtensionHostAction,
  DebugExtensionsContribution
};
//# sourceMappingURL=debugExtensionHostAction.js.map
