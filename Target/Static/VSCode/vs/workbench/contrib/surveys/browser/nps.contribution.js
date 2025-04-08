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
import * as nls from "../../../../nls.js";
import { language } from "../../../../base/common/platform.js";
import { IWorkbenchContributionsRegistry, IWorkbenchContribution, Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { Severity, INotificationService, NotificationPriority } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { URI } from "../../../../base/common/uri.js";
import { platform } from "../../../../base/common/process.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
const PROBABILITY = 0.15;
const SESSION_COUNT_KEY = "nps/sessionCount";
const LAST_SESSION_DATE_KEY = "nps/lastSessionDate";
const SKIP_VERSION_KEY = "nps/skipVersion";
const IS_CANDIDATE_KEY = "nps/isCandidate";
let NPSContribution = class {
  static {
    __name(this, "NPSContribution");
  }
  constructor(storageService, notificationService, telemetryService, openerService, productService, configurationService) {
    if (!productService.npsSurveyUrl || !configurationService.getValue("telemetry.feedback.enabled")) {
      return;
    }
    const skipVersion = storageService.get(SKIP_VERSION_KEY, StorageScope.APPLICATION, "");
    if (skipVersion) {
      return;
    }
    const date = (/* @__PURE__ */ new Date()).toDateString();
    const lastSessionDate = storageService.get(LAST_SESSION_DATE_KEY, StorageScope.APPLICATION, (/* @__PURE__ */ new Date(0)).toDateString());
    if (date === lastSessionDate) {
      return;
    }
    const sessionCount = (storageService.getNumber(SESSION_COUNT_KEY, StorageScope.APPLICATION, 0) || 0) + 1;
    storageService.store(LAST_SESSION_DATE_KEY, date, StorageScope.APPLICATION, StorageTarget.USER);
    storageService.store(SESSION_COUNT_KEY, sessionCount, StorageScope.APPLICATION, StorageTarget.USER);
    if (sessionCount < 9) {
      return;
    }
    const isCandidate = storageService.getBoolean(IS_CANDIDATE_KEY, StorageScope.APPLICATION, false) || Math.random() < PROBABILITY;
    storageService.store(IS_CANDIDATE_KEY, isCandidate, StorageScope.APPLICATION, StorageTarget.USER);
    if (!isCandidate) {
      storageService.store(SKIP_VERSION_KEY, productService.version, StorageScope.APPLICATION, StorageTarget.USER);
      return;
    }
    notificationService.prompt(
      Severity.Info,
      nls.localize("surveyQuestion", "Do you mind taking a quick feedback survey?"),
      [{
        label: nls.localize("takeSurvey", "Take Survey"),
        run: /* @__PURE__ */ __name(() => {
          openerService.open(URI.parse(`${productService.npsSurveyUrl}?o=${encodeURIComponent(platform)}&v=${encodeURIComponent(productService.version)}&m=${encodeURIComponent(telemetryService.machineId)}`));
          storageService.store(IS_CANDIDATE_KEY, false, StorageScope.APPLICATION, StorageTarget.USER);
          storageService.store(SKIP_VERSION_KEY, productService.version, StorageScope.APPLICATION, StorageTarget.USER);
        }, "run")
      }, {
        label: nls.localize("remindLater", "Remind Me Later"),
        run: /* @__PURE__ */ __name(() => storageService.store(SESSION_COUNT_KEY, sessionCount - 3, StorageScope.APPLICATION, StorageTarget.USER), "run")
      }, {
        label: nls.localize("neverAgain", "Don't Show Again"),
        run: /* @__PURE__ */ __name(() => {
          storageService.store(IS_CANDIDATE_KEY, false, StorageScope.APPLICATION, StorageTarget.USER);
          storageService.store(SKIP_VERSION_KEY, productService.version, StorageScope.APPLICATION, StorageTarget.USER);
        }, "run")
      }],
      { sticky: true, priority: NotificationPriority.URGENT }
    );
  }
};
NPSContribution = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IConfigurationService)
], NPSContribution);
if (language === "en") {
  const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
  workbenchRegistry.registerWorkbenchContribution(NPSContribution, LifecyclePhase.Restored);
}
//# sourceMappingURL=nps.contribution.js.map
