var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../base/common/lifecycle.js";
import { MainContext } from "../common/extHost.protocol.js";
import { extHostNamedCustomer } from "../../services/extensions/common/extHostCustomers.js";
import { IDownloadService } from "../../../platform/download/common/download.js";
import { URI } from "../../../base/common/uri.js";
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
let MainThreadDownloadService = class MainThreadDownloadService2 extends Disposable {
  static {
    __name(this, "MainThreadDownloadService");
  }
  constructor(extHostContext, downloadService) {
    super();
    this.downloadService = downloadService;
  }
  $download(uri, to) {
    return this.downloadService.download(URI.revive(uri), URI.revive(to));
  }
};
MainThreadDownloadService = __decorate([
  extHostNamedCustomer(MainContext.MainThreadDownloadService),
  __param(1, IDownloadService)
], MainThreadDownloadService);
export {
  MainThreadDownloadService
};
//# sourceMappingURL=mainThreadDownloadService.js.map
