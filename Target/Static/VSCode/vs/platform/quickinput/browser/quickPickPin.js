var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Codicon } from "../../../base/common/codicons.js";
import { localize } from "../../../nls.js";
import { IQuickPick, IQuickPickItem, QuickPickItem } from "../common/quickInput.js";
import { IStorageService, StorageScope, StorageTarget } from "../../storage/common/storage.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { DisposableStore, IDisposable } from "../../../base/common/lifecycle.js";
const pinButtonClass = ThemeIcon.asClassName(Codicon.pin);
const pinnedButtonClass = ThemeIcon.asClassName(Codicon.pinned);
const buttonClasses = [pinButtonClass, pinnedButtonClass];
function showWithPinnedItems(storageService, storageKey, quickPick, filterDuplicates) {
  const itemsWithoutPinned = quickPick.items;
  let itemsWithPinned = _formatPinnedItems(storageKey, quickPick, storageService, void 0, filterDuplicates);
  const disposables = new DisposableStore();
  disposables.add(quickPick.onDidTriggerItemButton(async (buttonEvent) => {
    const expectedButton = buttonEvent.button.iconClass && buttonClasses.includes(buttonEvent.button.iconClass);
    if (expectedButton) {
      quickPick.items = itemsWithoutPinned;
      itemsWithPinned = _formatPinnedItems(storageKey, quickPick, storageService, buttonEvent.item, filterDuplicates);
      quickPick.items = quickPick.value ? itemsWithoutPinned : itemsWithPinned;
    }
  }));
  disposables.add(quickPick.onDidChangeValue(async (value) => {
    if (quickPick.items === itemsWithPinned && value) {
      quickPick.items = itemsWithoutPinned;
    } else if (quickPick.items === itemsWithoutPinned && !value) {
      quickPick.items = itemsWithPinned;
    }
  }));
  quickPick.items = quickPick.value ? itemsWithoutPinned : itemsWithPinned;
  quickPick.show();
  return disposables;
}
__name(showWithPinnedItems, "showWithPinnedItems");
function _formatPinnedItems(storageKey, quickPick, storageService, changedItem, filterDuplicates) {
  const formattedItems = [];
  let pinnedItems;
  if (changedItem) {
    pinnedItems = updatePinnedItems(storageKey, changedItem, storageService);
  } else {
    pinnedItems = getPinnedItems(storageKey, storageService);
  }
  if (pinnedItems.length) {
    formattedItems.push({ type: "separator", label: localize("terminal.commands.pinned", "pinned") });
  }
  const pinnedIds = /* @__PURE__ */ new Set();
  for (const itemToFind of pinnedItems) {
    const itemToPin = quickPick.items.find((item) => itemsMatch(item, itemToFind));
    if (itemToPin) {
      const pinnedItemId = getItemIdentifier(itemToPin);
      const pinnedItem = { ...itemToPin };
      if (!filterDuplicates || !pinnedIds.has(pinnedItemId)) {
        pinnedIds.add(pinnedItemId);
        updateButtons(pinnedItem, false);
        formattedItems.push(pinnedItem);
      }
    }
  }
  for (const item of quickPick.items) {
    updateButtons(item, true);
    formattedItems.push(item);
  }
  return formattedItems;
}
__name(_formatPinnedItems, "_formatPinnedItems");
function getItemIdentifier(item) {
  return item.type === "separator" ? "" : item.id || `${item.label}${item.description}${item.detail}}`;
}
__name(getItemIdentifier, "getItemIdentifier");
function updateButtons(item, removePin) {
  if (item.type === "separator") {
    return;
  }
  const newButtons = item.buttons?.filter((button) => button.iconClass && !buttonClasses.includes(button.iconClass)) ?? [];
  newButtons.unshift({
    iconClass: removePin ? pinButtonClass : pinnedButtonClass,
    tooltip: removePin ? localize("pinCommand", "Pin command") : localize("pinnedCommand", "Pinned command"),
    alwaysVisible: false
  });
  item.buttons = newButtons;
}
__name(updateButtons, "updateButtons");
function itemsMatch(itemA, itemB) {
  return getItemIdentifier(itemA) === getItemIdentifier(itemB);
}
__name(itemsMatch, "itemsMatch");
function updatePinnedItems(storageKey, changedItem, storageService) {
  const removePin = changedItem.buttons?.find((b) => b.iconClass === pinnedButtonClass);
  let items = getPinnedItems(storageKey, storageService);
  if (removePin) {
    items = items.filter((item) => getItemIdentifier(item) !== getItemIdentifier(changedItem));
  } else {
    items.push(changedItem);
  }
  storageService.store(storageKey, JSON.stringify(items), StorageScope.WORKSPACE, StorageTarget.MACHINE);
  return items;
}
__name(updatePinnedItems, "updatePinnedItems");
function getPinnedItems(storageKey, storageService) {
  const items = storageService.get(storageKey, StorageScope.WORKSPACE);
  return items ? JSON.parse(items) : [];
}
__name(getPinnedItems, "getPinnedItems");
export {
  showWithPinnedItems
};
//# sourceMappingURL=quickPickPin.js.map
