var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Event } from "../../../base/common/event.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { basename } from "../../../base/common/resources.js";
import Severity from "../../../base/common/severity.js";
import { URI } from "../../../base/common/uri.js";
import { localize } from "../../../nls.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ITelemetryData } from "../../telemetry/common/telemetry.js";
import { MessageBoxOptions } from "../../../base/parts/sandbox/common/electronTypes.js";
import { mnemonicButtonLabel } from "../../../base/common/labels.js";
import { isLinux, isMacintosh, isWindows } from "../../../base/common/platform.js";
import { IProductService } from "../../product/common/productService.js";
import { deepClone } from "../../../base/common/objects.js";
const IDialogService = createDecorator("dialogService");
var DialogKind = /* @__PURE__ */ ((DialogKind2) => {
  DialogKind2[DialogKind2["Confirmation"] = 1] = "Confirmation";
  DialogKind2[DialogKind2["Prompt"] = 2] = "Prompt";
  DialogKind2[DialogKind2["Input"] = 3] = "Input";
  return DialogKind2;
})(DialogKind || {});
class AbstractDialogHandler {
  static {
    __name(this, "AbstractDialogHandler");
  }
  getConfirmationButtons(dialog) {
    return this.getButtons(dialog, 1 /* Confirmation */);
  }
  getPromptButtons(dialog) {
    return this.getButtons(dialog, 2 /* Prompt */);
  }
  getInputButtons(dialog) {
    return this.getButtons(dialog, 3 /* Input */);
  }
  getButtons(dialog, kind) {
    const buttons = [];
    switch (kind) {
      case 1 /* Confirmation */: {
        const confirmationDialog = dialog;
        if (confirmationDialog.primaryButton) {
          buttons.push(confirmationDialog.primaryButton);
        } else {
          buttons.push(localize({ key: "yesButton", comment: ["&& denotes a mnemonic"] }, "&&Yes"));
        }
        if (confirmationDialog.cancelButton) {
          buttons.push(confirmationDialog.cancelButton);
        } else {
          buttons.push(localize("cancelButton", "Cancel"));
        }
        break;
      }
      case 2 /* Prompt */: {
        const promptDialog = dialog;
        if (Array.isArray(promptDialog.buttons) && promptDialog.buttons.length > 0) {
          buttons.push(...promptDialog.buttons.map((button) => button.label));
        }
        if (promptDialog.cancelButton) {
          if (promptDialog.cancelButton === true) {
            buttons.push(localize("cancelButton", "Cancel"));
          } else if (typeof promptDialog.cancelButton === "string") {
            buttons.push(promptDialog.cancelButton);
          } else {
            if (promptDialog.cancelButton.label) {
              buttons.push(promptDialog.cancelButton.label);
            } else {
              buttons.push(localize("cancelButton", "Cancel"));
            }
          }
        }
        if (buttons.length === 0) {
          buttons.push(localize({ key: "okButton", comment: ["&& denotes a mnemonic"] }, "&&OK"));
        }
        break;
      }
      case 3 /* Input */: {
        const inputDialog = dialog;
        if (inputDialog.primaryButton) {
          buttons.push(inputDialog.primaryButton);
        } else {
          buttons.push(localize({ key: "okButton", comment: ["&& denotes a mnemonic"] }, "&&OK"));
        }
        if (inputDialog.cancelButton) {
          buttons.push(inputDialog.cancelButton);
        } else {
          buttons.push(localize("cancelButton", "Cancel"));
        }
        break;
      }
    }
    return buttons;
  }
  getDialogType(type) {
    if (typeof type === "string") {
      return type;
    }
    if (typeof type === "number") {
      return type === Severity.Info ? "info" : type === Severity.Error ? "error" : type === Severity.Warning ? "warning" : "none";
    }
    return void 0;
  }
  getPromptResult(prompt, buttonIndex, checkboxChecked) {
    const promptButtons = [...prompt.buttons ?? []];
    if (prompt.cancelButton && typeof prompt.cancelButton !== "string" && typeof prompt.cancelButton !== "boolean") {
      promptButtons.push(prompt.cancelButton);
    }
    let result = promptButtons[buttonIndex]?.run({ checkboxChecked });
    if (!(result instanceof Promise)) {
      result = Promise.resolve(result);
    }
    return { result, checkboxChecked };
  }
}
const IFileDialogService = createDecorator("fileDialogService");
var ConfirmResult = /* @__PURE__ */ ((ConfirmResult2) => {
  ConfirmResult2[ConfirmResult2["SAVE"] = 0] = "SAVE";
  ConfirmResult2[ConfirmResult2["DONT_SAVE"] = 1] = "DONT_SAVE";
  ConfirmResult2[ConfirmResult2["CANCEL"] = 2] = "CANCEL";
  return ConfirmResult2;
})(ConfirmResult || {});
const MAX_CONFIRM_FILES = 10;
function getFileNamesMessage(fileNamesOrResources) {
  const message = [];
  message.push(...fileNamesOrResources.slice(0, MAX_CONFIRM_FILES).map((fileNameOrResource) => typeof fileNameOrResource === "string" ? fileNameOrResource : basename(fileNameOrResource)));
  if (fileNamesOrResources.length > MAX_CONFIRM_FILES) {
    if (fileNamesOrResources.length - MAX_CONFIRM_FILES === 1) {
      message.push(localize("moreFile", "...1 additional file not shown"));
    } else {
      message.push(localize("moreFiles", "...{0} additional files not shown", fileNamesOrResources.length - MAX_CONFIRM_FILES));
    }
  }
  message.push("");
  return message.join("\n");
}
__name(getFileNamesMessage, "getFileNamesMessage");
function massageMessageBoxOptions(options, productService) {
  const massagedOptions = deepClone(options);
  let buttons = (massagedOptions.buttons ?? []).map((button) => mnemonicButtonLabel(button).withMnemonic);
  let buttonIndeces = (options.buttons || []).map((button, index) => index);
  let defaultId = 0;
  let cancelId = massagedOptions.cancelId ?? buttons.length - 1;
  if (buttons.length > 1) {
    const cancelButton = typeof cancelId === "number" ? buttons[cancelId] : void 0;
    if (isLinux || isMacintosh) {
      if (typeof cancelButton === "string" && buttons.length > 1 && cancelId !== 1) {
        buttons.splice(cancelId, 1);
        buttons.splice(1, 0, cancelButton);
        const cancelButtonIndex = buttonIndeces[cancelId];
        buttonIndeces.splice(cancelId, 1);
        buttonIndeces.splice(1, 0, cancelButtonIndex);
        cancelId = 1;
      }
      if (isLinux && buttons.length > 1) {
        buttons = buttons.reverse();
        buttonIndeces = buttonIndeces.reverse();
        defaultId = buttons.length - 1;
        if (typeof cancelButton === "string") {
          cancelId = defaultId - 1;
        }
      }
    } else if (isWindows) {
      if (typeof cancelButton === "string" && buttons.length > 1 && cancelId !== buttons.length - 1) {
        buttons.splice(cancelId, 1);
        buttons.push(cancelButton);
        const buttonIndex = buttonIndeces[cancelId];
        buttonIndeces.splice(cancelId, 1);
        buttonIndeces.push(buttonIndex);
        cancelId = buttons.length - 1;
      }
    }
  }
  massagedOptions.buttons = buttons;
  massagedOptions.defaultId = defaultId;
  massagedOptions.cancelId = cancelId;
  massagedOptions.noLink = true;
  massagedOptions.title = massagedOptions.title || productService.nameLong;
  return {
    options: massagedOptions,
    buttonIndeces
  };
}
__name(massageMessageBoxOptions, "massageMessageBoxOptions");
export {
  AbstractDialogHandler,
  ConfirmResult,
  IDialogService,
  IFileDialogService,
  getFileNamesMessage,
  massageMessageBoxOptions
};
//# sourceMappingURL=dialogs.js.map
