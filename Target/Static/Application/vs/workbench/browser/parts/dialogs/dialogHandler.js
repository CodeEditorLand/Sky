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
var BrowserDialogHandler_1;
import { localize } from "../../../../nls.js";
import { AbstractDialogHandler } from "../../../../platform/dialogs/common/dialogs.js";
import { ILayoutService } from "../../../../platform/layout/browser/layoutService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import Severity from "../../../../base/common/severity.js";
import { Dialog } from "../../../../base/browser/ui/dialog/dialog.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { fromNow } from "../../../../base/common/date.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { MarkdownRenderer, openLinkFromMarkdown } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { createWorkbenchDialogOptions } from "../../../../platform/dialogs/browser/dialog.js";
let BrowserDialogHandler = class BrowserDialogHandler2 extends AbstractDialogHandler {
  static {
    __name(this, "BrowserDialogHandler");
  }
  static {
    BrowserDialogHandler_1 = this;
  }
  static {
    this.ALLOWABLE_COMMANDS = [
      "copy",
      "cut",
      "editor.action.selectAll",
      "editor.action.clipboardCopyAction",
      "editor.action.clipboardCutAction",
      "editor.action.clipboardPasteAction"
    ];
  }
  constructor(logService, layoutService, keybindingService, instantiationService, productService, clipboardService, openerService) {
    super();
    this.logService = logService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.productService = productService;
    this.clipboardService = clipboardService;
    this.openerService = openerService;
    this.markdownRenderer = instantiationService.createInstance(MarkdownRenderer, {});
  }
  async prompt(prompt) {
    this.logService.trace("DialogService#prompt", prompt.message);
    const buttons = this.getPromptButtons(prompt);
    const { button, checkboxChecked } = await this.doShow(prompt.type, prompt.message, buttons, prompt.detail, prompt.cancelButton ? buttons.length - 1 : -1, prompt.checkbox, void 0, typeof prompt?.custom === "object" ? prompt.custom : void 0);
    return this.getPromptResult(prompt, button, checkboxChecked);
  }
  async confirm(confirmation) {
    this.logService.trace("DialogService#confirm", confirmation.message);
    const buttons = this.getConfirmationButtons(confirmation);
    const { button, checkboxChecked } = await this.doShow(confirmation.type ?? "question", confirmation.message, buttons, confirmation.detail, buttons.length - 1, confirmation.checkbox, void 0, typeof confirmation?.custom === "object" ? confirmation.custom : void 0);
    return { confirmed: button === 0, checkboxChecked };
  }
  async input(input) {
    this.logService.trace("DialogService#input", input.message);
    const buttons = this.getInputButtons(input);
    const { button, checkboxChecked, values } = await this.doShow(input.type ?? "question", input.message, buttons, input.detail, buttons.length - 1, input?.checkbox, input.inputs, typeof input.custom === "object" ? input.custom : void 0);
    return { confirmed: button === 0, checkboxChecked, values };
  }
  async about() {
    const detailString = /* @__PURE__ */ __name((useAgo) => {
      return localize("aboutDetail", "Version: {0}\nCommit: {1}\nDate: {2}\nBrowser: {3}", this.productService.version || "Unknown", this.productService.commit || "Unknown", this.productService.date ? `${this.productService.date}${useAgo ? " (" + fromNow(new Date(this.productService.date), true) + ")" : ""}` : "Unknown", navigator.userAgent);
    }, "detailString");
    const detail = detailString(true);
    const detailToCopy = detailString(false);
    const { button } = await this.doShow(Severity.Info, this.productService.nameLong, [
      localize({ key: "copy", comment: ["&& denotes a mnemonic"] }, "&&Copy"),
      localize("ok", "OK")
    ], detail, 1);
    if (button === 0) {
      this.clipboardService.writeText(detailToCopy);
    }
  }
  async doShow(type, message, buttons, detail, cancelId, checkbox, inputs, customOptions) {
    const dialogDisposables = new DisposableStore();
    const renderBody = customOptions ? (parent) => {
      parent.classList.add(...customOptions.classes || []);
      customOptions.markdownDetails?.forEach((markdownDetail) => {
        const result2 = this.markdownRenderer.render(markdownDetail.markdown, {
          actionHandler: {
            callback: markdownDetail.actionHandler || ((link) => {
              return openLinkFromMarkdown(
                this.openerService,
                link,
                markdownDetail.markdown.isTrusted,
                true
                /* skip URL validation to prevent another dialog from showing which is unsupported */
              );
            }),
            disposables: dialogDisposables
          }
        });
        parent.appendChild(result2.element);
        result2.element.classList.add(...markdownDetail.classes || []);
        dialogDisposables.add(result2);
      });
    } : void 0;
    const dialog = new Dialog(this.layoutService.activeContainer, message, buttons, createWorkbenchDialogOptions({
      detail,
      cancelId,
      type: this.getDialogType(type),
      renderBody,
      icon: customOptions?.icon,
      disableCloseAction: customOptions?.disableCloseAction,
      buttonDetails: customOptions?.buttonDetails,
      checkboxLabel: checkbox?.label,
      checkboxChecked: checkbox?.checked,
      inputs
    }, this.keybindingService, this.layoutService, BrowserDialogHandler_1.ALLOWABLE_COMMANDS));
    dialogDisposables.add(dialog);
    const result = await dialog.show();
    dialogDisposables.dispose();
    return result;
  }
};
BrowserDialogHandler = BrowserDialogHandler_1 = __decorate([
  __param(0, ILogService),
  __param(1, ILayoutService),
  __param(2, IKeybindingService),
  __param(3, IInstantiationService),
  __param(4, IProductService),
  __param(5, IClipboardService),
  __param(6, IOpenerService)
], BrowserDialogHandler);
export {
  BrowserDialogHandler
};
//# sourceMappingURL=dialogHandler.js.map
