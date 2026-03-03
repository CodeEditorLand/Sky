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
import { Disposable, DisposableMap } from "../../../base/common/lifecycle.js";
import { Event } from "../../../base/common/event.js";
import { createDecorator, IInstantiationService } from "../../instantiation/common/instantiation.js";
import { generateUuid } from "../../../base/common/uuid.js";
import { BrowserViewGroup } from "./browserViewGroup.js";
const IBrowserViewGroupMainService = createDecorator("browserViewGroupMainService");
let BrowserViewGroupMainService = class BrowserViewGroupMainService2 extends Disposable {
  static {
    __name(this, "BrowserViewGroupMainService");
  }
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.groups = this._register(new DisposableMap());
  }
  async createGroup() {
    const id = generateUuid();
    const group = this.instantiationService.createInstance(BrowserViewGroup, id);
    this.groups.set(id, group);
    Event.once(group.onDidDestroy)(() => {
      this.groups.deleteAndLeak(id);
    });
    return id;
  }
  async destroyGroup(groupId) {
    this.groups.deleteAndDispose(groupId);
  }
  async addViewToGroup(groupId, viewId) {
    return this._getGroup(groupId).addView(viewId);
  }
  async removeViewFromGroup(groupId, viewId) {
    return this._getGroup(groupId).removeView(viewId);
  }
  async getDebugWebSocketEndpoint(groupId) {
    return this._getGroup(groupId).getDebugWebSocketEndpoint();
  }
  onDynamicDidAddView(groupId) {
    return this._getGroup(groupId).onDidAddView;
  }
  onDynamicDidRemoveView(groupId) {
    return this._getGroup(groupId).onDidRemoveView;
  }
  onDynamicDidDestroy(groupId) {
    return this._getGroup(groupId).onDidDestroy;
  }
  /**
   * Get a group or throw if not found.
   */
  _getGroup(groupId) {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Browser view group ${groupId} not found`);
    }
    return group;
  }
};
BrowserViewGroupMainService = __decorate([
  __param(0, IInstantiationService)
], BrowserViewGroupMainService);
export {
  BrowserViewGroupMainService,
  IBrowserViewGroupMainService
};
//# sourceMappingURL=browserViewGroupMainService.js.map
