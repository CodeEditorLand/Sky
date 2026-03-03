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
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IConfigurationService } from "../../configuration/common/configuration.js";
import { IEnvironmentMainService } from "../../environment/electron-main/environmentMainService.js";
import { ILifecycleMainService } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { IMeteredConnectionService } from "../../meteredConnection/common/meteredConnection.js";
import { INativeHostMainService } from "../../native/electron-main/nativeHostMainService.js";
import { IProductService } from "../../product/common/productService.js";
import { asJson, IRequestService } from "../../request/common/request.js";
import { State } from "../common/update.js";
import { AbstractUpdateService, createUpdateURL } from "./abstractUpdateService.js";
let LinuxUpdateService = class LinuxUpdateService2 extends AbstractUpdateService {
  static {
    __name(this, "LinuxUpdateService");
  }
  constructor(lifecycleMainService, configurationService, environmentMainService, requestService, logService, nativeHostMainService, productService, meteredConnectionService) {
    super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService, meteredConnectionService, false);
    this.nativeHostMainService = nativeHostMainService;
  }
  buildUpdateFeedUrl(quality, commit, options) {
    return createUpdateURL(this.productService.updateUrl, `linux-${process.arch}`, quality, commit, options);
  }
  doCheckForUpdates(explicit, _pendingCommit) {
    if (!this.quality) {
      return;
    }
    const internalOrg = this.getInternalOrg();
    const background = !explicit && !internalOrg;
    const url = this.buildUpdateFeedUrl(this.quality, this.productService.commit, { background, internalOrg });
    this.setState(State.CheckingForUpdates(explicit));
    this.requestService.request({ url }, CancellationToken.None).then(asJson).then((update) => {
      if (!update || !update.url || !update.version || !update.productVersion) {
        this.setState(State.Idle(
          1
          /* UpdateType.Archive */
        ));
      } else {
        this.setState(State.AvailableForDownload(update));
      }
    }).then(void 0, (err) => {
      this.logService.error(err);
      const message = explicit ? err.message || err : void 0;
      this.setState(State.Idle(1, message));
    });
  }
  async doDownloadUpdate(state) {
    if (this.productService.downloadUrl && this.productService.downloadUrl.length > 0) {
      this.nativeHostMainService.openExternal(void 0, this.productService.downloadUrl);
    } else if (state.update.url) {
      this.nativeHostMainService.openExternal(void 0, state.update.url);
    }
    this.setState(State.Idle(
      1
      /* UpdateType.Archive */
    ));
  }
};
LinuxUpdateService = __decorate([
  __param(0, ILifecycleMainService),
  __param(1, IConfigurationService),
  __param(2, IEnvironmentMainService),
  __param(3, IRequestService),
  __param(4, ILogService),
  __param(5, INativeHostMainService),
  __param(6, IProductService),
  __param(7, IMeteredConnectionService)
], LinuxUpdateService);
export {
  LinuxUpdateService
};
//# sourceMappingURL=updateService.linux.js.map
