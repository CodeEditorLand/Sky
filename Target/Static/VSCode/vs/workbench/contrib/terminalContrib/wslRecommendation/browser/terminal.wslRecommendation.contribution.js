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
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { basename } from "../../../../../base/common/path.js";
import { isWindows } from "../../../../../base/common/platform.js";
import { localize } from "../../../../../nls.js";
import { IExtensionManagementService } from "../../../../../platform/extensionManagement/common/extensionManagement.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { INotificationService, NeverShowAgainScope, NotificationPriority, Severity } from "../../../../../platform/notification/common/notification.js";
import { IProductService } from "../../../../../platform/product/common/productService.js";
import { registerWorkbenchContribution2, WorkbenchPhase } from "../../../../common/contributions.js";
import { InstallRecommendedExtensionAction } from "../../../extensions/browser/extensionsActions.js";
import { ITerminalService } from "../../../terminal/browser/terminal.js";
let TerminalWslRecommendationContribution = class extends Disposable {
  static {
    __name(this, "TerminalWslRecommendationContribution");
  }
  static ID = "terminalWslRecommendation";
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
      notificationService.prompt(
        Severity.Info,
        localize("useWslExtension.title", "The '{0}' extension is recommended for opening a terminal in WSL.", exeBasedExtensionTips.wsl.friendlyName),
        [
          {
            label: localize("install", "Install"),
            run: /* @__PURE__ */ __name(() => {
              instantiationService.createInstance(InstallRecommendedExtensionAction, extId).run();
            }, "run")
          }
        ],
        {
          sticky: true,
          priority: NotificationPriority.OPTIONAL,
          neverShowAgain: { id: "terminalConfigHelper/launchRecommendationsIgnore", scope: NeverShowAgainScope.APPLICATION },
          onCancel: /* @__PURE__ */ __name(() => {
          }, "onCancel")
        }
      );
    });
  }
};
TerminalWslRecommendationContribution = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IProductService),
  __decorateParam(4, ITerminalService)
], TerminalWslRecommendationContribution);
registerWorkbenchContribution2(TerminalWslRecommendationContribution.ID, TerminalWslRecommendationContribution, WorkbenchPhase.Eventually);
export {
  TerminalWslRecommendationContribution
};
//# sourceMappingURL=terminal.wslRecommendation.contribution.js.map
