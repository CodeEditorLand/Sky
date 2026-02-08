var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { extUri, isEqual } from "../../../../../../base/common/resources.js";
import { URI } from "../../../../../../base/common/uri.js";
import { localize } from "../../../../../../nls.js";
import { ILabelService } from "../../../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../../../platform/opener/common/opener.js";
import { PROMPT_DOCUMENTATION_URL, PromptsType } from "../../../common/promptSyntax/promptTypes.js";
import { IQuickInputService } from "../../../../../../platform/quickinput/common/quickInput.js";
import { IWorkspaceContextService } from "../../../../../../platform/workspace/common/workspace.js";
import { IPromptsService, PromptsStorage } from "../../../common/promptSyntax/service/promptsService.js";
async function askForPromptSourceFolder(accessor, type, existingFolder, isMove = false) {
  const quickInputService = accessor.get(IQuickInputService);
  const promptsService = accessor.get(IPromptsService);
  const labelService = accessor.get(ILabelService);
  const workspaceService = accessor.get(IWorkspaceContextService);
  const folders = await promptsService.getSourceFolders(type);
  if (folders.length === 0) {
    await showNoFoldersDialog(accessor, type);
    return;
  }
  const pickOptions = {
    placeHolder: existingFolder ? getPlaceholderStringforMove(type, isMove) : getPlaceholderStringforNew(type),
    canPickMany: false,
    matchOnDescription: true
  };
  const foldersList = folders.map((folder) => {
    const uri = folder.uri;
    const detail = existingFolder && isEqual(uri, existingFolder) ? localize("current.folder", "Current Location") : void 0;
    if (folder.storage !== PromptsStorage.local) {
      return {
        type: "item",
        label: promptsService.getPromptLocationLabel(folder),
        detail,
        tooltip: labelService.getUriLabel(uri),
        folder
      };
    }
    const { folders: folders2 } = workspaceService.getWorkspace();
    const isMultirootWorkspace = folders2.length > 1;
    const firstFolder = folders2[0];
    if (isMultirootWorkspace || !firstFolder || !extUri.isEqual(firstFolder.uri, uri)) {
      return {
        type: "item",
        label: labelService.getUriLabel(uri, { relative: true }),
        detail,
        tooltip: labelService.getUriLabel(uri),
        folder
      };
    }
    return {
      type: "item",
      label: localize("commands.prompts.create.source-folder.current-workspace", "Current Workspace"),
      detail,
      tooltip: labelService.getUriLabel(uri),
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
      return localize("workbench.command.instructions.create.location.placeholder", "Select a location to create the instructions file");
    case PromptsType.prompt:
      return localize("workbench.command.prompt.create.location.placeholder", "Select a location to create the prompt file");
    case PromptsType.agent:
      return localize("workbench.command.agent.create.location.placeholder", "Select a location to create the agent file");
    case PromptsType.skill:
      return localize("workbench.command.skill.create.location.placeholder", "Select a location to create the skill");
    case PromptsType.hook:
      return localize("workbench.command.hook.create.location.placeholder", "Select a location to create the hook file");
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getPlaceholderStringforNew, "getPlaceholderStringforNew");
function getPlaceholderStringforMove(type, isMove) {
  if (isMove) {
    switch (type) {
      case PromptsType.instructions:
        return localize("instructions.move.location.placeholder", "Select a location to move the instructions file to");
      case PromptsType.prompt:
        return localize("prompt.move.location.placeholder", "Select a location to move the prompt file to");
      case PromptsType.agent:
        return localize("agent.move.location.placeholder", "Select a location to move the agent file to");
      case PromptsType.skill:
        return localize("skill.move.location.placeholder", "Select a location to move the skill to");
      case PromptsType.hook:
        throw new Error("Hooks cannot be moved");
      default:
        throw new Error("Unknown prompt type");
    }
  }
  switch (type) {
    case PromptsType.instructions:
      return localize("instructions.copy.location.placeholder", "Select a location to copy the instructions file to");
    case PromptsType.prompt:
      return localize("prompt.copy.location.placeholder", "Select a location to copy the prompt file to");
    case PromptsType.agent:
      return localize("agent.copy.location.placeholder", "Select a location to copy the agent file to");
    case PromptsType.skill:
      return localize("skill.copy.location.placeholder", "Select a location to copy the skill to");
    case PromptsType.hook:
      throw new Error("Hooks cannot be copied");
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
    case PromptsType.agent:
      return localize("commands.agent.create.ask-folder.empty.docs-label", "Learn how to configure custom agents");
    case PromptsType.skill:
      return localize("commands.skill.create.ask-folder.empty.docs-label", "Learn how to configure skills");
    case PromptsType.hook:
      return localize("commands.hook.create.ask-folder.empty.docs-label", "Learn how to configure hooks");
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
    case PromptsType.agent:
      return localize("commands.agent.create.ask-folder.empty.placeholder", "No agent source folders found.");
    case PromptsType.skill:
      return localize("commands.skill.create.ask-folder.empty.placeholder", "No skill source folders found.");
    case PromptsType.hook:
      return localize("commands.hook.create.ask-folder.empty.placeholder", "No hook source folders found.");
    default:
      throw new Error("Unknown prompt type");
  }
}
__name(getMissingSourceFolderString, "getMissingSourceFolderString");
export {
  askForPromptSourceFolder
};
//# sourceMappingURL=askForPromptSourceFolder.js.map
