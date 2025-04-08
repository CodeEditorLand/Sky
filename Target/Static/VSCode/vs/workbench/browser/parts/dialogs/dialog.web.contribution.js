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
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IDialogHandler, IDialogResult, IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IWorkbenchContribution, WorkbenchPhase, registerWorkbenchContribution2 } from "../../../common/contributions.js";
import { IDialogsModel, IDialogViewItem } from "../../../common/dialogs.js";
import { BrowserDialogHandler } from "./dialogHandler.js";
import { DialogService } from "../../../services/dialogs/common/dialogService.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { Lazy } from "../../../../base/common/lazy.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
let DialogHandlerContribution = class extends Disposable {
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
  static {
    __name(this, "DialogHandlerContribution");
  }
  static ID = "workbench.contrib.dialogHandler";
  model;
  impl;
  currentDialog;
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
DialogHandlerContribution = __decorateClass([
  __decorateParam(0, IDialogService),
  __decorateParam(1, ILogService),
  __decorateParam(2, ILayoutService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IClipboardService),
  __decorateParam(7, IOpenerService)
], DialogHandlerContribution);
registerWorkbenchContribution2(
  DialogHandlerContribution.ID,
  DialogHandlerContribution,
  WorkbenchPhase.BlockStartup
  // Block to allow for dialogs to show before restore finished
);
export {
  DialogHandlerContribution
};
//# sourceMappingURL=dialog.web.contribution.js.map
