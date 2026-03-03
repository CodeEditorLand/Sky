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
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { BrowserDialogHandler } from "../../../browser/parts/dialogs/dialogHandler.js";
import { NativeDialogHandler } from "./dialogHandler.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { createNativeAboutDialogDetails } from "../../../../platform/dialogs/electron-browser/dialog.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
let DialogHandlerContribution = class DialogHandlerContribution2 extends Disposable {
  static {
    __name(this, "DialogHandlerContribution");
  }
  static {
    this.ID = "workbench.contrib.dialogHandler";
  }
  constructor(configurationService, dialogService, logService, instantiationService, productService, clipboardService, nativeHostService, environmentService) {
    super();
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.productService = productService;
    this.nativeHostService = nativeHostService;
    this.environmentService = environmentService;
    this.browserImpl = new Lazy(() => instantiationService.createInstance(BrowserDialogHandler));
    this.nativeImpl = new Lazy(() => new NativeDialogHandler(logService, nativeHostService, clipboardService));
    this.model = this.dialogService.model;
    this._register(this.model.onWillShowDialog(() => {
      if (!this.currentDialog) {
        this.processDialogs();
      }
    }));
    this.processDialogs();
  }
  async processDialogs() {
    while (this.model.dialogs.length) {
      this.currentDialog = this.model.dialogs[0];
      let result = void 0;
      try {
        if (this.currentDialog.args.confirmArgs) {
          const args = this.currentDialog.args.confirmArgs;
          result = this.useCustomDialog || args?.confirmation.custom ? await this.browserImpl.value.confirm(args.confirmation) : await this.nativeImpl.value.confirm(args.confirmation);
        } else if (this.currentDialog.args.inputArgs) {
          const args = this.currentDialog.args.inputArgs;
          result = await this.browserImpl.value.input(args.input);
        } else if (this.currentDialog.args.promptArgs) {
          const args = this.currentDialog.args.promptArgs;
          result = this.useCustomDialog || args?.prompt.custom ? await this.browserImpl.value.prompt(args.prompt) : await this.nativeImpl.value.prompt(args.prompt);
        } else {
          const aboutDialogDetails = createNativeAboutDialogDetails(this.productService, await this.nativeHostService.getOSProperties());
          if (this.useCustomDialog) {
            await this.browserImpl.value.about(aboutDialogDetails.title, aboutDialogDetails.details, aboutDialogDetails.detailsToCopy);
          } else {
            await this.nativeImpl.value.about(aboutDialogDetails.title, aboutDialogDetails.details, aboutDialogDetails.detailsToCopy);
          }
        }
      } catch (error) {
        result = error;
      }
      this.currentDialog.close(result);
      this.currentDialog = void 0;
    }
  }
  get useCustomDialog() {
    return this.configurationService.getValue("window.dialogStyle") === "custom" || // Use the custom dialog while driven so that the driver can interact with it
    !!this.environmentService.enableSmokeTestDriver;
  }
};
DialogHandlerContribution = __decorate([
  __param(0, IConfigurationService),
  __param(1, IDialogService),
  __param(2, ILogService),
  __param(3, IInstantiationService),
  __param(4, IProductService),
  __param(5, IClipboardService),
  __param(6, INativeHostService),
  __param(7, IWorkbenchEnvironmentService)
], DialogHandlerContribution);
registerWorkbenchContribution2(
  DialogHandlerContribution.ID,
  DialogHandlerContribution,
  1
  /* WorkbenchPhase.BlockStartup */
);
export {
  DialogHandlerContribution
};
//# sourceMappingURL=dialog.contribution.js.map
