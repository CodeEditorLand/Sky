var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { basename, extUri, isEqual } from "../../../../../../base/common/resources.js";
import { URI } from "../../../../../../base/common/uri.js";
import { localize } from "../../../../../../nls.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { PROMPT_DOCUMENTATION_URL, PromptsType } from "../../../common/promptSyntax/promptTypes.js";
import { IQuickInputService } from "../../../../../../platform/quickinput/common/quickInput.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IPromptsService } from "../../../common/promptSyntax/service/promptsService.js";
async function askForPromptSourceFolder(accessor, type, existingFolder, isMove = false) {
  const quickInputService = accessor.get(IQuickInputService);
  const promptsService = accessor.get(IPromptsService);
  const labelService = accessor.get(ILabelService);
  const workspaceService = accessor.get(IWorkspaceContextService);
  const folders = promptsService.getSourceFolders(type);
  if (folders.length === 0) {
    await showNoFoldersDialog(accessor, type);
    return;
  }
  if (!existingFolder && folders.length === 1) {
    return folders[0];
  }
  const pickOptions = {
    placeHolder: existingFolder ? getPlaceholderStringforMove(type, isMove) : getPlaceholderStringforNew(type),
    canPickMany: false,
    matchOnDescription: true
  };
  const foldersList = folders.map((folder) => {
    const uri = folder.uri;
    const detail = existingFolder && isEqual(uri, existingFolder) ? localize("current.folder", "Current Location") : void 0;
    if (folder.storage === "user") {
      return {
        type: "item",
        label: localize("commands.prompts.create.source-folder.user", "User Data Folder"),
        detail,
        description: labelService.getUriLabel(uri),
        tooltip: uri.fsPath,
        folder
      };
    }
    const { folders: folders2 } = workspaceService.getWorkspace();
    const isMultirootWorkspace = folders2.length > 1;
    const firstFolder = folders2[0];
    if (isMultirootWorkspace || !firstFolder || !extUri.isEqual(firstFolder.uri, uri)) {
      return {
        type: "item",
        label: basename(uri),
        detail,
        description: labelService.getUriLabel(uri, { relative: true }),
        tooltip: uri.fsPath,
        folder
      };
    }
    return {
      type: "item",
      label: localize("commands.prompts.create.source-folder.current-workspace", "Current Workspace"),
      detail,
      // use absolute path as the description
      description: labelService.getUriLabel(uri, { relative: false }),
      tooltip: uri.fsPath,
      folder
    };
  });
  const answer = await quickInputService.pick(foldersList, pickOptions);
  if (!answer) {
    return;
  }
  return answer.folder;
}
__name(askForPromptSourceFolder, "askForPromptSourceFolder");
function getPlaceholderStringforNew(type) {
  switch (type) {
    case PromptsType.instructions:
      return localize("workbench.command.instructions.create.location.placeholder", "Select a location to create the instructions file in...");
    case PromptsType.prompt:
      return localize("workbench.command.prompt.create.location.placeholder", "Select a location to create the prompt file in...");
    case PromptsType.mode:
      return localize("workbench.command.mode.create.location.placeholder", "Select a location to create the mode file in...");
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPlaceholderStringforNew, "getPlaceholderStringforNew");
function getPlaceholderStringforMove(type, isMove) {
  if (isMove) {
    switch (type) {
      case PromptsType.instructions:
        return localize("instructions.move.location.placeholder", "Select a location to move the instructions file to...");
      case PromptsType.prompt:
        return localize("prompt.move.location.placeholder", "Select a location to move the prompt file to...");
      case PromptsType.mode:
        return localize("mode.move.location.placeholder", "Select a location to move the mode file to...");
      default:
        throw new Error("Unknown prompt type");
    }
  }
  switch (type) {
    case PromptsType.instructions:
      return localize("instructions.copy.location.placeholder", "Select a location to copy the instructions file to...");
    case PromptsType.prompt:
      return localize("prompt.copy.location.placeholder", "Select a location to copy the prompt file to...");
    case PromptsType.mode:
      return localize("mode.copy.location.placeholder", "Select a location to copy the mode file to...");
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPlaceholderStringforMove, "getPlaceholderStringforMove");
async function showNoFoldersDialog(accessor, type) {
  const quickInputService = accessor.get(IQuickInputService);
  const openerService = accessor.get(IOpenerService);
  const docsQuickPick = {
    type: "item",
    label: getLearnLabel(type),
    description: PROMPT_DOCUMENTATION_URL,
    tooltip: PROMPT_DOCUMENTATION_URL,
    value: URI.parse(PROMPT_DOCUMENTATION_URL)
  };
  const result = await quickInputService.pick([docsQuickPick], {
    placeHolder: getMissingSourceFolderString(type),
    canPickMany: false
  });
  if (result) {
    await openerService.open(result.value);
  }
}
__name(showNoFoldersDialog, "showNoFoldersDialog");
function getLearnLabel(type) {
  switch (type) {
    case PromptsType.prompt:
      return localize("commands.prompts.create.ask-folder.empty.docs-label", "Learn how to configure reusable prompts");
    case PromptsType.instructions:
      return localize("commands.instructions.create.ask-folder.empty.docs-label", "Learn how to configure reusable instructions");
    case PromptsType.mode:
      return localize("commands.mode.create.ask-folder.empty.docs-label", "Learn how to configure custom chat modes");
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getLearnLabel, "getLearnLabel");
function getMissingSourceFolderString(type) {
  switch (type) {
    case PromptsType.instructions:
      return localize("commands.instructions.create.ask-folder.empty.placeholder", "No instruction source folders found.");
    case PromptsType.prompt:
      return localize("commands.prompts.create.ask-folder.empty.placeholder", "No prompt source folders found.");
    case PromptsType.mode:
      return localize("commands.mode.create.ask-folder.empty.placeholder", "No custom chat mode source folders found.");
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getMissingSourceFolderString, "getMissingSourceFolderString");
export {
  askForPromptSourceFolder
};
//# sourceMappingURL=askForPromptSourceFolder.js.map
