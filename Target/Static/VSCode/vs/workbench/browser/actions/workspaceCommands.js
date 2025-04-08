var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize, localize2 } from "../../../nls.js";
import { hasWorkspaceFileExtension, IWorkspaceContextService } from "../../../platform/workspace/common/workspace.js";
import { IWorkspaceEditingService } from "../../services/workspaces/common/workspaceEditing.js";
import { dirname } from "../../../base/common/resources.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { mnemonicButtonLabel } from "../../../base/common/labels.js";
import { CommandsRegistry, ICommandService } from "../../../platform/commands/common/commands.js";
import { FileKind } from "../../../platform/files/common/files.js";
import { ServicesAccessor } from "../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../platform/label/common/label.js";
import { IQuickInputService, IPickOptions, IQuickPickItem } from "../../../platform/quickinput/common/quickInput.js";
import { getIconClasses } from "../../../editor/common/services/getIconClasses.js";
import { IModelService } from "../../../editor/common/services/model.js";
import { ILanguageService } from "../../../editor/common/languages/language.js";
import { IFileDialogService, IPickAndOpenOptions } from "../../../platform/dialogs/common/dialogs.js";
import { URI, UriComponents } from "../../../base/common/uri.js";
import { Schemas } from "../../../base/common/network.js";
import { IOpenEmptyWindowOptions, IOpenWindowOptions, IWindowOpenable } from "../../../platform/window/common/window.js";
import { IRecent, IWorkspacesService } from "../../../platform/workspaces/common/workspaces.js";
import { IPathService } from "../../services/path/common/pathService.js";
import { ILocalizedString } from "../../../platform/action/common/action.js";
const ADD_ROOT_FOLDER_COMMAND_ID = "addRootFolder";
const ADD_ROOT_FOLDER_LABEL = localize2("addFolderToWorkspace", "Add Folder to Workspace...");
const SET_ROOT_FOLDER_COMMAND_ID = "setRootFolder";
const PICK_WORKSPACE_FOLDER_COMMAND_ID = "_workbench.pickWorkspaceFolder";
CommandsRegistry.registerCommand({
  id: "workbench.action.files.openFileFolderInNewWindow",
  handler: /* @__PURE__ */ __name((accessor) => accessor.get(IFileDialogService).pickFileFolderAndOpen({ forceNewWindow: true }), "handler")
});
CommandsRegistry.registerCommand({
  id: "_files.pickFolderAndOpen",
  handler: /* @__PURE__ */ __name((accessor, options) => accessor.get(IFileDialogService).pickFolderAndOpen(options), "handler")
});
CommandsRegistry.registerCommand({
  id: "workbench.action.files.openFolderInNewWindow",
  handler: /* @__PURE__ */ __name((accessor) => accessor.get(IFileDialogService).pickFolderAndOpen({ forceNewWindow: true }), "handler")
});
CommandsRegistry.registerCommand({
  id: "workbench.action.files.openFileInNewWindow",
  handler: /* @__PURE__ */ __name((accessor) => accessor.get(IFileDialogService).pickFileAndOpen({ forceNewWindow: true }), "handler")
});
CommandsRegistry.registerCommand({
  id: "workbench.action.openWorkspaceInNewWindow",
  handler: /* @__PURE__ */ __name((accessor) => accessor.get(IFileDialogService).pickWorkspaceAndOpen({ forceNewWindow: true }), "handler")
});
CommandsRegistry.registerCommand({
  id: ADD_ROOT_FOLDER_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    const folders = await selectWorkspaceFolders(accessor);
    if (!folders || !folders.length) {
      return;
    }
    await workspaceEditingService.addFolders(folders.map((folder) => ({ uri: folder })));
  }, "handler")
});
CommandsRegistry.registerCommand({
  id: SET_ROOT_FOLDER_COMMAND_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    const contextService = accessor.get(IWorkspaceContextService);
    const folders = await selectWorkspaceFolders(accessor);
    if (!folders || !folders.length) {
      return;
    }
    await workspaceEditingService.updateFolders(0, contextService.getWorkspace().folders.length, folders.map((folder) => ({ uri: folder })));
  }, "handler")
});
async function selectWorkspaceFolders(accessor) {
  const dialogsService = accessor.get(IFileDialogService);
  const pathService = accessor.get(IPathService);
  const folders = await dialogsService.showOpenDialog({
    openLabel: mnemonicButtonLabel(localize({ key: "add", comment: ["&& denotes a mnemonic"] }, "&&Add")),
    title: localize("addFolderToWorkspaceTitle", "Add Folder to Workspace"),
    canSelectFolders: true,
    canSelectMany: true,
    defaultUri: await dialogsService.defaultFolderPath(),
    availableFileSystems: [pathService.defaultUriScheme]
  });
  return folders;
}
__name(selectWorkspaceFolders, "selectWorkspaceFolders");
CommandsRegistry.registerCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID, async function(accessor, args) {
  const quickInputService = accessor.get(IQuickInputService);
  const labelService = accessor.get(ILabelService);
  const contextService = accessor.get(IWorkspaceContextService);
  const modelService = accessor.get(IModelService);
  const languageService = accessor.get(ILanguageService);
  const folders = contextService.getWorkspace().folders;
  if (!folders.length) {
    return;
  }
  const folderPicks = folders.map((folder) => {
    const label = folder.name;
    const description = labelService.getUriLabel(dirname(folder.uri), { relative: true });
    return {
      label,
      description: description !== label ? description : void 0,
      // https://github.com/microsoft/vscode/issues/183418
      folder,
      iconClasses: getIconClasses(modelService, languageService, folder.uri, FileKind.ROOT_FOLDER)
    };
  });
  const options = (args ? args[0] : void 0) || /* @__PURE__ */ Object.create(null);
  if (!options.activeItem) {
    options.activeItem = folderPicks[0];
  }
  if (!options.placeHolder) {
    options.placeHolder = localize("workspaceFolderPickerPlaceholder", "Select workspace folder");
  }
  if (typeof options.matchOnDescription !== "boolean") {
    options.matchOnDescription = true;
  }
  const token = (args ? args[1] : void 0) || CancellationToken.None;
  const pick = await quickInputService.pick(folderPicks, options, token);
  if (pick) {
    return folders[folderPicks.indexOf(pick)];
  }
  return;
});
CommandsRegistry.registerCommand({
  id: "vscode.openFolder",
  handler: /* @__PURE__ */ __name((accessor, uriComponents, arg) => {
    const commandService = accessor.get(ICommandService);
    if (typeof arg === "boolean") {
      arg = { forceNewWindow: arg };
    }
    if (!uriComponents) {
      const options2 = {
        forceNewWindow: arg?.forceNewWindow
      };
      if (arg?.forceLocalWindow) {
        options2.remoteAuthority = null;
        options2.availableFileSystems = ["file"];
      }
      return commandService.executeCommand("_files.pickFolderAndOpen", options2);
    }
    const uri = URI.from(uriComponents, true);
    const options = {
      forceNewWindow: arg?.forceNewWindow,
      forceReuseWindow: arg?.forceReuseWindow,
      noRecentEntry: arg?.noRecentEntry,
      remoteAuthority: arg?.forceLocalWindow ? null : void 0,
      forceProfile: arg?.forceProfile,
      forceTempProfile: arg?.forceTempProfile
    };
    const uriToOpen = hasWorkspaceFileExtension(uri) || uri.scheme === Schemas.untitled ? { workspaceUri: uri } : { folderUri: uri };
    return commandService.executeCommand("_files.windowOpen", [uriToOpen], options);
  }, "handler"),
  metadata: {
    description: "Open a folder or workspace in the current window or new window depending on the newWindow argument. Note that opening in the same window will shutdown the current extension host process and start a new one on the given folder/workspace unless the newWindow parameter is set to true.",
    args: [
      {
        name: "uri",
        description: "(optional) Uri of the folder or workspace file to open. If not provided, a native dialog will ask the user for the folder",
        constraint: /* @__PURE__ */ __name((value) => value === void 0 || value === null || value instanceof URI, "constraint")
      },
      {
        name: "options",
        description: "(optional) Options. Object with the following properties: `forceNewWindow`: Whether to open the folder/workspace in a new window or the same. Defaults to opening in the same window. `forceReuseWindow`: Whether to force opening the folder/workspace in the same window.  Defaults to false. `noRecentEntry`: Whether the opened URI will appear in the 'Open Recent' list. Defaults to false. Note, for backward compatibility, options can also be of type boolean, representing the `forceNewWindow` setting.",
        constraint: /* @__PURE__ */ __name((value) => value === void 0 || typeof value === "object" || typeof value === "boolean", "constraint")
      }
    ]
  }
});
CommandsRegistry.registerCommand({
  id: "vscode.newWindow",
  handler: /* @__PURE__ */ __name((accessor, options) => {
    const commandService = accessor.get(ICommandService);
    const commandOptions = {
      forceReuseWindow: options && options.reuseWindow,
      remoteAuthority: options && options.remoteAuthority
    };
    return commandService.executeCommand("_files.newWindow", commandOptions);
  }, "handler"),
  metadata: {
    description: "Opens an new window depending on the newWindow argument.",
    args: [
      {
        name: "options",
        description: "(optional) Options. Object with the following properties: `reuseWindow`: Whether to open a new window or the same. Defaults to opening in a new window. ",
        constraint: /* @__PURE__ */ __name((value) => value === void 0 || typeof value === "object", "constraint")
      }
    ]
  }
});
CommandsRegistry.registerCommand("_workbench.removeFromRecentlyOpened", function(accessor, uri) {
  const workspacesService = accessor.get(IWorkspacesService);
  return workspacesService.removeRecentlyOpened([uri]);
});
CommandsRegistry.registerCommand({
  id: "vscode.removeFromRecentlyOpened",
  handler: /* @__PURE__ */ __name((accessor, path) => {
    const workspacesService = accessor.get(IWorkspacesService);
    if (typeof path === "string") {
      path = path.match(/^[^:/?#]+:\/\//) ? URI.parse(path) : URI.file(path);
    } else {
      path = URI.revive(path);
    }
    return workspacesService.removeRecentlyOpened([path]);
  }, "handler"),
  metadata: {
    description: "Removes an entry with the given path from the recently opened list.",
    args: [
      { name: "path", description: "URI or URI string to remove from recently opened.", constraint: /* @__PURE__ */ __name((value) => typeof value === "string" || value instanceof URI, "constraint") }
    ]
  }
});
CommandsRegistry.registerCommand("_workbench.addToRecentlyOpened", async function(accessor, recentEntry) {
  const workspacesService = accessor.get(IWorkspacesService);
  const uri = recentEntry.uri;
  const label = recentEntry.label;
  const remoteAuthority = recentEntry.remoteAuthority;
  let recent = void 0;
  if (recentEntry.type === "workspace") {
    const workspace = await workspacesService.getWorkspaceIdentifier(uri);
    recent = { workspace, label, remoteAuthority };
  } else if (recentEntry.type === "folder") {
    recent = { folderUri: uri, label, remoteAuthority };
  } else {
    recent = { fileUri: uri, label, remoteAuthority };
  }
  return workspacesService.addRecentlyOpened([recent]);
});
CommandsRegistry.registerCommand("_workbench.getRecentlyOpened", async function(accessor) {
  const workspacesService = accessor.get(IWorkspacesService);
  return workspacesService.getRecentlyOpened();
});
export {
  ADD_ROOT_FOLDER_COMMAND_ID,
  ADD_ROOT_FOLDER_LABEL,
  PICK_WORKSPACE_FOLDER_COMMAND_ID,
  SET_ROOT_FOLDER_COMMAND_ID
};
//# sourceMappingURL=workspaceCommands.js.map
