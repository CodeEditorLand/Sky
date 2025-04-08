var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { EventHelper } from "../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../base/browser/keyboardEvent.js";
import { IDialogOptions } from "../../../base/browser/ui/dialog/dialog.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
import { ResultKind } from "../../keybinding/common/keybindingResolver.js";
import { ILayoutService } from "../../layout/browser/layoutService.js";
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
      if (resolved.kind === ResultKind.KbFound && resolved.commandId) {
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
