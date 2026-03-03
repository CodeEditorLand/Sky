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
import { ProxyChannel } from "../../../base/parts/ipc/common/ipc.js";
import { SyncDescriptor } from "../../instantiation/common/descriptors.js";
import { registerSingleton } from "../../instantiation/common/extensions.js";
import { createDecorator, IInstantiationService } from "../../instantiation/common/instantiation.js";
import { IMainProcessService } from "../common/mainProcessService.js";
class RemoteServiceStub {
  static {
    __name(this, "RemoteServiceStub");
  }
  constructor(channelName, options, remote, instantiationService) {
    const channel = remote.getChannel(channelName);
    if (isRemoteServiceWithChannelClientOptions(options)) {
      return instantiationService.createInstance(new SyncDescriptor(options.channelClientCtor, [channel]));
    }
    return ProxyChannel.toService(channel, options?.proxyOptions);
  }
}
function isRemoteServiceWithChannelClientOptions(obj) {
  const candidate = obj;
  return !!candidate?.channelClientCtor;
}
__name(isRemoteServiceWithChannelClientOptions, "isRemoteServiceWithChannelClientOptions");
let MainProcessRemoteServiceStub = class MainProcessRemoteServiceStub2 extends RemoteServiceStub {
  static {
    __name(this, "MainProcessRemoteServiceStub");
  }
  constructor(channelName, options, ipcService, instantiationService) {
    super(channelName, options, ipcService, instantiationService);
  }
};
MainProcessRemoteServiceStub = __decorate([
  __param(2, IMainProcessService),
  __param(3, IInstantiationService)
], MainProcessRemoteServiceStub);
function registerMainProcessRemoteService(id, channelName, options) {
  registerSingleton(id, new SyncDescriptor(MainProcessRemoteServiceStub, [channelName, options], true));
}
__name(registerMainProcessRemoteService, "registerMainProcessRemoteService");
const ISharedProcessService = createDecorator("sharedProcessService");
let SharedProcessRemoteServiceStub = class SharedProcessRemoteServiceStub2 extends RemoteServiceStub {
  static {
    __name(this, "SharedProcessRemoteServiceStub");
  }
  constructor(channelName, options, ipcService, instantiationService) {
    super(channelName, options, ipcService, instantiationService);
  }
};
SharedProcessRemoteServiceStub = __decorate([
  __param(2, ISharedProcessService),
  __param(3, IInstantiationService)
], SharedProcessRemoteServiceStub);
function registerSharedProcessRemoteService(id, channelName, options) {
  registerSingleton(id, new SyncDescriptor(SharedProcessRemoteServiceStub, [channelName, options], true));
}
__name(registerSharedProcessRemoteService, "registerSharedProcessRemoteService");
export {
  ISharedProcessService,
  registerMainProcessRemoteService,
  registerSharedProcessRemoteService
};
//# sourceMappingURL=services.js.map
