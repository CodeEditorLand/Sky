var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isStatusbarEntryLocation } from "../../../services/statusbar/browser/statusbar.js";
import { hide, show, isAncestorOfActiveElement } from "../../../../base/browser/dom.js";
import { Emitter } from "../../../../base/common/event.js";
class StatusbarViewModel extends Disposable {
  static {
    __name(this, "StatusbarViewModel");
  }
  static {
    this.HIDDEN_ENTRIES_KEY = "workbench.statusbar.hidden";
  }
  get entries() {
    return this._entries.slice(0);
  }
  get lastFocusedEntry() {
    return this._lastFocusedEntry && !this.isHidden(this._lastFocusedEntry.id) ? this._lastFocusedEntry : void 0;
  }
  constructor(storageService) {
    super();
    this.storageService = storageService;
    this._onDidChangeEntryVisibility = this._register(new Emitter());
    this.onDidChangeEntryVisibility = this._onDidChangeEntryVisibility.event;
    this._entries = [];
    this.hidden = /* @__PURE__ */ new Set();
    this.restoreState();
    this.registerListeners();
  }
  restoreState() {
    const hiddenRaw = this.storageService.get(
      StatusbarViewModel.HIDDEN_ENTRIES_KEY,
      0
      /* StorageScope.PROFILE */
    );
    if (hiddenRaw) {
      try {
        this.hidden = new Set(JSON.parse(hiddenRaw));
      } catch (error) {
      }
    }
  }
  registerListeners() {
    this._register(this.storageService.onDidChangeValue(0, StatusbarViewModel.HIDDEN_ENTRIES_KEY, this._store)(() => this.onDidStorageValueChange()));
  }
  onDidStorageValueChange() {
    const currentlyHidden = new Set(this.hidden);
    this.hidden.clear();
    this.restoreState();
    const changed = /* @__PURE__ */ new Set();
    for (const id of currentlyHidden) {
      if (!this.hidden.has(id)) {
        changed.add(id);
      }
    }
    for (const id of this.hidden) {
      if (!currentlyHidden.has(id)) {
        changed.add(id);
      }
    }
    if (changed.size > 0) {
      for (const entry of this._entries) {
        if (changed.has(entry.id)) {
          this.updateVisibility(entry.id, true);
          changed.delete(entry.id);
        }
      }
    }
  }
  add(entry) {
    this._entries.push(entry);
    this.updateVisibility(entry, false);
    this.sort();
    this.markFirstLastVisibleEntry();
  }
  remove(entry) {
    const index = this._entries.indexOf(entry);
    if (index >= 0) {
      this._entries.splice(index, 1);
      if (this._entries.some((otherEntry) => isStatusbarEntryLocation(otherEntry.priority.primary) && otherEntry.priority.primary.location.id === entry.id)) {
        this.sort();
      }
      this.markFirstLastVisibleEntry();
    }
  }
  isHidden(id) {
    return this.hidden.has(id);
  }
  hide(id) {
    if (!this.hidden.has(id)) {
      this.hidden.add(id);
      this.updateVisibility(id, true);
      this.saveState();
    }
  }
  show(id) {
    if (this.hidden.has(id)) {
      this.hidden.delete(id);
      this.updateVisibility(id, true);
      this.saveState();
    }
  }
  findEntry(container) {
    return this._entries.find((entry) => entry.container === container);
  }
  getEntries(alignment) {
    return this._entries.filter((entry) => entry.alignment === alignment);
  }
  focusNextEntry() {
    this.focusEntry(1, 0);
  }
  focusPreviousEntry() {
    this.focusEntry(-1, this.entries.length - 1);
  }
  isEntryFocused() {
    return !!this.getFocusedEntry();
  }
  getFocusedEntry() {
    return this._entries.find((entry) => isAncestorOfActiveElement(entry.container));
  }
  focusEntry(delta, restartPosition) {
    const getVisibleEntry = /* @__PURE__ */ __name((start) => {
      let indexToFocus = start;
      let entry2 = indexToFocus >= 0 && indexToFocus < this._entries.length ? this._entries[indexToFocus] : void 0;
      while (entry2 && this.isHidden(entry2.id)) {
        indexToFocus += delta;
        entry2 = indexToFocus >= 0 && indexToFocus < this._entries.length ? this._entries[indexToFocus] : void 0;
      }
      return entry2;
    }, "getVisibleEntry");
    const focused = this.getFocusedEntry();
    if (focused) {
      const entry2 = getVisibleEntry(this._entries.indexOf(focused) + delta);
      if (entry2) {
        this._lastFocusedEntry = entry2;
        entry2.labelContainer.focus();
        return;
      }
    }
    const entry = getVisibleEntry(restartPosition);
    if (entry) {
      this._lastFocusedEntry = entry;
      entry.labelContainer.focus();
    }
  }
  updateVisibility(arg1, trigger) {
    if (typeof arg1 === "string") {
      const id = arg1;
      for (const entry of this._entries) {
        if (entry.id === id) {
          this.updateVisibility(entry, trigger);
        }
      }
    } else {
      const entry = arg1;
      const isHidden = this.isHidden(entry.id);
      if (isHidden) {
        hide(entry.container);
      } else {
        show(entry.container);
      }
      if (trigger) {
        this._onDidChangeEntryVisibility.fire({ id: entry.id, visible: !isHidden });
      }
      this.markFirstLastVisibleEntry();
    }
  }
  saveState() {
    if (this.hidden.size > 0) {
      this.storageService.store(
        StatusbarViewModel.HIDDEN_ENTRIES_KEY,
        JSON.stringify(Array.from(this.hidden.values())),
        0,
        0
        /* StorageTarget.USER */
      );
    } else {
      this.storageService.remove(
        StatusbarViewModel.HIDDEN_ENTRIES_KEY,
        0
        /* StorageScope.PROFILE */
      );
    }
  }
  sort() {
    const allEntryIds = new Set(this._entries.map((entry) => entry.id));
    const mapEntryWithNumberedPriorityToIndex = /* @__PURE__ */ new Map();
    const mapEntryWithRelativePriority = /* @__PURE__ */ new Map();
    for (let i = 0; i < this._entries.length; i++) {
      const entry = this._entries[i];
      if (typeof entry.priority.primary === "number" || !allEntryIds.has(entry.priority.primary.location.id)) {
        mapEntryWithNumberedPriorityToIndex.set(entry, i);
      } else {
        const referenceEntryId = entry.priority.primary.location.id;
        let entries = mapEntryWithRelativePriority.get(referenceEntryId);
        if (!entries) {
          for (const relativeEntries of mapEntryWithRelativePriority.values()) {
            if (relativeEntries.has(referenceEntryId)) {
              entries = relativeEntries;
              break;
            }
          }
          if (!entries) {
            entries = /* @__PURE__ */ new Map();
            mapEntryWithRelativePriority.set(referenceEntryId, entries);
          }
        }
        entries.set(entry.id, entry);
      }
    }
    const sortedEntriesWithNumberedPriority = Array.from(mapEntryWithNumberedPriorityToIndex.keys());
    sortedEntriesWithNumberedPriority.sort((entryA, entryB) => {
      if (entryA.alignment === entryB.alignment) {
        const entryAPrimaryPriority = typeof entryA.priority.primary === "number" ? entryA.priority.primary : entryA.priority.primary.location.priority;
        const entryBPrimaryPriority = typeof entryB.priority.primary === "number" ? entryB.priority.primary : entryB.priority.primary.location.priority;
        if (entryAPrimaryPriority !== entryBPrimaryPriority) {
          return entryBPrimaryPriority - entryAPrimaryPriority;
        }
        if (entryA.priority.secondary !== entryB.priority.secondary) {
          return entryB.priority.secondary - entryA.priority.secondary;
        }
        return mapEntryWithNumberedPriorityToIndex.get(entryA) - mapEntryWithNumberedPriorityToIndex.get(entryB);
      }
      if (entryA.alignment === 0) {
        return -1;
      }
      if (entryB.alignment === 0) {
        return 1;
      }
      return 0;
    });
    let sortedEntries;
    if (mapEntryWithRelativePriority.size > 0) {
      sortedEntries = [];
      for (const entry of sortedEntriesWithNumberedPriority) {
        const relativeEntriesMap = mapEntryWithRelativePriority.get(entry.id);
        const relativeEntries = relativeEntriesMap ? Array.from(relativeEntriesMap.values()) : void 0;
        if (relativeEntries) {
          sortedEntries.push(...relativeEntries.filter(
            (entry2) => isStatusbarEntryLocation(entry2.priority.primary) && entry2.priority.primary.alignment === 0
            /* StatusbarAlignment.LEFT */
          ).sort((entryA, entryB) => entryB.priority.secondary - entryA.priority.secondary));
        }
        sortedEntries.push(entry);
        if (relativeEntries) {
          sortedEntries.push(...relativeEntries.filter(
            (entry2) => isStatusbarEntryLocation(entry2.priority.primary) && entry2.priority.primary.alignment === 1
            /* StatusbarAlignment.RIGHT */
          ).sort((entryA, entryB) => entryB.priority.secondary - entryA.priority.secondary));
        }
        mapEntryWithRelativePriority.delete(entry.id);
      }
      for (const [, entries] of mapEntryWithRelativePriority) {
        sortedEntries.push(...Array.from(entries.values()).sort((entryA, entryB) => entryB.priority.secondary - entryA.priority.secondary));
      }
    } else {
      sortedEntries = sortedEntriesWithNumberedPriority;
    }
    this._entries = sortedEntries;
  }
  markFirstLastVisibleEntry() {
    this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(
      0
      /* StatusbarAlignment.LEFT */
    ));
    this.doMarkFirstLastVisibleStatusbarItem(this.getEntries(
      1
      /* StatusbarAlignment.RIGHT */
    ));
  }
  doMarkFirstLastVisibleStatusbarItem(entries) {
    let firstVisibleItem;
    let lastVisibleItem;
    for (const entry of entries) {
      entry.container.classList.remove("first-visible-item", "last-visible-item");
      const isVisible = !this.isHidden(entry.id);
      if (isVisible) {
        if (!firstVisibleItem) {
          firstVisibleItem = entry;
        }
        lastVisibleItem = entry;
      }
    }
    firstVisibleItem?.container.classList.add("first-visible-item");
    lastVisibleItem?.container.classList.add("last-visible-item");
  }
}
export {
  StatusbarViewModel
};
//# sourceMappingURL=statusbarModel.js.map
