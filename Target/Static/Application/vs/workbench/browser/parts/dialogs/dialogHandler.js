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
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IMarkdownRendererService, openLinkFromMarkdown } from "../../../../platform/markdown/browser/markdownRenderer.js";
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
  constructor(logService, layoutService, keybindingService, instantiationService, clipboardService, openerService, markdownRendererService) {
    super();
    this.logService = logService;
    this.layoutService = layoutService;
    this.keybindingService = keybindingService;
    this.clipboardService = clipboardService;
    this.openerService = openerService;
    this.markdownRendererService = markdownRendererService;
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
  async about(title, details, detailsToCopy) {
    const { button } = await this.doShow(Severity.Info, title, [
      localize({ key: "copy", comment: ["&& denotes a mnemonic"] }, "&&Copy"),
      localize("ok", "OK")
    ], details, 1);
    if (button === 0) {
      this.clipboardService.writeText(detailsToCopy);
    }
  }
  async doShow(type, message, buttons, detail, cancelId, checkbox, inputs, customOptions) {
    const dialogDisposables = new DisposableStore();
    const renderBody = customOptions ? (parent) => {
      parent.classList.add(...customOptions.classes || []);
      customOptions.markdownDetails?.forEach((markdownDetail) => {
        const result2 = dialogDisposables.add(this.markdownRendererService.render(markdownDetail.markdown, {
          actionHandler: markdownDetail.actionHandler || ((link, mdStr) => {
            return openLinkFromMarkdown(
              this.openerService,
              link,
              mdStr.isTrusted,
              true
              /* skip URL validation to prevent another dialog from showing which is unsupported */
            );
          })
        }));
        parent.appendChild(result2.element);
        result2.element.classList.add(...markdownDetail.classes || []);
      });
    } : void 0;
    const dialog = new Dialog(this.layoutService.activeContainer, message, buttons, createWorkbenchDialogOptions({
      detail,
      cancelId,
      type: this.getDialogType(type),
      renderBody,
      icon: customOptions?.icon,
      disableCloseAction: customOptions?.disableCloseAction,
      buttonOptions: customOptions?.buttonDetails?.map((detail2) => ({ sublabel: detail2 })),
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
  __param(4, IClipboardService),
  __param(5, IOpenerService),
  __param(6, IMarkdownRendererService)
], BrowserDialogHandler);
export {
  BrowserDialogHandler
};
//# sourceMappingURL=dialogHandler.js.map
