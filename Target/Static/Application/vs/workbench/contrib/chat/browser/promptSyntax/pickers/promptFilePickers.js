var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../nls.js";
import { URI } from "../../../../../../base/common/uri.js";
import { assert } from "../../../../../../base/common/assert.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { IPromptsService } from "../../../common/promptSyntax/service/promptsService.js";
import { dirname, extUri, joinPath } from "../../../../../../base/common/resources.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { IFileService } from "../../../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { IDialogService } from "../../../../../../platform/dialogs/common/dialogs.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { getCleanPromptName } from "../../../common/promptSyntax/config/promptFileLocations.js";
import { PromptsType, INSTRUCTIONS_DOCUMENTATION_URL, MODE_DOCUMENTATION_URL, PROMPT_DOCUMENTATION_URL } from "../../../common/promptSyntax/promptTypes.js";
import { NEW_PROMPT_COMMAND_ID, NEW_INSTRUCTIONS_COMMAND_ID, NEW_MODE_COMMAND_ID } from "../newPromptFileActions.js";
import { IQuickInputService } from "../../../../../../platform/quickinput/common/quickInput.js";
import { askForPromptFileName } from "./askForPromptName.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { UILabelProvider } from "../../../../../../base/common/keybindingLabels.js";
import { OS } from "../../../../../../base/common/platform.js";
import { askForPromptSourceFolder } from "./askForPromptSourceFolder.js";
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
const HELP_BUTTON = Object.freeze({
  tooltip: localize("help", "Help"),
  iconClass: ThemeIcon.asClassName(Codicon.question)
});
const NEW_PROMPT_FILE_OPTION = Object.freeze({
  type: "item",
  label: `$(plus) ${localize("commands.new-promptfile.select-dialog.label", "New prompt file...")}`,
  value: URI.parse(PROMPT_DOCUMENTATION_URL),
  pickable: false,
  alwaysShow: true,
  buttons: [HELP_BUTTON],
  commandId: NEW_PROMPT_COMMAND_ID
});
const NEW_INSTRUCTIONS_FILE_OPTION = Object.freeze({
  type: "item",
  label: `$(plus) ${localize("commands.new-instructionsfile.select-dialog.label", "Create new instruction file...")}`,
  value: URI.parse(INSTRUCTIONS_DOCUMENTATION_URL),
  pickable: false,
  alwaysShow: true,
  buttons: [HELP_BUTTON],
  commandId: NEW_INSTRUCTIONS_COMMAND_ID
});
const NEW_MODE_FILE_OPTION = Object.freeze({
  type: "item",
  label: `$(plus) ${localize("commands.new-modefile.select-dialog.label", "Create new custom chat mode file...")}`,
  value: URI.parse(MODE_DOCUMENTATION_URL),
  pickable: false,
  alwaysShow: true,
  buttons: [HELP_BUTTON],
  commandId: NEW_MODE_COMMAND_ID
});
const EDIT_BUTTON = Object.freeze({
  tooltip: localize("open", "Open in Editor"),
  iconClass: ThemeIcon.asClassName(Codicon.edit)
});
const DELETE_BUTTON = Object.freeze({
  tooltip: localize("delete", "Delete"),
  iconClass: ThemeIcon.asClassName(Codicon.trash)
});
const RENAME_BUTTON = Object.freeze({
  tooltip: localize("rename", "Rename"),
  iconClass: ThemeIcon.asClassName(Codicon.replace)
});
const COPY_BUTTON = Object.freeze({
  tooltip: localize("copy", "Copy or Move (press {0})", UILabelProvider.modifierLabels[OS].ctrlKey),
  iconClass: ThemeIcon.asClassName(Codicon.copy)
});
let PromptFilePickers = class PromptFilePickers2 {
  static {
    __name(this, "PromptFilePickers");
  }
  constructor(_labelService, _quickInputService, _openerService, _fileService, _dialogService, _commandService, _instaService, _promptsService) {
    this._labelService = _labelService;
    this._quickInputService = _quickInputService;
    this._openerService = _openerService;
    this._fileService = _fileService;
    this._dialogService = _dialogService;
    this._commandService = _commandService;
    this._instaService = _instaService;
    this._promptsService = _promptsService;
  }
  /**
   * Shows the prompt file selection dialog to the user that allows to run a prompt file(s).
   *
   * If {@link ISelectOptions.resource resource} is provided, the dialog will have
   * the resource pre-selected in the prompts list.
   */
  async selectPromptFile(options) {
    const quickPick = this._quickInputService.createQuickPick();
    quickPick.busy = true;
    quickPick.placeholder = localize("searching", "Searching file system...");
    try {
      const fileOptions = await this._createPromptPickItems(options);
      const activeItem = options.resource && fileOptions.find((f) => extUri.isEqual(f.value, options.resource));
      quickPick.activeItems = [activeItem ?? fileOptions[0]];
      quickPick.placeholder = options.placeholder;
      quickPick.canAcceptInBackground = true;
      quickPick.matchOnDescription = true;
      quickPick.items = fileOptions;
    } finally {
      quickPick.busy = false;
    }
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
        if (selectedItem.commandId) {
          await this._commandService.executeCommand(selectedItem.commandId);
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
      disposables.add(quickPick.onDidTriggerItemButton((e) => this._handleButtonClick(quickPick, e, options)));
      disposables.add(quickPick.onDidHide(disposables.dispose.bind(disposables)));
      quickPick.show();
    });
  }
  async _createPromptPickItems(options) {
    const { resource } = options;
    const buttons = [];
    if (options.optionEdit !== false) {
      buttons.push(EDIT_BUTTON);
    }
    if (options.optionCopy !== false) {
      buttons.push(COPY_BUTTON);
    }
    if (options.optionRename !== false) {
      buttons.push(RENAME_BUTTON);
    }
    if (options.optionDelete !== false) {
      buttons.push(DELETE_BUTTON);
    }
    const promptFiles = await this._promptsService.listPromptFiles(options.type, CancellationToken.None);
    const fileOptions = promptFiles.map((promptFile) => {
      return this._createPromptPickItem(promptFile, buttons);
    });
    let activeItem;
    if (options.resource) {
      activeItem = fileOptions.find((file) => {
        return extUri.isEqual(file.value, options.resource);
      });
      if (!activeItem) {
        activeItem = this._createPromptPickItem({
          uri: options.resource,
          // "user" prompts are always registered in the prompts list, hence it
          // should be safe to assume that `resource` is not "user" prompt here
          storage: "local",
          type: options.type
        }, buttons);
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
    const newItem = options.optionNew !== false ? this._getNewItem(options.type) : void 0;
    if (newItem) {
      fileOptions.splice(0, 0, newItem);
    }
    return fileOptions;
  }
  _getNewItem(type) {
    switch (type) {
      case PromptsType.prompt:
        return NEW_PROMPT_FILE_OPTION;
      case PromptsType.instructions:
        return NEW_INSTRUCTIONS_FILE_OPTION;
      case PromptsType.mode:
        return NEW_MODE_FILE_OPTION;
      default:
        throw new Error(`Unknown prompt type '${type}'.`);
    }
  }
  _createPromptPickItem(promptFile, buttons) {
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
      buttons
    };
  }
  async keepQuickPickOpen(quickPick, work) {
    const previousIgnoreFocusOut = quickPick.ignoreFocusOut;
    quickPick.ignoreFocusOut = true;
    try {
      await work();
    } finally {
      quickPick.ignoreFocusOut = previousIgnoreFocusOut;
    }
  }
  async _handleButtonClick(quickPick, context, options) {
    const { item, button } = context;
    const { value } = item;
    if (button === EDIT_BUTTON) {
      await this._openerService.open(value);
      return;
    }
    if (button === COPY_BUTTON) {
      const currentFolder = dirname(value);
      const isMove = quickPick.keyMods.ctrlCmd;
      const newFolder = await this._instaService.invokeFunction(askForPromptSourceFolder, options.type, currentFolder, isMove);
      if (!newFolder) {
        return;
      }
      const newName = await this._instaService.invokeFunction(askForPromptFileName, options.type, newFolder.uri, item.label);
      if (!newName) {
        return;
      }
      const newFile = joinPath(newFolder.uri, newName);
      if (isMove) {
        await this._fileService.move(value, newFile);
      } else {
        await this._fileService.copy(value, newFile);
      }
      await this._openerService.open(newFile);
      return;
    }
    if (button === RENAME_BUTTON) {
      const currentFolder = dirname(value);
      const newName = await this._instaService.invokeFunction(askForPromptFileName, options.type, currentFolder, item.label);
      if (newName) {
        const newFile = joinPath(currentFolder, newName);
        await this._fileService.move(value, newFile);
        await this._openerService.open(newFile);
      }
      return;
    }
    if (button === DELETE_BUTTON) {
      assert(quickPick.activeItems.length < 2, `Expected maximum one active item, got '${quickPick.activeItems.length}'.`);
      const activeItem = quickPick.activeItems[0];
      const info = await this._fileService.stat(value);
      assert(info.isDirectory === false, `'${value.fsPath}' points to a folder.`);
      await this.keepQuickPickOpen(quickPick, async () => {
        const filename = getCleanPromptName(value);
        const { confirmed } = await this._dialogService.confirm({
          message: localize("commands.prompts.use.select-dialog.delete-prompt.confirm.message", "Are you sure you want to delete '{0}'?", filename)
        });
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
      });
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
  __param(5, ICommandService),
  __param(6, IInstantiationService),
  __param(7, IPromptsService)
], PromptFilePickers);
export {
  PromptFilePickers
};
//# sourceMappingURL=promptFilePickers.js.map
