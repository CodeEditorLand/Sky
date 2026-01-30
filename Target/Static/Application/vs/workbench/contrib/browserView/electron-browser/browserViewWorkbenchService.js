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
import { ipcBrowserViewChannelName } from "../../../../platform/browserView/common/browserView.js";
import { BrowserViewModel } from "../common/browserView.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { Event } from "../../../../base/common/event.js";
let BrowserViewWorkbenchService = class BrowserViewWorkbenchService2 {
  static {
    __name(this, "BrowserViewWorkbenchService");
  }
  constructor(mainProcessService, instantiationService, workspaceContextService) {
    this.instantiationService = instantiationService;
    this.workspaceContextService = workspaceContextService;
    this._models = /* @__PURE__ */ new Map();
    const channel = mainProcessService.getChannel(ipcBrowserViewChannelName);
    this._browserViewService = ProxyChannel.toService(channel);
  }
  async getOrCreateBrowserViewModel(id) {
    let model = this._models.get(id);
    if (model) {
      return model;
    }
    model = this.instantiationService.createInstance(BrowserViewModel, id, this._browserViewService);
    this._models.set(id, model);
    await model.initialize();
    Event.once(model.onWillDispose)(() => {
      this._models.delete(id);
    });
    return model;
  }
  async clearGlobalStorage() {
    return this._browserViewService.clearGlobalStorage();
  }
  async clearWorkspaceStorage() {
    const workspaceId = this.workspaceContextService.getWorkspace().id;
    return this._browserViewService.clearWorkspaceStorage(workspaceId);
  }
};
BrowserViewWorkbenchService = __decorate([
  __param(0, IMainProcessService),
  __param(1, IInstantiationService),
  __param(2, IWorkspaceContextService)
], BrowserViewWorkbenchService);
export {
  BrowserViewWorkbenchService
};
//# sourceMappingURL=browserViewWorkbenchService.js.map
