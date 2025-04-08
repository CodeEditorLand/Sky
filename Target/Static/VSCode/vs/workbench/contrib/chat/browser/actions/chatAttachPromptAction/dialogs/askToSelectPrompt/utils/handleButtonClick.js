var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../../../nls.js";
import { DELETE_BUTTON, EDIT_BUTTON } from "../constants.js";
import { assert } from "../../../../../../../../../base/common/assert.js";
import { WithUriValue } from "../../../../../../../../../base/common/types.js";
import { IFileService } from "../../../../../../../../../platform/files/common/files.js";
import { IOpenerService } from "../../../../../../../../../platform/opener/common/opener.js";
import { IDialogService } from "../../../../../../../../../platform/dialogs/common/dialogs.js";
import { getCleanPromptName } from "../../../../../../../../../platform/prompts/common/constants.js";
import { IQuickPick, IQuickPickItem, IQuickPickItemButtonEvent } from "../../../../../../../../../platform/quickinput/common/quickInput.js";
async function handleButtonClick(options, context) {
  const { quickPick, openerService, fileService, dialogService } = options;
  const { item, button } = context;
  const { value } = item;
  if (button === EDIT_BUTTON) {
    return await openerService.open(value);
  }
  if (button === DELETE_BUTTON) {
    assert(
      quickPick.activeItems.length < 2,
      `Expected maximum one active item, got '${quickPick.activeItems.length}'.`
    );
    const activeItem = quickPick.activeItems[0];
    const info = await fileService.stat(value);
    assert(
      info.isDirectory === false,
      `'${value.fsPath}' points to a folder.`
    );
    const previousIgnoreFocusOut = quickPick.ignoreFocusOut;
    quickPick.ignoreFocusOut = true;
    const filename = getCleanPromptName(value);
    const { confirmed } = await dialogService.confirm({
      message: localize(
        "commands.prompts.use.select-dialog.delete-prompt.confirm.message",
        "Are you sure you want to delete '{0}'?",
        filename
      )
    });
    quickPick.ignoreFocusOut = previousIgnoreFocusOut;
    if (!confirmed) {
      return;
    }
    await fileService.del(value);
    let removedIndex = -1;
    quickPick.items = quickPick.items.filter((option, index) => {
      if (option === item) {
        removedIndex = index;
        return false;
      }
      return true;
    });
    if (activeItem && activeItem === item) {
      assert(
        removedIndex >= 0,
        "Removed item index must be a valid index."
      );
      const newActiveItemIndex = Math.max(removedIndex - 1, 0);
      const newActiveItem = quickPick.items[newActiveItemIndex];
      quickPick.activeItems = newActiveItem ? [newActiveItem] : [];
    }
    return;
  }
  throw new Error(`Unknown button '${JSON.stringify(button)}'.`);
}
__name(handleButtonClick, "handleButtonClick");
export {
  handleButtonClick
};
//# sourceMappingURL=handleButtonClick.js.map
