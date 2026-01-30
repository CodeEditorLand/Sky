var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { KeybindingsRegistry } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import * as platform from "../../../../base/common/platform.js";
import { getActiveWindow } from "../../../../base/browser/dom.js";
if (platform.isMacintosh) {
  let bindExecuteCommand = function(command) {
    return () => {
      getActiveWindow().document.execCommand(command);
    };
  };
  var bindExecuteCommand2 = bindExecuteCommand;
  __name(bindExecuteCommand, "bindExecuteCommand");
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "execCut",
    primary: 2048 | 54,
    handler: bindExecuteCommand("cut"),
    weight: 0,
    when: void 0
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "execCopy",
    primary: 2048 | 33,
    handler: bindExecuteCommand("copy"),
    weight: 0,
    when: void 0
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "execPaste",
    primary: 2048 | 52,
    handler: bindExecuteCommand("paste"),
    weight: 0,
    when: void 0
  });
}
//# sourceMappingURL=inputClipboardActions.js.map
