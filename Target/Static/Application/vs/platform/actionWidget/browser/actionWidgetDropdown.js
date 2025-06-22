var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IActionWidgetService } from "./actionWidget.js";
import { BaseDropdown } from "../../../base/browser/ui/dropdown/dropdown.js";
import { ThemeIcon } from "../../../base/common/themables.js";
import { Codicon } from "../../../base/common/codicons.js";
import { getActiveElement, isHTMLElement } from "../../../base/browser/dom.js";
import { IKeybindingService } from "../../keybinding/common/keybinding.js";
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
let ActionWidgetDropdown = class ActionWidgetDropdown2 extends BaseDropdown {
  static {
    __name(this, "ActionWidgetDropdown");
  }
  constructor(container, _options, actionWidgetService, keybindingService) {
    super(container, _options);
    this._options = _options;
    this.actionWidgetService = actionWidgetService;
    this.keybindingService = keybindingService;
  }
  show() {
    let actionBarActions = this._options.actionBarActions ?? this._options.actionBarActionProvider?.getActions() ?? [];
    const actions = this._options.actions ?? this._options.actionProvider?.getActions() ?? [];
    const actionWidgetItems = [];
    const actionsByCategory = /* @__PURE__ */ new Map();
    for (const action of actions) {
      let category = action.category;
      if (!category) {
        category = { label: "", order: Number.MIN_SAFE_INTEGER };
      }
      if (!actionsByCategory.has(category.label)) {
        actionsByCategory.set(category.label, []);
      }
      actionsByCategory.get(category.label).push(action);
    }
    const sortedCategories = Array.from(actionsByCategory.entries()).sort((a, b) => {
      const aOrder = a[1][0]?.category?.order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b[1][0]?.category?.order ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
    for (const [categoryLabel, categoryActions] of sortedCategories) {
      if (categoryLabel !== "") {
        actionWidgetItems.push({
          label: categoryLabel,
          kind: "header",
          canPreview: false,
          disabled: false,
          hideIcon: false
        });
      }
      for (const action of categoryActions) {
        actionWidgetItems.push({
          item: action,
          tooltip: action.tooltip,
          description: action.description,
          kind: "action",
          canPreview: false,
          group: { title: "", icon: ThemeIcon.fromId(action.checked ? Codicon.check.id : Codicon.blank.id) },
          disabled: false,
          hideIcon: false,
          label: action.label,
          keybinding: this._options.showItemKeybindings ? this.keybindingService.lookupKeybinding(action.id) : void 0
        });
      }
    }
    const previouslyFocusedElement = getActiveElement();
    const actionWidgetDelegate = {
      onSelect: /* @__PURE__ */ __name((action, preview) => {
        this.actionWidgetService.hide();
        action.run();
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name(() => {
        if (isHTMLElement(previouslyFocusedElement)) {
          previouslyFocusedElement.focus();
        }
      }, "onHide")
    };
    actionBarActions = actionBarActions.map((action) => ({
      ...action,
      run: /* @__PURE__ */ __name(async (...args) => {
        this.actionWidgetService.hide();
        return action.run(...args);
      }, "run")
    }));
    const accessibilityProvider = {
      isChecked(element) {
        return element.kind === "action" && !!element?.item?.checked;
      },
      getRole: /* @__PURE__ */ __name((e) => e.kind === "action" ? "menuitemcheckbox" : "separator", "getRole"),
      getWidgetRole: /* @__PURE__ */ __name(() => "menu", "getWidgetRole")
    };
    this.actionWidgetService.show(this._options.label ?? "", false, actionWidgetItems, actionWidgetDelegate, this.element, void 0, actionBarActions, accessibilityProvider);
  }
};
ActionWidgetDropdown = __decorate([
  __param(2, IActionWidgetService),
  __param(3, IKeybindingService)
], ActionWidgetDropdown);
export {
  ActionWidgetDropdown
};
//# sourceMappingURL=actionWidgetDropdown.js.map
