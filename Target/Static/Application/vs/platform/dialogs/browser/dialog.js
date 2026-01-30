var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EventHelper } from "../../../base/browser/dom.js";
import { fromNow } from "../../../base/common/date.js";
import { localize } from "../../../nls.js";
import { defaultButtonStyles, defaultCheckboxStyles, defaultInputBoxStyles, defaultDialogStyles } from "../../theme/browser/defaultStyles.js";
const defaultDialogAllowableCommands = [
  "workbench.action.quit",
  "workbench.action.reloadWindow",
  "copy",
  "cut",
  "editor.action.selectAll",
  "editor.action.clipboardCopyAction",
  "editor.action.clipboardCutAction",
  "editor.action.clipboardPasteAction"
];
function createWorkbenchDialogOptions(options, keybindingService, layoutService, allowableCommands = defaultDialogAllowableCommands) {
  return {
    keyEventProcessor: /* @__PURE__ */ __name((event) => {
      const resolved = keybindingService.softDispatch(event, layoutService.activeContainer);
      if (resolved.kind === 2 && resolved.commandId) {
        if (!allowableCommands.includes(resolved.commandId)) {
          EventHelper.stop(event, true);
        }
      }
    }, "keyEventProcessor"),
    buttonStyles: defaultButtonStyles,
    checkboxStyles: defaultCheckboxStyles,
    inputBoxStyles: defaultInputBoxStyles,
    dialogStyles: defaultDialogStyles,
    ...options
  };
}
__name(createWorkbenchDialogOptions, "createWorkbenchDialogOptions");
function createBrowserAboutDialogDetails(productService) {
  const detailString = /* @__PURE__ */ __name((useAgo) => {
    return localize("aboutDetail", "Version: {0}\nCommit: {1}\nDate: {2}\nBrowser: {3}", productService.version || "Unknown", productService.commit || "Unknown", productService.date ? `${productService.date}${useAgo ? " (" + fromNow(new Date(productService.date), true) + ")" : ""}` : "Unknown", navigator.userAgent);
  }, "detailString");
  const details = detailString(true);
  const detailsToCopy = detailString(false);
  return {
    title: productService.nameLong,
    details,
    detailsToCopy
  };
}
__name(createBrowserAboutDialogDetails, "createBrowserAboutDialogDetails");
export {
  createBrowserAboutDialogDetails,
  createWorkbenchDialogOptions
};
//# sourceMappingURL=dialog.js.map
