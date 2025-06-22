var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { IBannerService } from "../../../services/banner/browser/bannerService.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { arch, platform } from "../../../../base/common/process.js";
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
let EmergencyAlert = class EmergencyAlert2 {
  static {
    __name(this, "EmergencyAlert");
  }
  static {
    this.ID = "workbench.contrib.emergencyAlert";
  }
  constructor(bannerService, requestService, productService, logService) {
    this.bannerService = bannerService;
    this.requestService = requestService;
    this.productService = productService;
    this.logService = logService;
    if (productService.quality !== "insider") {
      return;
    }
    const emergencyAlertUrl = productService.emergencyAlertUrl;
    if (!emergencyAlertUrl) {
      return;
    }
    this.fetchAlerts(emergencyAlertUrl);
  }
  async fetchAlerts(url) {
    try {
      await this.doFetchAlerts(url);
    } catch (e) {
      this.logService.error(e);
    }
  }
  async doFetchAlerts(url) {
    const requestResult = await this.requestService.request({ type: "GET", url, disableCache: true }, CancellationToken.None);
    if (requestResult.res.statusCode !== 200) {
      throw new Error(`Failed to fetch emergency alerts: HTTP ${requestResult.res.statusCode}`);
    }
    const emergencyAlerts = await asJson(requestResult);
    if (!emergencyAlerts) {
      return;
    }
    for (const emergencyAlert of emergencyAlerts.alerts) {
      if (emergencyAlert.commit !== this.productService.commit || // version mismatch
      emergencyAlert.platform && emergencyAlert.platform !== platform || // platform mismatch
      emergencyAlert.arch && emergencyAlert.arch !== arch) {
        return;
      }
      this.bannerService.show({
        id: "emergencyAlert.banner",
        icon: Codicon.warning,
        message: emergencyAlert.message,
        actions: emergencyAlert.actions
      });
      break;
    }
  }
};
EmergencyAlert = __decorate([
  __param(0, IBannerService),
  __param(1, IRequestService),
  __param(2, IProductService),
  __param(3, ILogService)
], EmergencyAlert);
registerWorkbenchContribution2(
  "workbench.emergencyAlert",
  EmergencyAlert,
  4
  /* WorkbenchPhase.Eventually */
);
export {
  EmergencyAlert
};
//# sourceMappingURL=emergencyAlert.contribution.js.map
