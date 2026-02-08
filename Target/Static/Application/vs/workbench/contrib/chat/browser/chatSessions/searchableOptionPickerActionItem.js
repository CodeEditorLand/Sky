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
var SearchableOptionPickerActionItem_1;
import "./media/chatSessionPickerActionItem.css";
import { CancellationTokenSource } from "../../../../../base/common/cancellation.js";
import { Delayer } from "../../../../../base/common/async.js";
import * as dom from "../../../../../base/browser/dom.js";
import { IActionWidgetService } from "../../../../../platform/actionWidget/browser/actionWidget.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { renderLabelWithIcons, renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { localize } from "../../../../../nls.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { ChatSessionPickerActionItem } from "./chatSessionPickerActionItem.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
function isSearchableOptionQuickPickItem(item) {
  return !!item && typeof item.optionItem === "object";
}
__name(isSearchableOptionQuickPickItem, "isSearchableOptionQuickPickItem");
let SearchableOptionPickerActionItem = class SearchableOptionPickerActionItem2 extends ChatSessionPickerActionItem {
  static {
    __name(this, "SearchableOptionPickerActionItem");
  }
  static {
    SearchableOptionPickerActionItem_1 = this;
  }
  static {
    this.SEE_MORE_ID = "__see_more__";
  }
  constructor(action, initialState, delegate, actionWidgetService, contextKeyService, keybindingService, quickInputService, logService, commandService, telemetryService) {
    super(action, initialState, delegate, actionWidgetService, contextKeyService, keybindingService, commandService, telemetryService);
    this.quickInputService = quickInputService;
    this.logService = logService;
  }
  getDropdownActions() {
    const currentOption = this.delegate.getCurrentOption();
    if (currentOption?.locked) {
      return [this.createLockedOptionAction(currentOption)];
    }
    const optionGroup = this.delegate.getOptionGroup();
    if (!optionGroup) {
      return [];
    }
    const actions = optionGroup.items.map((optionItem) => {
      const isCurrent = optionItem.id === currentOption?.id;
      return {
        id: optionItem.id,
        enabled: !optionItem.locked,
        icon: optionItem.icon,
        checked: isCurrent,
        class: void 0,
        description: optionItem.description,
        tooltip: optionItem.description ?? optionItem.name,
        label: optionItem.name,
        run: /* @__PURE__ */ __name(() => {
          this.delegate.setOption(optionItem);
        }, "run")
      };
    });
    if (optionGroup.onSearch) {
      actions.push({
        id: SearchableOptionPickerActionItem_1.SEE_MORE_ID,
        enabled: true,
        checked: false,
        class: "searchable-picker-see-more",
        description: void 0,
        tooltip: localize("seeMore.tooltip", "Search for more options"),
        label: localize("seeMore", "See more..."),
        run: /* @__PURE__ */ __name(() => {
          this.showSearchableQuickPick(optionGroup);
        }, "run")
      });
    }
    return actions;
  }
  renderLabel(element) {
    const domChildren = [];
    const optionGroup = this.delegate.getOptionGroup();
    element.classList.add("chat-session-option-picker");
    if (optionGroup?.icon) {
      domChildren.push(renderIcon(optionGroup.icon));
    }
    const label = this.currentOption?.name ?? optionGroup?.name ?? localize("selectOption", "Select...");
    domChildren.push(dom.$("span.chat-session-option-label", void 0, label));
    domChildren.push(...renderLabelWithIcons(`$(chevron-down)`));
    dom.reset(element, ...domChildren);
    this.setAriaLabelAttributes(element);
    return null;
  }
  getContainerClass() {
    return "chat-searchable-option-picker-item";
  }
  /**
   * Shows the full searchable QuickPick with all items (initial + search results)
   * Called when user clicks "See more..." from the dropdown
   */
  async showSearchableQuickPick(optionGroup) {
    if (optionGroup.onSearch) {
      const disposables = new DisposableStore();
      const quickPick = this.quickInputService.createQuickPick();
      disposables.add(quickPick);
      quickPick.placeholder = optionGroup.description ?? localize("selectOption.placeholder", "Select {0}", optionGroup.name);
      quickPick.matchOnDescription = true;
      quickPick.matchOnDetail = true;
      quickPick.ignoreFocusOut = true;
      quickPick.busy = true;
      quickPick.show();
      let currentSearchCts;
      const searchDelayer = disposables.add(new Delayer(300));
      const performSearch = /* @__PURE__ */ __name(async (query) => {
        currentSearchCts?.cancel();
        currentSearchCts?.dispose();
        currentSearchCts = new CancellationTokenSource();
        const token = currentSearchCts.token;
        quickPick.busy = true;
        try {
          const items = await optionGroup.onSearch(query, token);
          if (!token.isCancellationRequested) {
            quickPick.items = items.map((item) => this.createQuickPickItem(item));
          }
        } catch (error) {
          if (!token.isCancellationRequested) {
            this.logService.error("Error fetching searchable option items:", error);
          }
        } finally {
          if (!token.isCancellationRequested) {
            quickPick.busy = false;
          }
        }
      }, "performSearch");
      await performSearch("");
      disposables.add(quickPick.onDidChangeValue((value) => {
        searchDelayer.trigger(() => performSearch(value));
      }));
      return new Promise((resolve) => {
        disposables.add(quickPick.onDidAccept(() => {
          const pick = quickPick.selectedItems[0];
          if (isSearchableOptionQuickPickItem(pick)) {
            const selectedItem = pick.optionItem;
            if (!selectedItem.locked) {
              this.delegate.setOption(selectedItem);
            }
          }
          quickPick.hide();
        }));
        disposables.add(quickPick.onDidHide(() => {
          currentSearchCts?.cancel();
          currentSearchCts?.dispose();
          disposables.dispose();
          resolve();
        }));
      });
    }
  }
  createQuickPickItem(item) {
    const iconClass = item.icon ? ThemeIcon.asClassName(item.icon) : void 0;
    return {
      label: item.name,
      description: item.description,
      iconClass,
      disabled: item.locked,
      optionItem: item
    };
  }
  /**
   * Opens the picker programmatically.
   */
  show() {
    const optionGroup = this.delegate.getOptionGroup();
    if (optionGroup) {
      this.showSearchableQuickPick(optionGroup);
    }
  }
};
SearchableOptionPickerActionItem = SearchableOptionPickerActionItem_1 = __decorate([
  __param(3, IActionWidgetService),
  __param(4, IContextKeyService),
  __param(5, IKeybindingService),
  __param(6, IQuickInputService),
  __param(7, ILogService),
  __param(8, ICommandService),
  __param(9, ITelemetryService)
], SearchableOptionPickerActionItem);
export {
  SearchableOptionPickerActionItem
};
//# sourceMappingURL=searchableOptionPickerActionItem.js.map
