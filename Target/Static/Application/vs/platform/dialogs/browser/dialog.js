var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EventHelper } from "../../../base/browser/dom.js";
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
export {
  createWorkbenchDialogOptions
};
//# sourceMappingURL=dialog.js.map
