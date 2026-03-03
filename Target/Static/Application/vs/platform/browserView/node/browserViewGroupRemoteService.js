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
import { Event } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ProxyChannel } from "../../../base/parts/ipc/common/ipc.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { IMainProcessService } from "../../ipc/common/mainProcessService.js";
import { ipcBrowserViewGroupChannelName } from "../common/browserViewGroup.js";
const IBrowserViewGroupRemoteService = createDecorator("browserViewGroupRemoteService");
class RemoteBrowserViewGroup extends Disposable {
  static {
    __name(this, "RemoteBrowserViewGroup");
  }
  constructor(id, groupService) {
    super();
    this.id = id;
    this.groupService = groupService;
    this._register(groupService.onDynamicDidDestroy(this.id)(() => {
      this.dispose(true);
    }));
  }
  get onDidAddView() {
    return this.groupService.onDynamicDidAddView(this.id);
  }
  get onDidRemoveView() {
    return this.groupService.onDynamicDidRemoveView(this.id);
  }
  get onDidDestroy() {
    return this.groupService.onDynamicDidDestroy(this.id);
  }
  async addView(viewId) {
    return this.groupService.addViewToGroup(this.id, viewId);
  }
  async removeView(viewId) {
    return this.groupService.removeViewFromGroup(this.id, viewId);
  }
  async getDebugWebSocketEndpoint() {
    return this.groupService.getDebugWebSocketEndpoint(this.id);
  }
  dispose(fromService = false) {
    if (!fromService) {
      this.groupService.destroyGroup(this.id);
    }
    super.dispose();
  }
}
let BrowserViewGroupRemoteService = class BrowserViewGroupRemoteService2 {
  static {
    __name(this, "BrowserViewGroupRemoteService");
  }
  constructor(mainProcessService) {
    this._groups = /* @__PURE__ */ new Map();
    const channel = mainProcessService.getChannel(ipcBrowserViewGroupChannelName);
    this._groupService = ProxyChannel.toService(channel);
  }
  async createGroup() {
    const id = await this._groupService.createGroup();
    return this._wrap(id);
  }
  _wrap(id) {
    const group = new RemoteBrowserViewGroup(id, this._groupService);
    this._groups.set(id, group);
    Event.once(group.onDidDestroy)(() => {
      this._groups.delete(id);
    });
    return group;
  }
};
BrowserViewGroupRemoteService = __decorate([
  __param(0, IMainProcessService)
], BrowserViewGroupRemoteService);
export {
  BrowserViewGroupRemoteService,
  IBrowserViewGroupRemoteService
};
//# sourceMappingURL=browserViewGroupRemoteService.js.map
