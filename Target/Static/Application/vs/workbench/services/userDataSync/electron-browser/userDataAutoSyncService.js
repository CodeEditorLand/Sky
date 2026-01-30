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
import { IUserDataAutoSyncService, UserDataSyncError } from "../../../../platform/userDataSync/common/userDataSync.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-browser/services.js";
import { Event } from "../../../../base/common/event.js";
import { registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
let UserDataAutoSyncService = class UserDataAutoSyncService2 {
  static {
    __name(this, "UserDataAutoSyncService");
  }
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
UserDataAutoSyncService = __decorate([
  __param(0, ISharedProcessService)
], UserDataAutoSyncService);
registerSingleton(
  IUserDataAutoSyncService,
  UserDataAutoSyncService,
  1
  /* InstantiationType.Delayed */
);
//# sourceMappingURL=userDataAutoSyncService.js.map
