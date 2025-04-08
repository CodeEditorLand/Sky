var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { app, JumpListCategory, JumpListItem } from "electron";
import { coalesce } from "../../../base/common/arrays.js";
import { ThrottledDelayer } from "../../../base/common/async.js";
import { Emitter, Event as CommonEvent } from "../../../base/common/event.js";
import { normalizeDriveLetter, splitRecentLabel } from "../../../base/common/labels.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { Schemas } from "../../../base/common/network.js";
import { isMacintosh, isWindows } from "../../../base/common/platform.js";
import { basename, extUriBiasedIgnorePathCase, originalFSPath } from "../../../base/common/resources.js";
import { URI } from "../../../base/common/uri.js";
import { Promises } from "../../../base/node/pfs.js";
import { localize } from "../../../nls.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILifecycleMainService, LifecycleMainPhase } from "../../lifecycle/electron-main/lifecycleMainService.js";
import { ILogService } from "../../log/common/log.js";
import { StorageScope, StorageTarget } from "../../storage/common/storage.js";
import { IApplicationStorageMainService } from "../../storage/electron-main/storageMainService.js";
import { IRecent, IRecentFile, IRecentFolder, IRecentlyOpened, IRecentWorkspace, isRecentFile, isRecentFolder, isRecentWorkspace, restoreRecentlyOpened, toStoreData } from "../common/workspaces.js";
import { IWorkspaceIdentifier, WORKSPACE_EXTENSION } from "../../workspace/common/workspace.js";
import { IWorkspacesManagementMainService } from "./workspacesManagementMainService.js";
import { ResourceMap } from "../../../base/common/map.js";
import { IDialogMainService } from "../../dialogs/electron-main/dialogMainService.js";
const IWorkspacesHistoryMainService = createDecorator("workspacesHistoryMainService");
let WorkspacesHistoryMainService = class extends Disposable {
  constructor(logService, workspacesManagementMainService, lifecycleMainService, applicationStorageMainService, dialogMainService) {
    super();
    this.logService = logService;
    this.workspacesManagementMainService = workspacesManagementMainService;
    this.lifecycleMainService = lifecycleMainService;
    this.applicationStorageMainService = applicationStorageMainService;
    this.dialogMainService = dialogMainService;
    this.registerListeners();
  }
  static {
    __name(this, "WorkspacesHistoryMainService");
  }
  static MAX_TOTAL_RECENT_ENTRIES = 500;
  static RECENTLY_OPENED_STORAGE_KEY = "history.recentlyOpenedPathsList";
  _onDidChangeRecentlyOpened = this._register(new Emitter());
  onDidChangeRecentlyOpened = this._onDidChangeRecentlyOpened.event;
  registerListeners() {
    this.lifecycleMainService.when(LifecycleMainPhase.Eventually).then(() => this.handleWindowsJumpList());
    this._register(this.workspacesManagementMainService.onDidEnterWorkspace((event) => this.addRecentlyOpened([{ workspace: event.workspace, remoteAuthority: event.window.remoteAuthority }])));
  }
  //#region Workspaces History
  async addRecentlyOpened(recentToAdd) {
    let workspaces = [];
    let files = [];
    for (const recent of recentToAdd) {
      if (isRecentWorkspace(recent)) {
        if (!this.workspacesManagementMainService.isUntitledWorkspace(recent.workspace) && !this.containsWorkspace(workspaces, recent.workspace)) {
          workspaces.push(recent);
        }
      } else if (isRecentFolder(recent)) {
        if (!this.containsFolder(workspaces, recent.folderUri)) {
          workspaces.push(recent);
        }
      } else {
        const alreadyExistsInHistory = this.containsFile(files, recent.fileUri);
        const shouldBeFiltered = recent.fileUri.scheme === Schemas.file && WorkspacesHistoryMainService.COMMON_FILES_FILTER.indexOf(basename(recent.fileUri)) >= 0;
        if (!alreadyExistsInHistory && !shouldBeFiltered) {
          files.push(recent);
          if (isWindows && recent.fileUri.scheme === Schemas.file) {
            app.addRecentDocument(recent.fileUri.fsPath);
          }
        }
      }
    }
    const mergedEntries = await this.mergeEntriesFromStorage({ workspaces, files });
    workspaces = mergedEntries.workspaces;
    files = mergedEntries.files;
    if (workspaces.length > WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES) {
      workspaces.length = WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES;
    }
    if (files.length > WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES) {
      files.length = WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES;
    }
    await this.saveRecentlyOpened({ workspaces, files });
    this._onDidChangeRecentlyOpened.fire();
    if (isMacintosh) {
      this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
    }
  }
  async removeRecentlyOpened(recentToRemove) {
    const keep = /* @__PURE__ */ __name((recent) => {
      const uri = this.location(recent);
      for (const resourceToRemove of recentToRemove) {
        if (extUriBiasedIgnorePathCase.isEqual(resourceToRemove, uri)) {
          return false;
        }
      }
      return true;
    }, "keep");
    const mru = await this.getRecentlyOpened();
    const workspaces = mru.workspaces.filter(keep);
    const files = mru.files.filter(keep);
    if (workspaces.length !== mru.workspaces.length || files.length !== mru.files.length) {
      await this.saveRecentlyOpened({ files, workspaces });
      this._onDidChangeRecentlyOpened.fire();
      if (isMacintosh) {
        this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
      }
    }
  }
  async clearRecentlyOpened(options) {
    if (options?.confirm) {
      const { response } = await this.dialogMainService.showMessageBox({
        type: "warning",
        buttons: [
          localize({ key: "clearButtonLabel", comment: ["&& denotes a mnemonic"] }, "&&Clear"),
          localize({ key: "cancel", comment: ["&& denotes a mnemonic"] }, "&&Cancel")
        ],
        message: localize("confirmClearRecentsMessage", "Do you want to clear all recently opened files and workspaces?"),
        detail: localize("confirmClearDetail", "This action is irreversible!"),
        cancelId: 1
      });
      if (response !== 0) {
        return;
      }
    }
    await this.saveRecentlyOpened({ workspaces: [], files: [] });
    app.clearRecentDocuments();
    this._onDidChangeRecentlyOpened.fire();
  }
  async getRecentlyOpened() {
    return this.mergeEntriesFromStorage();
  }
  async mergeEntriesFromStorage(existingEntries) {
    const mapWorkspaceIdToWorkspace = new ResourceMap((uri) => extUriBiasedIgnorePathCase.getComparisonKey(uri));
    if (existingEntries?.workspaces) {
      for (const workspace of existingEntries.workspaces) {
        mapWorkspaceIdToWorkspace.set(this.location(workspace), workspace);
      }
    }
    const mapFileIdToFile = new ResourceMap((uri) => extUriBiasedIgnorePathCase.getComparisonKey(uri));
    if (existingEntries?.files) {
      for (const file of existingEntries.files) {
        mapFileIdToFile.set(this.location(file), file);
      }
    }
    const recentFromStorage = await this.getRecentlyOpenedFromStorage();
    for (const recentWorkspaceFromStorage of recentFromStorage.workspaces) {
      const existingRecentWorkspace = mapWorkspaceIdToWorkspace.get(this.location(recentWorkspaceFromStorage));
      if (existingRecentWorkspace) {
        existingRecentWorkspace.label = existingRecentWorkspace.label ?? recentWorkspaceFromStorage.label;
      } else {
        mapWorkspaceIdToWorkspace.set(this.location(recentWorkspaceFromStorage), recentWorkspaceFromStorage);
      }
    }
    for (const recentFileFromStorage of recentFromStorage.files) {
      const existingRecentFile = mapFileIdToFile.get(this.location(recentFileFromStorage));
      if (existingRecentFile) {
        existingRecentFile.label = existingRecentFile.label ?? recentFileFromStorage.label;
      } else {
        mapFileIdToFile.set(this.location(recentFileFromStorage), recentFileFromStorage);
      }
    }
    return {
      workspaces: [...mapWorkspaceIdToWorkspace.values()],
      files: [...mapFileIdToFile.values()]
    };
  }
  async getRecentlyOpenedFromStorage() {
    await this.applicationStorageMainService.whenReady;
    let storedRecentlyOpened = void 0;
    const storedRecentlyOpenedRaw = this.applicationStorageMainService.get(WorkspacesHistoryMainService.RECENTLY_OPENED_STORAGE_KEY, StorageScope.APPLICATION);
    if (typeof storedRecentlyOpenedRaw === "string") {
      try {
        storedRecentlyOpened = JSON.parse(storedRecentlyOpenedRaw);
      } catch (error) {
        this.logService.error("Unexpected error parsing opened paths list", error);
      }
    }
    return restoreRecentlyOpened(storedRecentlyOpened, this.logService);
  }
  async saveRecentlyOpened(recent) {
    await this.applicationStorageMainService.whenReady;
    this.applicationStorageMainService.store(WorkspacesHistoryMainService.RECENTLY_OPENED_STORAGE_KEY, JSON.stringify(toStoreData(recent)), StorageScope.APPLICATION, StorageTarget.MACHINE);
  }
  location(recent) {
    if (isRecentFolder(recent)) {
      return recent.folderUri;
    }
    if (isRecentFile(recent)) {
      return recent.fileUri;
    }
    return recent.workspace.configPath;
  }
  containsWorkspace(recents, candidate) {
    return !!recents.find((recent) => isRecentWorkspace(recent) && recent.workspace.id === candidate.id);
  }
  containsFolder(recents, candidate) {
    return !!recents.find((recent) => isRecentFolder(recent) && extUriBiasedIgnorePathCase.isEqual(recent.folderUri, candidate));
  }
  containsFile(recents, candidate) {
    return !!recents.find((recent) => extUriBiasedIgnorePathCase.isEqual(recent.fileUri, candidate));
  }
  //#endregion
  //#region macOS Dock / Windows JumpList
  static MAX_MACOS_DOCK_RECENT_WORKSPACES = 7;
  // prefer higher number of workspaces...
  static MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL = 10;
  // ...over number of files
  static MAX_WINDOWS_JUMP_LIST_ENTRIES = 7;
  // Exclude some very common files from the dock/taskbar
  static COMMON_FILES_FILTER = [
    "COMMIT_EDITMSG",
    "MERGE_MSG",
    "git-rebase-todo"
  ];
  macOSRecentDocumentsUpdater = this._register(new ThrottledDelayer(800));
  async handleWindowsJumpList() {
    if (!isWindows) {
      return;
    }
    await this.updateWindowsJumpList();
    this._register(this.onDidChangeRecentlyOpened(() => this.updateWindowsJumpList()));
  }
  async updateWindowsJumpList() {
    if (!isWindows) {
      return;
    }
    const jumpList = [];
    jumpList.push({
      type: "tasks",
      items: [
        {
          type: "task",
          title: localize("newWindow", "New Window"),
          description: localize("newWindowDesc", "Opens a new window"),
          program: process.execPath,
          args: "-n",
          // force new window
          iconPath: process.execPath,
          iconIndex: 0
        }
      ]
    });
    if ((await this.getRecentlyOpened()).workspaces.length > 0) {
      const toRemove = [];
      for (const item of app.getJumpListSettings().removedItems) {
        const args = item.args;
        if (args) {
          const match = /^--(folder|file)-uri\s+"([^"]+)"$/.exec(args);
          if (match) {
            toRemove.push(URI.parse(match[2]));
          }
        }
      }
      await this.removeRecentlyOpened(toRemove);
      let hasWorkspaces = false;
      const items = coalesce((await this.getRecentlyOpened()).workspaces.slice(0, WorkspacesHistoryMainService.MAX_WINDOWS_JUMP_LIST_ENTRIES).map((recent) => {
        const workspace = isRecentWorkspace(recent) ? recent.workspace : recent.folderUri;
        const { title, description } = this.getWindowsJumpListLabel(workspace, recent.label);
        let args;
        if (URI.isUri(workspace)) {
          args = `--folder-uri "${workspace.toString()}"`;
        } else {
          hasWorkspaces = true;
          args = `--file-uri "${workspace.configPath.toString()}"`;
        }
        return {
          type: "task",
          title: title.substr(0, 255),
          // Windows seems to be picky around the length of entries
          description: description.substr(0, 255),
          // (see https://github.com/microsoft/vscode/issues/111177)
          program: process.execPath,
          args,
          iconPath: "explorer.exe",
          // simulate folder icon
          iconIndex: 0
        };
      }));
      if (items.length > 0) {
        jumpList.push({
          type: "custom",
          name: hasWorkspaces ? localize("recentFoldersAndWorkspaces", "Recent Folders & Workspaces") : localize("recentFolders", "Recent Folders"),
          items
        });
      }
    }
    jumpList.push({
      type: "recent"
      // this enables to show files in the "recent" category
    });
    try {
      const res = app.setJumpList(jumpList);
      if (res && res !== "ok") {
        this.logService.warn(`updateWindowsJumpList#setJumpList unexpected result: ${res}`);
      }
    } catch (error) {
      this.logService.warn("updateWindowsJumpList#setJumpList", error);
    }
  }
  getWindowsJumpListLabel(workspace, recentLabel) {
    if (recentLabel) {
      return { title: splitRecentLabel(recentLabel).name, description: recentLabel };
    }
    if (URI.isUri(workspace)) {
      return { title: basename(workspace), description: this.renderJumpListPathDescription(workspace) };
    }
    if (this.workspacesManagementMainService.isUntitledWorkspace(workspace)) {
      return { title: localize("untitledWorkspace", "Untitled (Workspace)"), description: "" };
    }
    let filename = basename(workspace.configPath);
    if (filename.endsWith(WORKSPACE_EXTENSION)) {
      filename = filename.substr(0, filename.length - WORKSPACE_EXTENSION.length - 1);
    }
    return { title: localize("workspaceName", "{0} (Workspace)", filename), description: this.renderJumpListPathDescription(workspace.configPath) };
  }
  renderJumpListPathDescription(uri) {
    return uri.scheme === "file" ? normalizeDriveLetter(uri.fsPath) : uri.toString();
  }
  async updateMacOSRecentDocuments() {
    if (!isMacintosh) {
      return;
    }
    app.clearRecentDocuments();
    const mru = await this.getRecentlyOpened();
    const workspaceEntries = [];
    let entries = 0;
    for (let i = 0; i < mru.workspaces.length && entries < WorkspacesHistoryMainService.MAX_MACOS_DOCK_RECENT_WORKSPACES; i++) {
      const loc = this.location(mru.workspaces[i]);
      if (loc.scheme === Schemas.file) {
        const workspacePath = originalFSPath(loc);
        if (await Promises.exists(workspacePath)) {
          workspaceEntries.push(workspacePath);
          entries++;
        }
      }
    }
    const fileEntries = [];
    for (let i = 0; i < mru.files.length && entries < WorkspacesHistoryMainService.MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL; i++) {
      const loc = this.location(mru.files[i]);
      if (loc.scheme === Schemas.file) {
        const filePath = originalFSPath(loc);
        if (WorkspacesHistoryMainService.COMMON_FILES_FILTER.includes(basename(loc)) || // skip some well known file entries
        workspaceEntries.includes(filePath)) {
          continue;
        }
        if (await Promises.exists(filePath)) {
          fileEntries.push(filePath);
          entries++;
        }
      }
    }
    fileEntries.reverse().forEach((fileEntry) => app.addRecentDocument(fileEntry));
    workspaceEntries.reverse().forEach((workspaceEntry) => app.addRecentDocument(workspaceEntry));
  }
  //#endregion
};
WorkspacesHistoryMainService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IWorkspacesManagementMainService),
  __decorateParam(2, ILifecycleMainService),
  __decorateParam(3, IApplicationStorageMainService),
  __decorateParam(4, IDialogMainService)
], WorkspacesHistoryMainService);
export {
  IWorkspacesHistoryMainService,
  WorkspacesHistoryMainService
};
//# sourceMappingURL=workspacesHistoryMainService.js.map
