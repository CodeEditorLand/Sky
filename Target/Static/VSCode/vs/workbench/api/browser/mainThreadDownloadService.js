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
import { Disposable } from "../../../base/common/lifecycle.js";
import { MainContext, MainThreadDownloadServiceShape } from "../common/extHost.protocol.js";
import { extHostNamedCustomer, IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IDownloadService } from "../../../platform/download/common/download.js";
import { UriComponents, URI } from "../../../base/common/uri.js";
let MainThreadDownloadService = class extends Disposable {
  constructor(extHostContext, downloadService) {
    super();
    this.downloadService = downloadService;
  }
  $download(uri, to) {
    return this.downloadService.download(URI.revive(uri), URI.revive(to));
  }
};
__name(MainThreadDownloadService, "MainThreadDownloadService");
MainThreadDownloadService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDownloadService),
  __decorateParam(1, IDownloadService)
], MainThreadDownloadService);
export {
  MainThreadDownloadService
};
//# sourceMappingURL=mainThreadDownloadService.js.map
