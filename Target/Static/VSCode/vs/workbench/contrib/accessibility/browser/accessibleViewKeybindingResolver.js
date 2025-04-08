var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { IPickerQuickAccessItem } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
function resolveContentAndKeybindingItems(keybindingService, value) {
  if (!value) {
    return;
  }
  const configureKeybindingItems = [];
  const configuredKeybindingItems = [];
  const matches = value.matchAll(/(\<keybinding:(?<commandId>[^\<]*)\>)/gm);
  for (const match of [...matches]) {
    const commandId = match?.groups?.commandId;
    let kbLabel;
    if (match?.length && commandId) {
      const keybinding = keybindingService.lookupKeybinding(commandId)?.getAriaLabel();
      if (!keybinding) {
        kbLabel = ` (unassigned keybinding)`;
        configureKeybindingItems.push({
          label: commandId,
          id: commandId
        });
      } else {
        kbLabel = " (" + keybinding + ")";
        configuredKeybindingItems.push({
          label: commandId,
          id: commandId
        });
      }
      value = value.replace(match[0], kbLabel);
    }
  }
  const content = new MarkdownString(value);
  content.isTrusted = true;
  return { content, configureKeybindingItems: configureKeybindingItems.length ? configureKeybindingItems : void 0, configuredKeybindingItems: configuredKeybindingItems.length ? configuredKeybindingItems : void 0 };
}
__name(resolveContentAndKeybindingItems, "resolveContentAndKeybindingItems");
export {
  resolveContentAndKeybindingItems
};
//# sourceMappingURL=accessibleViewKeybindingResolver.js.map
