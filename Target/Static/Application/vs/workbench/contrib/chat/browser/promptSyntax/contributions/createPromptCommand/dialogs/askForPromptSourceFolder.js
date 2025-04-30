var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../../../../../nls.js";
import { URI } from "../../../../../../../../base/common/uri.js";
import { basename, extUri } from "../../../../../../../../base/common/resources.js";
import { PROMPT_DOCUMENTATION_URL } from "../../../../../common/promptSyntax/constants.js";
const askForPromptSourceFolder = /* @__PURE__ */ __name(async (options) => {
  const { type, placeHolder, promptsService, quickInputService, labelService, openerService, workspaceService } = options;
  const folders = promptsService.getSourceFolders(type);
  if (folders.length === 0) {
    return await showNoFoldersDialog(quickInputService, openerService);
  }
  if (folders.length === 1) {
    return folders[0];
  }
  const pickOptions = {
    placeHolder,
    canPickMany: false,
    matchOnDescription: true
  };
  const foldersList = folders.map((folder) => {
    const uri = folder.uri;
    if (folder.storage === "user") {
      return {
        type: "item",
        label: localize("commands.prompts.create.source-folder.user", "User Data Folder"),
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
        description: labelService.getUriLabel(uri, { relative: true }),
        tooltip: uri.fsPath,
        folder
      };
    }
    return {
      type: "item",
      label: localize("commands.prompts.create.source-folder.current-workspace", "Current Workspace"),
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
}, "askForPromptSourceFolder");
const showNoFoldersDialog = /* @__PURE__ */ __name(async (quickInputService, openerService) => {
  const docsQuickPick = {
    type: "item",
    label: localize("commands.prompts.create.ask-folder.empty.docs-label", "Learn how to configure reusable prompts"),
    description: PROMPT_DOCUMENTATION_URL,
    tooltip: PROMPT_DOCUMENTATION_URL,
    value: URI.parse(PROMPT_DOCUMENTATION_URL)
  };
  const result = await quickInputService.pick([docsQuickPick], {
    placeHolder: localize("commands.prompts.create.ask-folder.empty.placeholder", "No prompt source folders found."),
    canPickMany: false
  });
  if (!result) {
    return;
  }
  await openerService.open(result.value);
  return;
}, "showNoFoldersDialog");
export {
  askForPromptSourceFolder
};
//# sourceMappingURL=askForPromptSourceFolder.js.map
