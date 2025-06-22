var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { BrowserDialogHandler } from "./dialogHandler.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
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
let DialogHandlerContribution = class DialogHandlerContribution2 extends Disposable {
  static {
    __name(this, "DialogHandlerContribution");
  }
  static {
    this.ID = "workbench.contrib.dialogHandler";
  }
  constructor(dialogService, logService, layoutService, keybindingService, instantiationService, productService, clipboardService, openerService) {
    super();
    this.dialogService = dialogService;
    this.impl = new Lazy(() => new BrowserDialogHandler(logService, layoutService, keybindingService, instantiationService, productService, clipboardService, openerService));
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
          result = await this.impl.value.confirm(args.confirmation);
        } else if (this.currentDialog.args.inputArgs) {
          const args = this.currentDialog.args.inputArgs;
          result = await this.impl.value.input(args.input);
        } else if (this.currentDialog.args.promptArgs) {
          const args = this.currentDialog.args.promptArgs;
          result = await this.impl.value.prompt(args.prompt);
        } else {
          await this.impl.value.about();
        }
      } catch (error) {
        result = error;
      }
      this.currentDialog.close(result);
      this.currentDialog = void 0;
    }
  }
};
DialogHandlerContribution = __decorate([
  __param(0, IDialogService),
  __param(1, ILogService),
  __param(2, ILayoutService),
  __param(3, IKeybindingService),
  __param(4, IInstantiationService),
  __param(5, IProductService),
  __param(6, IClipboardService),
  __param(7, IOpenerService)
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
//# sourceMappingURL=dialog.web.contribution.js.map
