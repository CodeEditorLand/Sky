var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { IUserDataAutoSyncService, SyncOptions, UserDataSyncError } from "../../../../platform/userDataSync/common/userDataSync.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-sandbox/services.js";
import { IChannel } from "../../../../base/parts/ipc/common/ipc.js";
import { Event } from "../../../../base/common/event.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
let UserDataAutoSyncService = class {
  static {
    __name(this, "UserDataAutoSyncService");
  }
  channel;
  get onError() {
    return Event.map(this.channel.listen("onError"), (e) => UserDataSyncError.toUserDataSyncError(e));
  }
  constructor(sharedProcessService) {
    this.channel = sharedProcessService.getChannel("userDataAutoSync");
  }
  triggerSync(sources, options) {
    return this.channel.call("triggerSync", [sources, options]);
  }
  turnOn() {
    return this.channel.call("turnOn");
  }
  turnOff(everywhere) {
    return this.channel.call("turnOff", [everywhere]);
  }
};
UserDataAutoSyncService = __decorateClass([
  __decorateParam(0, ISharedProcessService)
], UserDataAutoSyncService);
registerSingleton(IUserDataAutoSyncService, UserDataAutoSyncService, InstantiationType.Delayed);
//# sourceMappingURL=userDataAutoSyncService.js.map
