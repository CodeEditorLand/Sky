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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { INativeHostMainService } from "../../native/electron-main/nativeHostMainService.js";
import { IProductService } from "../../product/common/productService.js";
import { asJson, IRequestService } from "../../request/common/request.js";
import { AvailableForDownload, IUpdate, State, UpdateType } from "../common/update.js";
import { AbstractUpdateService, createUpdateURL } from "./abstractUpdateService.js";
let LinuxUpdateService = class extends AbstractUpdateService {
  constructor(lifecycleMainService, configurationService, environmentMainService, requestService, logService, nativeHostMainService, productService) {
    super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService);
    this.nativeHostMainService = nativeHostMainService;
  }
  static {
    __name(this, "LinuxUpdateService");
  }
  buildUpdateFeedUrl(quality) {
    return createUpdateURL(`linux-${process.arch}`, quality, this.productService);
  }
  doCheckForUpdates(context) {
    if (!this.url) {
      return;
    }
    this.setState(State.CheckingForUpdates(context));
    this.requestService.request({ url: this.url }, CancellationToken.None).then(asJson).then((update) => {
      if (!update || !update.url || !update.version || !update.productVersion) {
        this.setState(State.Idle(UpdateType.Archive));
      } else {
        this.setState(State.AvailableForDownload(update));
      }
    }).then(void 0, (err) => {
      this.logService.error(err);
      const message = !!context ? err.message || err : void 0;
      this.setState(State.Idle(UpdateType.Archive, message));
    });
  }
  async doDownloadUpdate(state) {
    if (this.productService.downloadUrl && this.productService.downloadUrl.length > 0) {
      this.nativeHostMainService.openExternal(void 0, this.productService.downloadUrl);
    } else if (state.update.url) {
      this.nativeHostMainService.openExternal(void 0, state.update.url);
    }
    this.setState(State.Idle(UpdateType.Archive));
  }
};
LinuxUpdateService = __decorateClass([
  __decorateParam(0, ILifecycleMainService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IEnvironmentMainService),
  __decorateParam(3, IRequestService),
  __decorateParam(4, ILogService),
  __decorateParam(5, INativeHostMainService),
  __decorateParam(6, IProductService)
], LinuxUpdateService);
export {
  LinuxUpdateService
};
//# sourceMappingURL=updateService.linux.js.map
