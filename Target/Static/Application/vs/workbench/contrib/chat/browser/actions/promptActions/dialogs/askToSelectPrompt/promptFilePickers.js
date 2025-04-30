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
import { localize } from "../../../../../../../../nls.js";
import { URI } from "../../../../../../../../base/common/uri.js";
import { OS } from "../../../../../../../../base/common/platform.js";
import { assert } from "../../../../../../../../base/common/assert.js";
import { Codicon } from "../../../../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../../../../base/common/themables.js";
import { dirname, extUri } from "../../../../../../../../base/common/resources.js";
import { DisposableStore } from "../../../../../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../../../../platform/opener/common/opener.js";
import { UILabelProvider } from "../../../../../../../../base/common/keybindingLabels.js";
import { IDialogService } from "../../../../../../../../platform/dialogs/common/dialogs.js";
import { getCleanPromptName } from "../../../../../../../../platform/prompts/common/constants.js";
import { INSTRUCTIONS_DOCUMENTATION_URL, PROMPT_DOCUMENTATION_URL } from "../../../../../common/promptSyntax/constants.js";
import { IQuickInputService } from "../../../../../../../../platform/quickinput/common/quickInput.js";
import { ICommandService } from "../../../../../../../../platform/commands/common/commands.js";
import { NEW_PROMPT_COMMAND_ID, NEW_INSTRUCTIONS_COMMAND_ID } from "../../../../promptSyntax/contributions/createPromptCommand/createPromptCommand.js";
const HELP_BUTTON = Object.freeze({
  tooltip: localize("help", "help"),
  iconClass: ThemeIcon.asClassName(Codicon.question)
});
const NEW_PROMPT_FILE_OPTION = Object.freeze({
  type: "item",
  label: `$(plus) ${localize("commands.new-promptfile.select-dialog.label", "New prompt file...")}`,
  value: URI.parse(PROMPT_DOCUMENTATION_URL),
  pickable: false,
  alwaysShow: true,
  buttons: [HELP_BUTTON]
});
const NEW_INSTRUCTIONS_FILE_OPTION = Object.freeze({
  type: "item",
  label: `$(plus) ${localize("commands.new-instructionsfile.select-dialog.label", "Create new instruction file...")}`,
  value: URI.parse(INSTRUCTIONS_DOCUMENTATION_URL),
  pickable: false,
  alwaysShow: true,
  buttons: [HELP_BUTTON]
});
const EDIT_BUTTON = Object.freeze({
  tooltip: localize("commands.prompts.use.select-dialog.open-button.tooltip", "edit ({0}-key + enter)", UILabelProvider.modifierLabels[OS].ctrlKey),
  iconClass: ThemeIcon.asClassName(Codicon.edit)
});
const DELETE_BUTTON = Object.freeze({
  tooltip: localize("delete", "delete"),
  iconClass: ThemeIcon.asClassName(Codicon.trash)
});
let PromptFilePickers = class PromptFilePickers2 {
  static {
    __name(this, "PromptFilePickers");
  }
  constructor(_labelService, _quickInputService, _openerService, _fileService, _dialogService, _commandService) {
    this._labelService = _labelService;
    this._quickInputService = _quickInputService;
    this._openerService = _openerService;
    this._fileService = _fileService;
    this._dialogService = _dialogService;
    this._commandService = _commandService;
  }
  /**
   * Shows the instructions selection dialog to the user that allows to select a instructions file(s).
   *
   * If {@link ISelectOptions.resource resource} is provided, the dialog will have
   * the resource pre-selected in the prompts list.
   */
  async selectInstructionsFiles(options) {
    const fileOptions = this._createPromptPickItems(options);
    fileOptions.splice(0, 0, NEW_INSTRUCTIONS_FILE_OPTION);
    const quickPick = this._quickInputService.createQuickPick();
    quickPick.activeItems = fileOptions.length ? [fileOptions[0]] : [];
    quickPick.placeholder = options.placeholder;
    quickPick.canAcceptInBackground = true;
    quickPick.matchOnDescription = true;
    quickPick.items = fileOptions;
    return new Promise((resolve) => {
      const disposables = new DisposableStore();
      let isResolved = false;
      disposables.add({
        dispose() {
          quickPick.dispose();
          if (!isResolved) {
            resolve(void 0);
            isResolved = true;
          }
        }
      });
      disposables.add(quickPick.onDidAccept(async (event) => {
        const { selectedItems } = quickPick;
        if (selectedItems[0] === NEW_INSTRUCTIONS_FILE_OPTION) {
          await this._commandService.executeCommand(NEW_INSTRUCTIONS_COMMAND_ID);
          return;
        }
        resolve(selectedItems.map((item) => item.value));
        isResolved = true;
        if (!event.inBackground) {
          disposables.dispose();
        }
      }));
      disposables.add(quickPick.onDidTriggerItemButton((e) => this._handleButtonClick(quickPick, e)));
      disposables.add(quickPick.onDidHide(disposables.dispose.bind(disposables)));
      quickPick.show();
    });
  }
  /**
   * Shows the instructions selection dialog to the user that allows to select a instructions file(s).
   *
   * If {@link ISelectOptions.resource resource} is provided, the dialog will have
   * the resource pre-selected in the prompts list.
   */
  async selectPromptFile(options) {
    const fileOptions = this._createPromptPickItems(options);
    fileOptions.splice(0, 0, NEW_PROMPT_FILE_OPTION);
    const quickPick = this._quickInputService.createQuickPick();
    quickPick.activeItems = fileOptions.length ? [fileOptions[0]] : [];
    quickPick.placeholder = options.placeholder;
    quickPick.canAcceptInBackground = true;
    quickPick.matchOnDescription = true;
    quickPick.items = fileOptions;
    return new Promise((resolve) => {
      const disposables = new DisposableStore();
      let isResolved = false;
      disposables.add({
        dispose() {
          quickPick.dispose();
          if (!isResolved) {
            resolve(void 0);
            isResolved = true;
          }
        }
      });
      disposables.add(quickPick.onDidAccept(async (event) => {
        const { selectedItems } = quickPick;
        const { keyMods } = quickPick;
        const selectedItem = selectedItems[0];
        if (selectedItem === NEW_PROMPT_FILE_OPTION) {
          await this._commandService.executeCommand(NEW_PROMPT_COMMAND_ID);
          return;
        }
        if (selectedItem) {
          resolve({ promptFile: selectedItem.value, keyMods: { ...keyMods } });
          isResolved = true;
        }
        if (!event.inBackground) {
          disposables.dispose();
        }
      }));
      disposables.add(quickPick.onDidTriggerItemButton((e) => this._handleButtonClick(quickPick, e)));
      disposables.add(quickPick.onDidHide(disposables.dispose.bind(disposables)));
      quickPick.show();
    });
  }
  _createPromptPickItems(options) {
    const { promptFiles, resource } = options;
    const fileOptions = promptFiles.map((promptFile) => {
      return this._createPromptPickItem(promptFile);
    });
    let activeItem;
    if (resource) {
      activeItem = fileOptions.find((file) => {
        return extUri.isEqual(file.value, resource);
      });
      if (!activeItem) {
        activeItem = this._createPromptPickItem({
          uri: resource,
          // "user" prompts are always registered in the prompts list, hence it
          // should be safe to assume that `resource` is not "user" prompt here
          storage: "local",
          type: "instructions"
        });
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
    return fileOptions;
  }
  _createPromptPickItem(promptFile) {
    const { uri, storage } = promptFile;
    const fileWithoutExtension = getCleanPromptName(uri);
    const description = storage === "user" ? localize("user-data-dir.capitalized", "User data folder") : this._labelService.getUriLabel(dirname(uri), { relative: true });
    const tooltip = storage === "user" ? description : uri.fsPath;
    return {
      id: uri.toString(),
      type: "item",
      label: fileWithoutExtension,
      description,
      tooltip,
      value: uri,
      buttons: [EDIT_BUTTON, DELETE_BUTTON]
    };
  }
  async _handleButtonClick(quickPick, context) {
    const { item, button } = context;
    const { value } = item;
    if (button === EDIT_BUTTON) {
      return await this._openerService.open(value);
    }
    if (button === DELETE_BUTTON) {
      assert(quickPick.activeItems.length < 2, `Expected maximum one active item, got '${quickPick.activeItems.length}'.`);
      const activeItem = quickPick.activeItems[0];
      const info = await this._fileService.stat(value);
      assert(info.isDirectory === false, `'${value.fsPath}' points to a folder.`);
      const previousIgnoreFocusOut = quickPick.ignoreFocusOut;
      quickPick.ignoreFocusOut = true;
      const filename = getCleanPromptName(value);
      const { confirmed } = await this._dialogService.confirm({
        message: localize("commands.prompts.use.select-dialog.delete-prompt.confirm.message", "Are you sure you want to delete '{0}'?", filename)
      });
      quickPick.ignoreFocusOut = previousIgnoreFocusOut;
      if (!confirmed) {
        return;
      }
      await this._fileService.del(value);
      let removedIndex = -1;
      quickPick.items = quickPick.items.filter((option, index) => {
        if (option === item) {
          removedIndex = index;
          return false;
        }
        return true;
      });
      if (activeItem && activeItem === item) {
        assert(removedIndex >= 0, "Removed item index must be a valid index.");
        const newActiveItemIndex = Math.max(removedIndex - 1, 0);
        const newActiveItem = quickPick.items[newActiveItemIndex];
        quickPick.activeItems = newActiveItem ? [newActiveItem] : [];
      }
      return;
    }
    if (button === HELP_BUTTON) {
      await this._openerService.open(item.value);
      return;
    }
    throw new Error(`Unknown button '${JSON.stringify(button)}'.`);
  }
};
PromptFilePickers = __decorate([
  __param(0, ILabelService),
  __param(1, IQuickInputService),
  __param(2, IOpenerService),
  __param(3, IFileService),
  __param(4, IDialogService),
  __param(5, ICommandService)
], PromptFilePickers);
export {
  PromptFilePickers
};
//# sourceMappingURL=promptFilePickers.js.map
