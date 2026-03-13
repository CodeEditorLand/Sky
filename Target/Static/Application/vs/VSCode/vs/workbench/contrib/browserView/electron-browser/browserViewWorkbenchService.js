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
import { BrowserViewCommandId, ipcBrowserViewChannelName } from "../../../../platform/browserView/common/browserView.js";
import { BrowserViewModel } from "../common/browserView.js";
import { IMainProcessService } from "../../../../platform/ipc/common/mainProcessService.js";
import { ProxyChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
import { Event } from "../../../../base/common/event.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
const browserViewContextMenuCommands = [
  BrowserViewCommandId.GoBack,
  BrowserViewCommandId.GoForward,
  BrowserViewCommandId.Reload
];
let BrowserViewWorkbenchService = class BrowserViewWorkbenchService2 extends Disposable {
  static {
    __name(this, "BrowserViewWorkbenchService");
  }
  constructor(mainProcessService, instantiationService, workspaceContextService, keybindingService) {
    super();
    this.instantiationService = instantiationService;
    this.workspaceContextService = workspaceContextService;
    this.keybindingService = keybindingService;
    this._models = /* @__PURE__ */ new Map();
    const channel = mainProcessService.getChannel(ipcBrowserViewChannelName);
    this._browserViewService = ProxyChannel.toService(channel);
    this.sendKeybindings();
    this._register(this.keybindingService.onDidUpdateKeybindings(() => this.sendKeybindings()));
  }
  async getOrCreateBrowserViewModel(id) {
    return this._getBrowserViewModel(id, true);
  }
  async getBrowserViewModel(id) {
    return this._getBrowserViewModel(id, false);
  }
  async clearGlobalStorage() {
    return this._browserViewService.clearGlobalStorage();
  }
  async clearWorkspaceStorage() {
    const workspaceId = this.workspaceContextService.getWorkspace().id;
    return this._browserViewService.clearWorkspaceStorage(workspaceId);
  }
  async _getBrowserViewModel(id, create) {
    let model = this._models.get(id);
    if (model) {
      return model;
    }
    model = this.instantiationService.createInstance(BrowserViewModel, id, this._browserViewService);
    this._models.set(id, model);
    try {
      await model.initialize(create);
    } catch (e) {
      this._models.delete(id);
      throw e;
    }
    Event.once(model.onWillDispose)(() => {
      this._models.delete(id);
    });
    return model;
  }
  sendKeybindings() {
    const keybindings = /* @__PURE__ */ Object.create(null);
    for (const commandId of browserViewContextMenuCommands) {
      const binding = this.keybindingService.lookupKeybinding(commandId);
      const accelerator = binding?.getElectronAccelerator();
      if (accelerator) {
        keybindings[commandId] = accelerator;
      }
    }
    void this._browserViewService.updateKeybindings(keybindings);
  }
};
BrowserViewWorkbenchService = __decorate([
  __param(0, IMainProcessService),
  __param(1, IInstantiationService),
  __param(2, IWorkspaceContextService),
  __param(3, IKeybindingService)
], BrowserViewWorkbenchService);
export {
  BrowserViewWorkbenchService
};
//# sourceMappingURL=browserViewWorkbenchService.js.map
