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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { basename } from "../../../../../base/common/path.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { localize } from "../../../../../nls.js";
import { IExtensionManagementService } from "../../../../../platform/extensionManagement/common/extensionManagement.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { INotificationService, NeverShowAgainScope, NotificationPriority, Severity } from "../../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { registerWorkbenchContribution2 } from "../../../../common/contributions.js";
import { InstallRecommendedExtensionAction } from "../../../extensions/browser/extensionsActions.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
let TerminalWslRecommendationContribution = class TerminalWslRecommendationContribution2 extends Disposable {
  static {
    __name(this, "TerminalWslRecommendationContribution");
  }
  static {
    this.ID = "terminalWslRecommendation";
  }
  constructor(extensionManagementService, instantiationService, notificationService, productService, terminalService) {
    super();
    if (!isWindows) {
      return;
    }
    const exeBasedExtensionTips = productService.exeBasedExtensionTips;
    if (!exeBasedExtensionTips || !exeBasedExtensionTips.wsl) {
      return;
    }
    let listener = terminalService.onDidCreateInstance(async (instance) => {
      async function isExtensionInstalled(id) {
        const extensions = await extensionManagementService.getInstalled();
        return extensions.some((e) => e.identifier.id === id);
      }
      __name(isExtensionInstalled, "isExtensionInstalled");
      if (!instance.shellLaunchConfig.executable || basename(instance.shellLaunchConfig.executable).toLowerCase() !== "wsl.exe") {
        return;
      }
      listener?.dispose();
      listener = void 0;
      const extId = Object.keys(exeBasedExtensionTips.wsl.recommendations).find((extId2) => exeBasedExtensionTips.wsl.recommendations[extId2].important);
      if (!extId || await isExtensionInstalled(extId)) {
        return;
      }
      notificationService.prompt(Severity.Info, localize("useWslExtension.title", "The '{0}' extension is recommended for opening a terminal in WSL.", exeBasedExtensionTips.wsl.friendlyName), [
        {
          label: localize("install", "Install"),
          run: /* @__PURE__ */ __name(() => {
            instantiationService.createInstance(InstallRecommendedExtensionAction, extId).run();
          }, "run")
        }
      ], {
        sticky: true,
        priority: NotificationPriority.OPTIONAL,
        neverShowAgain: { id: "terminalConfigHelper/launchRecommendationsIgnore", scope: NeverShowAgainScope.APPLICATION },
        onCancel: /* @__PURE__ */ __name(() => {
        }, "onCancel")
      });
    });
  }
};
TerminalWslRecommendationContribution = __decorate([
  __param(0, IExtensionManagementService),
  __param(1, IInstantiationService),
  __param(2, INotificationService),
  __param(3, IProductService),
  __param(4, ITerminalService)
], TerminalWslRecommendationContribution);
registerWorkbenchContribution2(
  TerminalWslRecommendationContribution.ID,
  TerminalWslRecommendationContribution,
  4
  /* WorkbenchPhase.Eventually */
);
export {
  TerminalWslRecommendationContribution
};
//# sourceMappingURL=terminal.wslRecommendation.contribution.js.map
