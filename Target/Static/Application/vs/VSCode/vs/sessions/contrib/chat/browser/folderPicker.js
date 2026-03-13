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
import * as dom from "../../../../base/browser/dom.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { basename, extUriBiasedIgnorePathCase, isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { IActionWidgetService } from "../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
const STORAGE_KEY_LAST_FOLDER = "agentSessions.lastPickedFolder";
const STORAGE_KEY_RECENT_FOLDERS = "agentSessions.recentlyPickedFolders";
const MAX_RECENT_FOLDERS = 10;
const FILTER_THRESHOLD = 10;
let FolderPicker = class FolderPicker2 extends Disposable {
  static {
    __name(this, "FolderPicker");
  }
  get selectedFolderUri() {
    return this._selectedFolderUri;
  }
  constructor(actionWidgetService, storageService, fileDialogService, commandService) {
    super();
    this.actionWidgetService = actionWidgetService;
    this.storageService = storageService;
    this.fileDialogService = fileDialogService;
    this.commandService = commandService;
    this._onDidSelectFolder = this._register(new Emitter());
    this.onDidSelectFolder = this._onDidSelectFolder.event;
    this._recentlyPickedFolders = [];
    this._renderDisposables = this._register(new DisposableStore());
    const lastFolder = this.storageService.get(
      STORAGE_KEY_LAST_FOLDER,
      0
      /* StorageScope.PROFILE */
    );
    if (lastFolder) {
      try {
        this._selectedFolderUri = URI.parse(lastFolder);
      } catch {
      }
    }
    try {
      const stored = this.storageService.get(
        STORAGE_KEY_RECENT_FOLDERS,
        0
        /* StorageScope.PROFILE */
      );
      if (stored) {
        this._recentlyPickedFolders = JSON.parse(stored).map((s) => URI.parse(s));
      }
    } catch {
    }
  }
  /**
   * Renders the folder picker trigger button into the given container.
   * Returns the container element.
   */
  render(container) {
    this._renderDisposables.clear();
    const slot = dom.append(container, dom.$(".sessions-chat-picker-slot"));
    this._renderDisposables.add({ dispose: /* @__PURE__ */ __name(() => slot.remove(), "dispose") });
    const trigger = dom.append(slot, dom.$("a.action-label"));
    trigger.tabIndex = 0;
    trigger.role = "button";
    this._triggerElement = trigger;
    this._updateTriggerLabel(trigger);
    this._renderDisposables.add(dom.addDisposableListener(trigger, dom.EventType.CLICK, (e) => {
      dom.EventHelper.stop(e, true);
      this.showPicker();
    }));
    this._renderDisposables.add(dom.addDisposableListener(trigger, dom.EventType.KEY_DOWN, (e) => {
      if (e.key === "Enter" || e.key === " ") {
        dom.EventHelper.stop(e, true);
        this.showPicker();
      }
    }));
    return slot;
  }
  /**
   * Shows the folder picker dropdown anchored to the trigger element.
   */
  showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible) {
      return;
    }
    const currentFolderUri = this._selectedFolderUri;
    const items = this._buildItems(currentFolderUri);
    const showFilter = items.filter(
      (i) => i.kind === "action"
      /* ActionListItemKind.Action */
    ).length > FILTER_THRESHOLD;
    const triggerElement = this._triggerElement;
    const delegate = {
      onSelect: /* @__PURE__ */ __name((item) => {
        this.actionWidgetService.hide();
        if (item.uri.scheme === "command" && item.uri.path === "browse") {
          this._browseForFolder();
        } else if (item.uri.scheme === "command" && item.uri.path === "clone") {
          this._cloneRepository();
        } else {
          this._selectFolder(item.uri);
        }
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name(() => {
        triggerElement.focus();
      }, "onHide")
    };
    const listOptions = showFilter ? { showFilter: true, filterPlaceholder: localize("folderPicker.filter", "Filter folders...") } : void 0;
    this.actionWidgetService.show("folderPicker", false, items, delegate, this._triggerElement, void 0, [], {
      getAriaLabel: /* @__PURE__ */ __name((item) => item.label ?? "", "getAriaLabel"),
      getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("folderPicker.ariaLabel", "Folder Picker"), "getWidgetAriaLabel")
    }, listOptions);
  }
  /**
   * Programmatically set the selected folder (e.g. restoring draft state).
   */
  setSelectedFolder(folderUri) {
    this._selectFolder(folderUri);
  }
  /**
   * Clears the selected folder.
   */
  clearSelection() {
    this._selectedFolderUri = void 0;
    this._updateTriggerLabel(this._triggerElement);
  }
  _selectFolder(folderUri) {
    this._selectedFolderUri = folderUri;
    this._addToRecentlyPickedFolders(folderUri);
    this.storageService.store(
      STORAGE_KEY_LAST_FOLDER,
      folderUri.toString(),
      0,
      1
      /* StorageTarget.MACHINE */
    );
    this._updateTriggerLabel(this._triggerElement);
    this._onDidSelectFolder.fire(folderUri);
  }
  async _browseForFolder() {
    try {
      const selected = await this.fileDialogService.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title: localize("selectFolder", "Select Folder")
      });
      if (selected?.[0]) {
        this._selectFolder(selected[0]);
      }
    } catch {
    }
  }
  async _cloneRepository() {
    try {
      const clonedPath = await this.commandService.executeCommand("git.clone", void 0, void 0, { postCloneAction: "none" });
      if (clonedPath) {
        this._selectFolder(URI.file(clonedPath));
      }
    } catch {
    }
  }
  _addToRecentlyPickedFolders(folderUri) {
    this._recentlyPickedFolders = [folderUri, ...this._recentlyPickedFolders.filter((f) => !isEqual(f, folderUri))].slice(0, MAX_RECENT_FOLDERS);
    this.storageService.store(
      STORAGE_KEY_RECENT_FOLDERS,
      JSON.stringify(this._recentlyPickedFolders.map((f) => f.toString())),
      0,
      1
      /* StorageTarget.MACHINE */
    );
  }
  _buildItems(currentFolderUri) {
    const seenUris = /* @__PURE__ */ new Set();
    const items = [];
    const allFolders = [];
    if (currentFolderUri) {
      seenUris.add(currentFolderUri.toString());
      allFolders.push({ uri: currentFolderUri, label: basename(currentFolderUri) });
    }
    for (const folderUri of this._recentlyPickedFolders) {
      const key = folderUri.toString();
      if (seenUris.has(key)) {
        continue;
      }
      seenUris.add(key);
      allFolders.push({ uri: folderUri, label: basename(folderUri) });
    }
    allFolders.sort((a, b) => extUriBiasedIgnorePathCase.compare(a.uri, b.uri));
    for (const folder of allFolders) {
      const isCurrent = currentFolderUri && isEqual(folder.uri, currentFolderUri);
      items.push({
        kind: "action",
        label: folder.label,
        group: { title: "", icon: Codicon.folder },
        item: { uri: folder.uri, label: folder.label, checked: isCurrent || false },
        ...!isCurrent ? { onRemove: /* @__PURE__ */ __name(() => this._removeFolder(folder.uri), "onRemove") } : {}
      });
    }
    if (items.length > 0) {
      items.push({
        kind: "separator",
        label: ""
      });
    }
    items.push({
      kind: "action",
      label: localize("browseFolder", "Browse..."),
      group: { title: "", icon: Codicon.search },
      item: { uri: URI.from({ scheme: "command", path: "browse" }), label: localize("browseFolder", "Browse...") }
    });
    items.push({
      kind: "action",
      label: localize("cloneRepository", "Clone..."),
      group: { title: "", icon: Codicon.repoClone },
      item: { uri: URI.from({ scheme: "command", path: "clone" }), label: localize("cloneRepository", "Clone...") }
    });
    return items;
  }
  /**
   * Removes a folder from the recently picked list and storage.
   */
  removeFromRecents(folderUri) {
    this._recentlyPickedFolders = this._recentlyPickedFolders.filter((f) => !isEqual(f, folderUri));
    this.storageService.store(
      STORAGE_KEY_RECENT_FOLDERS,
      JSON.stringify(this._recentlyPickedFolders.map((f) => f.toString())),
      0,
      1
      /* StorageTarget.MACHINE */
    );
    if (this._selectedFolderUri && isEqual(this._selectedFolderUri, folderUri)) {
      this._selectedFolderUri = void 0;
      this.storageService.remove(
        STORAGE_KEY_LAST_FOLDER,
        0
        /* StorageScope.PROFILE */
      );
      this._updateTriggerLabel(this._triggerElement);
    }
  }
  _removeFolder(folderUri) {
    this._recentlyPickedFolders = this._recentlyPickedFolders.filter((f) => !isEqual(f, folderUri));
    this.storageService.store(
      STORAGE_KEY_RECENT_FOLDERS,
      JSON.stringify(this._recentlyPickedFolders.map((f) => f.toString())),
      0,
      1
      /* StorageTarget.MACHINE */
    );
  }
  _updateTriggerLabel(trigger) {
    if (!trigger) {
      return;
    }
    dom.clearNode(trigger);
    const folderUri = this._selectedFolderUri;
    const label = folderUri ? basename(folderUri) : localize("pickFolder", "Pick Folder");
    dom.append(trigger, renderIcon(Codicon.folder));
    const labelSpan = dom.append(trigger, dom.$("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = label;
    dom.append(trigger, renderIcon(Codicon.chevronDown));
  }
};
FolderPicker = __decorate([
  __param(0, IActionWidgetService),
  __param(1, IStorageService),
  __param(2, IFileDialogService),
  __param(3, ICommandService)
], FolderPicker);
export {
  FolderPicker
};
//# sourceMappingURL=folderPicker.js.map
