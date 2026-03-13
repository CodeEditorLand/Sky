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
import { localize } from "../../../../nls.js";
import { IActionWidgetService } from "../../../../platform/actionWidget/browser/actionWidget.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
const OPEN_REPO_COMMAND = "github.copilot.chat.cloudSessions.openRepository";
const STORAGE_KEY_LAST_REPO = "agentSessions.lastPickedRepo";
const STORAGE_KEY_RECENT_REPOS = "agentSessions.recentlyPickedRepos";
const MAX_RECENT_REPOS = 10;
const FILTER_THRESHOLD = 10;
let RepoPicker = class RepoPicker2 extends Disposable {
  static {
    __name(this, "RepoPicker");
  }
  get selectedRepo() {
    return this._selectedRepo?.id;
  }
  constructor(actionWidgetService, storageService, commandService) {
    super();
    this.actionWidgetService = actionWidgetService;
    this.storageService = storageService;
    this.commandService = commandService;
    this._onDidSelectRepo = this._register(new Emitter());
    this.onDidSelectRepo = this._onDidSelectRepo.event;
    this._renderDisposables = this._register(new DisposableStore());
    this._recentlyPickedRepos = [];
    try {
      const last = this.storageService.get(
        STORAGE_KEY_LAST_REPO,
        0
        /* StorageScope.PROFILE */
      );
      if (last) {
        this._selectedRepo = JSON.parse(last);
      }
    } catch {
    }
    try {
      const stored = this.storageService.get(
        STORAGE_KEY_RECENT_REPOS,
        0
        /* StorageScope.PROFILE */
      );
      if (stored) {
        this._recentlyPickedRepos = JSON.parse(stored);
      }
    } catch {
    }
  }
  /**
   * Renders the repo picker trigger button into the given container.
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
    this._updateTriggerLabel();
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
   * Shows the repo picker dropdown anchored to the trigger element.
   */
  showPicker() {
    if (!this._triggerElement || this.actionWidgetService.isVisible) {
      return;
    }
    const items = this._buildItems();
    const showFilter = items.filter(
      (i) => i.kind === "action"
      /* ActionListItemKind.Action */
    ).length > FILTER_THRESHOLD;
    const triggerElement = this._triggerElement;
    const delegate = {
      onSelect: /* @__PURE__ */ __name((item) => {
        this.actionWidgetService.hide();
        if (item.id === "browse") {
          this._browseForRepo();
        } else {
          this._selectRepo(item);
        }
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name(() => {
        triggerElement.focus();
      }, "onHide")
    };
    this.actionWidgetService.show("repoPicker", false, items, delegate, this._triggerElement, void 0, [], {
      getAriaLabel: /* @__PURE__ */ __name((item) => item.label ?? "", "getAriaLabel"),
      getWidgetAriaLabel: /* @__PURE__ */ __name(() => localize("repoPicker.ariaLabel", "Repository Picker"), "getWidgetAriaLabel")
    }, showFilter ? { showFilter: true, filterPlaceholder: localize("repoPicker.filter", "Filter repositories...") } : void 0);
  }
  /**
   * Programmatically set the selected repository.
   */
  setSelectedRepo(repoPath) {
    this._selectRepo({ id: repoPath, name: repoPath });
  }
  /**
   * Clears the selected repository.
   */
  clearSelection() {
    this._selectedRepo = void 0;
    this._updateTriggerLabel();
  }
  _selectRepo(item) {
    this._selectedRepo = item;
    this._addToRecentlyPicked(item);
    this.storageService.store(
      STORAGE_KEY_LAST_REPO,
      JSON.stringify(item),
      0,
      1
      /* StorageTarget.MACHINE */
    );
    this._updateTriggerLabel();
    this._onDidSelectRepo.fire(item.id);
  }
  async _browseForRepo() {
    try {
      const result = await this.commandService.executeCommand(OPEN_REPO_COMMAND);
      if (result) {
        this._selectRepo({ id: result, name: result });
      }
    } catch {
    }
  }
  _addToRecentlyPicked(item) {
    this._recentlyPickedRepos = [
      { id: item.id, name: item.name },
      ...this._recentlyPickedRepos.filter((r) => r.id !== item.id)
    ].slice(0, MAX_RECENT_REPOS);
    this.storageService.store(
      STORAGE_KEY_RECENT_REPOS,
      JSON.stringify(this._recentlyPickedRepos),
      0,
      1
      /* StorageTarget.MACHINE */
    );
  }
  _buildItems() {
    const seenIds = /* @__PURE__ */ new Set();
    const items = [];
    if (this._selectedRepo) {
      seenIds.add(this._selectedRepo.id);
      items.push({
        kind: "action",
        label: this._selectedRepo.name,
        group: { title: "", icon: Codicon.repo },
        item: this._selectedRepo
      });
    }
    const dedupedRepos = this._recentlyPickedRepos.filter((r) => !seenIds.has(r.id));
    dedupedRepos.sort((a, b) => a.name.localeCompare(b.name));
    for (const repo of dedupedRepos) {
      seenIds.add(repo.id);
      items.push({
        kind: "action",
        label: repo.name,
        group: { title: "", icon: Codicon.repo },
        item: repo,
        onRemove: /* @__PURE__ */ __name(() => this._removeRepo(repo.id), "onRemove")
      });
    }
    if (items.length > 0) {
      items.push({ kind: "separator", label: "" });
    }
    items.push({
      kind: "action",
      label: localize("browseRepo", "Browse..."),
      group: { title: "", icon: Codicon.search },
      item: { id: "browse", name: localize("browseRepo", "Browse...") }
    });
    return items;
  }
  _removeRepo(repoId) {
    this._recentlyPickedRepos = this._recentlyPickedRepos.filter((r) => r.id !== repoId);
    this.storageService.store(
      STORAGE_KEY_RECENT_REPOS,
      JSON.stringify(this._recentlyPickedRepos),
      0,
      1
      /* StorageTarget.MACHINE */
    );
    this.actionWidgetService.hide();
    this.showPicker();
  }
  _updateTriggerLabel() {
    if (!this._triggerElement) {
      return;
    }
    dom.clearNode(this._triggerElement);
    const label = this._selectedRepo?.name ?? localize("pickRepo", "Pick Repository");
    dom.append(this._triggerElement, renderIcon(Codicon.repo));
    const labelSpan = dom.append(this._triggerElement, dom.$("span.sessions-chat-dropdown-label"));
    labelSpan.textContent = label;
    dom.append(this._triggerElement, renderIcon(Codicon.chevronDown));
  }
};
RepoPicker = __decorate([
  __param(0, IActionWidgetService),
  __param(1, IStorageService),
  __param(2, ICommandService)
], RepoPicker);
export {
  RepoPicker
};
//# sourceMappingURL=repoPicker.js.map
