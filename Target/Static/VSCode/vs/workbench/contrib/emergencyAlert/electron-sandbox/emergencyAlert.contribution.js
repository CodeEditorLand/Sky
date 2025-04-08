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
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from "../../../common/contributions.js";
import { IBannerService } from "../../../services/banner/browser/bannerService.js";
import { asJson, IRequestService } from "../../../../platform/request/common/request.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { arch, platform } from "../../../../base/common/process.js";
let EmergencyAlert = class {
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
  static {
    __name(this, "EmergencyAlert");
  }
  static ID = "workbench.contrib.emergencyAlert";
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
EmergencyAlert = __decorateClass([
  __decorateParam(0, IBannerService),
  __decorateParam(1, IRequestService),
  __decorateParam(2, IProductService),
  __decorateParam(3, ILogService)
], EmergencyAlert);
registerWorkbenchContribution2("workbench.emergencyAlert", EmergencyAlert, WorkbenchPhase.Eventually);
export {
  EmergencyAlert
};
//# sourceMappingURL=emergencyAlert.contribution.js.map
