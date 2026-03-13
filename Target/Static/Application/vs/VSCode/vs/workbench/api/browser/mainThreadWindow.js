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
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { ExtHostContext, MainContext } from "../common/extHost.protocol.js";
import { IHostService } from "../../services/host/browser/host.js";
import { IUserActivityService } from "../../services/userActivity/common/userActivityService.js";
import { encodeBase64 } from "../../../base/common/buffer.js";
let MainThreadWindow = class MainThreadWindow2 {
  static {
    __name(this, "MainThreadWindow");
  }
  constructor(extHostContext, hostService, openerService, userActivityService) {
    this.hostService = hostService;
    this.openerService = openerService;
    this.userActivityService = userActivityService;
    this.disposables = new DisposableStore();
    this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostWindow);
    Event.latch(hostService.onDidChangeFocus)(this.proxy.$onDidChangeWindowFocus, this.proxy, this.disposables);
    userActivityService.onDidChangeIsActive(this.proxy.$onDidChangeWindowActive, this.proxy, this.disposables);
    this.registerNativeHandle();
  }
  dispose() {
    this.disposables.dispose();
  }
  registerNativeHandle() {
    Event.latch(this.hostService.onDidChangeActiveWindow)(async (windowId) => {
      const handle = await this.hostService.getNativeWindowHandle(windowId);
      this.proxy.$onDidChangeActiveNativeWindowHandle(handle ? encodeBase64(handle) : void 0);
    }, this, this.disposables);
  }
  $getInitialState() {
    return Promise.resolve({
      isFocused: this.hostService.hasFocus,
      isActive: this.userActivityService.isActive
    });
  }
  async $openUri(uriComponents, uriString, options) {
    const uri = URI.from(uriComponents);
    let target;
    if (uriString && URI.parse(uriString).toString() === uri.toString()) {
      target = uriString;
    } else {
      target = uri;
    }
    return this.openerService.open(target, {
      openExternal: true,
      allowTunneling: options.allowTunneling,
      allowContributedOpeners: options.allowContributedOpeners
    });
  }
  async $asExternalUri(uriComponents, options) {
    const result = await this.openerService.resolveExternalUri(URI.revive(uriComponents), options);
    return result.resolved;
  }
};
MainThreadWindow = __decorate([
  extHostNamedCustomer(MainContext.MainThreadWindow),
  __param(1, IHostService),
  __param(2, IOpenerService),
  __param(3, IUserActivityService)
], MainThreadWindow);
export {
  MainThreadWindow
};
//# sourceMappingURL=mainThreadWindow.js.map
