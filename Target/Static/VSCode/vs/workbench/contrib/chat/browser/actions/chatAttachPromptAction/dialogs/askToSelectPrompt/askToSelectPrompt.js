var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { assert } from "../../../../../../../../base/common/assert.js";
import { DisposableStore } from "../../../../../../../../base/common/lifecycle.js";
import { extUri } from "../../../../../../../../base/common/resources.js";
import { WithUriValue } from "../../../../../../../../base/common/types.js";
import { URI } from "../../../../../../../../base/common/uri.js";
import { ICommandService } from "../../../../../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../../../../platform/opener/common/opener.js";
import { IQuickInputService, IQuickPickItem } from "../../../../../../../../platform/quickinput/common/quickInput.js";
import { IViewsService } from "../../../../../../../services/views/common/viewsService.js";
import { IPromptPath } from "../../../../../common/promptSyntax/service/types.js";
import { IChatWidget } from "../../../../chat.js";
import { DOCS_OPTION } from "./constants.js";
import { attachPrompts } from "./utils/attachPrompts.js";
import { createPlaceholderText } from "./utils/createPlaceholderText.js";
import { createPromptPickItem } from "./utils/createPromptPickItem.js";
import { handleButtonClick } from "./utils/handleButtonClick.js";
const askToSelectPrompt = /* @__PURE__ */ __name(async (options) => {
  const { promptFiles, resource, quickInputService, labelService } = options;
  const fileOptions = promptFiles.map((promptFile) => {
    return createPromptPickItem(promptFile, labelService);
  });
  fileOptions.push(DOCS_OPTION);
  let activeItem;
  if (resource) {
    activeItem = fileOptions.find((file) => {
      return extUri.isEqual(file.value, resource);
    });
    if (!activeItem) {
      activeItem = createPromptPickItem({
        uri: resource,
        // "user" prompts are always registered in the prompts list, hence it
        // should be safe to assume that `resource` is not "user" prompt here
        type: "local"
      }, labelService);
      fileOptions.push(activeItem);
    }
    fileOptions.sort((file1, file2) => {
      if (extUri.isEqual(file1.value, resource)) {
        return -1;
      }
      if (extUri.isEqual(file2.value, resource)) {
        return 1;
      }
      return 0;
    });
  }
  if (!activeItem) {
    activeItem = fileOptions[0];
  }
  const quickPick = quickInputService.createQuickPick();
  quickPick.activeItems = activeItem ? [activeItem] : [];
  quickPick.placeholder = createPlaceholderText(options);
  quickPick.canAcceptInBackground = true;
  quickPick.matchOnDescription = true;
  quickPick.items = fileOptions;
  const { openerService } = options;
  return await new Promise((resolve) => {
    const disposables = new DisposableStore();
    let lastActiveWidget = options.widget;
    disposables.add({
      dispose() {
        quickPick.dispose();
        resolve();
        lastActiveWidget?.focusInput();
      }
    });
    disposables.add(quickPick.onDidAccept(async (event) => {
      const { selectedItems } = quickPick;
      assert(
        selectedItems.length === 1,
        `Only one item can be accepted, got '${selectedItems.length}'.`
      );
      const selectedOption = selectedItems[0];
      const docsSelected = selectedOption === DOCS_OPTION;
      if (docsSelected) {
        await openerService.open(selectedOption.value);
        return;
      }
      lastActiveWidget = await attachPrompts(selectedItems, options, quickPick.keyMods);
      if (!event.inBackground) {
        disposables.dispose();
      }
    }));
    disposables.add(quickPick.onDidTriggerItemButton(
      handleButtonClick.bind(null, { quickPick, ...options })
    ));
    disposables.add(quickPick.onDidHide(
      disposables.dispose.bind(disposables)
    ));
    quickPick.show();
  });
}, "askToSelectPrompt");
export {
  askToSelectPrompt
};
//# sourceMappingURL=askToSelectPrompt.js.map
