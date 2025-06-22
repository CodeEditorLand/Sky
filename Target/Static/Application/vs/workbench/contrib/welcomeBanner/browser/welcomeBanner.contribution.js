var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions as WorkbenchExtensions } from "../../../common/contributions.js";
import { IBannerService } from "../../../services/banner/browser/bannerService.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { URI } from "../../../../base/common/uri.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
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
var WelcomeBannerContribution_1;
let WelcomeBannerContribution = class WelcomeBannerContribution2 {
  static {
    __name(this, "WelcomeBannerContribution");
  }
  static {
    WelcomeBannerContribution_1 = this;
  }
  static {
    this.WELCOME_BANNER_DISMISSED_KEY = "workbench.banner.welcome.dismissed";
  }
  constructor(bannerService, storageService, environmentService) {
    const welcomeBanner = environmentService.options?.welcomeBanner;
    if (!welcomeBanner) {
      return;
    }
    if (storageService.getBoolean(WelcomeBannerContribution_1.WELCOME_BANNER_DISMISSED_KEY, 0, false)) {
      return;
    }
    let icon = void 0;
    if (typeof welcomeBanner.icon === "string") {
      icon = ThemeIcon.fromId(welcomeBanner.icon);
    } else if (welcomeBanner.icon) {
      icon = URI.revive(welcomeBanner.icon);
    }
    bannerService.show({
      id: "welcome.banner",
      message: welcomeBanner.message,
      icon,
      actions: welcomeBanner.actions,
      onClose: /* @__PURE__ */ __name(() => {
        storageService.store(
          WelcomeBannerContribution_1.WELCOME_BANNER_DISMISSED_KEY,
          true,
          0,
          1
          /* StorageTarget.MACHINE */
        );
      }, "onClose")
    });
  }
};
WelcomeBannerContribution = WelcomeBannerContribution_1 = __decorate([
  __param(0, IBannerService),
  __param(1, IStorageService),
  __param(2, IBrowserWorkbenchEnvironmentService)
], WelcomeBannerContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(
  WelcomeBannerContribution,
  3
  /* LifecyclePhase.Restored */
);
//# sourceMappingURL=welcomeBanner.contribution.js.map
