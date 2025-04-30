var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../nls.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../../platform/dialogs/common/dialogs.js";
async function shouldPasteTerminalText(accessor, text, bracketedPasteMode) {
  const configurationService = accessor.get(IConfigurationService);
  const dialogService = accessor.get(IDialogService);
  const textForLines = text.split(/\r?\n/);
  if (textForLines.length === 1) {
    return true;
  }
  function parseConfigValue(value) {
    if (typeof value === "string") {
      if (value === "auto" || value === "always" || value === "never") {
        return value;
      }
    }
    if (typeof value === "boolean") {
      return value ? "auto" : "never";
    }
    return "auto";
  }
  __name(parseConfigValue, "parseConfigValue");
  const configValue = parseConfigValue(configurationService.getValue(
    "terminal.integrated.enableMultiLinePasteWarning"
    /* TerminalSettingId.EnableMultiLinePasteWarning */
  ));
  if (configValue === "never") {
    return true;
  }
  if (configValue === "auto") {
    if (bracketedPasteMode) {
      return true;
    }
    const textForLines2 = text.split(/\r?\n/);
    if (textForLines2.length === 2 && textForLines2[1].trim().length === 0) {
      return true;
    }
  }
  const displayItemsCount = 3;
  const maxPreviewLineLength = 30;
  let detail = localize("preview", "Preview:");
  for (let i = 0; i < Math.min(textForLines.length, displayItemsCount); i++) {
    const line = textForLines[i];
    const cleanedLine = line.length > maxPreviewLineLength ? `${line.slice(0, maxPreviewLineLength)}\u2026` : line;
    detail += `
${cleanedLine}`;
  }
  if (textForLines.length > displayItemsCount) {
    detail += `
\u2026`;
  }
  const { result, checkboxChecked } = await dialogService.prompt({
    message: localize("confirmMoveTrashMessageFilesAndDirectories", "Are you sure you want to paste {0} lines of text into the terminal?", textForLines.length),
    detail,
    type: "warning",
    buttons: [
      {
        label: localize({ key: "multiLinePasteButton", comment: ["&& denotes a mnemonic"] }, "&&Paste"),
        run: /* @__PURE__ */ __name(() => ({ confirmed: true, singleLine: false }), "run")
      },
      {
        label: localize({ key: "multiLinePasteButton.oneLine", comment: ["&& denotes a mnemonic"] }, "Paste as &&one line"),
        run: /* @__PURE__ */ __name(() => ({ confirmed: true, singleLine: true }), "run")
      }
    ],
    cancelButton: true,
    checkbox: {
      label: localize("doNotAskAgain", "Do not ask me again")
    }
  });
  if (!result) {
    return false;
  }
  if (result.confirmed && checkboxChecked) {
    await configurationService.updateValue("terminal.integrated.enableMultiLinePasteWarning", "never");
  }
  if (result.singleLine) {
    return { modifiedText: text.replace(/\r?\n/g, "") };
  }
  return result.confirmed;
}
__name(shouldPasteTerminalText, "shouldPasteTerminalText");
export {
  shouldPasteTerminalText
};
//# sourceMappingURL=terminalClipboard.js.map
